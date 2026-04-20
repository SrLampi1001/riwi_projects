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
   - Used by nodes (Redis, HTTP Request, etc.)
   - Must be created in the UI or imported

---

## Setup Steps

### 1. Start the Application

```bash
docker compose up -d
```

### 2. Create Initial Admin User

1. Open http://localhost:5678
2. You'll be prompted to create an account
3. Use the credentials from your `.env`:
   - Email: Whatever you want (these aren't used for login in basic auth mode)
   - Password: Use `N8N_BASIC_AUTH_PASSWORD` value
4. Or if already logged in before, use the basic auth user/password

### 3. Create Credentials in n8n UI

For each service, create a credential in **Settings > Credentials**:

#### Redis Credentials
1. Go to **Settings > Credentials > New Credential**
2. Select **Redis API**
3. Configure:
   - **Host**: `redis` (the container name)
   - **Port**: `6379`
4. **Name it**: `Redis API`

#### Google Gemini API
n8n v2 with LangChain nodes uses OAuth2 for Google Gemini. To use the `Google Gemini Chat Model` and `Embeddings Google Gemini` nodes:

**Prerequisites:**
- A Google AI Studio API key (get it at https://aistudio.google.com/app/apikey)

**Setup:**
1. Go to **Settings > Credentials > New Credential**
2. Select **Google Gemini API**
3. Configure:
   - **API Key**: `={{ $env.GOOGLE_API_KEY }}` (or paste your key directly)
   - **Name it**: `Google Gemini API`
4. Save

**For the workflow (`academy-ai-workflow-v2.json`):**
- It expects a credential named `Google Gemini API`
- If you named it differently, update the credential reference in the workflow nodes

**Alternative: Direct API Key in Nodes**
If credential-based auth doesn't work, you can use the HTTP Request node with:
- URL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={{ $env.GOOGLE_API_KEY }}`

#### Telegram Bot
1. Go to **Settings > Credentials > New Credential**
2. Select **Telegram Bot Api**
3. Enter your bot token (get from @BotFather on Telegram)
4. Save

#### Email/SMTP
1. Go to **Settings > Credentials > New Credential**
2. Select **SMTP** (or "Email (SMTP)" depending on n8n version)
3. Configure:
   - **Host**: `{{ $env.EMAIL_SMTP_HOST }}`
   - **Port**: `{{ $env.EMAIL_SMTP_PORT }}`
   - **User**: `{{ $env.EMAIL_SMTP_USER }}`
   - **Password**: `{{ $env.EMAIL_SMTP_PASS }}`
   - **From Email**: `{{ $env.EMAIL_FROM }}`
4. Save

---

## Alternative: Import Workflow with Embedded Credentials

For automated/CI setups, you can import workflows with credentials pre-configured:

### Limitations
- Credentials are encrypted with a master key
- Requires `N8N_ENCRYPTION_KEY` to be set consistently
- Not recommended for local development

### Process
1. Create credentials in UI first
2. Export workflow (includes credential IDs)
3. Other n8n instances can import if they have the same `N8N_ENCRYPTION_KEY`

---

## Using Environment Variables in Workflows

### Via $env Variable
In Code nodes or expressions:
```javascript
const apiKey = $env.GOOGLE_API_KEY;
```

### Via Variable Selector
In HTTP Request nodes, use the variable selector to pick:
`{{ $env.VARIABLE_NAME }}`

### Available Environment Variables
| Variable | Description |
|----------|-------------|
| `GOOGLE_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | Gemini model to use (default: gemini-1.5-flash) |
| `N8N_BASIC_AUTH_USER` | n8n login username |
| `N8N_BASIC_AUTH_PASSWORD` | n8n login password |
| `N8N_ENCRYPTION_KEY` | Encryption key for credential storage |
| `REDIS_HOST` | Redis container hostname |
| `REDIS_PORT` | Redis port |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `HUMAN_SUPPORT_CHAT_ID` | Telegram chat ID for admin notifications |
| `HUMAN_SUPPORT_EMAIL` | Email address for admin notifications |
| `EMAIL_FROM` | From email address for outgoing emails |
| `EMAIL_SMTP_HOST` | SMTP server hostname |
| `EMAIL_SMTP_PORT` | SMTP server port |

---

## Troubleshooting

### "Invalid credentials" when workflow runs
1. Ensure credentials are created in **Settings > Credentials**
2. Check that credential names match what nodes expect
3. Verify `N8N_ENCRYPTION_KEY` hasn't changed (it would invalidate all credentials)

### "Login failed" for n8n UI
1. Check `N8N_BASIC_AUTH_*` env vars are set correctly in `.env`
2. Restart n8n container: `docker compose restart n8n`
3. Clear browser cookies/localStorage

### Can't access environment variables in nodes
1. Ensure the variable exists in your `.env` file
2. Restart n8n after adding new env vars: `docker compose restart n8n`
3. Use exact syntax: `={{$env.VARIABLE_NAME}}`

---

## Security Notes

- **Never commit `.env` to git** - it contains secrets
- **Use strong `N8N_ENCRYPTION_KEY`** - Generate with `openssl rand -hex 32`
- **Change default passwords** - Update all `*_PASSWORD` values
- **Redis has no authentication** - It's only accessible within the Docker network
- **PostgreSQL credentials** - Used internally, change for production

---

## RAG Context File

The RAG context file is mounted into the n8n container at `/data/rag/rag_context.txt`.

**Location in project:** `rag/rag_context.txt`

**To update the AI's knowledge base:**
1. Edit `rag/rag_context.txt`
2. Restart n8n: `docker compose restart n8n`

**Note:** The in-memory vector store is rebuilt on every workflow execution. For production with better performance, consider using a persistent vector store (like Qdrant or Pinecone).

---

## Workflow Files

Two workflow templates are provided:

1. **`workflows/academy-ai-workflow.json`** - Basic workflow with RAG support
2. **`workflows/academy-ai-workflow-v2.json`** - Full workflow with human handoff support

**To import a workflow:**
1. Open n8n at http://localhost:5678
2. Go to **Settings > Workflows**
3. Click **Import from JSON**
4. Paste the workflow JSON or upload the file

**After import:**
1. Create the required credentials (Google Gemini API, Redis, Telegram, SMTP)
2. Open each node that needs credential selection and pick the appropriate credential
3. Activate the workflow