# isee .v1

AI-powered project idea scouter — React (Vite) + Express + Tailwind + TypeScript.

## Quick start

```bash
npm run install:all
npm run dev
```

- **Client:** http://localhost:5173
- **API:** http://localhost:3001

## Environment

Copy `server/.env.example` to `server/.env` and set API keys for platform models:

- `GEMINI_API_KEY` — Google Gemini models
- `OPENAI_API_KEY` — GPT-4o models
- `ANTHROPIC_API_KEY` — Claude models

Users can also choose **Your API Key** in the app and bring their own provider key (stored locally in the browser).

## User flow

1. **Input** — Enter your idea on the hero screen
2. **Confirm** — Review AI comprehension, optionally refine
3. **Dashboard** — Bento grid with scores, market research, autopilot & distribution playbook

Saved scouts persist in browser `localStorage`.
