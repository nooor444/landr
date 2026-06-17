# Landr — AI Immigration SaaS Platform

> Helping Indian nationals relocate to Ireland and the UK — powered by AI.  
> **Live at [landr-gilt.vercel.app](https://landr-gilt.vercel.app)**

Built and founded solo. Real users. Full production stack.

---

## What it does

Landr gives users a personalised, AI-powered guide to navigating Irish and UK immigration — replacing hours of government website research with a conversational, checklist-driven experience.

**Core features:**
- 🤖 AI visa chatbot (Google Gemini 2.5 Flash) — answers immigration questions in real time
- ✅ Dynamic checklist engine — personalised to visa type and nationality
- 💬 Community forum — users share experiences and ask questions
- 🔐 Multi-tenant auth — Supabase Auth with row-level security policies

---

## Architecture

```
User
 │
 ▼
Next.js 14 (TypeScript)     ← frontend + API routes
 │
 ├── Supabase Auth           ← authentication + RLS
 ├── PostgreSQL (Supabase)   ← database + row-level security
 └── Gemini 2.5 Flash API    ← AI chatbot microservice
 │
 ▼
Vercel                       ← cloud deployment + CI/CD
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | Next.js API routes, Supabase Edge Functions |
| Database | PostgreSQL (Supabase) with relational schema |
| Auth | Supabase Auth, row-level security |
| AI | Google Gemini 2.5 Flash API |
| Deployment | Vercel (CI/CD via GitHub integration) |

---

## Engineering Highlights

- **Sole engineer** — designed, built, and deployed end-to-end
- **Fault-tolerant AI layer** — chatbot degrades gracefully if API quota is hit
- **CI/CD** — GitHub-integrated Vercel pipeline, same-day production releases
- **Zero security incidents** post-launch — RLS policies enforce data isolation per user
- **Operational monitoring** — error logging and usage tracking from day one

---

## Skills Demonstrated

`full-stack development` `cloud-native architecture` `microservices` `PostgreSQL`  
`distributed systems` `CI/CD` `GenAI integration` `SDLC ownership` `TypeScript` `Next.js`
