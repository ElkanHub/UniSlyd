Build a modern AI-powered web application for university students that allows them to upload lecture slide decks, extract and embed their content, and query that knowledge conversationally to retrieve accurate, source-grounded answers for studying.

The product must feel as polished and intuitive as ChatGPT, but specialized for academic slide-based learning.

Tech Stack (MANDATORY)

Frontend: Next.js (App Router)

Styling: Tailwind CSS

UI Components: shadcn/ui (sleek, minimal, modern)

Backend / DB: Supabase

Postgres + pgvector

Supabase Auth (email/password + OAuth ready)

Embeddings: OpenAI text-embedding-3-small

LLM (Generation): Groq using openai/gpt-oss-120b

File Handling: PPTX and PDF (PPTX prioritized)

PDF Export: Client-side export of generated answers

Auth-aware UI: User name, plan, usage limits clearly visible

Product Structure
Pages

Landing Page (Public)

About Page (Public)

Pricing Page (Public)

Auth Pages

Sign up

Login

App Dashboard (Protected)

1. Landing Page (High-impact, modern, concise)
Visual Style

Clean, white/light background

Large typography

Subtle gradients

ChatGPT / Perplexity / Claude-style aesthetic

No clutter

Hero Section

Headline (clear value, no buzzwords):

Turn your lecture slides into an AI you can study with.

Subtext:

Upload your class slides. Ask questions. Get precise answers sourced directly from your lectures.

Primary CTA:

“Get Started Free”

Secondary CTA:

“See How It Works”

Feature Highlights (3–4 max)

Upload slides once, query anytime

Answers grounded in your lecture content

Source-aware responses (slide references)

Built for students, not generic AI

Social Proof (light)

“Designed for university students”

“Study smarter, not longer”

2. About Page

Explain:

Why slides are hard to study from

Why generic AI fails students

How SlideMind works differently (slide-grounded, private, structured)

Tone:

Honest

Academic-friendly

No hype

3. Pricing Page
Free Plan

Up to 5 slide decks

Up to 10 queries per month

Basic chat & retrieval

Clearly labeled limits

Pro Plan

Unlimited slide decks

Unlimited queries

Priority processing

Advanced answers & exports

Price:

$7.99 / month

$49 / year

CTA:

“Upgrade to Pro”

4. Authentication (Supabase Auth)

Email/password login

Clean UI

Redirect to dashboard after login

Store:

User name

Email

Plan (free / pro)

5. Dashboard (Core App)
Layout

Left Sidebar

Main Chat Area

Right Panel or Tab for Uploaded Content

Must visually resemble ChatGPT-style interfaces.

Sidebar (Left)

Sections:

User Profile

“Welcome, {First Name}”

Plan badge: Free / Pro

Usage summary:

Slide decks used: X / 5 (Free only)

Queries used: X / 10 (Free only)

Conversations

List of past chats

Click to resume

New Chat button

Uploaded Content

List of slide decks

Show:

Filename

Upload date

Number of slides

Option to delete a deck

Main Chat Area
Chat Behavior

User asks questions in natural language

System retrieves relevant slide chunks from Supabase

Uses Groq LLM to generate answers

Answers must:

Be concise

Be academic in tone

Reference slides implicitly (“From your lecture on X…”)

Message UI (IMPORTANT)

For AI-generated responses:

Allow full text selection

Provide action buttons (either under message or 3-dot menu):

Copy

Edit (inline editable text area)

Export as PDF

Regenerate

Editing behavior:

When “Edit” is clicked, response becomes editable text

User can modify content freely

Changes do NOT affect embeddings (display-only)

Uploaded Content Section

Upload slide decks (PPTX, PDF)

Show upload progress

On upload:

Extract text

Normalize bullets into sentences

Chunk per slide

Embed using text-embedding-3-small

Store in Supabase with metadata

Definition:

1 slide deck = 1 uploaded file

Slide count does NOT affect deck count

Free users:

Hard stop at 5 decks

Data Model (Supabase)
users

id

name

email

plan (free / pro)

slide_decks

id

user_id

filename

total_slides

created_at

slide_chunks

id

deck_id

slide_number

content

embedding (VECTOR 1536)

conversations

id

user_id

created_at

messages

id

conversation_id

role (user / assistant)

content

created_at

Query Flow (MANDATORY)

User submits question

Embed query using OpenAI embedding 3-small

Perform cosine similarity search via pgvector

Retrieve top 5–10 chunks (scoped to user)

Pass context + question to Groq LLM

Generate grounded answer

Display in chat with actions

Export Feature

Allow users to export:

A single response

Or entire conversation

Format: PDF

Clean academic layout

Title + content only

UX Requirements (Strict)

Fast

Minimal clicks

No technical jargon exposed to users

Limits explained in human terms (decks, queries)

Upgrade prompts shown only when limits are hit



Light dark mode toggle



Overall Product Principle

This is not a generic chatbot.
It is a personal academic knowledge system.

Every design and technical decision must reinforce:

Trust

Accuracy

Student usefulness

Ease of studying

## I pondered over the pricing

Serving Ghanaian students first changes everything: pricing psychology, payment rails, and adoption speed. I’ll be blunt and locally realistic.

1. Ground reality: Ghanaian student economics (no fantasies)

Let’s call it as it is:

Most university students in Ghana:

Don’t have steady income

Are price-sensitive

Think in cedis, not dollars

Monthly “discretionary” spend for tools:

Roughly GHS 20 – 60 if they see real value

Anything above that needs clear academic advantage

If you keep $7.99/month, you will kill adoption early.

2. Reframe pricing in GHS (psychology matters)

Never show USD to Ghanaian students.

Everything must be in GHS.

At current reality (rough average):

$1 ≈ GHS 12 (don’t hardcode, but price accordingly)

So:

$7.99 ≈ GHS 95+ → too expensive for students

We need local-first pricing.

3. Recommended Ghana-first pricing (this is my strong take)
🟢 Free Plan (unchanged conceptually)

5 slide decks

10 queries / month

Full experience preview

🔵 Pro Plan (Ghana Student Plan)

Option A: Monthly

GHS 25 / month

This is the sweet spot.

Affordable

Comparable to:

Data bundles

Netflix student share

Printing & handouts for one course

Feels like a study expense, not luxury

Option B: Semester Plan (HIGHLY recommended)

GHS 120 / semester (4 months)

This is powerful because:

Students think in semesters

One-time payment feels lighter

Reduces churn

This should be your default upsell.

Optional Annual Plan (later)

GHS 300 / year

Only for power users. Don’t push it initially.

4. How this still makes business sense (unit economics)

Let’s be realistic.

Average Ghanaian Pro User

Moderate usage

Fewer queries than US users

Smaller decks

Estimated cost/user/month:

Embeddings: GHS 5–8

LLM inference: GHS 10–15

Infra + DB: GHS 5

Total cost ≈ GHS 20–25

Revenue:

GHS 25/month

This is break-even to small profit per user — which is fine early.

Your real leverage comes from:

Volume

Semester payments

Institutional deals later

5. Critical move: Tiered pricing by region (do this quietly)

Behind the scenes:

Ghana → GHS pricing

International → USD pricing

Same product. Different price perception.

This is not unethical — it’s market intelligence.

6. Payment methods (this will make or break you)

You MUST support:

Mobile Money (MTN, Vodafone, AirtelTigo)

Optional: cards for later

If students can’t pay in 30 seconds, they won’t pay at all.

7. How to message the price (copy matters)

On pricing page, say things like:

“Less than the cost of printing lecture slides.”

“One semester. All your courses. One tool.”

“Built for Ghanaian university students.”

This isn’t marketing fluff — it’s alignment.

8. Upgrade triggers (very important)

Don’t push upgrades aggressively.

Trigger upgrade prompts only when:

User hits 5th deck

User hits 10th query

User tries to export PDF

Message example:

“You’ve reached the Free Plan limit. Upgrade for GHS 25 and keep studying without interruptions.”

Simple. Respectful. Effective.

9. Final pricing summary (lock this in)
Ghana Launch Pricing

Free: 5 decks / 10 queries

Pro Monthly: GHS 25

Pro Semester (4 months): GHS 120

Later:

International pricing

Institution licenses

Tutor bundles