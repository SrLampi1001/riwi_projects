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

#### Google Gemini API (HTTP Query Auth)
Since n8n doesn't have a native Gemini credential type, we use HTTP Query authentication:

1. Go to **Settings > Credentials > New Credential**
2. Select **HTTP Header Auth** (or just use `{{$env.GOOGLE_API_KEY}}` directly in nodes)
3. For simplicity, we recommend using environment variable interpolation in HTTP Request nodes:
   - Use `={{$env.GOOGLE_API_KEY}}` in the API key field

#### Telegram Bot (optional)
1. Go to **Settings > Credentials > New Credential**
2. Select **Telegram Bot Api** (if available) or use HTTP Request
3. Enter your bot token

#### Email/SMTP
1. Go to **Settings > Credentials > New Credential**
2. Select **SMTP' (or similar, depending on n8n version)
3. Configure your SMTP settings

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
| `N8N_BASIC_AUTH_USER` | n8n login username |
| `N8N_BASIC_AUTH_PASSWORD` | n8n login password |
| `REDIS_HOST` | Redis container hostname |
| `REDIS_PORT` | Redis port |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |

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