# RAG Multi-Agent Software Team Chatbot

## Overview

An advanced RAG (Retrieval-Augmented Generation) multi-agent AI system designed to assemble a software team of specialist agents (Product Owner, Analyst, Architect, Developer, Tester, Designer, Reviewer, Tech Writer) that collaborates to analyze documents, produce designs, code, and documentation.

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

- Multi-agent orchestration where different agents specialize and collaborate
- Document ingestion and semantic search using FAISS
- PDF/CSV upload and automated analysis
- Code generation and automated testing scaffolding
- Real-time prompting and step-by-step solution construction

---

## Setup & Development Notes

- Python 3.10+ recommended
- Create a virtual environment and install dependencies in `requirements.txt`
- Configure environment variables with NVIDIA or LLM provider keys
- Start the Streamlit UI and the API server for local testing

---

## Architecture 

The system orchestrates tasks across a set of domain-specific agents that communicate via a coordinating orchestrator and a shared vector store. The Flow uses LangChain/LangGraph constructs for subtask delegation and context passing.

---

## Future Work

- Multi-user collaboration and real-time synchronization
- Enhanced monitoring and agent performance analytics
- UI improvements for agent customization and debugging

---

Built with AI-first design and modular microservices.
