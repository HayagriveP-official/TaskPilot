# TaskPilot

A full-stack, multi-user task and team management platform built with the MERN stack. Created as the capstone deliverable of my Full-Stack Web Development Internship at **Altruisty Innovation Pvt Ltd** (Jun – Aug 2025).

**Live:** https://taskpilot-wine-phi.vercel.app/ ( ⚠️ As maintainence is underway to switch free tier clusters on the backend deployment , the application might not work properly ) 

---

## Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing, protected routes, and persistent sessions
- **Task management** — full CRUD with title, description, priority (Low / Medium / High), due dates, and completion tracking
- **Team workspace** — multi-user task assignment, member cards, and workspace-level statistics
- **Analytics dashboard** — Recharts-powered visualizations for task progress, priority distribution, and team load
- **Profile & settings** — editable user profile with task ownership tracking
- **Responsive UI** — built with Tailwind CSS v4 and lucide-react icons

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router v7, Recharts, Axios, lucide-react |
| Backend | Node.js, Express 5, Mongoose, JWT, bcrypt, validator |
| Database | MongoDB |
| Deployment | Vercel (frontend), Render (backend) |
| Tooling | ESLint, Nodemon, Git/GitHub |

---

## Project Structure

```
.
├── backend/
│   ├── config/         # DB connection, env config
│   ├── controllers/    # Route handler logic
│   ├── middleware/     # Auth middleware (JWT verify)
│   ├── models/         # Mongoose schemas (User, Task)
│   ├── routes/         # Express routes (user, task)
│   └── server.js       # Express app entrypoint
└── frontend/
    ├── src/
    │   ├── components/ # Layout, Navbar, Sidebar, Login, SignUp
    │   ├── pages/      # Dashboard, Tasks, Team, Profile
    │   ├── services/   # Axios API client
    │   └── App.jsx     # Routes + auth guards
    └── vercel.json
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas connection string)

### Backend
```bash
cd backend
npm install
# create .env with:
#   MONGO_URI=<your mongo connection string>
#   JWT_SECRET=<a long random string>
#   PORT=5000
npm start
```

### Frontend
```bash
cd frontend
npm install
# create .env with:
#   VITE_API_URL=http://localhost:5000
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Key Implementation Highlights

- **Protected routes** — `ProtectedLayout` wrapping authenticated pages with JWT verification on each request
- **Modular backend** — clean separation of routes, controllers, models, and middleware
- **Validator middleware** — input sanitization on user signup/login flows
- **CORS-secured API layer** — configured for cross-origin requests between Vercel frontend and backend
- **Recharts integration** — bar and donut charts for task analytics, plus a custom activity heatmap

---

## Author

**Hayagrive P** — Final-year B.Tech IT, Sri Sai Ram Institute of Technology
[Portfolio](https://portfolio-website-eight-fawn-48.vercel.app/) · [LinkedIn](https://www.linkedin.com/in/hayagrive-p-619512257) · [GitHub](https://github.com/HayagriveP-official)
