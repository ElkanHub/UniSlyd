-- Create research_sessions table
create table public.research_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Untitled Research',
  selected_deck_ids uuid[] default '{}',
  editor_content jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_opened_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on research_sessions
alter table public.research_sessions enable row level security;

-- Policies for research_sessions
create policy "Users can view their own research sessions"
  on public.research_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own research sessions"
  on public.research_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own research sessions"
  on public.research_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own research sessions"
  on public.research_sessions for delete
  using (auth.uid() = user_id);

-- Create research_messages table
create table public.research_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.research_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on research_messages
alter table public.research_messages enable row level security;

-- Policies for research_messages
-- Logic: If you can access the session, you can access the messages.
create policy "Users can view messages of their research sessions"
  on public.research_messages for select
  using (
    exists (
      select 1 from public.research_sessions
      where public.research_sessions.id = research_messages.session_id
      and public.research_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into their research sessions"
  on public.research_messages for insert
  with check (
    exists (
      select 1 from public.research_sessions
      where public.research_sessions.id = research_messages.session_id
      and public.research_sessions.user_id = auth.uid()
    )
  );

-- Function to update updated_at on change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for research_sessions
create trigger on_research_sessions_updated
  before update on public.research_sessions
  for each row execute procedure public.handle_updated_at();
