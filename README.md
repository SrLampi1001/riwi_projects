# AI Automatization Assessment test

**Task:** Foreign languages Academy Questions and Answers automation using AI.

**Acceptance criteria:** Use n8n for AI processing with webhooks, telegram bot and email responses with human response when needed. 
- The n8n flow can manage exceptions.
- The AI has a RAG system for answers
- The AI can answer questions in Spanish and English
- The AI responds questions on schedules, prices, levels, inscriptions, certifications and modalities
- There's cached responses for the same questions.
- The application is containerized with docker

## Tech stack
- n8n
- docker
- docker-compose
- node.js
- ChatGPT
### Install tech stack

## Instructions
0. Change into the directory you wish. Example:
```bash
    cd apps/Academy_responses/
```

1. Clone the repository
```bash
    git clone https://github.com/SrLampi1001/ai_assesment_test.git
```

2. Create a .env file  
    Use the .env.example file as a template

3. Execute the docker command
```bash
    docker compose up -d
```

4. If you wish to change the RAG context, change the content of the `rag_context.txt` file in the `rag` folder and restart the application
