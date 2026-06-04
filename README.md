# Job Application Tracker

A full-stack web app to track job applications from first save to final outcome. Built with Next.js 16, Prisma, Neon Postgres, Auth.js, and Google Gemini for AI-powered features.

> Built from the spec in [SPEC.md](./SPEC.md). Goes well beyond the MVP with 20+ features including Kanban board, interview prep tracker, offer comparison, AI insights, bulk actions, and more.

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
  <img alt="Deployed on Vercel" src="https://img.shields.io/badge/Vercel-deployed-000?logo=vercel" />
</p>

**[Try the live demo →](https://job-application-tracker-one-ochre.vercel.app/)** &nbsp;·&nbsp; Sign in with GitHub or Google to see the full flow.

---

## Features

### Core

- **Authentication** — GitHub or Google via [Auth.js v5](https://authjs.dev/), email/password, database sessions, Prisma adapter
- **Application management** — full CRUD with company, role, URL, location, salary range, currency, status, priority, source
- **Status pipeline** — Saved → Applied → Interviewing → Offer → Rejected → Archived, with optimistic one-click changes and 5-second undo
- **Notes** — full CRUD with optimistic updates, inline edit, timestamps, and search across note content
- **Reminders** — Follow-up / Interview / Deadline / Other, with optimistic updates, completion tracking, and overdue highlighting
- **Contact & recruiter management** — store recruiter name, email, and phone per application
- **Cover letter storage** — per-application cover letter editor with AI generation
- **Resume version management** — upload and tag resume versions to applications

### Dashboard & Analytics

- **Dashboard** — 5 stat cards (total, active, interviewing, offers, avg response time), status distribution chart, pipeline funnel chart, upcoming reminders, recently updated activity
- **Pipeline funnel chart** — conversion rates between stages (Saved → Applied → Interviewing → Offer) using Recharts
- **Time-to-response tracking** — days from save to first status change, displayed per application and as a dashboard average
- **Status change timeline** — visual activity log on each application showing every status transition with timestamps
- **CSV export** — download all applications as a CSV file

### Views & Navigation

- **List view** — sortable, searchable table with pagination, status and priority filters
- **Kanban board** — drag-and-drop columns per status using native HTML5 DnD, responsive grid layout (1 col mobile → 2 sm → 3 lg → 6 xl)
- **List/Kanban toggle** — switch between views on the applications page
- **Bulk status update** — select multiple applications with checkboxes and change status in batch via a floating action bar
- **Pagination** — URL-based page params with skip/take and page controls
- **Search & filter** — full-text search across company, role, location, and note content; status and priority filters; multiple sort options

### Interview & Offer Tools

- **Interview prep tracker** — structured interview rounds with round number, type (phone screen, technical, behavioral, system design, onsite, final), interviewer details, scheduled date, notes, feedback, outcome, and debrief notes
- **Offer comparison page** — side-by-side comparison table for OFFER-status applications (salary, location, company, role)
- **Interview debrief notes** — structured reflection after each round (what went well, what to improve, red flags)

### AI Features

- **AI follow-up email** — drafts a personalized follow-up with Google Gemini 2.5 Flash, with tone selector and token-by-token streaming
- **AI note summarization** — summarizes all notes for an application into key takeaways
- **AI next-step suggestions** — suggests what to do next based on application status and context
- **Tabbed AI insights dialog** — all AI features accessible from a single button on the detail page

### UI & UX

- **Dark mode** — manual light/dark toggle with system preference fallback, persisted to localStorage, class-based strategy
- **Keyboard shortcuts** — nav (1-3), new application (n), search (/), Escape for dialogs
- **Custom status dropdown** — portal-based popover with smooth open/close animations, escapes parent overflow
- **Custom delete dialogs** — confirmation Dialog component replaces browser `confirm()` throughout the app
- **Inline editing** — edit fields directly on the detail page without navigating to a separate edit page
- **Responsive design** — table view on desktop, card view on mobile
- **Loading states** — shimmer skeletons for slow queries
- **Animations** — page fade-up, staggered list items, smooth status transitions, dialog scale-in/out, toast slide-in
- **Accessible** — semantic HTML, ARIA labels, focus-visible rings, `prefers-reduced-motion` respected

### Engineering

- **CI/CD pipeline** — GitHub Actions workflow with lint → typecheck → build on every push/PR
- **Optimistic updates** — notes, reminders, and status changes appear/disappear instantly via `useOptimistic`
- **Input validation** — Zod schemas on all forms, server-side validation on all actions
- **Ownership enforcement** — every query and action verifies the user owns the resource
- **Rate limiting** — per-user rate limiter on AI endpoints to prevent abuse

---

## Quick start

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

---

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

---

## Tech stack

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
| AI | [Google Gemini 2.5 Flash](https://aistudio.google.com/) (free tier) via `@google/generative-ai` |
| Icons | [Lucide](https://lucide.dev/) |
| CI/CD | [GitHub Actions](https://github.com/features/actions) |
| Deployment | [Vercel](https://vercel.com/) + Neon |

---

## Project layout

```
src/
├── app/
│   ├── (app)/                    # Authenticated routes (protected layout)
│   │   ├── dashboard/            # Stats + charts + reminders + activity
│   │   ├── applications/
│   │   │   ├── page.tsx          # List + Kanban views with bulk actions
│   │   │   ├── new/page.tsx      # Create form
│   │   │   ├── [id]/page.tsx     # Detail view (notes, reminders, contacts,
│   │   │   │                     #   resume, cover letter, interview rounds,
│   │   │   │                     #   AI insights, inline editing, timeline)
│   │   │   ├── [id]/edit/page.tsx
│   │   │   └── compare/page.tsx  # Offer comparison table
│   │   ├── settings/             # Theme, OAuth providers, account
│   │   ├── layout.tsx            # Top nav, sign-out, keyboard shortcuts
│   │   ├── loading.tsx           # Shimmer skeleton
│   │   ├── error.tsx             # Error boundary
│   │   └── not-found.tsx
│   ├── (public)/
│   │   ├── signin/               # OAuth + email/password sign-in
│   │   └── goodbye/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js handlers
│   │   └── ai/
│   │       ├── follow-up/        # Streaming follow-up email endpoint
│   │       ├── summarize/        # AI note summarization
│   │       └── next-steps/       # AI next-step suggestions
│   ├── layout.tsx
│   ├── globals.css               # Animations + ambient background
│   └── page.tsx                  # Root redirect
├── components/
│   ├── ui/                       # Button, Card, Dialog, Toast, Select, etc.
│   ├── applications/
│   │   ├── ApplicationsTable.tsx # Responsive table with bulk checkboxes
│   │   ├── KanbanBoard.tsx       # Drag-and-drop status columns
│   │   ├── StatusSelect.tsx      # Portal-based custom dropdown
│   │   ├── StatusBadge.tsx
│   │   ├── StatusTimeline.tsx    # Activity log
│   │   ├── InterviewRounds.tsx   # Interview prep CRUD
│   │   ├── InlineEditFields.tsx
│   │   ├── ContactSection.tsx
│   │   ├── CoverLetterSection.tsx
│   │   ├── ResumeSection.tsx / ResumeManager.tsx
│   │   ├── BulkActionBar.tsx     # Floating bulk status update bar
│   │   ├── BulkApplicationsWrapper.tsx
│   │   └── DeleteApplicationButton.tsx
│   ├── notes/NotesList.tsx
│   ├── reminders/RemindersList.tsx
│   ├── dashboard/
│   │   ├── StatusChart.tsx       # Status distribution bar chart
│   │   ├── PipelineFunnelChart.tsx  # Conversion rate funnel
│   │   └── DashboardContent.tsx
│   └── ai/
│       ├── FollowUpButton.tsx    # Streaming email draft modal
│       └── AIInsightsButton.tsx  # Tabbed summarize/next-steps dialog
├── lib/
│   ├── actions/
│   │   ├── applications.ts       # CRUD, bulk update, list, CSV export
│   │   ├── notes.ts
│   │   ├── reminders.ts
│   │   ├── interviews.ts         # Interview round CRUD (raw SQL)
│   │   ├── resumes.ts            # Resume, contact, cover letter actions
│   │   ├── email-drafts.ts
│   │   ├── ownership.ts          # Shared ownership assertion
│   │   └── export.ts             # CSV export action
│   ├── interviews.ts             # Interview types, schema, constants
│   ├── auth.ts                   # Auth.js config
│   ├── db.ts                     # Prisma client (with driver adapter)
│   ├── gemini.ts                 # Gemini client + rate limiter
│   ├── queries.ts                # Dashboard / detail / funnel queries
│   ├── validation.ts             # Zod schemas
│   ├── constants.ts              # Status / priority enums + labels
│   ├── dates.ts                  # date-fns helpers (including daysBetween)
│   ├── session.ts                # requireUser helper
│   ├── utils.ts                  # cn() utility
│   └── types.ts                  # Raw SQL type extensions
├── providers/theme-provider.tsx
prisma/
├── schema.prisma
├── seed.ts
└── config.ts
.github/workflows/ci.yml          # Lint → typecheck → build
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
| `npm run db:push` | Push schema to the database |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## Data model

```
User ─┬─ Account (Auth.js OAuth)
      ├─ Session (Auth.js)
      ├─ Application ─┬─ Note
      │               ├─ Reminder
      │               ├─ EmailDraft
      │               ├─ StatusChange (audit log)
      │               └─ InterviewRound (raw SQL)
      └─ ResumeVersion
```

- `Application.status`: `SAVED` → `APPLIED` → `INTERVIEWING` → `OFFER` | `REJECTED` | `ARCHIVED`
- `Application.priority`: `LOW` | `MEDIUM` | `HIGH`
- `Reminder.reminderType`: `FOLLOW_UP` | `INTERVIEW` | `DEADLINE` | `OTHER`
- `InterviewRound.type`: `PHONE_SCREEN` | `TECHNICAL` | `BEHAVIORAL` | `SYSTEM_DESIGN` | `ONSITE` | `FINAL` | `OTHER`
- `InterviewRound.outcome`: `PENDING` | `PASSED` | `FAILED` | `NO_SHOW`

All entity ownership is enforced at the action layer — no application, note, or reminder is ever returned to a user other than its owner.

---

## AI features

All AI features use `gemini-2.5-flash` (free tier: 15 RPM, 1M TPM). Each endpoint has a per-user rate limit.

### Follow-up email draft
- Prompt includes company, role, status, date applied, and the 5 most recent notes.
- Tone selector: `professional` (default) or `friendly`.
- Response is streamed to the client and rendered token-by-token.

### Note summarization
- Summarizes all notes for an application into key takeaways.
- Useful for refreshing context before an interview or follow-up.

### Next-step suggestions
- Analyzes the application's current status and context.
- Suggests actionable next steps (e.g., "Send a follow-up email", "Prepare for system design round").

All AI buttons are hidden if `GEMINI_API_KEY` is not set, so the rest of the app works without AI.

---

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

---

## CI/CD

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on every push and PR:

1. **Lint** — ESLint
2. **Typecheck** — `tsc --noEmit`
3. **Build** — `prisma generate && next build`

---

## Notes on polish

This isn't a tutorial clone. A few details that were intentional:

- **Animations** use CSS keyframes (no animation library) and respect `prefers-reduced-motion`.
- **Ambient background** is a fixed gradient mesh that adapts to light/dark mode.
- **Empty states** have gradient hero illustrations rather than dead-end messages.
- **Stat cards** have hover lift and unique color accents per metric.
- **Status select** is a portal-based custom dropdown with smooth scale-in/out animations and a colored status dot that pulses softly while saving.
- **Form inputs** have a focus state that lifts the border and adds a soft ring + shadow.
- **Loading skeletons** use a moving shimmer gradient, not a flat pulse.
- **Delete confirmations** use custom Dialog components instead of browser `confirm()`.
- **Kanban board** uses a responsive CSS grid that adapts columns per breakpoint (no horizontal scrolling).

---

## License

MIT
