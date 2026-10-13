# UWI DCIT Chatbot

## Overview

A chatbot for the University of the West Indies (UWI) that answers questions from internal documents and course materials. It uses a vector database to find the passages relevant to each question.

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
- Aimed at education use and knowledge retrieval

---

## Deployment & Notes

- Requires LLM and embedding keys from Google/other providers
- Seed the vector DB with PDFs and docs to enable retrieval
- Configure server settings and API keys via environment variables

---

*Built so students can get to structured course resources more easily.*
