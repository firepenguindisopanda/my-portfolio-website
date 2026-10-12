# Folio: Chat With Your PDFs, One Vector Database Per User

## Overview

Folio answers questions about a PDF you upload: a faculty handbook, a 2,000-chunk textbook, a set of lecture slides. Two things make it more than a retrieval demo. Every user gets **their own Postgres vector database**, a separate Neon project created the first time they sign in, so one tenant's embeddings never sit in a table with another's. And the retrieval is built around the questions people actually ask a long document, which are often not the ones similarity search is good at: "what is this book about?", "what is chapter 2 about?", "and the last chapter?".

It started from Neon's open source vector-database-per-tenant example (Remix, OpenAI, Cloudflare R2, one chat per document, nothing saved). I kept the tenancy idea and rebuilt most of the rest: the models, the storage, the retrieval, the data lifecycle and the whole interface.

**Live:** [https://folio-production-7bee.up.railway.app/](https://folio-production-7bee.up.railway.app/)

| | |
|---|---|
| Framework | Remix (Vite), React 18, Tailwind CSS |
| Databases | Neon Postgres: one main database, plus one project with pgvector per user |
| Models | NVIDIA NIM: `nemotron-3.5-lightning-30b-a3b` for chat, `llama-nemotron-embed-vl-1b-v2` for embeddings (1024 dimensions) |
| Storage and limits | UploadThing for the PDFs, Upstash Redis for rate limits and upload records |
| Streaming | Vercel AI SDK, with the model's reasoning streamed separately from the answer |
| Deployment | Docker on Railway |

---

## One database per tenant

The main database holds users, documents, chats and messages, plus a `vector_databases` table that maps each user to their Neon project. On first sign in the app creates a project through the Neon API, enables pgvector and runs the embeddings migrations against it. Projects are named after the public user id (`tenant-usr_...`) so a tenant can be found in the Neon console without putting an email address in a project name.

Provisioning crosses two systems that cannot share a transaction, so it is written to clean up after itself: if anything fails after the Neon project exists (the migration, or the insert that records it), the project is deleted before the error is returned. Without that, every failed sign in would leave an orphaned database billing quietly in the background. The user row and its tenant record are written in one transaction, so two sign ins racing each other cannot both succeed.

A per-tenant schema needs per-tenant migrations. `npm run vector-db:migrate` walks every row in `vector_databases` and migrates each project in turn; new tenants are migrated when they are created. The second migration added an expression index on `metadata->>'documentId'`, because every search and every deletion filters chunks by document.

---

## Getting answers right on long documents

The test document that shaped the retrieval was a 2,184-chunk software engineering textbook. Each question retrieves the six passages most similar to it, which is exactly right for "what are the objectives of chapter 4?" and badly wrong for "summarise this document": there is no passage that resembles a summary, so the model was handed six unrelated snippets and described the book as a guide to writing requirements documents. Three changes fixed the broad questions without touching the specific ones.

**A document overview, written on upload.** While the chunks are embedded, the model writes an overview of at most 200 words from the opening 12,000 characters (title page, preface, contents) plus eight 1,000-character samples spread evenly through the rest, so a long book is covered end to end without sending the whole text. The overview goes into every prompt. "Explain the idea of the book in plain English" went from "there isn't a single statement that summarises the book" to a correct account of its purpose, audience and four parts. If generating the overview fails, the upload still succeeds without one, and a backfill script fills in any that are missing.

**Follow-ups that keep their context.** Each question is searched on its own and also together with the previous question, and the results are merged. "How does it say to combine those two approaches?" now retrieves the passages on agile and plan-driven development and quotes the author, instead of searching for the words "those two approaches".

**Chapters and sections found by their numbering.** "What is chapter 2 about?" first came back missing one of the chapter's four sections, because the passage that lists them was not among the six most similar. Similarity search is the wrong tool for structure, so chapter questions also run a numbering search over the tenant's chunks:

- A chapter's own opening and the book's table of contents both list its section headings (`2.1 Software process models`, `2.2 Process activities`, ...). Passages are scored by how many of `N.1` to `N.6` they contain *followed by a capitalised title*, which excludes the end-of-chapter exercises (`2.1. Explain why...`), and passages that also say "Contents" or "Chapter N" rank higher than other numbered lists.
- Chunks are stored in reading order, so the passage just before the chapter's contents list is fetched too: that is where its title and learning objectives are.
- A section question reads the section's title from the contents (`2.3 Coping with change 43`), then finds the first place that heading appears after the chapter opening, which is where the section actually starts.
- The chapter's title is read from the table of contents and searched for as well, so the answer gets the chapter's content and not only its outline.
- "The last chapter" resolves to the highest chapter number the book mentions more than once (26 here), and "the next chapter" counts from the chapter in the previous question.

The chapter 2 answer now lists all four sections and the chapter's five objectives, and "what is the last chapter about?" went from speculating about what it "likely" covered to its five sections and objectives. Books without numbered sections simply get nothing extra, and their answers are unchanged.

---

## Thinking mode

The chat model reasons before it answers unless told not to, and on the first version that broke the app in a way that looked like silence: the reasoning arrived as empty content chunks, and on one question it used the whole response, so the chat showed nothing at all. With thinking off the same question took about 0.8 seconds instead of about 9.

So thinking became a choice. A **Think** toggle in the message box (with a default in Settings) sets `enable_thinking` per message. When it is on, the reasoning is streamed as its own part of the response and shown in a collapsible panel that follows the text live and folds into "Thought for 6s" when the answer starts. It is saved with the message, so it is still there after a reload. If the model ever spends its whole budget thinking, the chat says so and offers a regenerate, rather than showing an empty bubble.

---

## Embeddings: asymmetric, and sized for the index

NVIDIA's retrieval embedders are asymmetric: a chunk must be embedded with `input_type: "passage"` and a question with `input_type: "query"`. LangChain's OpenAI embeddings class cannot send that field, so a small custom `Embeddings` class calls the endpoint directly, batches 50 inputs a request and retries through LangChain's caller.

Choosing the model was a constraint problem. pgvector's HNSW index supports up to 2,000 dimensions; one of the available models would only return 2,048. `llama-nemotron-embed-vl-1b-v2` accepts a `dimensions` parameter, so the vectors are 1,024 wide and the HNSW index stays.

---

## The data lifecycle

A document's data lives in three places: rows in the main database, chunks in the user's own Neon project, and the PDF in UploadThing. Every foreign key in the main database cascades (users, documents, chats, messages), and every deletion is ordered so it can be retried: each step is idempotent (deleting a file or chunks that are already gone succeeds) and the main database row is removed last.

| Action | What it removes |
|---|---|
| Delete a chat | The chat and its messages |
| Delete a document | Its PDF, its chunks in the tenant database, its chats and messages |
| Delete account | Every PDF, the user's entire Neon project, and every row the user owns |

Deleting an account asks the user to type their email, lists exactly what will go, and signs them out afterwards. I checked both deletions end to end against a throwaway tenant (a real Neon project, a real file, seeded chunks, a chat and messages), including that Neon reports the project as gone and that deleting the same document twice is harmless.

Uploads are guarded the same way:

- If processing fails, any chunks already written and the uploaded file are removed, so a failed upload never leaves a PDF behind that counts against nothing.
- The processing step only accepts a file key that UploadThing confirmed this same user uploaded (recorded in Redis when the upload completes, cleared when it is processed), rather than trusting whatever key the browser sends.
- The three-document limit is checked again inside the transaction that records the document, because two uploads at once can both pass the check at upload time.

---

## Limits and feedback

Each user gets 50 messages a day, counted in Upstash with fixed one-day windows that line up with midnight UTC, and 10 a minute. The per-minute limit used to be keyed on a proxy header that does not exist locally, which put every user in one shared bucket; it is keyed on the user now. The message box always shows how many messages are left, the dashboard warns at ten, and at zero the box is replaced by a notice saying when it resets. A message rejected for a limit is put back in the box instead of being lost.

Every answer can be copied, regenerated or rated, and ratings are saved and counted on the dashboard. While an answer is on its way, a status line reports what is happening: searching the document, thinking, writing.

---

## The interface

- Several saved chats per document, titled automatically from the first question, and renamed or deleted from the sidebar
- A dashboard with usage, document cards and recent chats with a preview of the last message
- The PDF beside the chat in a resizable panel on desktop, full screen on phones
- A sidebar that collapses to an icon rail (Ctrl+B), remembered in a cookie so the server renders the right width
- Light and dark themes from one set of CSS variables, chosen by a cookie so the first paint is already in the right colours

---

## What I would do next

- **Page numbers.** Text is extracted with the pages merged, so answers cannot cite a page. Keeping page boundaries on each chunk would let every answer point back into the PDF panel.
- **Scanned PDFs.** An image-only PDF is refused with a clear message today. My OCR project could read them first.
- **Tests.** The lifecycle and retrieval were checked by scripts against real services, but the repository has no automated test suite yet, and the deletion paths are the first thing that deserves one.
