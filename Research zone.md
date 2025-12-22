GOLD FEATURE: Research Zone
1. Product Intent (Non-Negotiable)

The Research Zone is a focused academic workspace that allows students to:

Conduct deep research using only selected slide decks

Take structured notes alongside AI assistance

Produce exportable, citation-aware research outputs

This feature must feel quiet, intentional, and professional — not like a chat app.

2. Core Concept

One research session = selected decks + notes + AI conversation scoped to those decks

Everything in the Research Zone is context-locked to the selected slide decks.

4. Top Bar – Source Deck Selector
Purpose

Controls which slide decks are active knowledge sources for the research session.

UI Elements

Horizontal deck list (scrollable if long)

Each deck chip shows:

Deck name

Optional icon / color

❌ Remove button

➕ Add Deck button (opens selector modal)

Behavior

User can add/remove decks at any time

Changing decks:

Immediately updates AI context

Does not erase notes or chat

If no decks are selected:

AI chat is disabled

User sees a prompt: “Add at least one deck to begin research”

Technical Notes

Deck selection state is persisted per research session

Max recommended decks per session (suggested): 5–10 (to control context size)

5. Main Workspace – Rich Text Research Editor
Purpose

Primary space for writing, editing, and structuring research output.

Required Capabilities

Rich text editor (Notion-like):

Headings (H1–H3)

Bold, italic, underline

Bullet & numbered lists

Quotes

Code blocks (optional but useful)

Inline links

Undo / redo

Auto-save (critical)

AI Integration

Each AI answer can be:

Copied

Copied into notes (inserts at cursor position)

When copying into notes:

Include citation references (e.g., [Slide 4, Deck: COMP 311])

Optional formatting preserved

Missing-but-Important Additions

✅ Version history / snapshots

Auto-save versions every X minutes

Allow “restore previous version”

✅ Word count / reading time
Useful for academic writing

6. Right Panel – Collapsible Research Chat
Purpose

AI assistant strictly scoped to selected decks.

Behavior Rules

AI answers are generated:

ONLY from selected decks

With inference and academic expansion allowed

The assistant behaves as a research guide, not a search engine

Citations are mandatory where slide content is used

UI

Collapsible panel on the right

Default state: open

Collapse icon to maximize writing space

Sticky input box

Message Actions

Each AI response includes:

📋 Copy

📝 Copy to Notes

System Constraints

If user asks something far outside selected decks:

Respond with guided redirection, not rejection

Example: “This goes beyond your selected sources, but based on Deck X, we can approach it this way…”

7. Bottom / Top Actions – Output Controls
Required Actions

💾 Save (manual save trigger, even with auto-save)

📋 Copy All

📄 Download as PDF

Clean formatting

Title page (optional)

Citations preserved

🗂 Open Research

Opens modal or dropdown of recent research sessions

Missing-but-Critical Addition

✅ Rename Research

Editable title

Used across lists and exports

8. Research Management Pages
A. All Research Page

A dedicated page that lists all research sessions.

Features

Search by title

Filter by:

Date

Deck used

Sort (recent, alphabetical)

Actions per item

View

Edit (loads into Research Zone)

Delete

B. View-Only Research Page

Purpose: Read-only mode for completed research.

UI

Clean reading layout

No chat panel

No editing tools

Actions (3-dot menu, top left)

Edit

Duplicate

Download PDF

Delete

9. Data Model (High-Level)
Research Session

id

userId

title

selectedDeckIds[]

editorContent (rich text JSON)

createdAt

updatedAt

lastOpenedAt

Chat Messages

researchSessionId

role (user / assistant)

content

citedDecks[]

timestamps

10. Permissions & Limits (Gold Feature Guardrails)

Research Zone is Gold-only

Query limits apply (higher than normal chat)

Deck limit per session enforced

PDF export may be capped per month

11. UX Principles (Important)

No clutter

No distractions

Calm academic tone

Fast transitions

Zero fear of losing work (auto-save everywhere)

12. Strategic Insight (Strong Opinion)

This feature is not a “nice add-on”.

This is:

Your retention engine

Your Gold conversion driver

Your moat against generic AI chat tools

If built correctly, users will:

Start research here

Stay here

Export from here

Pay to keep using it

13. Final Instruction Summary (for Antigravity)

Build a Research Zone: a scoped, deck-aware research workspace combining a Notion-like editor and an AI tutor, where all AI assistance is constrained to user-selected slide decks, with strong persistence, citation awareness, and export capabilities.


🏁 Recommended Stack for Editor

Best balance:
📌 TipTap (React) + Custom Toolbar + PDF Export tool

Export options:

HTML → PDF conversion (client or backend)

Plugins for images/tables

🧠 Additional Features 

These are required, but great:

🔹 Auto-save drafts

(in local storage or DB every X seconds)

🔹 Versions / History

Track changes between saves

🔹 Collaborative research

Multi-user editing?

🔹 Citation manager

Store slide references inline (like “(Slide 3)” tags)

🔹 Research Tags

Users can categorize/label research pieces

🔹 Search inside research

Text search within research contents

📌 Success Criteria (how you’ll know it’s done)

A user should be able to:

✔ Select decks
✔ Ask AI in-context questions
✔ Get answers with citations
✔ Insert responses into editor
✔ Write, edit, and format content
✔ Save research
✔ View, search, export past research

Provide the neccesary schema files to run in supabase

implement good rate limits on the Ai chat for the research zone to avoid abuse