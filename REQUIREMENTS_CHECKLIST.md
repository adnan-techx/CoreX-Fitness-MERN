# CoreX Fitness — requirements checklist

Mapped from the uploaded Fitness Tracker brief.

| Brief requirement | Implementation location |
|---|---|
| Registration, login, profile | `backend/routes/auth.js`, `frontend/src/pages/AuthPage.jsx`, `Profile.jsx` |
| Secure credentials / authorization | bcrypt hash in `backend/models/User.js`; JWT in `backend/middleware/auth.js`; protected routes and admin role middleware |
| Workout CRUD, category and notes | `backend/routes/workouts.js`, `frontend/src/pages/Workouts.jsx` |
| Nutrition entries and macros | `backend/routes/nutrition.js`, `frontend/src/pages/Nutrition.jsx` |
| Fitness metrics and charts | `backend/routes/progress.js`, `frontend/src/pages/Progress.jsx`, dashboard charts |
| Dashboard overview | `frontend/src/pages/Dashboard.jsx` |
| Analytics visualization | Recharts weight chart and nutrition macro summaries |
| Notifications and reminders | `backend/routes/notifications.js`, `frontend/src/pages/Reminders.jsx`; activity logs create in-app notifications |
| Search and filtering | Workout exercise/category and nutrition food/meal filters; admin member/record search |
| Mobile responsiveness | `frontend/src/styles.css` media queries |
| Reports / export | CSV exports in tracking pages; browser print-to-PDF in Progress |
| Settings / preferences | profile units, appearance and in-app notification settings |
| Support / feedback | user support page and admin ticket response workflow |
| Administration | `backend/routes/admin.js`, `frontend/src/pages/Admin.jsx` |
| Developer documentation | `README.md` and this checklist |

## Scope notes

The brief also mentions performance targets, hundreds of concurrent users, GDPR/privacy compliance, 99% uptime, automated backups, monitoring, accessibility conformance, penetration testing and a walkthrough video. These require deployment infrastructure, operational testing and/or separate deliverables; this source-code MVP does not claim those outcomes are already achieved. Push/email notification delivery is also not wired up; reminders are stored and displayed in-app.
