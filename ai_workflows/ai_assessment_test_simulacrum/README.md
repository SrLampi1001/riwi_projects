---
author: Santiago Sánchez Ruiz
source_provider: Riwi
status: incomplete
---

# AI Test Simulacrum

This is a simulacrum test for the real assessment test on the first module on AI automation course at Riwi.

## Contents

**Title:**

Intelligent Operations Center for Veterinary Clinic with Multi-Channel and Automatic Triage

**Use Case (Epic):**

As an automation engineer, you transform the operation of "PetCare Medellín" veterinary clinic, which is collapsing due to daily communication volume. The clinic receives inquiries via email, Telegram, and web form. The team loses urgent cases among administrative queries, schedules appointments incorrectly, and veterinarians find out about critical cases too late.

Your challenge is to build a system that receives communications from multiple channels, classifies them automatically, responds when possible based on clinical protocols, registers appointments, and notifies on-duty veterinarians of urgent cases. The complexity is higher than the actual test to better prepare you.

**Functional Requirements**

1. **Multi-channel Reception**

The system must receive messages from at least 2 simultaneous channels (email, Telegram, or webhook/form) and normalize inputs to a common format.

2. **Triage and Classification**

Classify each message into one of 5 categories: URGENCY, APPOINTMENT, QUERY, FOLLOW-UP, ADMINISTRATIVE. Classification must use the LLM with structured JSON output (category, priority, justification).

3. **RAG on Business Protocols**

Load at least 4 business documents (protocols, pricing, FAQ, policies), apply chunking, and store in a vector database. Responses must be based solely on these documents.

4. **Differentiated Actions by Category**

URGENCY → notify on-duty veterinarian via immediate channel

APPOINTMENT → register request in database or Google Sheets

QUERY → respond automatically using RAG

FOLLOW-UP → register and confirm receipt

ADMINISTRATIVE → respond with configured template

5. **Memory and Monitoring**

Maintain context per user across messages. Record basic metrics: queries per channel, escalation rate, API costs.

6. **Extra Points (Max. 15)**

Skills personalized or MCP to extend the agent

Multimodal support (analyze pet images with Vision)

Deploy to public URL (Railway, Vercel, Render, etc.)

Visual metrics dashboard in real-time can be created with Lovable

**Expected Deliverables**

Your delivery must include exactly the following components: a ZIP file containing the entire project (do not upload your GitHub repository)

**Component | Description**

Workflow of n8n | Exported .json file of the complete functional flow

Vector Database | Populated with the 4 business documents (Pinecone, Supabase, or ChromaDB)

Web Platform | Frontend that displays the automation metrics dashboard

Notification System | For urgent cases to the veterinarian (Telegram or similar)

Appointment Registry | Google Sheets, Notion, or database

README in English | With setup, architecture, environment variables, and examples to run it

.env.example | With all necessary variables documented

Dockerfile and docker compose | To containerize everything needed for the project to run

**Evaluation Criteria**

Captación del problema y diseño de arquitectura

Sistema multi-canal funcionando correctamente

Triage preciso con salida estructurada

RAG basado en documentos del negocio

Acciones diferenciadas ejecutándose correctamente

Dashboard y métricas accesibles

Código limpio, modular y con API Keys protegidas

Documentación profesional en inglés
