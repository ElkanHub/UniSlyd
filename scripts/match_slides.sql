-- Add this to your schema.sql or run in dashboard

create or replace function match_slides (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
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
  where 1 - (slide_chunks.embedding <=> query_embedding) > match_threshold
  order by slide_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
