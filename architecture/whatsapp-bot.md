# Module 4 – AI WhatsApp Support Bot Architecture

## Overview

This document describes the system design for an AI-powered WhatsApp support bot integrated into the Rayeva platform. The bot handles customer queries about orders, returns, and refunds using Gemini AI for intent detection and natural language responses.

---

## System Flow

```
Customer (WhatsApp)
       │
       ▼
  Twilio API  ──────────────────────────────────────────────┐
       │                                                     │
       ▼                                                     │
POST /api/whatsapp  (Vercel Serverless)                      │
       │                                                     │
       ├── 1. Parse incoming message                         │
       ├── 2. Send message to Gemini for intent detection    │
       │         Intents: order_status | return_policy |     │
       │                  refund_request | general_query     │
       ├── 3. Route by intent:                               │
       │         order_status   → Query MongoDB for order    │
       │         return_policy  → Return static policy text  │
       │         refund_request → Escalate + log ticket      │
       │         general_query  → Gemini generates reply     │
       ├── 4. Log conversation to AILog collection           │
       └── 5. Send reply back via Twilio API ────────────────┘
```

---

## Components

### Twilio WhatsApp Webhook
- Twilio receives the WhatsApp message and forwards it via HTTP POST to `/api/whatsapp`.
- The payload includes `From` (customer phone), `Body` (message text), and `WaId` (WhatsApp ID).

### Intent Detection (Gemini)
Prompt sent to Gemini:
```
Classify the following customer message into one of these intents:
order_status, return_policy, refund_request, general_query.
Return only the intent label.

Message: "<customer message>"
```

### Intent Handlers

| Intent | Action |
|---|---|
| `order_status` | Query MongoDB `orders` collection by order ID extracted from message |
| `return_policy` | Return pre-written policy from a config file |
| `refund_request` | Create a support ticket in MongoDB, notify admin, reply with ticket ID |
| `general_query` | Send full message to Gemini for a free-form sustainable commerce response |

### Conversation Logging
Every interaction is saved to the `AILog` collection:
```json
{
  "module": "WhatsApp Bot",
  "prompt": "<customer message>",
  "response": "<bot reply>",
  "metadata": {
    "phone": "<WaId>",
    "intent": "order_status"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Refund Escalation Logic

1. Gemini detects `refund_request` intent.
2. System creates a `SupportTicket` document in MongoDB with status `open`.
3. Bot replies: *"Your refund request has been logged. Ticket ID: #TKT-XXXX. Our team will contact you within 24 hours."*
4. An admin notification is triggered (email via SendGrid or internal dashboard alert).

---

## Environment Variables Required

```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
GEMINI_API_KEY=your_gemini_key
MONGO_URI=your_mongodb_uri
```

---

## Why This Architecture

- Vercel serverless keeps costs near zero — only runs when a message arrives.
- Gemini handles all NLP so no custom ML model is needed.
- MongoDB stores full conversation history for audit and analytics.
- Twilio abstracts WhatsApp's API complexity with a simple webhook model.
