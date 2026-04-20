# AI Automatization Assessment test

**Task:** Foreign languages Academy Questions and Answers automation using AI.

**Acceptance criteria:** Use n8n for AI processing with webhooks, telegram bot and email responses with human response when needed.

- The n8n flow can manage exceptions.
- The AI has a RAG system for answers
- The AI can answer questions in Spanish and English
- The AI responds questions on schedules, prices, levels, inscriptions, certifications and modalities
- There's cached responses for the same questions (embedding similarity-based)
- The application is containerized with docker

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Docker Network                                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     n8n      │  │  PostgreSQL  │  │     Redis        │  │
│  │    :5678     │  │    :5432     │  │     :6379        │  │
│  │              │◄─┤ (n8n_db +    │◄─┤   (caching)      │  │
│  │ AI Workflows │  │  users_db)   │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ RAG Context (volume mount)                              ││
│  │ rag/rag_context.txt                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- n8n (workflow automation)
- PostgreSQL 15 (databases)
- Redis 7 (caching)
- Docker & Docker Compose

## Quick Start

### 1. Copy environment file

```bash
cp .env.example .env
```

### 2. Configure your environment

Edit `.env` and fill in:

- `GOOGLE_API_KEY` - Get one at [Google AI Studio](https://aistudio.google.com/app/apikey)
- `N8N_ENCRYPTION_KEY` - Generate with: `openssl rand -hex 32`
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token (from @BotFather)
- `EMAIL_SMTP_*` - Your email SMTP settings
- `IMAP_*` - Your email IMAP settings (for receiving emails)
- `HUMAN_SUPPORT_CHAT_ID` - Your Telegram chat ID (for admin notifications)
- Update all passwords for security

### 3. Create credentials in n8n

After starting, you must create credentials in n8n UI:

1. Go to http://localhost:5678 > Settings > Credentials
2. Create these credentials:
   - **Redis API**: Host=`redis`, Port=6379
   - **IMAP Email**: Use your IMAP settings
   - **SMTP Email**: Use your SMTP settings
   - **Telegram Bot Api**: Your bot token

### 3. Start the application

```bash
docker compose up -d
```

### 4. Access n8n

Open http://localhost:5678 and login with:
- User: `admin`
- Password: (from your `.env` file)

## Updating RAG Context

Edit the `rag/rag_context.txt` file to update the AI's knowledge base. Restart n8n to apply changes:

```bash
docker compose restart n8n
```

## Caching Configuration

The system uses embedding similarity by default for cached responses. To change the caching strategy:

1. Edit `.env`
2. Change `CACHE_STRATEGY` to `exact` if you want exact question matching
3. Adjust `CACHE_SIMILARITY_THRESHOLD` (0.0 to 1.0) to control similarity matching strictness

## User Input Channels

Users can ask questions via:

- **Telegram Bot** - Send messages to your Telegram bot
- **Email** - Send emails to your configured SMTP address
- **Web Form** - Via n8n webhook endpoints

## Stopping the Application

```bash
docker compose down
```

To also remove volumes (deletes all data):

```bash
docker compose down -v
```

## Project Structure

```
.
├── docker-compose.yml     # Main compose file
├── .env.example           # Environment template
├── .env                   # Your environment (not committed)
├── .gitignore
├── rag/
│   └── rag_context.txt    # RAG knowledge base
├── postgres-init/
│   └── init-multiple-dbs.sh  # Database initialization
├── workflows/
│   └── academy-ai-workflow-stable.json  # Recommended workflow
└── README.md
```

## Workflow

Use `workflows/academy-ai-workflow-stable.json` - it uses only standard n8n nodes:
- Webhook trigger (for web forms)
- Telegram trigger (for Telegram bot)
- Email trigger via IMAP (for email questions)
- Redis for response caching
- HTTP Request to Gemini API (no LangChain nodes needed)
- Code nodes for logic and parsing

## Health Checks

- n8n: http://localhost:5678/healthz
- PostgreSQL: `docker exec academy_postgres pg_isready`
- Redis: `docker exec academy_redis redis-cli ping`

## Next Steps

After verifying the AI responses work correctly:

1. Set up the admin panel for human intervention on unanswered questions
2. Configure web form UI
3. Add more RAG context for specific topics