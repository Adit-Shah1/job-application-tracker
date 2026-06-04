# Feature Roadmap — Ease × Impact Analysis

> Prioritized by two axes: **Ease** (how fast/low-risk to implement given existing infrastructure) and **Impact** (user value + portfolio impressiveness). Features are ranked within each tier.

---

## How to Read This

```
                    HIGH IMPACT
                        │
     ┌──────────────────┼──────────────────┐
     │                  │                  │
     │   🏆 QUICK WINS  │   🎯 BIG BETS    │
     │   Do these first │   Worth the time │
     │                  │                  │
EASY ├──────────────────┼──────────────────┤ HARD
     │                  │                  │
     │   📎 FILLERS     │   ⏸️  DEPRIORITIZE│
     │   Nice to have   │   Not now        │
     │                  │                  │
     └──────────────────┼──────────────────┘
                        │
                    LOW IMPACT
```

---

## 🏆 TIER 1 — Quick Wins (Easy + High Impact)

These build heavily on existing infrastructure. Each can be done in a single focused session.

### 1. Pipeline Funnel Chart
**Effort:** ~1 hour | **Impact:** 🔥🔥🔥

Reuses existing Recharts setup + existing `statusChanges` data. A new chart component on the dashboard showing conversion rates: Saved → Applied → Interviewing → Offer. This is the #1 analytics feature competitors like Teal highlight.

- **What exists:** `StatusChart.tsx` (Recharts pattern), `statusChanges` model, dashboard page
- **What's new:** One new chart component, one query to calculate conversion rates
- **Why it matters:** Turns raw data into actionable insight. Shows data visualization skills.

### 2. Interview Debrief Notes
**Effort:** ~1 hour | **Impact:** 🔥🔥

Extend `InterviewRound` with `debriefNotes` (what went well, what to improve, red flags). Just a new textarea field in the edit form + raw SQL column.

- **What exists:** InterviewRound model, CRUD actions, InterviewRounds component with edit form
- **What's new:** One SQL column, one textarea in EditRoundForm
- **Why it matters:** Makes the interview tracker actually useful for reflection. Shows thoughtful UX.

### 3. Bulk Status Update
**Effort:** ~1.5 hours | **Impact:** 🔥🔥

Add checkboxes to the applications table + a bulk action bar. Calls the existing `updateApplicationStatus` action in a loop.

- **What exists:** `ApplicationsTable.tsx`, `updateApplicationStatus` server action
- **What's new:** Selection state, checkbox column, bulk action bar component
- **Why it matters:** Solves real pain when managing 50+ applications. Shows state management skills.

### 4. Time-to-Response Tracking
**Effort:** ~1 hour | **Impact:** 🔥🔥

Show "X days to respond" on each application using existing `statusChanges` timestamps. Add an average to the dashboard.

- **What exists:** `statusChanges` model with `changedAt` timestamps, detail page layout
- **What's new:** One utility function to calculate deltas, display on detail page + dashboard stat
- **Why it matters:** Unique analytics feature no competitor has. Shows data analysis thinking.

### 5. CI/CD Pipeline (GitHub Actions)
**Effort:** ~30 min | **Impact:** 🔥🔥🔥

Create `.github/workflows/ci.yml` with lint → typecheck → build. Demonstrates production engineering maturity.

- **What exists:** `npm run lint`, `tsc --noEmit`, `npm run build` all work
- **What's new:** One YAML file
- **Why it matters:** 90%+ of portfolio projects have zero CI/CD. Massive differentiator for 30 minutes of work.

---

## 🎯 TIER 2 — Big Bets (Harder but Very Impactful)

These require more effort but deliver outsized user and portfolio value.

### 6. Resume ↔ Job Fit Score
**Effort:** ~3 hours | **Impact:** 🔥🔥🔥🔥

Paste a job description → get a 0–100 match score with missing keywords highlighted. The "killer feature" that Teal is known for.

- **What exists:** Gemini integration, streaming API pattern, AIInsightsButton dialog
- **What's new:** One API route (`/api/ai/fit-score`), one button + dialog component, keyword extraction logic
- **Why it matters:** Most impressive AI feature. Directly solves the #1 job search challenge. Demonstrates prompt engineering.

### 7. AI Cover Letter Generator
**Effort:** ~2.5 hours | **Impact:** 🔥🔥🔥

Given job description + resume → generate tailored cover letter → save to existing `coverLetter` field. Edit inline before saving.

- **What exists:** Gemini integration, `CoverLetterSection` component with editor, `coverLetter` DB column
- **What's new:** One API route (`/api/ai/cover-letter`), "Generate with AI" button in CoverLetterSection
- **Why it matters:** Natural extension of existing cover letter storage. Reduces "blank page syndrome."

### 8. Email Template Library
**Effort:** ~3 hours | **Impact:** 🔥🔥🔥

Pre-written templates (follow-up, thank-you, withdrawal, recruiter outreach) with `{{company}}`, `{{role}}` variables auto-filled from application data.

- **What exists:** Follow-up email AI feature, `FollowUpButton` component
- **What's new:** Template data (could be hardcoded or in DB), template interpolation, template picker UI
- **Why it matters:** Every job seeker needs this. Shows templating, form handling, and UX design.

### 9. E2E Testing (Playwright)
**Effort:** ~3 hours | **Impact:** 🔥🔥🔥🔥

Playwright tests for 5 critical flows: create application, change status, add note, use Kanban, view dashboard.

- **What exists:** Nothing (no tests currently)
- **What's new:** Playwright config, test files for each flow, `npm run test:e2e` script
- **Why it matters:** The single biggest portfolio differentiator. Demonstrates testing maturity. Pairs with CI/CD.

### 10. Interview Question Generator
**Effort:** ~2 hours | **Impact:** 🔥🔥

AI generates likely interview questions based on role, company, and round type. Shows in the InterviewRound detail.

- **What exists:** Gemini integration, InterviewRound model with `type` field
- **What's new:** One API route, "Generate Questions" button in round detail view
- **Why it matters:** Ties AI into the interview prep workflow. Natural extension of existing features.

---

## 📎 TIER 3 — Fillers (Easy but Lower Impact)

Nice polish features. Do these when you have spare time or need a break from bigger work.

### 11. Source Effectiveness
**Effort:** ~1 hour | **Impact:** 🔥

Chart showing response rates by application source (LinkedIn, referral, company site, etc.).

- **What exists:** `source` field on Application, Recharts setup
- **What's new:** One chart component, one aggregation query

### 12. Salary Analytics
**Effort:** ~1 hour | **Impact:** 🔥

Chart showing salary ranges across applications. Min/avg/max by company or status.

- **What exists:** `salaryMin`, `salaryMax`, `currency` fields, Recharts
- **What's new:** One chart component, one query

### 13. API Rate Limiting
**Effort:** ~30 min | **Impact:** 🔥

Extend the existing rate limiter in `gemini.ts` to protect all AI endpoints.

- **What exists:** Rate limiter in `gemini.ts`
- **What's new:** Apply same pattern to `/api/ai/summarize`, `/api/ai/next-steps`, new AI routes

### 14. Company Research Notes
**Effort:** ~1.5 hours | **Impact:** 🔥🔥

Dedicated section per application for research. AI can pre-populate from company name.

- **What exists:** Notes model, Gemini integration
- **What's new:** Research section UI, "Auto-populate" button calling Gemini

### 15. Auto-fill from URL
**Effort:** ~2 hours | **Impact:** 🔥🔥🔥

Paste a job posting URL → auto-extract company, role, location, salary using AI or metadata parsing.

- **What exists:** Gemini integration, application create form
- **What's new:** One API route (`/api/ai/extract-job`), URL input in create form with auto-fill logic
- **Why it's here instead of Tier 2:** The Chrome bookmarklet partially solves this already. This is the "without extension" fallback.

---

## ⏸️ TIER 4 — Deprioritize (Hard + Lower Impact)

Not worth the effort right now relative to other options.

### 16. Chrome Bookmarklet
**Effort:** ~3 hours | **Impact:** 🔥🔥

One-click save from LinkedIn/Indeed. Requires a public API endpoint, CORS handling, bookmarklet JS, and a "how to install" page.

- **Why deprioritize:** High effort for what is essentially a convenience feature. The auto-fill-from-URL (Tier 3 #15) provides 80% of the value with 30% of the effort. The bookmarklet is better done after the extraction API exists.

### 17. Mock Interview with AI
**Effort:** ~5 hours | **Impact:** 🔥🔥🔥

Simulated Q&A: AI asks questions, user answers, AI evaluates. Requires conversational state management, scoring rubric, and a new full-page UI.

- **Why deprioritize:** Very high effort. Impressive but the Interview Question Generator (Tier 2 #10) gives 60% of the value at 30% of the cost. Build this after the question generator proves the concept.

### 18. PWA / Offline Support
**Effort:** ~4 hours | **Impact:** 🔥🔥

Service Worker, manifest.json, offline caching strategy. Shows advanced web platform knowledge.

- **Why deprioritize:** Significant effort and ongoing maintenance burden. Better to do after other polish is complete.

### 19. Recurring Reminders
**Effort:** ~2 hours | **Impact:** 🔥

Schema changes, interval logic, cron-like scheduling. Nice but not a differentiator.

### 20. Weekly/Monthly Summary
**Effort:** ~3 hours | **Impact:** 🔥🔥

AI-generated activity digest. Requires a new endpoint, aggregation queries, and potentially email delivery.

- **Why deprioritize:** The existing dashboard + AI summarize features cover most of this. Email delivery adds complexity.

---

## 🗺️ Recommended Execution Order

```
Session 1 (Quick wins — 2 hours)
├── CI/CD Pipeline (30 min)
├── Pipeline Funnel Chart (1 hr)
└── Time-to-Response Tracking (1 hr)

Session 2 (Quick wins continued — 2 hours)
├── Interview Debrief Notes (1 hr)
└── Bulk Status Update (1 hr)

Session 3 (AI features — 3 hours)
├── Resume ↔ Job Fit Score (2.5 hr)
└── API Rate Limiting (30 min)

Session 4 (AI features — 3 hours)
├── AI Cover Letter Generator (2 hr)
└── Interview Question Generator (1 hr)

Session 5 (Testing — 3 hours)
└── E2E Testing with Playwright (3 hr)

Session 6 (Polish — 3 hours)
├── Email Template Library (2 hr)
└── Source Effectiveness + Salary Analytics charts (1 hr)

Later (if time permits)
├── Auto-fill from URL
├── Company Research Notes
├── Chrome Bookmarklet (after extraction API exists)
├── Mock Interview with AI
└── PWA / Offline Support
```

---

## Summary

| Tier | Count | Total Effort | Portfolio Value |
|------|-------|-------------|-----------------|
| 🏆 Quick Wins | 5 | ~5 hours | High — analytics, UX polish, CI/CD |
| 🎯 Big Bets | 5 | ~14 hours | Very High — AI features, E2E testing |
| 📎 Fillers | 5 | ~7 hours | Medium — charts, polish |
| ⏸️ Deprioritize | 5 | ~17 hours | Variable — do later |

**The highest-ROI move:** Do Tier 1 (5 hours) → you get CI/CD, analytics, and UX improvements that make the app feel production-grade.

**The most impressive move:** Add Tier 2 #6 + #9 (6 hours) → you get AI fit scoring + E2E tests, which together make this a standout portfolio piece.
