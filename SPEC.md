# Project Spec: Job Application Tracker

## 1. Project summary

Build a web app that helps users track job applications from first save to final outcome. The app should let users store job postings, manage application stages, keep notes, set reminders, and review their progress over time. The goal is to create a polished portfolio project that feels like a real product, not a tutorial clone.

The app should be useful enough that someone could actually use it for a real job search. It should also be simple enough to finish well, with clean UI, clear data flow, and a focused feature set.

## 2. Project goal

The main goal is to build a resume-worthy product that demonstrates:
- Frontend UI design.
- Backend/data modeling.
- CRUD workflows.
- Search and filtering.
- Authentication and persistence.
- Thoughtful product decisions.

A good side project should solve a real problem, be deployed, and show depth rather than breadth.

## 3. Core user problem

Job seekers often lose track of:
- Which roles they applied to.
- What stage each application is in.
- When to follow up.
- Which resume version they used.
- Notes from interviews or recruiter calls.

This app solves that by giving users one place to manage everything related to their job search.

## 4. Recommended MVP

The MVP should include these features:
- User authentication.
- Create, edit, delete, and view applications.
- Application status pipeline.
- Notes attached to each application.
- Search and filtering.
- Follow-up reminders.
- Dashboard with simple stats.

The MVP should be fully usable before any advanced features are added.

## 5. Data model

Use a relational model if possible.

### User
- id
- name
- email
- password hash or auth provider id
- created_at

### Application
- id
- user_id
- company_name
- role_title
- job_url
- location
- status
- salary_range optional
- date_saved
- date_applied optional
- last_updated
- priority
- source

### Note
- id
- application_id
- content
- created_at
- updated_at

### Reminder
- id
- application_id
- reminder_date
- reminder_type
- completed

### ResumeVersion optional
- id
- user_id
- name
- file_url
- created_at

This structure supports a real application workflow and leaves room for later expansion.

## 6. Status workflow

Use a default pipeline such as:
- Saved.
- Applied.
- Interviewing.
- Offer.
- Rejected.
- Archived.

The user should be able to move an application between statuses easily, ideally through drag-and-drop or a simple status selector.

## 7. UI pages

### Dashboard
Show a summary of the user’s application activity:
- Total applications.
- Applications by status.
- Upcoming reminders.
- Recently updated entries.
- A simple progress chart.

### Applications list
Show all applications in a sortable, searchable table or card layout. Include status, company, role, date, and quick actions.

### Application detail
Show one application with:
- All metadata.
- Notes.
- Follow-up history.
- Reminder controls.
- Edit/delete actions.

### Add application form
A clean form for creating a new application.

### Settings/profile
Basic account details and preferences.

The interface should feel clean, modern, and easy to scan.

## 8. Interaction design

The app should make common actions fast:
- Add application in under one minute.
- Update status in one click.
- Add a note without leaving the page.
- Filter by stage, company, or date.
- Set a reminder with minimal friction.

This makes the product feel practical and well-designed.

## 9. Suggested tech approach

The best implementation is the one that is easiest to finish well and deploy cleanly. A common strong setup would be:
- Frontend: React-based framework or similar.
- Backend: REST or server actions.
- Database: PostgreSQL or another relational database.
- ORM: Prisma or equivalent.
- Auth: OAuth or email/password auth.
- Styling: Tailwind or component library.
- Deployment: Vercel, Render, or similar.

The exact stack is flexible, but the architecture should be clean, modern, and easy to understand from the GitHub repo.

## 10. Engineering requirements

The codebase should include:
- Clear folder structure.
- Reusable components.
- Strong type definitions or schema validation.
- Input validation on all forms.
- Error handling.
- Loading states.
- Responsive design.
- Seed/demo data if useful.

The project should look like something a developer would maintain, not a quick prototype.

## 11. API and backend behavior

If building a backend API, support these operations:
- Create application.
- Update application.
- Delete application.
- List applications with filters.
- Fetch one application.
- Add and list notes.
- Add and complete reminders.
- Get dashboard summary.

All routes should have validation and sensible error responses.

## 12. Nice-to-have features

Add these after the MVP is stable:
- Resume version upload and tagging.
- Cover letter storage.
- Interview question bank.
- Company research notes.
- AI-generated follow-up emails.
- AI suggestions for improving application materials.
- Calendar sync for follow-up reminders.
- Chrome extension or bookmarklet for saving jobs quickly.
- Import from CSV or spreadsheet.

These extras can make the project much more impressive if implemented cleanly.

## 13. Optional AI features

If you want the project to stand out more, add one AI feature only, such as:
- Draft a follow-up email from application context.
- Summarize interview notes.
- Suggest next steps based on status.
- Tailor a short cover letter intro.

Keep AI as an enhancement, not the core dependency. The app should still be valuable without it.

## 14. Acceptance criteria

The project is done when:
- A user can sign up and log in.
- A user can create and manage applications.
- A user can track status and notes.
- A user can view reminders and dashboard stats.
- The app works on mobile and desktop.
- The repo has a readable README with setup instructions.
- The app is deployed and usable.

## 15. Quality bar

The finished project should show:
- Good UX.
- Clean code.
- Thoughtful data modeling.
- Real-world usefulness.
- Polished presentation.

One polished project is stronger than several half-finished ones.

## 16. Deliverables for the coding agent

The coding agent should produce:
- Full source code.
- Database schema.
- API routes or backend logic.
- UI pages and reusable components.
- Seed data or demo data.
- README with setup and deployment instructions.
- Environment variable documentation.

It should build the MVP first, then add optional features only if time allows.

## 17. Suggested build order

1. Define schema and data models.
2. Set up auth and persistence.
3. Build create/read/update/delete flows.
4. Add dashboard and filters.
5. Add reminders and notes.
6. Polish UI and responsiveness.
7. Add one standout extra feature.
8. Write documentation and deploy.

This order reduces risk and keeps the project finishable.

## 18. Extra ideas to consider

If you want to expand the project later, add:
- Browser extension for one-click job saving.
- Analytics for response rate by company type.
- Interview preparation tracker.
- Referral/contact relationship graph.
- Dark mode.
- Notification emails.
- Mobile-first layout improvements.

These are optional, but they can help the app feel like a real product rather than a class assignment.