# Unislyd Application Documentation (APPDOC)

## 1. Project Overview
**Unislyd** (Project Name: `Unislyd`) is a modern AI-powered web application designed for university students. It enables users to upload lecture slide decks (PPTX, PDF), extracts their content, embeds it for semantic search, and allows students to query that knowledge conversationally. The system provides accurate, source-grounded answers to facilitate studying.

### Key Value Proposition
- **Specialized for Academia**: Tailored for slide-based learning, not generic queries.
- **Source-Grounded AI**: Answers are derived directly from the uploaded lecture material.
- **Privacy & Structure**: Organizes content by "decks" and keeps user data isolated.

---

## 2. Technical Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend & Database
- **Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL with `pgvector` extension for vector similarity search.
- **Authentication**: Supabase Auth (Email/Password, OAuth ready).
- **Storage**: Supabase Storage (for raw files if needed, though text is extracted and stored in DB).

### AI & Machine Learning
- **Embeddings**: OpenAI `text-embedding-3-small` (via `openai` node package).
- **LLM / Text Generation**: Groq API (`groq-sdk`) utilizing `openai/gpt-oss-120b` (or comparable high-performance open models) for fast inference.
- **File Processing**:
    - `pdf-parse`: For extracting text from PDF files.
    - `mammoth` / `pptx2json`: For extracting text/structure from PowerPoint files.
    - `turndown`: For converting HTML-like content to Markdown.

---

## 3. Architecture & Data Flow

### 3.1. Ingestion Pipeline
1.  **Upload**: User uploads a file (PPTX or PDF) via the Dashboard.
2.  **Extraction**: Server-side logic (`app/api/upload`) parses the file.
    - Bullets are normalized into sentences.
    - Content is chunked by slide.
3.  **Embedding**: Text chunks are sent to OpenAI API to generate vector embeddings (1536 dimensions).
4.  **Storage**:
    - `decks` table: Stores metadata (filename, total slides).
    - `slide_chunks` table: Stores the text content, slide number, and the vector embedding.

### 3.2. Query / RAG Pipeline
1.  **User Query**: User sends a text message in the Chat interface.
2.  **Embedding**: The query is embedded using the same OpenAI model.
3.  **Vector Search**: A `match_slide_chunks` (or similar) RPC function in Postgres performs cosine similarity search to find the most relevant slide chunks for the user's specific deck(s).
4.  **Generation**:
    - Context (relevant chunks) + User Query are constructed into a prompt.
    - Sent to Groq LLM.
5.  **Response**: The LLM generates a concise, academic response, citing the context implicitly.

---

## 4. Directory Structure

```
slyd/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Protected routes (Dashboard, Chat, Decks)
│   ├── (marketing)/        # Public routes (Landing, About, Pricing)
│   ├── api/                # API Routes (chat, upload, auth callbacks)
│   ├── auth/               # Auth related pages/routes
│   ├── globals.css         # Global styles (Tailwind imports)
│   └── layout.tsx          # Root layout
├── components/             # React Components
│   ├── ui/                 # Reusable UI elements (shadcn/ui)
│   ├── dashboard/          # Dashboard-specific components
│   ├── chat/               # Chat interface components
│   ├── landing/            # Landing page components
│   └── layout/             # Layout components (Header, Sidebar)
├── lib/                    # Utilities and helper functions
│   ├── supabase/           # Supabase client initialization
│   ├── utils.ts            # CN/clsx helpers
│   └── ...
├── hooks/                  # Custom React hooks
├── scripts/                # Utility scripts (e.g., db setup, ingestion tests)
├── public/                 # Static assets
└── ...config files         # (next.config, tailwind.config, etc.)
```

---

## 5. Database Schema (Supabase)

### `profiles`
- `id`: UUID (References `auth.users`)
- `email`: Text
- `full_name`: Text
- `plan`: Text ('free' or 'pro')
- `created_at`: Timestamp

### `decks`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `profiles.id`)
- `title`: Text
- `file_type`: Text ('pdf', 'pptx')
- `slide_count`: Integer
- `created_at`: Timestamp

### `slide_chunks`
- `id`: UUID (Primary Key)
- `deck_id`: UUID (Foreign Key to `decks.id`)
- `content`: Text (The actual slide text)
- `slide_number`: Integer
- `embedding`: Vector(1536) (pgvector type)

### `chats` / `conversations`
- `id`: UUID
- `user_id`: UUID
- `title`: Text
- `created_at`: Timestamp

### `messages`
- `id`: UUID
- `chat_id`: UUID
- `role`: Text ('user', 'assistant')
- `content`: Text
- `created_at`: Timestamp

---

## 6. Setup & Installation

### Prerequisites
- Node.js (v20+ recommended)
- npm or pnpm
- A Supabase Project
- API Keys for OpenAI and Groq

### Environment Variables
Create a `.env.local` file in the root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

### Commands
- **Install Dependencies**: `npm install`
- **Run Development Server**: `npm run dev`
    - Access at `http://localhost:3000`
- **Build for Production**: `npm run build`
- **Start Production Server**: `npm start`
- **Lint Code**: `npm run lint`

---

## 7. Key Features Implementation Checklist
- [x] **Authentication**: Supabase Auth integration.
- [x] **Ingestion**: File upload and parsing.
- [x] **Vector Database**: Storing embeddings in Supabase.
- [x] **RAG Chat**: Real-time streaming chat with context retrieval.
- [ ] **History & Pagination**: Managing past conversations (In Progress).
- [ ] **Payments**: Integration (Planned for Phase 4).

## 8. Deployment
The application is optimized for deployment on **Vercel**.
- Connect GitHub repository.
- Configure Environment Variables in Vercel project settings.
- Deploy.
