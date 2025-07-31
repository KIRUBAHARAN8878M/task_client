
```
# Task Management Dashboard — Frontend

A responsive task management UI with **JWT authentication**, **role‑based access control**, and **task CRUD** (filters, sort, pagination), built with **React + TypeScript + Vite + Redux Toolkit + Tailwind CSS**.

> Backend (Node/Express + MongoDB Atlas) is deployed separately. This README covers the **frontend** only.

---

## Live Demo

- **Frontend (Vercel)**: https://task-client-nu.vercel.app 

---

## Features

- **Authentication**: Login/Register, token refresh, auto‑logout on expiry
- **RBAC**: `admin`, `manager`, `user` with UI/route guards
- **Tasks**: list with status filter, sort (created/priority/due), pagination, inline editing, delete (admin)
- **Admin**: user list + change roles
- **UI/UX**: responsive, dark mode, toasts, loading/empty states

---

## Tech Stack

- React, TypeScript, Vite
- Redux Toolkit, React Router
- Tailwind CSS
- Fetch wrapper with token injection/refresh

---

## Prerequisites

- Node.js 18+
- Backend API URL (Render or local)

---

## Environment

Create a `.env` file in project root:

```
- VITE_API_BASE=https://your-backend.example.com/api

- If not set, it defaults to http://localhost:4000/api.

```
**Installation & Development**

# install deps
npm install

# start dev server
npm run dev

# typecheck & build
npm run build

# preview the production build locally
npm run preview
```
```
**Folder Structure (short)**
src/
├─ app/                # store + typed hooks
├─ componenets/        # layout + UI primitives (Button, Field, Modal, Toast, etc.)
├─ features/
│  ├─ auth/            # authSlice + login/register pages
│  ├─ tasks/           # taskSlice + table + add modal
│  └─ users/           # admin page + usersApi
├─ lib/                # config, http (fetch), token helpers
├─ routes/             # ProtectedRoute, RoleGuard
├─ styles/             # tailwind.css
├─ theme/              # ThemeProvider (dark mode)
├─ App.tsx
└─ main.tsx
```
```
**Notes**
- Access token is mirrored to localStorage for demo persistence.
- For production, prefer httpOnly refresh cookies and short‑lived access tokens stored in memory.

- Free‑tier backend may have initial cold start delays.

```


