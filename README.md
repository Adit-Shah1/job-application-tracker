# Job Application Tracker

An open-source job search management platform. Track applications from first save to final outcome with AI-powered insights, Kanban board, interview prep, and analytics — all in one place.

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql" />
  <img alt="Auth.js" src="https://img.shields.io/badge/Auth.js-v5-000?logo=auth0" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-2.5_Flash-4285f4?logo=google" />
  <img alt="CI" src="https://img.shields.io/badge/CI-GitHub_Actions-2088ff?logo=githubactions" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-deployed-000?logo=vercel" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
</p>

**[App →](https://job-application-tracker-one-ochre.vercel.app/)** &nbsp;·&nbsp; [Report a bug](https://github.com/Adit-Shah1/job-application-tracker/issues) &nbsp;·&nbsp; [Request a feature](https://github.com/Adit-Shah1/job-application-tracker/issues)

---

## Why this exists

Job seekers juggle dozens of applications across multiple platforms, stages, and timelines. Spreadsheets break down fast. This app replaces that chaos with a structured, searchable, AI-assisted workflow — one place to manage everything about your job search.

---

## Features

### Application Management

- **Full CRUD** — company, role, URL, location, salary range, currency, status, priority, source
- **Status pipeline** — Saved → Applied → Interviewing → Offer → Rejected → Archived, with one-click changes, optimistic UI, and 5-second undo
- **Notes** — full CRUD with optimistic updates, inline editing, and full-text search across note content
- **Reminders** — Follow-up / Interview / Deadline / Other, with completion tracking and overdue highlighting
- **Contacts** — recruiter name, email, and phone per application
- **Cover letters** — per-application editor with AI generation
- **Resume versions** — upload and tag resume versions to applications
- **CSV export** — download all applications

### Views

- **List view** — sortable, searchable table with pagination, status/priority filters
- **Kanban board** — drag-and-drop columns per status, responsive grid (1 → 2 → 3 → 6 columns by breakpoint)
- **Bulk actions** — select multiple applications with checkboxes, change status in batch
- **Offer comparison** — side-by-side table comparing salary, location, and role for offer-stage applications

### Analytics

- **Dashboard** — 5 stat cards (total, active, interviewing, offers, avg response time), status chart, pipeline funnel, upcoming reminders, recent activity
- **Pipeline funnel** — conversion rates between stages (Saved → Applied → Interviewing → Offer)
- **Response time tracking** — days from save to first status change, per application and as a dashboard average
- **Status timeline** — visual activity log of every status transition with timestamps

### Interview Prep

- **Interview rounds** — structured tracking with round number, type (phone screen, technical, behavioral, system design, onsite, final), interviewer details, scheduled date, notes, feedback, outcome
- **Debrief notes** — structured reflection after each round
- **AI question generator** — generates likely interview questions based on role, company, and round type

### AI Features

All AI features use Google Gemini 2.5 Flash. Each endpoint has per-user rate limiting. AI buttons are hidden if `GEMINI_API_KEY` is not configured — the rest of the app works fully without it.

- **Resume ↔ Job Fit Score** — paste a job description, get a 0–100 match score with strengths, gaps, and actionable suggestions
- **Cover letter generator** — generate a tailored cover letter from a job description, stream it into the editor, and save
- **Follow-up email drafts** — AI-drafted follow-ups with tone selector (professional/friendly), streaming, save, and copy
- **Email template library** — pre-written templates (follow-up, thank-you, withdrawal, recruiter outreach) with auto-filled variables
- **Note summarization** — summarizes all notes into key takeaways
- **Next-step suggestions** — recommends what to do next based on application status and context

### Design & UX

- **Dark mode** — manual light/dark toggle with system preference fallback
- **Keyboard shortcuts** — navigation (1–3), new application (n), search (/), Escape for dialogs
- **Custom components** — portal-based status dropdown, dialog-based delete confirmations, inline editing
- **Responsive** — table on desktop, cards on mobile, adaptive Kanban grid
- **Animations** — page fade-up, staggered lists, smooth transitions, dialog scale-in/out, toast slide-in
- **Loading states** — shimmer skeletons for async operations
- **Accessible** — semantic HTML, ARIA labels, focus-visible rings, `prefers-reduced-motion` respected

### Engineering

- **CI/CD** — GitHub Actions with lint → typecheck → build on every push/PR
- **Optimistic updates** — notes, reminders, and status changes feel instant via `useOptimistic`
- **Input validation** — Zod schemas on all forms, server-side validation on all actions
- **Ownership enforcement** — every query and action verifies the user owns the resource
- **Rate limiting** — per-user rate limiter on AI endpoints

---

## Quick Start

### Prerequisites

- Node.js 22+
- A [Neon](https://neon.tech) Postgres database (free tier works)
- GitHub and/or Google OAuth credentials (or use email/password)
- Optional: a [Google AI Studio](https://aistudio.google.com/apikey) API key for AI features (free)

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

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon project → connection string (pooled, with `?sslmode=require`) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | [GitHub OAuth app](https://github.com/settings/developers) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) (free) |

### 3. Set up the database

```bash
npm run db:push       # apply schema to your database
npm run db:seed       # optional: seed sample applications
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## OAuth Setup

### Google

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project → configure the OAuth consent screen (External, add `email`/`profile`/`openid` scopes)
3. Create OAuth client ID (Web application):
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret into `.env`

> **Production:** add your production URL to both origins and redirect URIs. Set `AUTH_URL` to the production URL in your hosting provider's env.

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → New OAuth App
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID → `AUTH_GITHUB_ID`, generate secret → `AUTH_GITHUB_SECRET`

### Troubleshooting

| Error | Cause |
|---|---|
| `Missing required parameter: client_id` | `AUTH_GOOGLE_ID` is empty, or you didn't restart the dev server |
| `redirect_uri_mismatch` | Redirect URI doesn't match exactly (no trailing slash) |
| `Access blocked` | OAuth consent screen not configured, or your email isn't on the test users list |
| `OAuthAccountNotLinked` | Previously signed in with a different provider using the same email |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + custom UI primitives |
| Database | PostgreSQL on [Neon](https://neon.tech) |
| ORM | [Prisma 7](https://www.prisma.io/) with driver adapter |
| Auth | [Auth.js v5](https://authjs.dev/) — GitHub + Google OAuth, email/password, DB sessions |
| Validation | [Zod](https://zod.dev/) |
| Forms | React Server Actions + `useActionState` + `useOptimistic` |
| Charts | [Recharts](https://recharts.org/) |
| AI | [Google Gemini 2.5 Flash](https://aistudio.google.com/) via `@google/generative-ai` |
| Icons | [Lucide](https://lucide.dev/) |
| CI/CD | [GitHub Actions](https://github.com/features/actions) |
| Deployment | [Vercel](https://vercel.com/) + Neon |

---

## Project Structure

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes
│   │   ├── dashboard/            # Stats, charts, reminders, activity
│   │   ├── applications/
│   │   │   ├── page.tsx          # List + Kanban views, bulk actions
│   │   │   ├── new/              # Create form
│   │   │   ├── [id]/             # Detail, edit
│   │   │   └── compare/          # Offer comparison
│   │   └── settings/             # Theme, providers, account
│   ├── (public)/signin/          # Sign-in page
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js handlers
│   │   └── ai/                   # AI endpoints (follow-up, summarize,
│   │                             #   next-steps, fit-score, cover-letter,
│   │                             #   interview-questions)
│   └── globals.css               # Animations, ambient background
├── components/
│   ├── ui/                       # Button, Card, Dialog, Toast, Select, etc.
│   ├── applications/             # Table, Kanban, StatusSelect, InterviewRounds,
│   │                             #   Contacts, CoverLetter, Resume, BulkActions
│   ├── dashboard/                # StatusChart, PipelineFunnelChart
│   ├── ai/                       # FollowUpButton, AIInsightsButton,
│   │                             #   FitScoreButton, EmailTemplateLibrary,
│   │                             #   InterviewQuestionsButton
│   ├── notes/
│   └── reminders/
├── lib/
│   ├── actions/                  # Server actions (applications, notes,
│   │                             #   reminders, interviews, resumes, etc.)
│   ├── queries.ts                # Dashboard, detail, funnel queries
│   ├── auth.ts, db.ts, gemini.ts # Core infrastructure
│   ├── validation.ts             # Zod schemas
│   ├── constants.ts, dates.ts    # Shared utilities
│   └── interviews.ts             # Interview types and schema
├── providers/theme-provider.tsx
prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Sample data
.github/workflows/ci.yml          # CI pipeline
e2e/app.spec.ts                   # Playwright E2E tests
playwright.config.ts              # Playwright config
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build (`prisma generate && next build`) |
| `npm start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

---

## Data Model

```
User ─┬─ Account (Auth.js OAuth)
      ├─ Session (Auth.js)
      ├─ Application ─┬─ Note
      │               ├─ Reminder
      │               ├─ EmailDraft
      │               ├─ StatusChange (audit log)
      │               └─ InterviewRound
      └─ ResumeVersion
```

**Status flow:** `SAVED` → `APPLIED` → `INTERVIEWING` → `OFFER` | `REJECTED` | `ARCHIVED`

**Priority:** `LOW` | `MEDIUM` | `HIGH`

**Reminder types:** `FOLLOW_UP` | `INTERVIEW` | `DEADLINE` | `OTHER`

**Interview types:** `PHONE_SCREEN` | `TECHNICAL` | `BEHAVIORAL` | `SYSTEM_DESIGN` | `ONSITE` | `FINAL` | `OTHER`

**Outcomes:** `PENDING` | `PASSED` | `FAILED` | `NO_SHOW`

All entity ownership is enforced server-side — no data is ever returned to a user other than its owner.

---

## Deployment

1. Push to GitHub.
2. Create a [Vercel](https://vercel.com) project and import the repo.
3. Add all env vars from `.env` to the Vercel project settings.
4. Set `AUTH_URL` to your production URL.
5. Add production callback URLs to your OAuth apps:
   - `https://your-app.vercel.app/api/auth/callback/github`
   - `https://your-app.vercel.app/api/auth/callback/google`
6. Deploy.

> If you use Neon, set `DATABASE_URL` to the **pooled** connection string and add a separate `DIRECT_URL` for migrations.

---

## Contributing

Contributions are welcome. Open an issue to discuss what you'd like to change, then submit a pull request.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

Please make sure `npm run lint` and `npm run typecheck` pass before submitting.

---

## License

[MIT](./LICENSE)
