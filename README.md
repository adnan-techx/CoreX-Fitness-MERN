# CoreX Fitness

A responsive MERN fitness tracking application with a black / red identity, a custom SVG wordmark, a member workspace and a protected admin panel. It is based on the uploaded Fitness Tracker project brief.

## Stack

- **Frontend:** React, Vite, React Router, Axios, Recharts, Lucide icons
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** JWT sessions and bcrypt password hashing

## Requirements covered

- Member registration, login, profile information and password update
- User-specific workout CRUD (exercise, category, sets, reps, weights, duration, notes and date)
- Nutrition diary CRUD (meal type, quantity, calories, protein, carbs and fats)
- Fitness progress check-ins (weight, measurements, running time, lift metric and notes)
- Weight progress charts and dashboard statistics
- Search and category/meal filtering
- In-app workout / nutrition / progress activity notifications and user-created reminders
- CSV export for workout, nutrition and progress data; browser print dialog can save a progress report as PDF
- User preferences for units, appearance and in-app notifications
- In-app support requests and admin replies
- Responsive layout for desktop, tablet and mobile
- Admin-only dashboard, user activation/deactivation/deletion, record review/deletion and support ticket status/reply management

## Run locally

### 1. Prerequisites

Install Node.js (Node 20 LTS or newer recommended) and have MongoDB available locally or through MongoDB Atlas.

### 2. Configure the backend

```bash
cd backend
```

Copy `.env.example` to `.env`, then set your MongoDB URI and a long, random `JWT_SECRET`. Before creating the admin account, set a strong `ADMIN_PASSWORD` in this private `.env` file.

Example local settings:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/corex_fitness
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=CoreX Admin
ADMIN_EMAIL=admin@corexfitness.com
ADMIN_PASSWORD=Use-A-Strong-Unique-Password
```

Install backend dependencies and create the admin user:

```bash
npm install
npm run create-admin
npm run dev
```

Keep the API terminal running at `http://localhost:5000`.

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Create a member account from **Get started**. To access the admin panel, sign in using the admin email/password you set in `backend/.env`; the admin account is created by `npm run create-admin`.

### Optional: run both sides from the project root

After dependencies are installed in the root, backend and frontend folders:

```bash
npm install
npm run install:all
npm run dev
```

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend HTTP port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign session tokens |
| `CLIENT_URL` | Allowed frontend origin for CORS |
| `ADMIN_NAME` | Seed admin display name |
| `ADMIN_EMAIL` | Seed admin email |
| `ADMIN_PASSWORD` | Seed admin password; use a strong private value |

## Important notes before public deployment

This project is a functional student / portfolio MVP, not a security or compliance certification. Before real public use, configure HTTPS, secure secrets, database backups, rate limiting, stronger request validation, monitoring, tested restore procedures and security review. Browser print-to-PDF relies on the user's browser; automated email or push notifications are not configured. User-entered nutrition and body measurements are not medical advice. The demo admin account should use a unique password and should never keep the example password.

## Logo

`frontend/public/corex-logo.svg` is the editable vector wordmark used throughout the UI. Red/white artwork on a black background was selected to match the CoreX Fitness black-and-red theme.
