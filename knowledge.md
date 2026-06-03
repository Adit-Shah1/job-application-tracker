# Project knowledge

This file gives Codebuff context about your project: goals, commands, conventions, and gotchas.

## When task complete
**IMPORTANT:** Always send me a push notification after completing ANY task I've asked for, no matter how small. Do this at the end of every response where you've done work for me. Also send a notification if you need my input or are stuck.

curl -X POST https://api.getmoshi.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"token":"xnJNBOfikdiUsAUEBKjL8XWvsG7DoFH0","title”:”Title, e.g. Done”,”message”:”Brief summary”}’

## Quickstart

- **Install:** `npm install` (runs `prisma generate` via postinstall)
- **Dev:** `npm run dev` (Next.js 16 with Turbopack — first compile can take 10-30s)
- **Build:** `npm run build` (runs `prisma generate && next build`)
- **Lint:** `npm run lint` (ESLint 9 flat config)
- **Typecheck:** `npm run typecheck` (`tsc --noEmit`)
- **DB push schema:** `npm run db:push`
- **DB migrate:** `npm run db:migrate`
- **DB seed:** `npm run db:seed` (seeds 12 demo applications)
- **DB studio:** `npm run db:studio`

## Architecture

This is a **full-stack job application tracker** built with Next.js 16 (App Router), React 19, Prisma 7, Neon Postgres, Auth.js v5, and Google Gemini for AI features.

### Key directories

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (protected by layout.tsx calling auth())
│   │   ├── dashboard/      # Stats + chart + reminders (Suspense-streamed)
│   │   ├── applications/   # List (server-side filter/sort/paginate), new, detail, edit
│   │   ├── settings/       # Profile, OAuth connections, password, theme, delete account
│   │   ├── layout.tsx      # Top nav bar, sign-out button, theme toggle
│   │   └── loading.tsx     # Shimmer skeleton fallback
│   ├── (public)/
│   │   └── signin/         # Email/password auth + OAuth buttons
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Auth.js route handler
│   │   └── ai/follow-up/         # Streaming Gemini endpoint (nodejs runtime)
│   ├── layout.tsx          # Root layout (fonts, ThemeProvider, ToastProvider)
│   ├── globals.css         # Animations, skeleton shimmer, ambient background, stagger helpers
│   └── page.tsx            # Root redirect: session → /dashboard, no session → /signin
├── components/
│   ├── ui/                 # Reusable primitives: Button, Card, Dialog, Input, Select, Badge,
│   │                       #   Table, Toast, Pagination, NavLink, ThemeToggle, MobileNav
│   ├── applications/       # ApplicationForm, ApplicationsTable (desktop table + mobile cards),
│   │                       #   StatusSelect (optimistic), StatusBadge, FilterBar, DeleteButton
│   ├── dashboard/          # DashboardContent (server), StatusChartClient (dynamic import, no SSR),
│   │                       #   DashboardSkeleton
│   ├── notes/              # NotesList (client, inline CRUD with useActionState)
│   ├── reminders/          # RemindersList (client, complete/delete with overdue highlighting)
│   ├── ai/                 # FollowUpButton (modal with streaming, tone selector, draft management)
│   ├── settings/           # ConnectedProvidersCard, PasswordCard, ThemeCard, DeleteAccountCard
│   └── auth/               # AuthForm (signin/signup toggle with password visibility)
├── lib/
│   ├── actions/            # Server actions (use "use server" directive)
│   │   ├── applications.ts # CRUD + list with filters/sort/pagination, ActionResult type
│   │   ├── notes.ts        # create/update/delete with ownership check
│   │   ├── reminders.ts    # create/complete/delete with ownership check
│   │   ├── email-drafts.ts # save/delete drafts (for AI follow-up)
│   │   ├── account.ts      # Auth: signIn/signUp with email, OAuth link/unlink, password mgmt, delete account
│   │   └── ownership.ts    # assertOwnsApplication (shared ownership check)
│   ├── auth.ts             # Auth.js config: GitHub + Google + Credentials providers, JWT strategy
│   ├── db.ts               # PrismaClient with PrismaPg driver adapter (Neon)
│   ├── queries.ts          # Data fetching: getDashboardSummary, getApplicationDetail (with unstable_cache)
│   ├── gemini.ts           # Gemini client singleton + in-memory rate limiter (5 req/min per user)
│   ├── validation.ts       # Zod schemas: application, note, reminder, email draft, auth forms
│   ├── constants.ts        # Status/priority/reminder enums + labels + badge variants
│   ├── dates.ts            # date-fns helpers: formatDate, fromNow, friendlyDate, isOverdue
│   ├── session.ts          # requireUser() — redirects to /signin if no session
│   └── utils.ts            # cn() — clsx + tailwind-merge
├── providers/
│   └── theme-provider.tsx  # Light/dark/system theme with localStorage persistence
prisma/
├── schema.prisma           # User, Account, Session, VerificationToken (Auth.js), Application, Note, Reminder, ResumeVersion, EmailDraft
├── seed.ts                 # Seeds 12 demo applications with notes/reminders
└── config.ts               # Prisma config with dotenv
```

### Data flow

1. **Pages** are server components that call data-fetching functions from `lib/queries.ts`
2. **Queries** use `unstable_cache` with 30s revalidation and cache tags for revalidation
3. **Server actions** in `lib/actions/` handle mutations, call `revalidatePath` + `updateTag`
4. **Client components** use `useActionState` for forms and `useTransition` for optimistic updates
5. **Auth** flows through Auth.js with JWT strategy; every protected page/layout calls `auth()` or `requireUser()`

## Conventions

### Patterns to follow

- **Server actions:** Use `"use server"` directive, return `ActionResult` type (`{ ok: true, id? } | { ok: false, error, fieldErrors? }`)
- **Ownership checks:** Use `assertOwnsApplication` from `lib/actions/ownership.ts` for notes/reminders
- **Validation:** Zod schemas in `lib/validation.ts` with `safeParse`, return field errors to client
- **Caching:** `unstable_cache` with tags (`"dashboard"`, `"applications"`, `"email-drafts"`) for data queries; `revalidatePath` + `updateTag` in mutations
- **Streaming/Suspense:** Wrap slow server components in `<Suspense fallback={...}>` — dashboard, settings, applications list all use this pattern
- **Dynamic imports:** Use `next/dynamic` with `ssr: false` for heavy client-only libs (e.g., Recharts in StatusChartClient)
- **Forms:** Use `useActionState` with server actions, show pending state, toast on success/error
- **Optimistic updates:** Use `useOptimistic` + `useTransition` (see StatusSelect)
- **Styling:** Tailwind CSS 4 utility classes, `cn()` helper from `lib/utils.ts`, CSS animations in `globals.css`
- **Icons:** Lucide React (`lucide-react`)
- **Toast notifications:** `useToast()` hook from `components/ui/toast.tsx`

### Formatting/linting

- ESLint 9 flat config (`eslint.config.mjs`)
- TypeScript strict mode
- `tsc --noEmit` for type checking

### Things to avoid

- Don't cast as `any` type
- Don't assume libraries are available — check imports and package.json first
- Don't call `auth()` multiple times in the same render tree — consolidate into shared fetch (see `AccountSettingsCards` pattern in settings page)
- Don't use `redirect()` inside try/catch (Next.js redirect throws internally)
- The `unstable_cache` function args are automatically included in cache key — no need to add userId to the key array
- `ApplicationForm` uses `useEffect` to handle post-submit redirect (not inline `if (state?.ok)` which causes render-loop issues)
- `Globals.css` has `prefers-reduced-motion` support — respect it in any new animations
- Auth.js `signIn`/`signOut` throw `NEXT_REDIRECT` internally — catch only `AuthError`, re-throw everything else

## Environment variables

Required in `.env` (gitignored):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon Postgres pooled connection string |
| `AUTH_SECRET` | Yes | Auth.js session secret (`openssl rand -base64 32`) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | No | Enables GitHub OAuth |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Enables Google OAuth |
| `AUTH_URL` | No | Public URL (defaults to http://localhost:3000) |
| `GEMINI_API_KEY` | No | Enables AI follow-up email feature |

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + custom UI primitives |
| Database | PostgreSQL on Neon |
| ORM | Prisma 7 with PrPg driver adapter |
| Auth | Auth.js v5 (GitHub + Google + Credentials) |
| Validation | Zod 4 |
| Forms | React Server Actions + `useActionState` |
| Charts | Recharts (dynamic import, no SSR) |
| AI | Google Gemini 2.5 Flash via `@google/generative-ai` |
| Icons | Lucide React |
| Deployment | Vercel + Neon |
