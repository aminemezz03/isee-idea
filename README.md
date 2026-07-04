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
- `OPENROUTER_API_KEY` — OpenRouter free/paid models
- `OLLAMA_API_KEY` — Ollama Cloud models

Users can also choose **Your API Key** in the app and bring their own provider key (stored locally in the browser).

## User flow

1. **Input** — Enter your idea on the hero screen
2. **Confirm** — Review AI comprehension, optionally refine
3. **Dashboard** — Bento grid with scores, market research, autopilot & distribution playbook

Saved scouts persist in browser `localStorage`.

## Deploy for free (full app)

Split deploy: **Netlify** (frontend) + a **Node backend** (Express API).

### Recommended — Netlify (frontend) + Render (backend)

**Frontend:** [Netlify](https://netlify.com) — free, no card  
**Backend:** [Render](https://render.com) — free tier, **card required for identity only** ($1 hold, not a subscription)

> **Koyeb** may now require a paid Pro plan ($29/mo) for new accounts — skip it if you see that screen.

#### 1. Backend on Render (Web Service — not Blueprint)

1. [render.com](https://render.com) → **New → Web Service** (not Blueprint).
2. Connect GitHub → repo `isee-idea`.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
4. **Environment variables:**
   - `OPENROUTER_API_KEY`, `OLLAMA_API_KEY`, etc.
   - `CLIENT_ORIGIN` = `https://iseeidea.netlify.app` (your Netlify URL)
5. Add card if asked ($1 verification hold only) → Deploy → copy URL, e.g. `https://isee-api.onrender.com`

> Free tier sleeps after ~15 min idle; cold start ~30–60s.

#### 2. Frontend on Netlify

1. [netlify.com](https://netlify.com) → **Import from Git** → `isee-idea`.
2. Netlify should read **`netlify.toml`** from the repo automatically. Verify in **Site settings → Build & deploy**:
   - **Base directory:** `client`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `client/dist` *(or `dist` if base is already `client`)*
3. **Environment variables:**
   - `VITE_API_URL` = your backend API URL (no trailing slash)
4. **Deploys → Trigger deploy → Clear cache and deploy site**

> **404 "Page not found"?** The publish folder is wrong or `netlify.toml` wasn't on GitHub. Pull latest code and redeploy with settings above.

#### 3. Link them

Set `VITE_API_URL` on Netlify to your Render URL. Set `CLIENT_ORIGIN` on Render to your Netlify URL.

---

### Free hosting comparison

| Platform | Card required? | Best for |
|----------|----------------|----------|
| **[Netlify](https://netlify.com)** | No | Frontend |
| **[Render](https://render.com)** | Yes (verify only, ~$1 hold) | Backend (free tier) |
| **[Koyeb](https://koyeb.com)** | Often yes ($29 Pro for new accounts) | Skip if paywall appears |
| **[Fly.io](https://fly.io)** | Often yes | Alternative backend |

Netlify alone cannot run the Express server — you always need a separate API host.
