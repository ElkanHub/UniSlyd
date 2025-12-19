-- Enable pgvector
create extension if not exists vector;

-- 1. Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  tier text default 'free' check (tier in ('free', 'pro_monthly', 'pro_semester', 'pro_annual')),
  avatar_url text,
  stripe_customer_id text, -- or Paystack/local payment ID
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. Decks (Uploaded Files)
create table decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  filename text not null,
  original_file_url text, -- Storage path
  page_count int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table decks enable row level security;
create policy "Users can view own decks" on decks for select using (auth.uid() = user_id);
create policy "Users can insert own decks" on decks for insert with check (auth.uid() = user_id);
create policy "Users can delete own decks" on decks for delete using (auth.uid() = user_id);

-- 3. Slide Chunks (Vector Store)
create table slide_chunks (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references decks(id) on delete cascade not null,
  slide_number int,
  content text,
  metadata jsonb, -- e.g., { "page": 1, "source": "intro.pptx" }
  embedding vector(1536) -- OpenAI small embedding size
);

alter table slide_chunks enable row level security;
-- Policy using a join (or exists) to check deck ownership
create policy "Users can view own chunks" on slide_chunks 
  for select using (
    exists (select 1 from decks where decks.id = slide_chunks.deck_id and decks.user_id = auth.uid())
  );
-- Insert is usually handled by server-side logic (service role) or by the user who owns the deck
create policy "Users can insert own chunks" on slide_chunks
  for insert with check (
    exists (select 1 from decks where decks.id = slide_chunks.deck_id and decks.user_id = auth.uid())
  );
create policy "Users can delete own chunks" on slide_chunks
  for delete using (
    exists (select 1 from decks where decks.id = slide_chunks.deck_id and decks.user_id = auth.uid())
  );

-- Enable HNSW index for fast search
create index on slide_chunks using hnsw (embedding vector_cosine_ops);

-- 4. Conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text default 'New Study Session',
  deck_id uuid references decks(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table conversations enable row level security;
create policy "Users can view own conversations" on conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations" on conversations for update using (auth.uid() = user_id);
create policy "Users can delete own conversations" on conversations for delete using (auth.uid() = user_id);

-- 5. Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb, -- Array of chunk references used for the answer
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table messages enable row level security;
create policy "Users can view own messages" on messages for select using (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);
create policy "Users can insert own messages" on messages for insert with check (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);

-- 6. Usage Logs
create table usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  metric text check (metric in ('deck_upload', 'query')),
  count int default 1,
  bucket_month date not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
create index on usage_logs (user_id, bucket_month);

alter table usage_logs enable row level security;
create policy "Users can view own usage" on usage_logs for select using (auth.uid() = user_id);
create policy "Users can insert own usage" on usage_logs for insert with check (auth.uid() = user_id);


-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 8. RPC: Match Slides (Updated for RLS security implicitly via filter or explicitly here)
create or replace function match_slides (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_deck_id uuid default null
)
returns table (
  id uuid,
  deck_id uuid,
  slide_number int,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    slide_chunks.id,
    slide_chunks.deck_id,
    slide_chunks.slide_number,
    slide_chunks.content,
    1 - (slide_chunks.embedding <=> query_embedding) as similarity
  from slide_chunks
  join decks on decks.id = slide_chunks.deck_id -- Join to check ownership
  where 1 - (slide_chunks.embedding <=> query_embedding) > match_threshold
  and (filter_deck_id is null or slide_chunks.deck_id = filter_deck_id)
  and decks.user_id = auth.uid() -- STRICT SECURITY: Only search own decks
  order by similarity desc
  limit match_count;
end;
$$;

-- 9. Storage Buckets (Execute this via SQL Editor)
insert into storage.buckets (id, name, public) 
values ('decks', 'decks', true)
on conflict (id) do nothing;

create policy "Public Access" on storage.objects 
for select using ( bucket_id = 'decks' );

create policy "Auth Upload" on storage.objects 
for insert with check ( 
    bucket_id = 'decks' 
    and auth.role() = 'authenticated' 
);
