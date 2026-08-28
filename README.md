# 🛡️ CyberShield — Cybersecurity Awareness & Threat Detection Platform

A full-stack web application that helps everyday users check suspicious emails,
messages, URLs, and screenshots for phishing, scams, and social-engineering
threats — plus an admin console, a cybersecurity awareness library, and an
interactive security quiz.

---

## 1. Overview

CyberShield lets a user paste in a suspicious email, message, or link — or
upload a screenshot — and get back a clear risk score, a plain-English
explanation, and concrete next steps. Every scan is saved to the user's
history. Admins get a separate dashboard to manage users, review all scans
platform-wide, and maintain the awareness articles and quiz content.

**Two roles, enforced on the backend (not just hidden in the UI):**
- **User** — runs scans, views their own history/reports, takes quizzes, reads awareness content.
- **Admin** — everything above, plus user management, platform-wide analytics, and content management. Every admin API route is protected by both a valid JWT *and* a server-side `role === 'admin'` check.

## 2. Features

- Phishing email scanner (risk score, indicators, recommendations)
- Suspicious message analyzer (WhatsApp/SMS/social platforms)
- AI-powered screenshot analyzer (fake login pages, phishing forms, etc.)
- URL security scanner (structural analysis + optional VirusTotal/Google Safe Browsing)
- Local, privacy-safe password strength checker (never leaves the browser)
- Cybersecurity awareness library (12 categories, full CRUD for admins)
- Interactive scored quiz with history and admin-managed question bank
- Full scan history with search/filter/delete and downloadable reports
- Admin dashboard: user management, platform stats, audit log of admin actions
- JWT auth, bcrypt password hashing, rate limiting, Helmet, input validation

## 3. Technology Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, Axios, Recharts
**Backend:** Node.js, Express, JWT, bcryptjs, express-validator, multer, helmet
**Database:** MySQL 8+
**AI:** Pluggable AI service (Anthropic-compatible `/v1/messages` API) with a
transparent rule-based fallback engine so the app works fully without an API key.

## 4. Folder Structure

```
cybersecurity-platform/
├── backend/
│   ├── config/          # DB pool + constants
│   ├── controllers/      # Route handlers
│   ├── middleware/       # auth, validation, rate limiting, upload, errors
│   ├── models/            # Raw parameterized SQL queries
│   ├── routes/            # Express routers
│   ├── services/          # aiService.js, urlAnalysisService.js
│   ├── utils/             # seedAdmin.js
│   ├── uploads/            # Uploaded screenshots (gitignored)
│   ├── tests/               # Node built-in test runner integration tests
│   ├── server.js
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/    # Sidebar, RiskMeter, RiskBadge, StatCard, etc.
│       ├── pages/           # All routed pages (+ pages/admin/)
│       ├── layouts/         # DashboardLayout
│       ├── context/         # AuthContext
│       ├── services/        # Axios client
│       └── utils/           # passwordStrength.js (client-only)
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env.example (see backend/.env.example and frontend/.env.example)
└── README.md
```

## 5. Requirements

- Node.js 18+
- MySQL 8+ (or MariaDB 10.6+)
- npm

## 6. Installation

```bash
# 1. Unzip and enter the project
cd cybersecurity-platform

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

## 7. Database Setup

```bash
# From the database/ folder, or point mysql at the files directly:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

`schema.sql` creates the `cybersecurity_platform` database and all tables.
`seed.sql` adds 12 awareness articles and 10 quiz questions. It does **not**
create user accounts — that's handled by the Node seed script next, so
passwords are properly bcrypt-hashed rather than pasted in as plaintext SQL.

## 8. Environment Variables

Copy the example files and fill in your own values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key backend variables (see `backend/.env.example` for the full list):

| Variable | Purpose |
|---|---|
| `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Signs auth tokens — set this to a long random string |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `npm run seed` |
| `AI_API_KEY` | Optional. Without it, analysis uses the built-in fallback engine |
| `VIRUSTOTAL_API_KEY` / `GOOGLE_SAFE_BROWSING_API_KEY` | Optional, for live URL threat-intel |

## 9. Create the Admin Account

```bash
cd backend
npm run seed
```

This creates (or updates) an admin account and a demo user account using the
credentials in your `.env` file, with bcrypt-hashed passwords. The script
prints the login credentials it used — **change these before any real
deployment.**

## 10. Running the Application

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Visit `http://localhost:5173`. Log in with the demo user account, or go to
`/admin/login` with the seeded admin credentials.

## 11. AI Configuration

CyberShield's analysis is built around `backend/services/aiService.js`:

- **With `AI_API_KEY` set** (Anthropic-compatible endpoint), phishing/message/
  screenshot analysis calls the configured model and expects a structured
  JSON response (`riskScore`, `riskLevel`, `verdict`, `threats`,
  `explanation`, `recommendations`).
- **Without a key**, each analyzer falls back to a transparent, rule-based
  heuristic engine — every result is tagged `aiMode: "fallback"` and the UI
  clearly labels it "Automated / Demo Analysis" rather than pretending it
  came from an AI provider.

The URL scanner is separate from the AI service: it always runs local,
safe URL-structure analysis, and layers in live VirusTotal / Google Safe
Browsing lookups only if those keys are configured. It never visits the
submitted URL from the backend.

## 12. Testing

```bash
cd backend
npm run dev        # start the server in one terminal
npm test            # in another terminal — runs backend/tests/api.test.js
```

Tests cover registration, login, rejecting invalid/missing tokens, verifying
a normal user cannot call admin-only endpoints, and that scan history is
correctly scoped to the authenticated user.

## 13. API Overview

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/admin-login
GET    /api/auth/me
PUT    /api/auth/change-password
PUT    /api/auth/profile

POST   /api/analyze/phishing
POST   /api/analyze/message
POST   /api/analyze/url
POST   /api/analyze/screenshot
GET    /api/dashboard-stats
GET    /api/analyses
GET    /api/analyses/:id
DELETE /api/analyses/:id

GET    /api/admin/dashboard
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET    /api/admin/analyses
GET    /api/admin/analyses/:id
GET    /api/admin/logs
GET    /api/admin/quiz-results

GET    /api/articles
GET    /api/articles/:id
POST   /api/articles          (admin)
PUT    /api/articles/:id      (admin)
DELETE /api/articles/:id      (admin)

GET    /api/quiz
POST   /api/quiz/submit
GET    /api/quiz/my-attempts
GET    /api/quiz/admin/questions       (admin)
POST   /api/quiz/admin/questions       (admin)
PUT    /api/quiz/admin/questions/:id   (admin)
DELETE /api/quiz/admin/questions/:id   (admin)
```

## 14. Deployment Notes

- Run `npm run build` in `frontend/` and serve the `dist/` folder from any
  static host (Nginx, Vercel, Netlify) or from Express itself.
- Run the backend behind a process manager (pm2, systemd) and a reverse
  proxy (Nginx) terminating TLS.
- Set `NODE_ENV=production`, a strong random `JWT_SECRET`, and change the
  seeded admin password immediately.
- Point `FRONTEND_URL` (backend) and `VITE_API_URL` (frontend) at your real
  domains.
- Use a managed MySQL instance with regular backups.

## 15. Security Considerations

- Passwords are hashed with bcrypt (cost factor 12) — never stored in plaintext.
- All SQL queries use parameterized placeholders — no string concatenation.
- JWT-based auth with role checks enforced **server-side** on every protected route.
- Rate limiting on auth and analysis endpoints to blunt brute-force/abuse.
- Helmet sets secure HTTP headers; CORS is restricted to `FRONTEND_URL`.
- File uploads are validated by MIME type and size, stored with randomized filenames.
- The password checker never transmits the entered password anywhere — analysis is 100% client-side.
- The URL scanner never visits submitted URLs from the backend.
- Centralized error handling never leaks stack traces to the client.

## 16. Test / Demo Data

The `database/seed.sql` file and quiz/article content are clearly for
demonstration and learning purposes. Sample phishing/scam patterns referenced
in the fallback detection engine (`backend/services/aiService.js`) are for
educational threat-recognition, not real malicious content.

---

Built as a demonstration full-stack cybersecurity awareness platform.
