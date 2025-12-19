    # Antigravity Mind: Unislyd Building Plan

    This document outlines the comprehensive approach to building **Unislyd**, a modern AI-powered study companion for university students (initially focused on Ghana).

    ## 1. Project Philosophy & Core UX
    *   **Goal**: "Turn lecture slides into an AI you can study with."
    *   **Vibe**: Polished, academic, trustworthy, "ChatGPT for your slides".
    *   **Key UX Principles**:
        *   **Zero Jargon**: No "vector stores" or "embeddings" visible. Just "Processing slides...".
        *   **Academic Tone**: Answers must be grounded, serious, and cite sources.
        *   **Speed**: Minimal clicks to value.
        *   **Mobile-First Payment**: Mobile Money (MOMO) is critical for the target market.

    ## 2. Technology Stack
    *   **Frontend**: Next.js 14+ (App Router), TypeScript.
    *   **Styling**: Tailwind CSS, `shadcn/ui` (for the sleek, minimal look).
    *   **Animation**: `framer-motion` (subtle entry animations, hover states).
    *   **Backend / Database**: Supabase (Postgres).
    *   **Vector Search**: `pgvector` extension on Supabase.
    *   **Auth**: Supabase Auth (Email/Password, Google OAuth).
    *   **AI - Embeddings**: OpenAI `text-embedding-3-small`.
    *   **AI - Generation**: Groq (Model: `openai/gpt-oss-120b` as a high-performance open-source alternative to GPT-4).
    *   **File Processing**:
        *   **Supported Types**: `.pdf`, `.pptx`, `.docx`, `.txt`.
        *   **Validation**: Strict file type checking on upload to reject unsupported formats immediately.
        *   **Libraries**:
        *   `.docx`: `mammoth` (Best for text extraction).
        *   `.pdf`: `pdf-parse`.
        *   `.txt`: Native Node.js handling.
        *   `.pptx`: **Critical**: Use `pptx2json` or careful custom Node parser. Avoid `officeparser` for PPTX as it can be unreliable.

    ## 3. Database Schema (Supabase)

    We will use a relational schema with vector support.

    ```sql
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

    -- 6. Usage Logs (Analytical & Safe)
    create table usage_logs (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references profiles(id) on delete cascade not null,
      metric text check (metric in ('deck_upload', 'query')),
      count int default 1,
      bucket_month date not null, -- First day of the month for aggregation
      created_at timestamp with time zone default timezone('utc'::text, now())
    );
    -- Index for fast monthly aggregation
    create index on usage_logs (user_id, bucket_month);

    ```

    ## 4. Limits & Access Control
    We will implement strict middleware/service-layer checks.

    | Feature | Free Tier | Pro Tier (GHS 25/mo) |
    | :--- | :--- | :--- |
    | **Max Decks** | 5 (Hard limit) | Unlimited |
    | **Queries/Mo** | 10 | Unlimited |
    | **PDF Export** | No | Yes |
    | **Support** | Standard | Priority |

    **Implementation Strategy**:
    *   **Explicit Usage Table**: Query `usage_logs` for strict accounting. Avoid triggers for this.
    *   **UI Feedback**: Show a progress bar in the sidebar: "3/5 Decks Used".
    *   **Paywall**: When a limit is hit, trigger a `shadcn` Dialog modal explaining the limit and offering the Pro upgrade (GHS 25).

    ### Internal Limits (Safety - Do Not Advertise)
    *   **Rate Limit**: Soft cap of 10 queries/minute per user.
    *   **File Size**: Max 20MB per upload.
    *   **Tokens**: Max 4096 tokens output per response to prevent abuse.

    ## 5. UI/UX & Design System

    ### Product Name
    *   **Public Product Name**: **Unislyd**


    ### Color Palette
    Focused on a "Scientific/Academic" aesthetic. Clean, trustworthy, focus-inducing.
    *   **Backgrounds**: Pure White (`#FFFFFF`) / Off-White (`#F9FAFB`) for light mode. Deep Navy/Slate (`#0F172A`) for dark mode.
    *   **Primary Accent**: **Indigo/Violet** (`#6366f1` to `#4f46e5`). Represents intelligence and depth.
    *   **Text**: Slate-900 (Main), Slate-500 (Secondary).
    *   **Success/Action**: Emerald Green (for "Correct Answer" or "Upload Complete").

    ### Typography
    *   **Font**: `Inter` or `Geist Sans` (Vercel’s font) for high legibility on screens.
    *   **Headers**: Bold, tight tracking.
    *   **Code/Data**: `JetBrains Mono` or `Fira Code` for any raw data snippets.

    ### Components (shadcn/ui preferences)
    *   **Buttons**: Rounded-md, subtle shadows.
    *   **Inputs**: Minimal borders, focus rings matching the Primary Accent.
    *   **Cards**: Flat with 1px border (`border-slate-200`), generic shadow only on hover.
    *   **Toasts**: Use `sonner` for slick notifications.

    ### Animations (Framer Motion)
    *   **Page Transitions**: Subtle fade-in (`opacity: 0 -> 1`, `y: 10 -> 0`).
    *   **Chat Stream**: Messages should stream in smoothly (typewriter effect).
    *   **Sidebar**: Collapsible with spring physics.

    ## 6. File Structure (Proposed)

    ```
    app/
    ├── (auth)/
    │   ├── login/page.tsx
    │   └── signup/page.tsx
    ├── (marketing)/
    │   ├── page.tsx          # Landing
    │   ├── about/page.tsx    # About
    │   └── pricing/page.tsx  # Pricing (GHS focused)
    ├── (dashboard)/
    │   ├── layout.tsx        # Sidebar, Auth Check
    │   ├── dashboard/
    │   │   └── page.tsx      # Recent activity
    │   ├── chat/
    │   │   ├── [id]/page.tsx # Active chat
    │   │   └── page.tsx      # New chat placeholder
    │   └── upload/
    │       └── page.tsx      # Drag & Drop Zone
    ├── api/
    │   ├── chat/route.ts     # RAG Pipeline (Supabase -> Groq)
    │   ├── upload/route.ts   # File processing & embedding
    │   └── webhooks/route.ts # Payment processing
    lib/
    ├── supabase/             # Client & Server clients
    ├── ai/                   # OpenAI & Groq wrappers
    ├── utils.ts              # cn helper
    └── types.ts              # DB interfaces
    components/
    ├── ui/                   # shadcn primitives
    ├── marketing/            # Hero, Features, PricingTable
    ├── dashboard/            # Sidebar, Header, UsageMeter
    └── chat/                 # ChatInterface, MessageBubble, SourceCitation
    ```

    ## 7. Development Phases

    ### Phase 1: Foundation & Auth
    *   Setup Next.js, Tailwind, shadcn.
    *   Configure Supabase projects.
    *   Implement Authentication (Login/Signup).
    *   Build the Dashboard Shell (Sidebar + Layout).

    ### Phase 2: Knowledge Ingestion (The Engine)
    *   Build `UploadZone` component with strict **client-side & server-side file type validation**.
    *   Implement API route for parsing PPTX, PDF, DOCX, and TXT.
    *   Set up OpenAI Embedding pipeline.
    *   Store vectors in Supabase `slide_chunks`.

    ### Phase 3: Chat & RAG
    *   Build the Chat UI (Optimistic updates, streaming).
    *   Implement Vector Search logic (Cosine Similarity).
    *   Connect Groq LLM for generation.
    *   Implement "Citation" features (linking answers back to specific chunks).

    ### Phase 4: Limits, Payments & Advanced Features
    *   Implement usage tracking via `usage_logs`.
    *   Build the "Upgrade" paywalls.
    *   **Feature Deployment: Exam Mode** (Pro-only prompt engineering for memorization).
    *   (Integration of local Payment Gateway - Paystack/Flutterwave would be best for Ghana MOMO).You can leave their connections empty for when i get them setup then we will fully integrate..


    ### Phase 5: Polish & Launch
    *   Landing page high-fidelity implementation.
    *   Mobile responsiveness check.
    *   SEO (Metadata).
    *   Final testing of study answers accuracy.

    ## 8. Specific "Ghana-First" Features & Polish
    *   **Pricing Display**: ALWAYS show GHS 25 / GHS 120. Do not default to USD.
    *   **🔥 Exam Mode (Killer Feature)**: Pro-only toggle in chat. "Explain this for exam revision." Forces bullets, definitions, and high-density facts.
    *   **Low Data Mode**: Optimize images/assets to be lightweight.
    *   **Offline Handling**: Use `react-query` or similar to cache recent chats.
    *   **UX Polish**:
        *   `last_accessed_at` on decks for sorting.
        *   Auto-generate conversation titles.
        *   "Delete Chat" option.
        *   Skeleton loaders during embeddings.

    This plan provides a solid roadmap to build Unislyd to your exact specifications.
