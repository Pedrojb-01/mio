# Mio — AI Content Assistant for Instagram Entrepreneurs

> **IBM SkillsBuild AI Builders Challenge — July 2026**
> Theme: Reimagining Creative Industries with AI

**Live demo:** https://mio-l8hy.onrender.com

---

## Problem Statement

Small business owners and entrepreneurs who use Instagram as their main sales and communication channel face a constant creative bottleneck: they need to produce consistent, on-brand content — captions, hashtags, post ideas — but they lack the time, budget, or copywriting expertise to do so effectively.

General-purpose AI tools like ChatGPT can generate text, but they treat every conversation as a blank slate. They don't know the business, don't remember what content was already created, and don't proactively suggest ideas. Every session starts from zero, forcing the user to re-explain their brand, audience, and tone each time.

The result: content is either generic, inconsistent, or simply not produced at all.

---

## Solution Description

Mio is a personalized AI content assistant built specifically for Instagram entrepreneurs and small businesses.

Unlike general-purpose chatbots, Mio builds a persistent business profile for each user — including business name, niche, target audience, differentiators, and brand voice. This profile is injected into every AI interaction automatically, so the assistant always generates content that sounds like the user's brand, not a generic template.

Mio offers two focused modes:

- **Brainstorm** — ideation and creative exploration. The AI suggests content themes, angles, campaign ideas, and post concepts tailored to the business.
- **Create** — full post generation. The AI produces ready-to-publish Instagram captions with hashtags, written in the brand's voice and targeted at the right audience.

Every conversation is saved as a named session, allowing users to return to previous ideas and builds a content history over time — something no general-purpose tool provides out of the box.

**Core differentiator:** ChatGPT doesn't know your business, doesn't remember what you've already created, and doesn't suggest anything. Mio does all three.

---

## AI Approach and Architecture

### How the AI works

Mio uses a **server-side system prompt** that is dynamically constructed from the user's business profile before every AI request. The system prompt instructs the model to act as a specialized Instagram content strategist for that specific business, and all user data is passed in structured `<user_data>` XML tags to prevent prompt injection and ensure the model treats it as context, not instructions.

User messages and AI responses are stored per session in the database, and the full conversation history is sent to the AI on each request — preserving context within a session the same way a real creative partner would remember what was discussed earlier.

AI responses are streamed token-by-token to the frontend using **Server-Sent Events (SSE)**, giving users real-time feedback rather than waiting for the full response. Session titles are also AI-generated automatically from the first exchange.

### Architecture overview

```
Frontend (React + Vite)
    │
    │  HTTPS + HttpOnly cookies (JWT auth)
    ▼
Backend (Node.js + Express)
    │
    ├── Auth & session management (Prisma ORM)
    ├── Business profile context builder
    ├── System prompt construction (server-side only)
    │
    ▼
Groq API (llama-3.3-70b-versatile)
    │
    ▼ SSE stream
Backend → Frontend (real-time token streaming)
    │
    ▼
PostgreSQL (Neon) — users, profiles, sessions, messages
```

### Security approach

- JWT stored in **HttpOnly cookies** — never accessible to JavaScript
- Passwords hashed with **Argon2 + pepper**
- Role and ownership verified from the database on every request — never trusted from the token alone
- All user data wrapped in `<user_data>` tags in the system prompt to prevent injection
- Rate limiting, CORS, Helmet headers, and CSRF protection via `SameSite` cookie policy

### Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v4, Vite, React Router, Recharts |
| Backend | Node.js, Express, Prisma v5 ORM |
| Database | PostgreSQL (Neon) |
| AI | Groq API — llama-3.3-70b-versatile |
| Auth | JWT (HttpOnly cookies), Argon2 |
| Hosting | Render (Web Service + Static Site) |

---

## Selected Challenge Theme

**July Challenge — Reimagine Creative Industries with AI**

Mio directly addresses the creative bottleneck that independent creators and small business owners face in producing consistent, on-brand content for social media. It acts as a **personalized AI creative partner** — not a generic generator — by combining business context, conversation memory, and focused creative modes to help entrepreneurs produce better content, faster, and with a consistent voice.

---

## How IBM Bob Was Used

IBM Bob was used as the **primary development tool** throughout the entire build, via the IBM Bob desktop application (VS Code-based IDE with IBM Bob integrated as an AI coding assistant).

IBM Bob assisted with:

- **Code generation** — generating boilerplate, route handlers, service functions, React components, and utility modules across the full stack
- **Architecture decisions** — explaining trade-offs between approaches (e.g. SSE vs WebSockets for streaming, cookie-based vs token-based auth strategies)
- **Code review** — identifying security vulnerabilities, logic errors, and inconsistencies in the codebase before they reached production
- **Debugging** — diagnosing runtime errors, Prisma schema issues, and streaming edge cases
- **Explaining concepts** — breaking down unfamiliar patterns (e.g. Argon2 pepper strategy, timing attack prevention, prompt injection hardening) so implementation decisions were understood, not just copied

The development workflow was iterative: write a feature with IBM Bob's assistance, test immediately, review the output critically, and refine. IBM Bob served as both a coding accelerator and a learning tool throughout the project.

---

## Features

- Business onboarding with persistent profile (niche, audience, tone, differentiators)
- Two AI modes: Brainstorm and Create
- Real-time AI response streaming via SSE
- Full conversation history with named sessions
- Dark/light theme
- Admin panel with user management and usage statistics
- Mobile-responsive design

## Project Structure

```
mio/
├── backend/          # Node.js + Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── prisma/
│   └── server.js
└── frontend/         # React + Vite SPA
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── utils/
    └── public/
```

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon account)
- Groq API key

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
npm run dev
```

**Backend environment variables:**
```
DATABASE_URL=your_postgresql_connection_string
PORT=3000
FRONTEND_URL=http://localhost:5173
PEPPER=your_random_hex_string
JWT_SECRET=your_random_hex_string
NODE_ENV=development
GROQ_API_KEY=your_groq_api_key
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies `/api` requests to `localhost:3000` in development — no `VITE_API_URL` needed locally. In production, create a `frontend/.env` file and set `VITE_API_URL=your_backend_url`.

---

*Built for the IBM SkillsBuild AI Builders Challenge — July 2026*
*IBM SkillsBuild completion certificate included in submission*