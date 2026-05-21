# MVP Implementation plan

## 🗺️ VoiceAgent — Project Plan

### Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast setup, you know it |
| Backend | Node.js + Express | You know it, simple REST API |
| AI Agent | NVIDIA NIM (Mistral) via OpenAI-compatible SDK | Free, no extra setup |
| TTS | Browser `Web Speech API` | Zero cost, zero key, works natively |
| STT (if time) | Browser `SpeechRecognition API` | Same, free |
| DB | MongoDB (Docker) | Conversation memory storage |
| Vector DB | pgvector on PostgreSQL (Docker) | RAG extra points, you know Docker |
| Containerization | Docker Compose | One command to run everything |

---

### The 2 Tools (Claude's pick)

**Tool 1: `dictionary_lookup`**
- Hits the free **DictionaryAPI.dev** (no key needed)
- Input: a word + language (`en` or `es`)
- Returns: definition, phonetic, part of speech, example sentence
- *Why:* Perfect for a language assistant, trivially fast to implement, clearly useful

**Tool 2: `translate_and_analyze`**
- Uses **MyMemory API** (free, no key needed, 1000 req/day)
- Input: text + source language + target language
- Returns: translated text + detected formality/quality score
- *Why:* Core to the use case, free, no auth, reliable

Both tools require zero API keys, which keeps `.env.example` clean and demos work instantly.

---

### Architecture

```
Browser (React)
    │
    ├── POST /api/chat  ──────────────► Express (Node)
    │                                       │
    ├── GET  /api/tts (not needed,           ├── AgentService
    │   Web Speech handles it)              │     ├── Mistral (NVIDIA NIM)
    │                                       │     ├── Tool: dictionary_lookup
    └── UI renders:                         │     └── Tool: translate_and_analyze
        ├── Chat history                    │
        ├── Tool-use badges                 └── MongoDB
        └── Text/Voice toggle                    └── Sessions (7-msg memory)
```

---

### Folder Structure

```
voiceagent/
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js          # Express entry point
│   │   ├── routes/chat.js    # POST /api/chat
│   │   ├── agent/
│   │   │   ├── agent.js      # Mistral + tool-calling loop
│   │   │   ├── tools.js      # Tool definitions + implementations
│   │   │   └── prompt.js     # System prompt (5+ instructions)
│   │   └── db/
│   │       └── memory.js     # MongoDB session memory (7 msgs)
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── ChatWindow.jsx     # Message history
        │   ├── MessageBubble.jsx  # Renders text + tool badge
        │   ├── InputBar.jsx       # Text input + send
        │   └── VoiceToggle.jsx    # Text/Voice mode selector
        └── hooks/
            └── useSpeech.js      # Web Speech API (TTS + STT)
```

---

### 6-Hour Timeline

| Block | Time | What you build |
|---|---|---|
| **1** | 0:00–0:45 | Docker Compose up (MongoDB), backend scaffold, `/api/chat` endpoint returning hardcoded JSON |
| **2** | 0:45–1:45 | Agent core: Mistral integration, system prompt, 7-msg memory in MongoDB |
| **3** | 1:45–2:45 | Tools: implement `dictionary_lookup` and `translate_and_analyze`, wire into agent loop |
| **4** | 2:45–3:45 | React frontend: chat window, input bar, message bubbles with tool badges |
| **5** | 3:45–4:30 | Voice toggle + Web Speech API TTS, test end-to-end |
| **6** | 4:30–5:00 | Polish UI, fix bugs, verify all acceptance criteria |
| **Extra** | 5:00–6:00 | RAG pipeline (pgvector + URL scraping) if everything above is solid |

---

### System Prompt (5 instructions, drafted now)

```
You are LinguaBot, a bilingual English-Spanish language assistant.
1. ROLE: Help users translate, understand, and practice English and Spanish.
2. TONE: Friendly, encouraging, and pedagogical. Never condescending.
3. TOOL USE: Always use dictionary_lookup when a user asks about a specific word's meaning, and translate_and_analyze when asked to translate a phrase or sentence.
4. RESTRICTIONS: Only discuss topics related to language learning, translation, grammar, vocabulary, and culture tied to English/Spanish. Politely decline off-topic requests.
5. FORMAT: Keep responses concise (max 3 sentences for direct answers). When using a tool, briefly explain the result in plain language after showing it.
6. LANGUAGE: Detect the user's language automatically and respond in the same language unless they ask otherwise.
7. MEMORY: Reference earlier messages in the conversation naturally when relevant.
```

---

### Key Decisions to Validate Before Starting

1. **NVIDIA NIM base URL** — confirm it's `https://integrate.api.nvidia.com/v1` and your model string is `mistralai/mixtral-8x7b-instruct-v0.1` (or similar). You'll need to check your dashboard.
2. **One command to run** — `docker compose up --build` starts MongoDB + backend + frontend. Confirm Docker Desktop is running on your machine.
3. **No RAG until block 6** — don't touch pgvector until the core 5 blocks are done and tested.
