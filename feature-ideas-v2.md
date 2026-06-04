# Feature Ideas V2 — Research-Backed Expansion Plan

> Compiled from research on Teal, Simplify, Huntr, Jobright, and other leading job search platforms, plus analysis of what impresses hiring managers in portfolio projects (2025–2026).

---

## Already Implemented (16/17 from original list)

| # | Feature | Status |
|---|---------|--------|
| 1 | Pagination | ✅ |
| 2 | Dark mode toggle | ✅ |
| 3 | Keyboard shortcuts | ✅ |
| 4 | Optimistic updates | ✅ |
| 5 | Search within notes | ✅ |
| 6 | Inline editing | ✅ |
| 7 | Activity log / audit trail | ✅ |
| 8 | CSV export | ✅ |
| 9 | Resume version upload | ✅ |
| 10 | Contact/recruiter management | ✅ |
| 11 | Cover letter storage | ✅ |
| 12 | Undo for status changes | ✅ |
| 13 | AI expansion (summarize + next steps) | ✅ |
| 14 | Drag-and-drop Kanban | ✅ |
| 15 | Interview prep tracker | ✅ |
| 16 | Offer comparison page | ✅ |
| 17 | Chrome bookmarklet | ❌ Not started |

---

## New Feature Ideas — Organized by Category

### 🤖 AI & Intelligence

These features leverage Gemini AI and position the project as an "AI-powered job search CRM."

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Resume ↔ Job Description Fit Score** | Paste a job description, get a 0–100 match score against your stored resume. Highlights missing keywords and skills. Inspired by Teal's ATS scoring. | Medium | 🔥 High |
| **AI Cover Letter Generator** | Given a job description + resume, generate a tailored cover letter draft. Edit inline before saving. Goes beyond the existing follow-up email feature. | Medium | 🔥 High |
| **Interview Question Generator** | Based on the role, company, and interview round type, generate likely interview questions with suggested talking points. Ties into the existing InterviewRound model. | Medium | High |
| **Application Strength Scoring** | AI analyzes each application (resume version, cover letter, notes, number of interview rounds) and assigns a "strength" score with improvement suggestions. | Low | Medium |
| **Smart Next Actions** | Extend the existing "next-steps" AI feature into a persistent, per-application action queue. AI suggests actions based on status, days since last update, and upcoming reminders. | Low | Medium |
| **Salary Negotiation Coach** | Given an offer's salary range, the user's experience, and market data, generate negotiation talking points and counter-offer suggestions. | Medium | Medium |

### 🔄 Automation & Efficiency

Reduce manual work — the #1 complaint about job searching.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Chrome Bookmarklet** | One-click "Save this job" from LinkedIn, Indeed, Glassdoor. Extracts title, company, description, and URL into a new application. (Last remaining item from original list.) | Medium | 🔥 High |
| **Auto-fill from URL** | Paste a job posting URL and auto-extract company name, role title, location, salary range, and description using AI or metadata parsing. | Medium | 🔥 High |
| **Email-to-Application** | Forward a job-related email (offer letter, interview invite) to a unique address, and it auto-creates/updates the application. | High | Medium |
| **Bulk Status Update** | Select multiple applications and change status at once (e.g., mark all "Saved" as "Applied" after a batch submission). | Low | Medium |
| **Recurring Reminders** | Set reminders that repeat (e.g., "follow up every 5 days until response"). Currently reminders are one-shot only. | Low | Low |

### 📊 Analytics & Insights

Turn raw data into actionable job search intelligence.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Pipeline Funnel Chart** | Visualize conversion rates: Applied → Screen → Interview → Offer → Accepted. Identify bottlenecks (e.g., "your resume gets responses 12% of the time"). | Medium | 🔥 High |
| **Time-to-Response Tracking** | Track how long each company takes to respond at each stage. Helps set realistic expectations and prioritize follow-ups. | Low | Medium |
| **Weekly/Monthly Summary** | AI-generated summary of job search activity: applications submitted, interviews scheduled, response rates, streaks. Could be a dashboard card or email digest. | Medium | Medium |
| **Salary Analytics** | Chart salary ranges across all applications. Show min/avg/max offers, compare by company size or location. | Low | Low |
| **Source Effectiveness** | Track which application sources (LinkedIn, referral, company site, etc.) have the highest response/interview rates. | Low | Low |

### 💬 Communication & Templates

The #1 time sink after applications themselves.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Email Template Library** | Pre-written, modular templates for: recruiter outreach, follow-up, thank-you, withdrawal, negotiation. Variables auto-filled from application data. | Medium | 🔥 High |
| **AI Email Tone Adjuster** | Take a draft email and adjust tone (formal/casual/confident/humble) before sending. Builds on the existing follow-up email feature. | Low | Medium |
| **LinkedIn Message Generator** | Generate personalized connection requests or InMail messages for recruiters/hiring managers based on the application context. | Low | Medium |

### 🎯 Interview & Preparation

Deepen the interview prep tracker with interactive features.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **Mock Interview with AI** | Simulated Q&A session. AI asks role-specific questions, evaluates answers, and provides feedback on content and structure. | High | 🔥 High |
| **Interview Debrief Notes** | Structured post-interview form: what went well, what to improve, key questions asked, red/green flags about the company. Tied to each InterviewRound. | Low | Medium |
| **Interview Calendar View** | Calendar widget showing upcoming interviews alongside reminders. Integrates with the existing InterviewRound scheduled dates. | Medium | Medium |
| **Company Research Notes** | Dedicated section per application for company research: Glassdoor reviews, team structure, tech stack, culture notes. AI can pre-populate from company name. | Low | Medium |

### 🏗️ Technical & Engineering Features

These impress senior engineers and hiring managers reviewing your portfolio.

| Feature | Description | Effort | Impact |
|---------|-------------|--------|--------|
| **PWA / Offline Support** | Service Worker caching for read-only offline access. Shows how you handle state sync and edge cases. | High | 🔥 High |
| **E2E Testing (Playwright)** | Full end-to-end test suite covering the critical user flows. Demonstrates testing maturity. | Medium | 🔥 High |
| **CI/CD Pipeline** | GitHub Actions for lint → typecheck → test → deploy. The kind of thing every production app needs. | Medium | 🔥 High |
| **Real-time Updates (WebSocket/SSE)** | Push notifications when application status changes (e.g., if integrated with email detection). Shows real-time architecture skills. | High | High |
| **Role-Based Access Control** | Admin vs. user roles, shared applications for career coaches. Demonstrates security awareness. | Medium | Medium |
| **Database Migrations Pipeline** | Proper Prisma migrations (once Node v26 Prisma issue is resolved) instead of raw SQL. Shows production readiness. | Low | Medium |
| **Performance Monitoring** | Add response time tracking, error rate monitoring, or Web Vitals reporting. Shows observability awareness. | Medium | Medium |
| **API Rate Limiting** | Rate limit the AI endpoints and server actions. Shows security-conscious engineering. | Low | Medium |

---

## 🏆 Top 10 Recommended Next Features

Ranked by a combination of user impact, portfolio impressiveness, and implementation feasibility:

| Rank | Feature | Why |
|------|---------|-----|
| 1 | **Chrome Bookmarklet** | Last remaining original feature. Solves the #1 pain point (manual data entry). Demonstrates browser extension knowledge. |
| 2 | **Resume ↔ Job Fit Score** | The most "wow" AI feature. Directly addresses the biggest challenge in job searching. Demonstrates LLM integration skills. |
| 3 | **Email Template Library** | Practical feature that every job seeker needs. Demonstrates form handling, templating, and AI integration. |
| 4 | **Auto-fill from URL** | Massive UX improvement. Demonstrates web scraping, metadata parsing, and AI extraction. |
| 5 | **Pipeline Funnel Chart** | Best analytics feature. Extends the existing Recharts setup. Demonstrates data visualization skills. |
| 6 | **E2E Testing (Playwright)** | The single biggest portfolio differentiator. 90%+ of portfolio projects have zero tests. |
| 7 | **CI/CD Pipeline** | Shows production engineering maturity. Pairs naturally with E2E tests. |
| 8 | **Mock Interview with AI** | Unique, interactive feature that stands out. Demonstrates streaming AI, conversational UI, and complex state management. |
| 9 | **PWA / Offline Support** | Demonstrates advanced web platform knowledge (Service Workers, caching strategies, background sync). |
| 10 | **Interview Debrief Notes** | Low effort, high value. Naturally extends the InterviewRound model. |

---

## 💡 What Top Competitors Do Well

| Platform | Superpower | What We Can Learn |
|----------|-----------|-------------------|
| **Teal** | Resume builder + ATS scoring + CRM-style contact management | Resume optimization is the killer feature — users care most about getting interviews |
| **Simplify** | Browser autofill across 100+ ATS platforms | Automation of repetitive tasks is the #1 user retention driver |
| **Huntr** | Clean Kanban UX, visual pipeline management | You already have this! Lean into it. |
| **Jobright** | AI-powered job discovery and matching | Proactive suggestions (not just passive tracking) increase engagement |

---

## 📐 Architecture Notes

- **Prisma CLI vs Node v26**: Currently using raw SQL for P2/P3 columns. Once resolved, proper Prisma migrations would clean this up.
- **AI Endpoints**: Currently streaming via Gemini. Could be extended to support multiple AI providers (OpenAI, Claude) via a provider abstraction.
- **Testing**: Zero test coverage currently. Adding Playwright E2E tests for the 5 critical flows (CRUD, status change, notes, Kanban, AI) would be the highest-ROI improvement.
