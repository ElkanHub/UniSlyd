    # Unislyd Setup Guide

You have successfully built Phase 1 (Foundation) and Phase 2 (Ingestion Engine).
To make the application functional, you must configure the Database and Environment Variables.

## 1. Environment Variables
Create a `.env.local` file in the root directory (if you haven't already) with the following keys:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

## 2. Database Setup via Supabase Dashboard

1.  Go to your Supabase Project Dashboard.
2.  Open the **SQL Editor**.
3.  Copy the contents of `scripts/schema.sql`.
4.  Run the script to create the tables (`profiles`, `decks`, `slide_chunks`, `messages`, `usage_logs`) and enable `pgvector`.

## 3. Verify
1.  Run `npm run dev`.
2.  Go to `http://localhost:3000/dashboard`.
3.  Upload a file via the Upload Zone.
4.  Check `decks` and `slide_chunks` tables in Supabase to see the data.

## Next Steps (Phase 3)
- Build Chat Interface (`app/(dashboard)/chat`).
- Connect Groq LLM for retrieval and generation.
