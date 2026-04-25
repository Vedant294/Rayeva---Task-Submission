# 🌿 Rayeva – AI Sustainable Commerce Platform


Live link : https://rayeva-ai.netlify.app/


> An AI-powered platform that automates product cataloging, B2B proposal generation, and sustainability impact reporting — built with React, Node.js, MongoDB Atlas, and Groq (Llama 3.3).

live link : https://agent-69c3812b8f725eb68e86312e--rayeva-ai.netlify.app/

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│           React Frontend (Vite + Tailwind CSS)        │
│  Dashboard | Category AI | Proposal AI | Impact AI   │
└─────────────────────┬────────────────────────────────┘
                      │  HTTP /api/*
                      ▼
┌──────────────────────────────────────────────────────┐
│           Express API Server  (server.js)             │
│                                                       │
│   lib/ai.js          lib/mongodb.js                   │
│   Groq API           Mongoose / Atlas                 │
│   Llama 3.3-70b      Cached connection                │
│                                                       │
│   Business Logic Layer  (api/)                        │
│   ├── category.js   validate → AI → store            │
│   ├── proposal.js   budget enforce → AI → store      │
│   ├── impact.js     estimate engine → AI → store     │
│   ├── dashboard.js  MongoDB aggregation               │
│   └── logs.js       prompt/response audit trail      │
└─────────────────────┬────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│           MongoDB Atlas                               │
│   Product | Proposal | ImpactReport | AILog           │
└──────────────────────────────────────────────────────┘
```

### Key Design Decisions

**1. Strict AI / Business Logic Separation**
The `api/` layer owns all validation, deterministic calculations, and database writes. `lib/ai.js` only wraps the Groq API call and JSON extraction. AI never touches the database directly.

**2. Deterministic Grounding Before AI**
The Impact module calculates plastic/carbon estimates using a server-side lookup table before calling AI. The AI only generates the narrative — not the numbers. This prevents hallucinated sustainability metrics.

**3. Structured JSON Enforcement**
Every prompt explicitly instructs the model to return only valid JSON matching a defined schema. The `extractJSON()` helper strips markdown fences and parses safely with error handling.

**4. Full Prompt + Response Logging**
Every AI call writes to the `AILog` collection with module name, full prompt, and raw response — enabling complete auditability via the Logs Viewer page.

**5. Environment-Based Key Management**
All secrets live in `.env` and are loaded server-side via `dotenv`. The frontend never receives or exposes any API keys.

---

## Modules

| Module | Endpoint | AI Role | Business Logic |
|---|---|---|---|
| Category Generator | `POST /api/category` | Classify product, generate SEO tags + sustainability filters | Input validation, store to Product collection |
| B2B Proposal Generator | `POST /api/proposal` | Generate product mix + budget allocation | Budget constraint enforcement, store to Proposal |
| Impact Report Generator | `POST /api/impact` | Narrate sustainability impact | Deterministic plastic/carbon estimates via lookup table |
| Dashboard | `GET /api/dashboard` | — | MongoDB aggregation across all collections |
| AI Logs Viewer | `GET /api/logs` | — | Full prompt/response audit trail |
| WhatsApp Bot | Architecture doc only | — | See `/architecture/whatsapp-bot.md` |

---

## AI Prompt Design

Every prompt follows this pattern:
1. Define the AI role clearly
2. Provide all required context
3. Specify the exact JSON schema to return
4. Instruct the model: return ONLY JSON, no extra text

### Module 1 — Category Generator Prompt

```
You are a sustainable product categorization AI.
Given the following product details, return ONLY a valid JSON object with no extra text.

Product Name: {name}
Description: {description}
Material: {material}

Return this exact JSON structure:
{
  "primary_category": "string",
  "sub_category": "string",
  "seo_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "sustainability_filters": ["filter1", "filter2"]
}

sustainability_filters must only include values from:
plastic-free, compostable, recyclable, vegan, biodegradable, organic, zero-waste, eco-friendly
```

Constraining `sustainability_filters` to a fixed vocabulary prevents hallucination and ensures consistent UI filtering.

### Module 2 — B2B Proposal Generator Prompt

```
You are a B2B sustainable commerce proposal AI.
Client: {client_name} | Budget: {budget} | Category: {product_category}

Return ONLY this JSON:
{
  "product_mix": ["Product A", "Product B", "Product C"],
  "budget_allocation": { "Product A": 0.4, "Product B": 0.35, "Product C": 0.25 },
  "cost_breakdown": { "Product A": {budget*0.4}, "Product B": {budget*0.35}, ... },
  "impact_positioning": "paragraph"
}

IMPORTANT: The sum of all cost_breakdown values must equal exactly {budget}.
```

Pre-computing cost values in the prompt grounds the AI in real numbers, preventing budget overruns.

### Module 3 — Impact Report Generator Prompt

```
You are a sustainability impact reporting AI.
Order: {order_id} | Products: {list}

Pre-calculated estimates (do not change these values):
- Plastic saved: {plastic_saved_kg} kg
- Carbon avoided: {carbon_avoided_kg} kg

Return ONLY this JSON:
{
  "plastic_saved_kg": {plastic_saved_kg},
  "carbon_avoided_kg": {carbon_avoided_kg},
  "local_sourcing_impact": "one sentence",
  "impact_statement": "two to three sentences"
}
```

Numeric values are calculated server-side using a product keyword lookup table. AI only generates the human-readable narrative.

---

## Project Structure

```
rayeva-ai-system/
├── api/                    # Express route handlers (business logic)
│   ├── category.js
│   ├── proposal.js
│   ├── impact.js
│   ├── dashboard.js
│   └── logs.js
├── lib/
│   ├── ai.js               # Groq API client + extractJSON helper
│   └── mongodb.js          # Cached Mongoose connection
├── models/                 # Mongoose schemas
│   ├── Product.js
│   ├── Proposal.js
│   ├── ImpactReport.js
│   └── AILog.js
├── netlify/functions/      # Netlify serverless function wrappers
├── frontend/               # React + Vite + Tailwind
│   └── src/
│       ├── pages/          # Dashboard, CategoryGenerator, etc.
│       ├── components/     # Navbar, StatCard, Spinner, ErrorBox
│       └── services/api.js # Centralized fetch wrapper
├── architecture/
│   └── whatsapp-bot.md     # Module 4 architecture doc
├── server.js               # Local Express server
├── netlify.toml            # Netlify deployment config
└── .env.example            # Environment variable template
```

---

## Database Schema

**Product** — `name, description, material, primary_category, sub_category, seo_tags[], sustainability_filters[], createdAt`

**Proposal** — `client_name, budget, product_category, product_mix[], budget_allocation{}, cost_breakdown{}, impact_positioning, createdAt`

**ImpactReport** — `order_id, products[], plastic_saved_kg, carbon_avoided_kg, local_sourcing_impact, impact_statement, createdAt`

**AILog** — `module, prompt, response, createdAt`

---

## Setup & Run Locally

```bash
# 1. Clone and install
git clone https://github.com/your-username/rayeva-ai-system.git
cd rayeva-ai-system
npm install

# 2. Set up environment
cp .env.example .env
# Fill in MONGO_URI and GROQ_API_KEY in .env

# 3. Build frontend
npm run build

# 4. Start server
node server.js
# Open http://localhost:3000
```

### Environment Variables

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rayeva
GROQ_API_KEY=gsk_...
```

---

## Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Functions directory: `netlify/functions`
4. Add environment variables: `MONGO_URI` and `GROQ_API_KEY`
5. Deploy

The `/api/*` routes redirect to `/.netlify/functions/*` via `netlify.toml`.

---

## Error Handling

- All API routes are wrapped in `try/catch` with descriptive error responses
- Input validation runs before any AI call — invalid requests never reach Groq
- `extractJSON()` handles malformed AI responses gracefully
- Frontend shows inline error messages and loading states on every form

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| AI | Groq API (Llama 3.3-70b-versatile) |
| Deployment | Netlify (functions + static) |
