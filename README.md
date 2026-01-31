# CBT-Based Mental Health Chatbot

## Overview

A work-in-progress **CBT-based mental health chatbot** designed to guide users through a structured, therapeutic-style conversation using large language models. The chatbot leverages the ChatGPT API and prompt engineering techniques to generate responses aligned with **Cognitive Behavioral Therapy (CBT)** principles.

This project is being developed as part of an academic research/lab effort. My primary contribution focuses on **prompt engineering and conversational design**, shaping the bot’s behavior to be safe, structured, and therapeutically appropriate.

---

## Project Status

**Actively Developed (In Progress)**
This project is not yet deployed and is under ongoing development and evaluation.

---

## Tech Stack

### Frontend

* **Next.js** (bootstrapped with `create-next-app`)
* React
* TypeScript

### Backend & AI

* **Node.js**
* **LangChain** for LLM orchestration
* **OpenAI / ChatGPT API** for response generation

---

## Core Functionality

* Guides users through a **7-step CBT conversation flow**
* Generates responses optimized for a therapeutic conversational context
* Uses structured prompting to maintain tone, safety, and coherence
* Supports multiple prompt engineering techniques to control reasoning and output quality

---

## Prompt Engineering Techniques

The chatbot currently incorporates and experiments with the following techniques:

* **Few-shot prompting** to demonstrate desired response patterns
* **Persona-based prompting** to maintain a consistent therapeutic voice
* **Chain-of-thought prompting** to encourage structured reasoning
* **Plan-and-solve prompting** to guide step-by-step problem exploration

Prompt iterations are evaluated and refined to improve response relevance, safety, and alignment with CBT principles.

---

## Architecture & Design

* Built on a modular Next.js architecture
* LLM interactions orchestrated via LangChain
* Prompt logic designed around explicit CBT stages rather than free-form chat
* Emphasis on intent-driven conversational flow instead of open-ended responses

---

## Running the Project Locally

### Prerequisites

* Node.js (v18 or later recommended)
* npm, yarn, or pnpm

### Development Setup

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application. Changes will auto-update during development.

---

## Current Limitations

* Not yet deployed
* Ongoing refinement of prompt structure and safety constraints
* UI and feature set subject to change as research progresses

---

## Attribution & Collaboration

This is a **collaborative research project**.
My role centers on **prompt engineering**, conversational intent design, and iterative refinement of LLM behavior for a CBT-based mental health use case.

---

## Notes for Reviewers

This project focuses on **LLM behavior design and prompt engineering**, rather than feature completeness or production deployment. Development prioritizes safety, structure, and therapeutic alignment over rapid release.
