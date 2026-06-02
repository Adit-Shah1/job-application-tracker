# Job Application Tracker

A full-stack web app to track job applications from first save to final outcome. Built with Next.js 16, Prisma, Neon Postgres, Auth.js, and Google Gemini for AI-powered follow-up emails.

> Built from the spec in [SPEC.md](./SPEC.md). The MVP is complete: auth, full CRUD, status pipeline, notes, reminders, search/filter/sort, a dashboard, and an AI follow-up email drafter.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql" />
  <img alt="Auth.js" src="https://img.shields.io/badge/Auth.js-v5-000?logo=auth0" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-2.5_Flash-4285f4?logo=google" />
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Vercel-deployed-000?logo=vercel" />
</p>

**[Try the live demo →](https://job-application-tracker-one-ochre.vercel.app/)** &nbsp;·&nbsp; Sign in with GitHub or Google to see the full flow.

## Features

- **Authentication** — GitHub or Google via [Auth.js v5](https://authjs.dev/), database sessions, Prisma adapter
- **Application management** — full CRUD with company, role, URL, location, salary range, currency, status, priority, source
- **Status pipeline** — Saved → Applied → Interviewing → Offer → Rejected → Archived, with optimistic one-click changes
- **Notes** — full CRUD with inline edit, timestamps, edit indicators
- **Reminders** — Follow-up / Interview / Deadline / Other, with completion tracking and overdue highlighting
- **Dashboard** — 4 stat cards, status distribution chart (Recharts), upcoming reminders, recently updated activity
- **Search & filter** — full-text search across company/role/location, status and priority filters, multiple sort options
- **AI follow-up email** — drafts a personalized follow-up with Google Gemini 2.5 Flash (free tier), with tone selector and token-by-token streaming
- **Responsive** — table view on desktop, card view on mobile
- **Loading states** — shimmer skeletons for slow queries
- **Animations** — page fade-up, staggered list items, smooth status transitions, dialog scale-in, toast slide-in
- **Accessible** — semantic HTML, ARIA labels, focus-visible rings, `prefers-reduced-motion` respected

## Quick start

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database (free tier works)
- GitHub and/or Google OAuth credentials
- Optional: a [Google AI Studio](https://aistudio.google.com/apikey) API key for the AI follow-up feature (free)

### 1. Clone and install

```bash
git clone https://github.com/Adit-Shah1/job-application-tracker.git
cd job-application-tracker
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon project → connection string (pooled, with `?sslmode=require`) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | [GitHub OAuth app](https://github.com/settings/developers) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) (free) |

See [OAuth setup details](#oauth-setup-details) below for step-by-step instructions.

### 3. Set up the database

```bash
npm run db:push       # apply schema to your database
npm run db:seed       # optional: seed 12 demo applications
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## OAuth setup details

The most common "sign-in doesn't work" issue is a missing or misconfigured OAuth credential. Here's a checklist.

### Google Cloud Console (for Google sign-in)

1. https://console.cloud.google.com/apis/credentials
2. **Create a project** (or pick an existing one).
3. **Configure the OAuth consent screen** (left sidebar → "OAuth consent screen"):
   - User type: **External** (unless you have a Google Workspace org)
   - Fill in app name, support email, developer email
   - Add the scopes: `email`, `profile`, `openid` (the defaults Auth.js requests)
   - If the app is in "Testing" mode, add your email under "Test users"
4. **Create OAuth client ID** (Credentials → Create Credentials → OAuth client ID):
   - Application type: **Web application**
   - Name: anything (e.g. "Job Tracker Dev")
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs** (must match exactly — no trailing slash):
     - `http://localhost:3000/api/auth/callback/google`
   - Click Create, then copy the Client ID and Client Secret into `.env`
5. **Restart `npm run dev`** so it picks up the new env vars.

> **For production:** add your production URL to both JavaScript origins and redirect URIs (e.g. `https://your-app.vercel.app/api/auth/callback/google`) and set `AUTH_URL` in your Vercel env to the production URL.

### GitHub (for GitHub sign-in)

1. https://github.com/settings/developers → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID → `AUTH_GITHUB_ID`, generate a client secret → `AUTH_GITHUB_SECRET`

### Common errors

| Error | Cause |
|---|---|
| `Missing required parameter: client_id` | `AUTH_GOOGLE_ID` is empty in `.env`, or you didn't restart the dev server after editing `.env` |
| `redirect_uri_mismatch` | The redirect URI in Google Cloud Console doesn't match `http://localhost:3000/api/auth/callback/google` exactly |
| `Access blocked: this app's request is invalid` | OAuth consent screen not configured, or your email isn't on the test users list |
| `OAuthAccountNotLinked` | You previously signed in with a different provider using the same email. Sign in with the other provider once. |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + custom UI primitives |
| Database | PostgreSQL on [Neon](https://neon.tech) |
| ORM | [Prisma 7](https://www.prisma.io/) with driver adapter |
| Auth | [Auth.js v5](https://authjs.dev/) — GitHub + Google OAuth, DB sessions |
| Validation | [Zod](https://zod.dev/) |
| Forms | React Server Actions + `useActionState` |
| Charts | [Recharts](https://recharts.org/) |
| AI | [Google Gemini 2.5 Flash](https://aistudio.google.com/) (free tier) via `@google/generative-ai` |
| Icons | [Lucide](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com/) + Neon |

## Project layout

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (protected layout)
│   │   ├── dashboard/      # Stats + chart + reminders
│   │   ├── applications/   # List, new, detail, edit
│   │   ├── settings/       # Profile
│   │   ├── layout.tsx      # Top nav, sign-out
│   │   ├── loading.tsx     # Shimmer skeleton
│   │   ├── error.tsx       # Error boundary
│   │   └── not-found.tsx
│   ├── (public)/signin/    # OAuth sign-in page
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js handlers
│   │   └── ai/follow-up/         # Streaming Gemini endpoint
│   ├── layout.tsx
│   ├── globals.css         # Animations + ambient background
│   └── page.tsx            # Root redirect
├── components/
│   ├── ui/                 # Button, Card, Dialog, Toast, NavLink, etc.
│   ├── applications/       # Form, table, status select, badges
│   ├── notes/
│   ├── reminders/
│   ├── dashboard/          # StatusChart
│   └── ai/                 # FollowUpButton (modal + stream)
├── lib/
│   ├── actions/            # Server actions (applications, notes, reminders)
│   ├── auth.ts             # Auth.js config (provider-aware)
│   ├── db.ts               # Prisma client (with driver adapter)
│   ├── gemini.ts           # Gemini client + rate limiter
│   ├── queries.ts          # Dashboard / detail queries
│   ├── validation.ts       # Zod schemas
│   ├── constants.ts        # Status / priority enums + labels
│   └── dates.ts            # date-fns helpers
└── types/
    └── next-auth.d.ts      # Augment session.user with id
prisma/
├── schema.prisma
└── seed.ts
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Data model

```
User ─┬─ Account (Auth.js)
      ├─ Session (Auth.js)
      ├─ Application ─┬─ Note
      │               └─ Reminder
      └─ ResumeVersion
```

- `Application.status`: `SAVED` → `APPLIED` → `INTERVIEWING` → `OFFER` | `REJECTED` | `ARCHIVED`
- `Application.priority`: `LOW` | `MEDIUM` | `HIGH`
- `Reminder.reminderType`: `FOLLOW_UP` | `INTERVIEW` | `DEADLINE` | `OTHER`

All entity ownership is enforced at the action layer — no application, note, or reminder is ever returned to a user other than its owner.

## AI follow-up email

- Uses `gemini-2.5-flash` for cost and speed. Free tier: 15 RPM, 1M TPM.
- The prompt includes the company, role, status, date applied, and the 5 most recent notes.
- Tone selector: `professional` (default) or `friendly`.
- Response is streamed to the client and rendered token-by-token.
- Server enforces a simple per-user rate limit (5 requests/minute). Swap for Upstash in production.
- The button is hidden if `GEMINI_API_KEY` is not set, so the rest of the app works without the AI feature.

## Deployment

1. Push the repo to GitHub.
2. Create a Vercel project and import the repo.
3. Add all the env vars from `.env.example` to the Vercel project settings.
4. Set `AUTH_URL` to your production URL.
5. Add the production callback URLs to your OAuth apps:
   - `https://your-app.vercel.app/api/auth/callback/github`
   - `https://your-app.vercel.app/api/auth/callback/google`
6. Deploy.

> Vercel will run `prisma generate` during build. If you use Neon, set `DATABASE_URL` to the **pooled** connection string and consider adding a separate `DIRECT_URL` for migrations.

## Notes on polish

This isn't a tutorial clone. A few details that were intentional:

- **Animations** use CSS keyframes (no animation library) and respect `prefers-reduced-motion`.
- **Ambient background** is a fixed gradient mesh that adapts to light/dark mode.
- **Empty states** have gradient hero illustrations rather than dead-end messages.
- **Stat cards** have hover lift and unique color accents per metric.
- **Status select** has a colored status dot that pulses softly while saving.
- **Form inputs** have a focus state that lifts the border and adds a soft ring + shadow.
- **Loading skeletons** use a moving shimmer gradient, not a flat pulse.

## License

MIT
