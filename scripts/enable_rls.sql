-- Enable RLS for Profiles
alter table profiles enable row level security;

drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Enable RLS for Decks
alter table decks enable row level security;

drop policy if exists "Users can view own decks" on decks;
create policy "Users can view own decks" on decks for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own decks" on decks;
create policy "Users can insert own decks" on decks for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own decks" on decks;
create policy "Users can delete own decks" on decks for delete using (auth.uid() = user_id);

-- Enable RLS for Slide Chunks
alter table slide_chunks enable row level security;

drop policy if exists "Users can view own chunks" on slide_chunks;
create policy "Users can view own chunks" on slide_chunks 
  for select using (
    exists (select 1 from decks where decks.id = slide_chunks.deck_id and decks.user_id = auth.uid())
  );

drop policy if exists "Users can insert own chunks" on slide_chunks;
create policy "Users can insert own chunks" on slide_chunks
  for insert with check (
    exists (select 1 from decks where decks.id = slide_chunks.deck_id and decks.user_id = auth.uid())
  );

drop policy if exists "Users can delete own chunks" on slide_chunks;
create policy "Users can delete own chunks" on slide_chunks
  for delete using (
    exists (select 1 from decks where decks.id = slide_chunks.deck_id and decks.user_id = auth.uid())
  );

-- Enable RLS for Conversations
alter table conversations enable row level security;

drop policy if exists "Users can view own conversations" on conversations;
create policy "Users can view own conversations" on conversations for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own conversations" on conversations;
create policy "Users can insert own conversations" on conversations for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own conversations" on conversations;
create policy "Users can update own conversations" on conversations for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own conversations" on conversations;
create policy "Users can delete own conversations" on conversations for delete using (auth.uid() = user_id);

-- Enable RLS for Messages
alter table messages enable row level security;

drop policy if exists "Users can view own messages" on messages;
create policy "Users can view own messages" on messages for select using (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);

drop policy if exists "Users can insert own messages" on messages;
create policy "Users can insert own messages" on messages for insert with check (
  exists (select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid())
);

-- Enable RLS for Usage Logs
alter table usage_logs enable row level security;

drop policy if exists "Users can view own usage" on usage_logs;
create policy "Users can view own usage" on usage_logs for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own usage" on usage_logs;
create policy "Users can insert own usage" on usage_logs for insert with check (auth.uid() = user_id);

-- Update match_slides to be secure (re-runnable)
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
