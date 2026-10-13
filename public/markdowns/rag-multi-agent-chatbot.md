# RAG Multi-Agent Software Team Chatbot

## Overview

A RAG (retrieval-augmented generation) system that runs a software team of specialist agents: Product Owner, Analyst, Architect, Developer, Tester, Designer, Reviewer and Tech Writer. Working together, they analyse documents and produce designs, code and documentation.

**Live Demo:** https://multi-agent-software-team.streamlit.app/
**Repository:** https://github.com/firepenguindisopanda/rag-chatbot-multi-agent-software-team

---

## Tech Stack

- Python, FastAPI
- Streamlit for UI
- FAISS / Vector DB for similarity search
- NVIDIA embedding and LLM endpoints
- LangChain / LangGraph for agent orchestration
- PyMuPDF and Pandas for document parsing and analysis

---

## Key Features

- An orchestrator that splits work across specialist agents and passes results between them
- Document ingestion and semantic search using FAISS
- PDF/CSV upload and automated analysis
- Code generation and automated testing scaffolding
- Live prompting, with solutions built up step by step

---

## Setup & Development Notes

- Python 3.10+ recommended
- Create a virtual environment and install dependencies in `requirements.txt`
- Configure environment variables with NVIDIA or LLM provider keys
- Start the Streamlit UI and the API server for local testing

---

## Architecture

A coordinating orchestrator hands tasks to a set of domain-specific agents, which share context through the orchestrator and a common vector store. Subtask delegation and context passing use LangChain/LangGraph constructs.

---

## Future Work

- Multi-user collaboration and real-time synchronization
- Better monitoring and agent performance analytics
- UI improvements for agent customization and debugging

---

The code is organised as modular services.
