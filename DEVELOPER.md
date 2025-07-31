# Task Management Dashboard — Developer Documentation (Frontend)

This document explains **how the frontend works** so a developer can quickly read, run, and extend it.

> Tech: React + TypeScript + Vite · Redux Toolkit · React Router · Tailwind CSS  
> API: Node/Express + MongoDB Atlas (hosted separately). This doc focuses on the frontend.

---

## 1. Implemented Features (at a glance)

- **Auth**: Login, Register, Logout, JWT access token handling, auto‑refresh on 401, auto‑logout on refresh failure.
- **RBAC**: Roles `admin`, `manager`, `user` with UI/route guards.
- **Tasks**: List with filter/sort/pagination; create via modal; inline edit (title/status/priority/due date/assignee based on role); delete (admin).
- **Admin**: User list + change roles.
- **UI/UX**: Responsive layout, dark mode theme, toasts, loading and empty states.

---

## 2. High‑Level Flow

1. User logs in or registers → backend returns `{ user, accessToken }`.
2. `authSlice` stores `user` and saves `accessToken` (in memory + localStorage mirror).
3. Protected routes check `auth.user`. If absent, redirect to `/login`.
4. All API calls go through `apiFetch`:
   - Adds `Authorization: Bearer <token>`.
   - On `401`: calls `/auth/refresh` (with `credentials: 'include'`), stores the new token, **retries** the original request once.
   - If refresh fails: clear token + redirect to `/login`.
5. Dashboard shows tasks with filters/sort/pagination; admin can manage users at `/admin`.

---

## 3. Project Structure (frontend)

src/
├─ app/
│ ├─ hooks.ts # typed Redux hooks
│ └─ store.ts # configureStore with slices
├─ componenets/ # ui + layout primitives (note: name typo kept)
│ ├─ layout/Topbar.tsx
│ └─ ui/
│ ├─ Button.tsx, IconButton.tsx, Spinner.tsx
│ ├─ Input.tsx, Select.tsx, Textarea.tsx, Field.tsx
│ ├─ Pagination.tsx, TableToolbar.tsx, Modal.tsx, Toast.tsx
│ └─ Primitives.css
├─ features/
│ ├─ auth/ # authSlice + pages + types
│ ├─ tasks/ # taskSlice + AddTaskModal + TaskTable
│ └─ users/ # AdminPage + usersApi
├─ lib/
│ ├─ config.ts # API base from env (VITE_API_BASE)
│ ├─ http.ts # fetch wrapper + token refresh/retry
│ └─ token.ts # get/set access token (memory + localStorage)
├─ routes/
│ ├─ ProtectedRoute.tsx
│ └─ RoleGuard.tsx
├─ styles/tailwind.css
├─ theme/useTheme.tsx # light/dark mode provider
├─ App.tsx
└─ main.tsx


---

## 4. Routing & Guards

- **`ProtectedRoute`** wraps private routes; renders `<Outlet/>` if `auth.user` exists, else `<Navigate to="/login" />`.
- **`RoleGuard`** wraps role‑sensitive UI; renders `children` only if `user.role ∈ allow`.

**Routes (App.tsx)**
- Public: `/login`, `/register`
- Protected: `/` (Dashboard), `/admin` (AdminPage)
- Not found: `* → /`

---

## 5. State Management (Redux Toolkit)

- **`authSlice`**
  - Thunks: `register`, `login`, `logout`
  - State: `{ user, loading, error? }`
  - `bootstrap` action can hydrate state on app start if needed.
  - On successful login/register: stores `user` + `accessToken`.

- **`taskSlice`**
  - Thunks: `fetchTasks`, `createTask`, `updateTask`, `deleteTask`
  - State: `{ items, total, loading, error? }`
  - Reducers update the list optimistically with server responses.

---

## 6. HTTP & Auth

**`lib/config.ts`**
- `API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000/api'`

**`lib/token.ts`**
- Keeps the access token in memory and mirrors to `localStorage` (for demo persistence).

**`lib/http.ts` (`apiFetch`)**
- Adds JSON headers and `Authorization` header if token exists.
- On `401`: calls `/auth/refresh` (cookie‑based), sets new token, retries original request.
- If refresh fails: clears token and redirects to `/login`.
- Responses return `JSON` or throw `{ message, status }`.

> **Production note**: Prefer httpOnly refresh cookies + short‑lived access tokens, with access token kept in memory only.

---

## 7. Tasks Feature (Dashboard)

**List (TaskTable)**
- Source of truth is **URL params**: `status`, `sort`, `page`, `limit`.
- Fetch on URL change; show loading/empty rows.
- Inline editors with role checks:
  - **Title**: admin
  - **Status**: admin/manager/self (if owner)
  - **Priority & Due**: admin/manager
  - **Assignee**: admin
- Delete: admin only.
- Pagination: shows totals, page controls, and page size.

**Create (AddTaskModal)**
- Opens from Topbar or `?new=1`.
- Admin can assign task to any user; others auto‑assign to self.
- Validates title; prevents past dates in UI.

---

## 8. Admin Feature

**AdminPage**
- Only rendered for `role === 'admin'`.
- `listUsers()` and `updateUserRole()` (PUT) to change roles.
- Shows toasts for success/error, has Back to Tasks and Logout in the Topbar.

---

## 9. UI System & Theming

- **UI primitives** in `componenets/ui/*` (Button, Field, Input, Select, Modal, Toast, Spinner, Pagination, TableToolbar).  
  Keep them **stateless** and free of feature logic.
- **Topbar** (`componenets/layout/Topbar.tsx`): title, theme toggle, user chip, role badge, Add Task, Logout, and optional right slot.
- **Theme**: `ThemeProvider` toggles `dark` class on `<html>`; syncs via localStorage.

---

## 10. Environment & Commands

**Environment variable**
- `VITE_API_BASE` → e.g., `https://your-backend.onrender.com/api`

**Commands**
```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # serve built app locally
npm run lint      # eslint

```
## 11. Troubleshooting

- 401 loop / redirect to login
- Ensure backend CORS allows your Vercel domain and sets refresh cookie. The app uses credentials: 'include'.

- CORS errors
- Check VITE_API_BASE and backend CORS headers (Access-Control-Allow-Credentials, allowed origin).

- Cold starts
- Free‑tier hosts can be slow initially; UI shows “Loading…” state.
---
## 12. Roadmap (nice‑to‑have)
- Global toast provider (queue + variants)

- More ARIA on table and focus trap in modal for a11y

- React.memo on large rows (if needed)

- Tests (Vitest/RTL + Playwright)

- Real‑time updates (WebSockets/SSE)

```