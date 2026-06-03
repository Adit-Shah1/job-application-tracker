# Feature Ideas & Improvements (Prioritized)

## P0 — Must-have for real-world use

### 1. Pagination
Applications list loads everything at once — no `skip`/`take` in `listApplications()`. With 100+ apps this breaks.
- URL-based page param, `take: 20` default, page controls
- `src/lib/actions/applications.ts:186`

### 2. Dark mode toggle
Dark mode works via `prefers-color-scheme` but no manual toggle — modern UX expectation.
- ThemeProvider context, toggle button in nav/settings, persist preference
- `src/app/globals.css:25-34`

## P1 — High user value, moderate effort

### 3. Keyboard shortcuts
Power-user UX with minimal implementation surface.
- `n` → new app, `/` → focus search, `1-4` → nav items, `Escape` → close dialogs
- New hook or context in `src/components/ui/`

### 4. Optimistic updates for notes and reminders
Only `StatusSelect` uses optimistic UI; notes/reminders feel sluggish waiting for server.
- `useOptimistic` in `NotesList.tsx` and `RemindersList.tsx`

### 5. Search within notes
Notes content excluded from full-text search — makes search much less useful.
- `src/lib/actions/applications.ts:169-175`

### 6. Inline editing on detail page
Edit company/role directly on detail page instead of navigating to separate edit page.
- `src/components/applications/ApplicationDetailContent.tsx`

### 7. Activity log / audit trail
No history of status changes. A `StatusChange` model would track what changed, when, and from/to what.
- Log on every status update in `src/lib/actions/applications.ts:100-136`

### 8. CSV export
Download all applications + notes as CSV. Practical for real users who want backups.
- New API route or server action

## P2 — Nice additions, good portfolio depth

### 9. Resume version upload
`ResumeVersion` model already in schema — just needs UI and server actions.
- File upload UI, tag resume to an application
- `prisma/schema.prisma:134-141`

### 10. Contact/recruiter management
"Recruiter calls" mentioned in empty states but no dedicated fields.
- Contact name, email, phone, notes per application
- `prisma/schema.prisma:84-108`, `ApplicationForm.tsx`

### 11. Cover letter storage
Per-application cover letter text/file. Mentioned in spec as nice-to-have.
- Textarea or file upload on form/detail page
- `prisma/schema.prisma`

### 12. Undo for status changes
Brief "Undo" toast after status change (like Gmail).
- `src/components/applications/StatusSelect.tsx`

### 13. AI feature expansion
Only follow-up email drafted via Gemini today. Could add note summarization or next-step suggestions.
- `src/app/api/ai/follow-up/route.ts`, `src/lib/gemini.ts`

## P3 — Portfolio standouts, higher scope

### 14. Drag-and-drop status
Replace status select with drag-to-move interaction on desktop. Spec calls this out as ideal UX.
- `src/components/applications/StatusSelect.tsx`

### 15. Interview prep tracker
Structured interview rounds (round number, interviewer, type, notes, feedback). Biggest portfolio standout.
- New Prisma model, component, server actions

### 16. Offer comparison page
Side-by-side comparison of OFFER-status applications (salary, location, perks).
- New route `src/app/(app)/applications/compare/`

### 17. Chrome bookmarklet
One-click "save this job" from LinkedIn/Indeed. Separate surface area.
- `public/bookmarklet.js`, new API route
