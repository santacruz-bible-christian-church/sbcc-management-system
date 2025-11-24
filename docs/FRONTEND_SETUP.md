# Frontend Setup Guide

Complete guide for setting up the React frontend for SBCC Management System.

## 📋 Prerequisites

- **Node.js 18** or higher
- npm or yarn package manager
- Git

## 🔧 Installation Steps

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

or with yarn:

```bash
yarn install
```

### 3. Configure Environment Variables

Create `.env.local` for environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Optional: Override backend URL
# VITE_BACKEND_URL=http://localhost:8000
```

⚠️ **Note:** Vite requires `VITE_` prefix for environment variables.

⚠️ **NEVER commit `.env.local` to git!**

### 4. Start Development Server

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

Server will start at: `http://localhost:5173`

## 📦 Installed Packages

### Core

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.1.1 | UI library |
| React DOM | 19.1.1 | React renderer |
| Vite | 7.1.7 | Build tool & dev server |
| PropTypes | 15.8.1 | Runtime type checking |

### Styling

| Package | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | 3.4.18 | Utility-first CSS framework |
| Flowbite | 3.1.2 | Tailwind components library |
| Flowbite React | 0.12.9 | React components for Flowbite |
| Autoprefixer | 10.4.21 | PostCSS plugin for vendor prefixes |
| PostCSS | 8.5.6 | CSS transformer |
| clsx | 2.1.1 | Conditional classnames |
| tailwind-merge | 3.3.1 | Merge Tailwind classes |

### Routing & State Management

| Package | Version | Purpose |
|---------|---------|---------|
| React Router DOM | 7.9.4 | Client-side routing |
| Zustand | 5.0.8 | State management |

### Data Fetching & API

| Package | Version | Purpose |
|---------|---------|---------|
| Axios | 1.12.2 | HTTP client |
| @tanstack/react-query | 5.90.2 | Server state management |

### Forms & Validation

| Package | Version | Purpose |
|---------|---------|---------|
| React Hook Form | 7.65.0 | Form state management |
| Zod | 4.1.12 | Schema validation |

### UI & Icons

| Package | Version | Purpose |
|---------|---------|---------|
| Lucide React | 0.545.0 | Icon library |
| React Icons | 5.5.0 | Popular icon library |
| Flowbite React Icons | 1.3.1 | Flowbite-specific icons |

### Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| date-fns | 4.1.0 | Date formatting & manipulation |
| jsPDF | 3.0.3 | PDF generation |
| jsPDF AutoTable | 5.0.2 | PDF table generation |
| qrcode.react | 4.2.0 | QR code generation |

## 🗂️ Project Structure

```
frontend/
├── public/                  # Static assets
│   └── assets/             # Public images, fonts
├── src/
│   ├── api/                # API client configuration
│   │   ├── axios.js       # Axios instance with interceptors
│   │   └── endpoints.js   # API endpoint definitions
│   ├── assets/             # Private assets (imported in code)
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Shared components (Button, Card, etc.)
│   │   ├── layout/        # Layout components (Header, Sidebar)
│   │   └── forms/         # Form components
│   ├── features/           # Feature-based modules
│   │   ├── auth/          # Authentication (login, register)
│   │   ├── ministries/    # Ministry management
│   │   ├── members/       # Member management
│   │   ├── events/        # Event management
│   │   ├── attendance/    # Attendance tracking
│   │   └── dashboard/     # Dashboard & stats
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js     # Authentication hook
│   │   ├── useApi.js      # API data fetching hook
│   │   └── useDebounce.js # Debounce hook
│   ├── router/             # Routing configuration
│   │   ├── index.jsx      # Route definitions
│   │   └── ProtectedRoute.jsx # Auth guard
│   ├── services/           # Business logic & API services
│   │   ├── authService.js # Auth API calls
│   │   ├── ministryService.js
│   │   ├── memberService.js
│   │   ├── eventService.js
│   │   └── attendanceService.js
│   ├── store/              # Zustand stores
│   │   ├── authStore.js   # Auth state
│   │   ├── uiStore.js     # UI state (sidebar, modals)
│   │   └── index.js       # Store exports
│   ├── styles/             # Global styles & Tailwind configs
│   │   └── globals.css    # Custom global styles
│   ├── utils/              # Utility functions
│   │   ├── constants.js   # App constants
│   │   ├── formatters.js  # Date, number formatters
│   │   └── validators.js  # Validation helpers
│   ├── App.jsx             # Main app component
│   ├── App.css             # App-specific styles
│   ├── index.css           # Tailwind imports & global styles
│   └── main.jsx            # Entry point
├── .env.local              # Local environment variables (not in git)
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies & scripts
├── postcss.config.js       # PostCSS config
├── tailwind.config.js      # Tailwind config
└── vite.config.js          # Vite configuration
```

## 🏗️ Architecture Overview

### Feature-Based Structure

The frontend follows the same **feature-based architecture** as the backend:

```
src/features/
├── auth/              # Authentication module
│   ├── components/    # Login, Register forms
│   ├── hooks/         # useLogin, useRegister
│   └── pages/         # LoginPage, RegisterPage
├── ministries/        # Ministry management
│   ├── components/    # MinistryCard, MinistryForm
│   ├── hooks/         # useMinistries, useCreateMinistry
│   └── pages/         # MinistriesPage, MinistryDetailPage
├── members/           # Member management
├── events/            # Event management
├── attendance/        # Attendance tracking
└── dashboard/         # Dashboard & statistics
```

### API Integration

```
Backend API          →    Frontend Service      →    React Query Hook
/api/ministries/     →    ministryService.js    →    useMinistries()
/api/members/        →    memberService.js      →    useMembers()
/api/events/         →    eventService.js       →    useEvents()
/api/attendance/     →    attendanceService.js  →    useAttendance()
/api/dashboard/stats/→    dashboardService.js   →    useDashboardStats()
```

## 🎨 Styling with Tailwind CSS

### Tailwind Configuration

`tailwind.config.js`:

```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... custom colors
        }
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
```

### Using Tailwind with clsx and tailwind-merge

```jsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Usage
<button
  className={cn(
    "px-4 py-2 rounded",
    isPrimary ? "bg-blue-500" : "bg-gray-500",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

## 🧩 Using Flowbite React Components

```jsx
import { Button, Card, Modal, Table } from 'flowbite-react';
import { HiPlus, HiTrash } from 'react-icons/hi';

function Example() {
  return (
    <div>
      <Button color="blue" size="sm">
        <HiPlus className="mr-2 h-5 w-5" />
        Add Ministry
      </Button>

      <Card className="mt-4">
        <h5 className="text-2xl font-bold">Church Ministries</h5>
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Leader</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {/* Table rows */}
          </Table.Body>
        </Table>
      </Card>
    </div>
  );
}
```

[Flowbite React Documentation](https://flowbite-react.com/)

## 🌐 API Integration

### 1. Configure Axios Instance

`src/api/axios.js`:

```js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add JWT token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### 2. Create API Services

`src/services/ministryService.js`:

```js
import api from '../api/axios';

export const ministryService = {
  // GET /api/ministries/
  getAll: async (params) => {
    const { data } = await api.get('/ministries/', { params });
    return data;
  },

  // GET /api/ministries/:id/
  getById: async (id) => {
    const { data } = await api.get(`/ministries/${id}/`);
    return data;
  },

  // POST /api/ministries/
  create: async (ministryData) => {
    const { data } = await api.post('/ministries/', ministryData);
    return data;
  },

  // PUT /api/ministries/:id/
  update: async (id, ministryData) => {
    const { data } = await api.put(`/ministries/${id}/`, ministryData);
    return data;
  },

  // PATCH /api/ministries/:id/
  partialUpdate: async (id, ministryData) => {
    const { data } = await api.patch(`/ministries/${id}/`, ministryData);
    return data;
  },

  // DELETE /api/ministries/:id/
  delete: async (id) => {
    const { data } = await api.delete(`/ministries/${id}/`);
    return data;
  },
};
```

### 3. Use React Query Hooks

`src/features/ministries/hooks/useMinistries.js`:

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ministryService } from '../../../services/ministryService';

// Fetch all ministries
export const useMinistries = (params) => {
  return useQuery({
    queryKey: ['ministries', params],
    queryFn: () => ministryService.getAll(params),
  });
};

// Fetch single ministry
export const useMinistry = (id) => {
  return useQuery({
    queryKey: ['ministries', id],
    queryFn: () => ministryService.getById(id),
    enabled: !!id,
  });
};

// Create ministry
export const useCreateMinistry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ministryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
    },
  });
};

// Update ministry
export const useUpdateMinistry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => ministryService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      queryClient.invalidateQueries({ queryKey: ['ministries', data.id] });
    },
  });
};

// Delete ministry
export const useDeleteMinistry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ministryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
    },
  });
};
```

### 4. Use in Components

`src/features/ministries/pages/MinistriesPage.jsx`:

```jsx
import { Button, Table, Spinner } from 'flowbite-react';
import { HiPlus } from 'react-icons/hi';
import { useMinistries, useDeleteMinistry } from '../hooks/useMinistries';

export default function MinistriesPage() {
  const { data: ministries, isLoading, error } = useMinistries();
  const deleteMutation = useDeleteMinistry();

  const handleDelete = (id) => {
    if (confirm('Are you sure?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Ministries</h1>
        <Button color="blue">
          <HiPlus className="mr-2 h-5 w-5" />
          Add Ministry
        </Button>
      </div>

      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Leader</Table.HeadCell>
          <Table.HeadCell>Members</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {ministries?.results?.map((ministry) => (
            <Table.Row key={ministry.id}>
              <Table.Cell>{ministry.name}</Table.Cell>
              <Table.Cell>{ministry.leader_name || 'N/A'}</Table.Cell>
              <Table.Cell>{ministry.member_count}</Table.Cell>
              <Table.Cell>
                <Button size="xs" color="failure" onClick={() => handleDelete(ministry.id)}>
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
```

## 🔐 Authentication Flow

### 1. Setup Auth Store (Zustand)

`src/store/authStore.js`:

```js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### 2. Create Protected Route

`src/router/ProtectedRoute.jsx`:

```jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

### 3. Setup Router

`src/router/index.jsx`:

```jsx
import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import MinistriesPage from '../features/ministries/pages/MinistriesPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ministries',
    element: (
      <ProtectedRoute>
        <MinistriesPage />
      </ProtectedRoute>
    ),
  },
  // ... other routes
]);
```

## 📝 Forms with React Hook Form & Zod

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Label, TextInput } from 'flowbite-react';

const ministrySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  leader: z.number().optional(),
});

export default function MinistryForm({ onSubmit, defaultValues }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ministrySchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Ministry Name</Label>
        <TextInput
          id="name"
          {...register('name')}
          color={errors.name ? 'failure' : undefined}
          helperText={errors.name?.message}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <TextInput
          id="description"
          {...register('description')}
        />
      </div>

      <Button type="submit" color="blue">
        Submit
      </Button>
    </form>
  );
}
```

## 📝 Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Update dependencies (check for updates)
npm outdated

# Update all dependencies
npm update

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🐛 Troubleshooting

### "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS errors when calling API

**Cause:** Backend CORS not configured or backend not running

**Solution:**
1. Ensure backend is running: `cd backend && python manage.py runserver`
2. Check backend CORS settings in `settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:5173",
   ]
   ```
3. Verify API URL in `.env.local`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

### 401 Unauthorized errors

**Cause:** JWT token expired or missing

**Solution:**
- Check if `access_token` exists in localStorage
- Check axios interceptor is adding `Authorization` header
- Verify token refresh logic works
- Try logging in again

### Tailwind classes not working

**Solution:**
1. Check `tailwind.config.js` content paths include your files
2. Ensure `index.css` imports Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Restart dev server: `npm run dev`

### React Query not refetching

**Solution:**
- Check `queryKey` is unique and correct
- Ensure `invalidateQueries` is called after mutations
- Check network tab for API calls
- Use React Query DevTools for debugging

### Build fails with memory error

**Solution:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

## 🎯 Environment Variables

Create `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# App Configuration
VITE_APP_NAME=SBCC Management System
VITE_APP_VERSION=1.0.0
```

Usage in code:

```js
const API_URL = import.meta.env.VITE_API_URL;
const APP_NAME = import.meta.env.VITE_APP_NAME;
const isDev = import.meta.env.DEV;  // Built-in Vite variable
const isProd = import.meta.env.PROD; // Built-in Vite variable
```

## 🎨 Styling Guidelines

### Responsive Design with Tailwind

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop, 4 on large screens */}
</div>

<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
  {/* Responsive text size */}
</h1>

<div className="p-4 sm:p-6 md:p-8">
  {/* Responsive padding */}
</div>
```

### Dark Mode Support

```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Dark mode support
</div>
```

## 🔒 Security Best Practices

- ✅ Never commit `.env.local` to version control
- ✅ Store JWT tokens in localStorage (or httpOnly cookies for better security)
- ✅ Implement token refresh logic
- ✅ Sanitize user input before displaying
- ✅ Use React Hook Form validation
- ✅ Implement CSRF protection for sensitive actions
- ✅ Keep dependencies updated: `npm audit`
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on API calls

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel/Netlify

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in dashboard

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Flowbite React Documentation](https://flowbite-react.com/)
- [React Router Documentation](https://reactrouter.com/)
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Axios Documentation](https://axios-http.com/)

## 🎯 Development Checklist

After setup, verify everything works:

- [ ] `npm run dev` starts server at http://localhost:5173
- [ ] No console errors in browser
- [ ] Tailwind classes apply correctly
- [ ] Can call backend API endpoints
- [ ] JWT authentication works (login/logout)
- [ ] Protected routes redirect to login when not authenticated
- [ ] React Query DevTools visible (in dev mode)
- [ ] Forms validate correctly with Zod
- [ ] Icons from lucide-react and react-icons display

## 🤝 Working with Backend

### Prerequisites

1. **Backend must be running:**
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Backend must have migrations applied:**
   ```bash
   python manage.py migrate
   ```

3. **Create superuser for testing:**
   ```bash
   python manage.py createsuperuser
   ```

### Available Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login/` | POST | User login (get JWT tokens) |
| `/api/auth/register/` | POST | User registration |
| `/api/auth/token/refresh/` | POST | Refresh access token |
| `/api/ministries/` | GET, POST | List/create ministries |
| `/api/ministries/:id/` | GET, PUT, PATCH, DELETE | Ministry CRUD |
| `/api/members/` | GET, POST | List/create members |
| `/api/members/:id/` | GET, PUT, PATCH, DELETE | Member CRUD |
| `/api/events/` | GET, POST | List/create events |
| `/api/events/:id/` | GET, PUT, PATCH, DELETE | Event CRUD |
| `/api/attendance/` | GET, POST | List/create attendance |
| `/api/attendance/:id/` | GET, PUT, PATCH, DELETE | Attendance CRUD |
| `/api/attendance/sheets/` | GET, POST | List/create attendance sheets |
| `/api/attendance/sheets/:id/download/` | GET | Download attendance CSV |
| `/api/attendance/records/member_summary/` | GET | Member attendance summary |
| `/api/attendance/records/ministry_report/` | GET | Ministry attendance report |
| `/api/inventory/` | GET, POST | List/create inventory items |
| `/api/inventory/:id/` | GET, PUT, PATCH, DELETE | Inventory CRUD |
| `/api/dashboard/stats/` | GET | Dashboard statistics |
| `/api/dashboard/activities/` | GET | Recent activities |

---

**Last Updated:** November 25, 2025
**React Version:** 19.1.1
**Vite Version:** 7.1.7
**Tailwind CSS:** 3.4.18
**Architecture:** Feature-based, matches backend structure
