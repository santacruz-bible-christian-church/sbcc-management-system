# Frontend Setup Guide

Setup guide for the SBCC Management System React frontend.

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend running at `http://localhost:8000`

## Quick Start

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

**Frontend:** http://localhost:5173

## Environment Configuration

Create `.env.local` in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000
```

> ⚠️ Vite requires `VITE_` prefix for all environment variables.

## Available Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

## Project Structure

```
frontend/src/
├── api/           # Axios configuration
├── components/    # Shared UI components
├── features/      # Feature modules (auth, members, events, etc.)
├── hooks/         # Custom React hooks
├── router/        # Route definitions
├── services/      # API service functions
├── store/         # Zustand state management
├── styles/        # Global styles
└── utils/         # Helper functions
```

## Tech Stack

| Category  | Technologies                        |
| --------- | ----------------------------------- |
| Framework | React 19.1.1, Vite 7.1.7            |
| Styling   | Tailwind CSS 3.4.18, Flowbite React |
| State     | Zustand, TanStack Query             |
| Forms     | React Hook Form, Zod                |
| HTTP      | Axios                               |

## Troubleshooting

### Module not found errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS errors

1. Verify backend is running: `http://localhost:8000`
2. Check `VITE_API_URL` in `.env.local`
3. Confirm backend CORS settings include `http://localhost:5173`

### Tailwind not working

1. Verify `tailwind.config.js` content paths
2. Check `index.css` has Tailwind directives
3. Restart dev server: `npm run dev`

### 401 Unauthorized

- Clear localStorage and login again
- Verify backend JWT settings

## Verification Checklist

- [ ] `npm run dev` starts at http://localhost:5173
- [ ] No console errors
- [ ] Can login with backend credentials
- [ ] API calls return data
- [ ] Styling renders correctly

## Resources

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flowbite React](https://flowbite-react.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

**Last Updated:** December 22, 2025
