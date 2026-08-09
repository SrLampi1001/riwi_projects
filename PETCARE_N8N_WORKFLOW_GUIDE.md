# PetCare Medellín - AI Operations Center Implementation Guide

## Overview

This guide details how to build an AI-powered triage and response system for veterinary clinic communications using **n8n**, **Telegram**, **Google Forms**, and **LLM-based classification**.

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│   Telegram  │────▶│   Google     │────▶│   AI Agent        │────▶│  Conditional  │
│   Webhook   │     │   Forms      │     │   (Classifier)    │     │  Router      │
└─────────────┘     │   Webhook    │     │                   │     └──────┬───────┘
                    └──────────────┘     │  - Classify input │            │
                                          │  - Generate resp │     ┌──────┴───────┐
                                          └───────────────────┘     │              │
                                                                       ▼              ▼
                                                               ┌──────────┐   ┌──────────┐
                                                               │  URGENCIA │   │ AGENDAMIE │
                                                               │ Notifier  │   │   NTO     │
                                                               └────┬─────┘   └─────┬─────┘
                                                                    │              │
┌─────────────┐     ┌──────────────┐     ┌───────────────────┐     │              │
│  Dashboard  │◀────│  Metrics     │◀────│   Log All         │◀────┘              │
│  (Frontend) │     │  Collector   │     │   Interactions    │                     │
└─────────────┘     └──────────────┘     └───────────────────┘                     ▼
                                                                     ┌──────────────────┐
                                                                     │ CONSULTA/SEGUIME │
                                                                     │   NTO/RAG        │
                                                                     └──────────────────┘
```

---

## Step 1: Project Initialization

### 1.1 Create Project Directory

```bash
mkdir petcare-medellin-ai
cd petcare-medellin-ai
npm init -y
```

### 1.2 Install Dependencies

```bash
npm install n8n                    # n8n core
npm install @n8n/n8n-nodes-langchain # LangChain nodes for AI
npm install pinecone-client         # Vector DB
npm install googleapis              # Google Sheets API
```

### 1.3 Create Environment File

```bash
touch .env.example
```

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxx

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook/telegram

# Google Forms
GOOGLE_FORMS_WEBHOOK_SECRET=your-webhook-secret

# Vector Database (Pinecone)
PINECONE_API_KEY=xxxx-xxxx-xxxx
PINECONE_INDEX=petcare-protocols

# Google Sheets
GOOGLE_SHEETS_CREDENTIALS=path/to/credentials.json
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms

# Notification
VET_TELEGRAM_CHAT_ID=123456789

# Optional: Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGcOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 2: Prepare Business Documents (RAG)

Create a `business-docs/` folder with at least 4 documents:

1. `protocolos_clinicos.md` - Medical protocols
2. `precios_servicios.md` - Service pricing
3. `faq.md` - Frequently asked questions
4. `politicas.md` - Clinic policies

### Document Format Example

```markdown
# Protocolos Clínicos - PetCare Medellín

## Urgencias Críticas
- **Código Rojo**: Dificultad respiratoria, envenenamiento, trauma craneoencefálico
- **Código Amarillo**: Hemorragias controladas, fracturas, quemadurás moderadas

## Tiempo de Respuesta
- Código Rojo: Atención inmediata
- Código Amarillo: Atención en 30 minutos
- Código Verde: Cita programada
```

---

## Step 3: n8n Workflow Design

### 3.1 Core Workflow Nodes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WORKFLOW STRUCTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────────┐    ┌────────────────────────────┐ │
│  │ Telegram     │    │ Google Forms     │    │  Code Node                 │ │
│  │ Trigger      │    │ Webhook          │    │  (Normalize Input)         │ │
│  │              │    │                  │    │                            │ │
│  │ on message   │    │ on form submit   │    │ {                          │ │
│  │ received     │    │                  │    │   source: "telegram|form", │ │
│  └──────┬───────┘    └────────┬─────────┘    │   user_id: "...",          │ │
│         │                     │              │   message: "...",          │ │
│         └────────┬────────────┘              │   timestamp: "..."         │ │
│                  │                           │  }                         │ │
│                  ▼                           └─────────────┬───────────────┘ │
│         ┌───────────────────────────────────────────────┐ │                  │
│         │            AI Agent (Classifier)              │ │                  │
│         │                                               │ │                  │
│         │  Model: gpt-4o                                │ │                  │
│         │  Output: Structured JSON                      │ │                  │
│         │                                               │ │                  │
│         │  System Prompt:                               │ │                  │
│         │  "Eres un clasificador de mensajes para       │ │                  │
│         │   clínica veterinaria. Clasifica en:          │ │                  │
│         │   URGENCIA, AGENDAMIENTO, CONSULTA,           │ │                  │
│         │   SEGUIMIENTO, ADMINISTRATIVA.                │ │                  │
│         │   Responde SOLO con JSON válido."             │ │                  │
│         │                                               │ │                  │
│         │  Input: message normalized                    │ │                  │
│         └───────────────────────────────────────────────┘ │                  │
│                            │                               │                  │
│                            ▼                               ▼                  │
│         ┌──────────────────────────────────────────────────────────────┐    │
│         │                    Code Node (Parse LLM Output)              │    │
│         │                                                             │    │
│         │  const classification = JSON.parse($json.classification);   │    │
│         │  return {                                                    │    │
│         │    category: classification.categoria,                      │    │
│         │    priority: classification.prioridad,                      │    │
│         │    justification: classification.justificacion,             │    │
│         │    originalMessage: $input.first().json.message             │    │
│         │  };                                                         │    │
│         └──────────────────────────────────────────────────────────────┘    │
│                            │                                                  │
│                            ▼                                                  │
│         ┌──────────────────────────────────────────────────────────────┐    │
│         │              Conditional Router (Switch)                      │    │
│         │                                                              │    │
│         │  $json.category === 'URGENCIA'        → URGENCIA branch      │    │
│         │  $json.category === 'AGENDAMIENTO'   → AGENDAMIENTO branch   │    │
│         │  $json.category === 'CONSULTA'       → CONSULTA branch       │    │
│         │  $json.category === 'SEGUIMIENTO'    → SEGUIMIENTO branch    │    │
│         │  $json.category === 'ADMINISTRATIVA' → ADMINISTRATIVA branch │    │
│         └──────────────────────────────────────────────────────────────┘    │
│                            │                                                  │
│         ┌──────────────────┼──────────────────┐                             │
│         ▼                  ▼                  ▼                              │
│    ┌─────────┐       ┌───────────┐      ┌──────────┐                         │
│    │URGENCIA │       │AGENDAMIE  │      │ RAG      │                         │
│    │Notifier │       │  NTO      │      │ Response │                         │
│    └────┬────┘       └─────┬─────┘      └────┬─────┘                         │
│         │                  │                 │                               │
│         └──────────────────┴─────────────────┘                               │
│                            │                                                  │
│                            ▼                                                  │
│         ┌──────────────────────────────────────────────────────────────┐    │
│         │                    Telegram / Form Response                   │    │
│         │                    (Reply to user)                            │    │
│         └──────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Node-by-Node Configuration

---

#### Node 1: Telegram Trigger

```javascript
{
  name: "Telegram Trigger",
  type: "n8n-nodes-telegram.telegramTrigger",
  parameters: {
    botToken: "{{ $env.TELEGRAM_BOT_TOKEN }}",
    updates: {
      allowedUpdates: ["message"]
    }
  }
}
```

**Webhook URL**: Copy the URL generated by n8n and set it in Telegram:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=<N8N_WEBHOOK_URL>
```

---

#### Node 2: Google Forms Webhook

```javascript
{
  name: "Google Forms Webhook",
  type: "n8n-nodes-webhook.webhook",
  parameters: {
    httpMethod: "POST",
    path: "google-forms",
    responseMode: "onReceived",
    responseData: "allEntries"
  }
}
```

**Google Forms Setup**:

1. Create a form with fields: `user_email`, `pet_name`, `message`, `preferred_date`
2. Go to Form → Responses → Connect to Sheets
3. Use n8n's Google Sheets node to poll or use Apps Script webhook

---

#### Node 3: Normalize Input Code Node

```javascript
// Normalize Input
const telegramData = $input.first().json;

let normalized = {
  source: 'unknown',
  user_id: '',
  user_name: '',
  message: '',
  timestamp: new Date().toISOString(),
  metadata: {}
};

// Detect source and normalize
if (telegramData.message) {
  // Telegram message
  normalized.source = 'telegram';
  normalized.user_id = String(telegramData.message.chat.id);
  normalized.user_name = telegramData.message.chat.first_name || 'Unknown';
  normalized.message = telegramData.message.text;
  normalized.metadata = {
    message_id: telegramData.message.message_id
  };
} else if (telegramData.body) {
  // Google Forms webhook
  normalized.source = 'google_forms';
  normalized.user_id = telegramData.body.email || telegramData.body.sender_email || 'anonymous';
  normalized.user_name = telegramData.body.name || 'Form User';
  normalized.message = telegramData.body.message || telegramData.body.preferred_date;
  normalized.metadata = {
    form_response: telegramData.body
  };
}

return [{ json: normalized }];
```

---

#### Node 4: AI Agent (Classifier)

```javascript
{
  name: "AI Classifier Agent",
  type: "@n8n/n8n-nodes-langchain.agent",
  parameters: {
    model: "gpt-4o",
    systemPrompt: `Eres un agente clasificador para la clínica veterinaria PetCare Medellín.

Tu tarea es analizar el mensaje del usuario y clasificarlo en UNA de las siguientes categorías:

1. **URGENCIA** - Casos que requieren atención veterinaria inmediata:
   - Síntomas graves: dificultad respiratoria, envenenamiento, hemorragias
   - Trauma: golpes, caídas, accidentes
   - Comportamiento extraño inusual

2. **AGENDAMIENTO** - Solicitudes de citas:
   - "necesito una cita"
   - "quiero agendar"
   - Fecha específica requerida

3. **CONSULTA** - Preguntas sobre servicios, precios, protocolos:
   - "¿Cuánto cuesta...?"
   - "¿Cuál es el horario...?"
   - "¿Qué servicios ofrecen?"

4. **SEGUIMIENTO** - Actualizaciones sobre pacientes existentes:
   - "Mi mascota ya está mejor"
   - "Resultados de exámenes"
   - "Control post-tratamiento"

5. **ADMINISTRATIVA** - Solicitudes administrativas:
   - Facturación
   - Horarios de atención
   - Ubicación
   - Contacto

Responde ÚNICAMENTE con JSON válido, sin explicaciones adicionales:

{
  "categoria": "CATEGORÍA",
  "prioridad": 1-5,
  "justificacion": "breve explicación de por qué se clasificó así"
}`,
    temperature: 0.1,
    responseFormat: "json_object"
  }
}
```

**Prompt Template** (use expression mode):

```
The following message needs classification:

User: {{ $json.user_name }}
Message: {{ $json.message }}
Source: {{ $json.source }}

Classify this message according to the system instructions.
```

---

#### Node 5: Parse Classification Code Node

```javascript
// Parse LLM Classification Output
const input = $input.first().json;

// The LLM should return JSON as string in 'output'
let classificationText = input.output || input.text || JSON.stringify(input);

// Parse if string
if (typeof classificationText === 'string') {
  try {
    classificationText = JSON.parse(classificationText);
  } catch (e) {
    // Try to extract JSON from response
    const jsonMatch = classificationText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      classificationText = JSON.parse(jsonMatch[0]);
    }
  }
}

return [{
  json: {
    category: classificationText.categoria || classificationText.category || 'ADMINISTRATIVA',
    priority: classificationText.prioridad || classificationText.priority || 3,
    justification: classificationText.justificacion || classificationText.justification || '',
    originalMessage: $('Normalize Input').first().json.message,
    user_id: $('Normalize Input').first().json.user_id,
    source: $('Normalize Input').first().json.source
  }
}];
```

---

#### Node 6: Conditional Router (Switch Node)

```javascript
{
  name: "Route by Category",
  type: "switch",
  parameters: {
    dataType: "string",
    value1: "={{ $json.category }}",
    rules: {
      rules: [
        { value2: "URGENCIA", operation: "equals" },
        { value2: "AGENDAMIENTO", operation: "equals" },
        { value2: "CONSULTA", operation: "equals" },
        { value2: "SEGUIMIENTO", operation: "equals" },
        { value2: "ADMINISTRATIVA", operation: "equals" }
      ]
    },
    fallbackOutput: "default"
  },
  // Connect each output to respective branch
  outputs: ["URGENCIA", "AGENDAMIENTO", "CONSULTA", "SEGUIMIENTO", "ADMINISTRATIVA"]
}
```

---

#### Node 7a: URGENCIA Branch - Vet Notification

```javascript
{
  name: "Notify Vet (URGENCIA)",
  type: "n8n-nodes-telegram.telegram",
  parameters: {
    message: `🚨 URGENCIA VETERINARIA 🚨

Cliente: {{ $json.user_name }}
ID: {{ $json.user_id }}

Mensaje:
{{ $('Normalize Input').first().json.message }}

Clasificación:
- Prioridad: {{ $json.priority }}/5
- Justificación: {{ $json.justification }}

⏰ Hora: {{ $json.timestamp }}
🔗 Fuente: {{ $json.source }}`,
    chatId: "{{ $env.VET_TELEGRAM_CHAT_ID }}"
  }
}
```

---

#### Node 7b: AGENDAMIENTO Branch - Create Appointment

```javascript
{
  name: "Create Appointment",
  type: "googleSheets",
  parameters: {
    operation: "append",
    sheetId: "{{ $env.GOOGLE_SHEET_ID }}",
    range: "A:E",
    columns: {
      mappingMode: "defineBelow",
      value: {
        timestamp: "={{ $now.toISO() }}",
        user_id: "={{ $json.user_id }}",
        user_name: "={{ $('Normalize Input').first().json.user_name }}",
        message: "={{ $json.originalMessage }}",
        status: "PENDIENTE"
      }
    }
  }
}
```

---

#### Node 7c: CONSULTA Branch - RAG Response

```javascript
{
  name: "RAG Query",
  type: "@n8n/n8n-nodes-langchain.vectorStorePinecone",
  parameters: {
    operation: "search",
    pineconeApiKey: "{{ $env.PINECONE_API_KEY }}",
    index: "{{ $env.PINECONE_INDEX }}",
    query: "={{ $json.originalMessage }}",
    limit: 3
  }
}
```

Then use another AI Agent to generate response based on RAG results.

---

#### Node 7d: SEGUIMIENTO Branch - Log & Confirm

```javascript
{
  name: "Log Seguimiento",
  type: "code",
  parameters: {
    jsCode: `// Log to database or sheet
return [{ json: { status: 'logged', category: 'SEGUIMIENTO' } }];`
  }
}
```

---

#### Node 7e: ADMINISTRATIVA Branch - Template Response

```javascript
{
  name: "Administrative Response",
  type: "n8n-nodes-telegram.telegram",
  parameters: {
    message: `Hola {{ $json.user_name }},

Gracias por contactar a PetCare Medellín 🐾

📍 **Ubicación:** Calle 10 #45-67, El Poblado
📞 **Teléfono:** +57 300 123 4567
⏰ **Horario:** Lunes a Sábado 7:00 AM - 8:00 PM

¿Hay algo más en lo que pueda ayudarte?`,
    chatId: "={{ $json.user_id }}"
  }
}
```

---

#### Node 8: Metrics Logger (All Branches)

```javascript
{
  name: "Log Metrics",
  type: "code",
  parameters: {
    jsCode: `
const metrics = {
  timestamp: new Date().toISOString(),
  channel: $('Normalize Input').first().json.source,
  category: $json.category,
  priority: $json.priority,
  response_time_ms: Date.now() - new Date($('Normalize Input').first().json.timestamp).getTime()
};

// Send to metrics database or log
return [{ json: metrics }];
`
  }
}
```

---

## Step 4: Set Up Vector Database (Pinecone)

### 4.1 Create Pinecone Index

1. Sign up at [pinecone.io](https://pinecone.io)
2. Create index: `petcare-protocols`
3. Dimension: 1536 (for OpenAI embeddings)
4. Metric: cosine

### 4.2 Populate with Documents

```javascript
// Ingestion workflow
{
  name: "Ingest Business Documents",
  type: "code",
  parameters: {
    jsCode: `
const fs = require('fs');
const path = require('path');

// Read all business docs
const docsDir = './business-docs';
const files = fs.readdirSync(docsDir);

const documents = [];
for (const file of files) {
  const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
  documents.push({
    content: content,
    metadata: { source: file }
  });
}

return documents.map(d => ({ json: d }));
`
  }
}
```

Then connect to **Pinecone Upsert** node with OpenAI Embeddings.

---

## Step 5: Environment Configuration

Create `.env` file:

```env
# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=secure-password
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=http

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_URL=https://your-domain.com/webhook/telegram

# Vector DB
PINECONE_API_KEY=xxxx-xxxx-xxxx
PINECONE_INDEX=petcare-protocols

# Google
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
VET_TELEGRAM_CHAT_ID=123456789

# App
WEBHOOK_URL=https://your-domain.com
```

---

## Step 6: Docker Deployment

### Dockerfile

```dockerfile
FROM n8nio/n8n:latest

WORKDIR /data

COPY business-docs ./business-docs
COPY .env ./.env

RUN npx n8n import:workflow --input=/data/workflows

EXPOSE 5678

CMD ["n8n", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    build: .
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
      - GOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}
      - VET_TELEGRAM_CHAT_ID=${VET_TELEGRAM_CHAT_ID}
    volumes:
      - ./workflows:/data/workflows
      - ./business-docs:/data/business-docs
      - n8n_data:/data

  # Optional: Qdrant vector DB (alternative to Pinecone)
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  n8n_data:
  qdrant_data:
```

---

## Step 7: Testing

### 7.1 Test Telegram

```bash
# Send test message to bot
curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d chat_id=<YOUR_CHAT_ID> \
  -d text="Mi perro no puede respirar, está tosiendo mucho"
```

### 7.2 Test Google Forms

Submit a form response and check n8n webhook logs.

### 7.3 Verify Classification

Check n8n execution log to see:

- Input normalization
- AI classification response
- Routing to correct branch

---

## Step 8: Monitoring & Metrics

### Recommended Metrics

| Metric                | Description                    |
| --------------------- | ------------------------------ |
| `total_messages`    | Total messages processed       |
| `by_channel`        | Breakdown by Telegram vs Forms |
| `by_category`       | Distribution of categories     |
| `avg_response_time` | Time from receive to response  |
| `escalation_rate`   | % of URGENCIA messages         |
| `api_cost`          | Estimated OpenAI costs         |

### Dashboard Options

1. **Grafana** - Connect to n8n metrics DB
2. **Lovable** - Build React dashboard
3. **Google Sheets** - Simple metrics tracker

---

## Common Issues & Solutions

| Issue                         | Solution                                       |
| ----------------------------- | ---------------------------------------------- |
| Telegram webhook not working  | Verify URL is HTTPS and accessible             |
| AI returns non-JSON           | Add `response_format: json_object` to prompt |
| Classification accuracy low   | Refine system prompt with more examples        |
| Google Forms data missing     | Check webhook payload structure                |
| Vector search returns nothing | Re-index documents with proper chunking        |

---

## File Structure

```
petcare-medellin-ai/
├── .env.example
├── .env
├── Dockerfile
├── docker-compose.yml
├── workflows/
│   └── petcare-triage-workflow.json
├── business-docs/
│   ├── protocolos_clinicos.md
│   ├── precios_servicios.md
│   ├── faq.md
│   └── politicas.md
├── README.md
└── metrics/
    └── dashboard/ (optional)
```

---

## Next Steps

1. Set up n8n instance
2. Create Telegram bot and configure webhook
3. Prepare and upload business documents to Pinecone
4. Import the provided workflow JSON
5. Test each branch individually
6. Deploy with Docker
7. Set up monitoring dashboard
