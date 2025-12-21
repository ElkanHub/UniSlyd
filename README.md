# Unislyd

**Unislyd** is a modern AI-powered study companion designed specifically for university students. It transforms your lecture slides into an interactive knowledge base, allowing you to "chat" with your course material, extract key summaries, and study more effectively.

## 🚀 Key Features

-   **📚 Smart Slide Ingestion**: Upload your lecture slides (PPTX, PDF). Unislyd extracts text, understands the structure, and indexes the content for AI processing.
-   **🤖 Conversational AI Tutor**: Chat with your slides! Ask questions, get definitions, and request summaries grounded in your actual course material—no hallucinations.
-   **📝 Study Organization**: Keep all your decks organized in a centralized dashboard.
-   **🔎 Vector Search Power**: Built on PostgreSQL with `pgvector` for accurate semantic retrieval of information.
-   **🔐 Secure & Private**: Your study materials are processed securely.

## 🛠️ Tech Stack

-   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), TypeScript, [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/).
-   **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Storage).
-   **AI & ML**: OpenAI (Embeddings), Groq (LLM Inference).
-   **Database**: PostgreSQL + `pgvector`.

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js (v20+ recommended)
-   npm or pnpm
-   A [Supabase](https://supabase.com/) Project
-   API Keys for OpenAI and Groq

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/ElkanHub/UniSlyd.git
    cd slyd
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add your keys:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    OPENAI_API_KEY=your_openai_api_key
    GROQ_API_KEY=your_groq_api_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
slyd/
├── app/                    # Next.js App Router & API Routes
├── components/             # React Components (UI, Dashboard, Chat)
├── lib/                    # Utilities, Supabase client, Helper functions
├── public/                 # Static assets
└── types/                  # TypeScript definitions
```
