# UWI DCIT Chatbot

## Overview

An AI-powered chatbot built for the University of the West Indies (UWI) using vector databases to provide context-aware answers from internal documents and course materials.

**Repository:** https://github.com/firepenguindisopanda/experiment-uwi-dcit-chatbot

---

## Tech Stack

- Python (LangChain, FastAPI)
- FAISS (vector DB) for semantic search
- Google PALM / embedding models
- Streamlit / web client for front-end

---

## Key Features

- Document ingestion and indexing into vector DB
- Semantic question answering with context-limited retrieval
- Multi-session chat with memory and conversation history
- Designed for education use cases and knowledge retrieval

---

## Deployment & Notes

- Requires LLM and embedding keys from Google/other providers
- Seed the vector DB with PDFs and docs to enable retrieval
- Configure server settings and API keys via environment variables

---

*Built to improve student access to structured course resources.*
