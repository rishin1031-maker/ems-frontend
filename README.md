# EMS Frontend

React SPA for the Employee Management System (EMS), built with Vite + TypeScript. Connects to the Laravel 13 REST API backend.

## Setup

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:5173](http://localhost:5173) by default.

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

The Laravel API should be running at `http://localhost:8000` with CORS enabled for the React dev origin.

## Test Credentials (local dev)

| Role     | Login              | Password      |
|----------|--------------------|---------------|
| Admin    | `admin@ems.com`    | From seeder   |
| Employee | `EMP001` or email  | `password123` (typical seeder default) |

## Scripts

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`  | Run oxlint               |

## Project Structure

```
src/
├── app/           # App shell, router, providers
├── api/           # Axios client + typed API modules
├── features/      # Feature-based UI (auth, admin, employee)
├── components/    # Shared UI, layout, guards, feedback
├── context/       # Auth context
├── hooks/         # Cross-cutting hooks
├── lib/           # Utilities, constants, storage
└── styles/        # Tailwind CSS
```

## Implementation Status

- **Phase 1 (complete):** Auth, routing, layouts, login, dashboards, toast, dark mode toggle
- **Phase 2 (complete):** Admin employees CRUD, departments & designations CRUD + toggle status
- **Phase 3 (complete):** Leave management, attendance (daily/monthly/analytics), salary, payroll
- **Phase 4 (complete):** Employee portal — check-in/out, breaks, profile, attendance, leaves
- **Phase 5 (complete):** Notifications, skeleton loaders, error boundary, header bell

## Tech Stack

- React 19 + Vite + TypeScript
- React Router v7
- TanStack Query
- Axios
- Tailwind CSS v4
- React Hook Form + Zod
- Chart.js + react-chartjs-2
- lucide-react
