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

-- 2. Decks (Uploaded Files)
create table decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  filename text not null,
  original_file_url text, -- Storage path
  page_count int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Slide Chunks (Vector Store)
create table slide_chunks (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references decks(id) on delete cascade not null,
  slide_number int,
  content text,
  metadata jsonb, -- e.g., { "page": 1, "source": "intro.pptx" }
  embedding vector(1536) -- OpenAI small embedding size
);

-- Enable HNSW index for fast search
create index on slide_chunks using hnsw (embedding vector_cosine_ops);

-- 4. Conversations
create table conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text default 'New Study Session',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Messages
create table messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb, -- Array of chunk references used for the answer
  created_at timestamp with time zone default timezone('utc'::text, now())
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
