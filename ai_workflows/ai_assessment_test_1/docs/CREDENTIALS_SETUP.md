# N8N Credential Setup Guide

## Understanding n8n Credentials in v2

n8n v2 stores credentials encrypted in the database. The `N8N_BASIC_AUTH_*` environment variables control **UI login access**, not workflow credentials.

### The Two Authentication Systems

1. **n8n UI Login** (Basic Auth)
   - Controlled by `N8N_BASIC_AUTH_*` env vars
   - Used to access http://localhost:5678
   - Creates the initial admin user

2. **Workflow Credentials** (Encrypted in DB)
   - Stored in PostgreSQL, encrypted with `N8N_ENCRYPTION_KEY`
   - Used by nodes (Redis, IMAP, SMTP, Telegram, etc.)
   - Must be created in the UI or imported

---

## Required Credentials

The workflow `academy-ai-workflow-stable.json` requires these credentials:

### 1. Redis API
1. Go to **Settings > Credentials > New Credential**
2. Select **Redis API**
3. Configure:
   - **Host**: `redis` (the container name, or `{{ $env.REDIS_HOST }}`)
   - **Port**: `6379` (or `{{ $env.REDIS_PORT }}`)
4. Save as `Redis API`

### 2. IMAP (Email Inbox - for Email Trigger)
1. Go to **Settings > Credentials > New Credential**
2. Select **IMAP Email** (or "Email (IMAP)")
3. Configure:
   - **Host**: `{{ $env.IMAP_HOST }}` (e.g., imap.gmail.com)
   - **Port**: `{{ $env.IMAP_PORT }}` (993 for SSL)
   - **User**: `{{ $env.IMAP_USER }}`
   - **Password**: `{{ $env.IMAP_PASS }}`
4. Save as `IMAP Email`

### 3. SMTP (Email Sending)
1. Go to **Settings > Credentials > New Credential**
2. Select **SMTP** (or "Email (SMTP)")
3. Configure:
   - **Host**: `{{ $env.EMAIL_SMTP_HOST }}`
   - **Port**: `{{ $env.EMAIL_SMTP_PORT }}`
   - **User**: `{{ $env.EMAIL_SMTP_USER }}`
   - **Password**: `{{ $env.EMAIL_SMTP_PASS }}`
   - **From Email**: `{{ $env.EMAIL_FROM }}`
4. Save as `SMTP Email`

### 4. Telegram Bot
1. Get your bot token from [@BotFather](https://t.me/BotFather) on Telegram
2. Go to **Settings > Credentials > New Credential**
3. Select **Telegram Bot Api**
4. Enter your bot token
5. Save as `Telegram Bot`

### 5. Google Gemini API Key
The workflow uses HTTP Request to call Gemini directly, so no special credential is needed. The API key is passed via `{{ $env.GOOGLE_API_KEY }}` in the URL query parameter.

If you prefer credential-based auth:
1. Go to **Settings > Credentials > New Credential**
2. Select **Google Gemini API** (if available in your n8n version)
3. Enter your API key from https://aistudio.google.com/app/apikey

---

## Using Environment Variables in Workflows

### Available Environment Variables
| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | Gemini model (default: gemini-1.5-flash) |
| `N8N_BASIC_AUTH_USER` | n8n login username |
| `N8N_BASIC_AUTH_PASSWORD` | n8n login password |
| `N8N_ENCRYPTION_KEY` | Encryption key for credential storage |
| `REDIS_HOST` | Redis container hostname (redis) |
| `REDIS_PORT` | Redis port (6379) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `HUMAN_SUPPORT_CHAT_ID` | Telegram chat ID for admin notifications |
| `HUMAN_SUPPORT_EMAIL` | Email address for admin notifications |
| `EMAIL_FROM` | From email address for outgoing emails |
| `EMAIL_SMTP_HOST` | SMTP server hostname |
| `EMAIL_SMTP_PORT` | SMTP server port |
| `IMAP_HOST` | IMAP server hostname |
| `IMAP_PORT` | IMAP server port |
| `IMAP_USER` | IMAP username |
| `IMAP_PASS` | IMAP password |

---

## Workflow Files

### Recommended: `workflows/academy-ai-workflow-stable.json`
Uses only standard n8n nodes (no LangChain dependencies):
- Webhook trigger
- Telegram trigger
- Email (IMAP) trigger
- Redis caching
- HTTP Request for Gemini API
- Code nodes for logic

### Legacy: `workflows/academy-ai-workflow-v2.json`
Uses LangChain nodes (requires `@n8n/n8n-nodes-langchain` package).

### Legacy: `workflows/academy-ai-workflow.json`
Basic workflow with Redis but no Email trigger.

---

## To Import and Activate the Workflow

1. **Start the application:**
   ```bash
   docker compose up -d
   ```

2. **Open n8n** at http://localhost:5678 and log in

3. **Import the workflow:**
   - Go to **Settings > Workflows**
   - Click **Import from JSON**
   - Upload `workflows/academy-ai-workflow-stable.json`

4. **Create credentials** (if not already created):
   - Redis API
   - IMAP Email
   - SMTP Email
   - Telegram Bot

5. **Assign credentials** to nodes:
   - Open each node that requires credentials
   - Select the appropriate credential from the dropdown

6. **Activate the workflow:**
   - Toggle the workflow to "Active"

7. **Test:**
   - Webhook: `POST http://localhost:5678/webhook/academy-webhook` with `{"question": "Cuales son los horarios?"}`
   - Telegram: Send a message to your bot
   - Email: Send an email to your configured inbox

---

## Troubleshooting

### "Node does not exist" errors
This means the LangChain nodes aren't installed. Use `academy-ai-workflow-stable.json` instead.

### Redis connection fails
1. Check Redis is running: `docker compose ps redis`
2. Verify Redis credentials: Host should be `redis` not `localhost`

### Email trigger not working
1. Enable IMAP on your Gmail account:
   - Go to Google Account > Security
   - Enable "Less secure app access" OR use an App Password
2. For Gmail with 2FA, use an App Password instead of your regular password

### Gemini API errors
1. Verify `GOOGLE_API_KEY` is set in `.env`
2. Restart n8n after changing env vars: `docker compose restart n8n`
3. Check the API key is valid at https://aistudio.google.com/app/apikey

---

## RAG Context File

The RAG context file is mounted into the n8n container at `/data/rag/rag_context.txt`.

**Location in project:** `rag/rag_context.txt`

**To update the AI's knowledge base:**
1. Edit `rag/rag_context.txt`
2. Restart n8n: `docker compose restart n8n`

---

## Security Notes

- **Never commit `.env` to git** - it contains secrets
- **Use strong `N8N_ENCRYPTION_KEY`** - Generate with `openssl rand -hex 32`
- **Change default passwords** - Update all `*_PASSWORD` values
- **Redis has no authentication** - It's only accessible within the Docker network
- **PostgreSQL credentials** - Used internally, change for production
- **IMAP/SMTP credentials** - Use App Passwords for Gmail