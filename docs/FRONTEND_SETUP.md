# Frontend Setup Guide

Complete guide for setting up the React frontend for SBCC Management System.

## 📋 Prerequisites

- Node.js 18 or higher
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

### 3. Start Development Server

```bash
npm run dev
```

or with yarn:

```bash
yarn dev
```

Server will start at: `http://localhost:5173`

## 📦 Installed Packages

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI library |
| Vite | 5.4.10 | Build tool |
| Tailwind CSS | 3.4.14 | CSS framework |
| Flowbite React | 0.10.2 | UI components |
| React Router DOM | 7.0.1 | Routing |

## 🗂️ Project Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   ├── App.css             # App styles
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
├── .gitignore              # Git ignore rules
├── eslint.config.js        # ESLint configuration
├── index.html              # HTML template
├── package.json            # Dependencies
├── postcss.config.js       # PostCSS config
├── tailwind.config.js      # Tailwind config
└── vite.config.js          # Vite configuration
```

## 🎨 Tailwind CSS Configuration

Tailwind is configured in `tailwind.config.js`:

```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
```

## 🧩 Using Flowbite Components

Flowbite React provides pre-built components:

```jsx
import { Button, Card, Modal } from 'flowbite-react';

function Example() {
  return (
    <div>
      <Button color="blue">Click me</Button>
      <Card>
        <h5>Card Title</h5>
        <p>Card content</p>
      </Card>
    </div>
  );
}
```

[Flowbite React Documentation](https://flowbite-react.com/)

## 🌐 API Integration

### Setting up API Service

Create `src/services/api.js`:

```js
const API_URL = 'http://localhost:8000/api';

export const api = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },
  
  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async put(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  async delete(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
```

### Using API Service

```jsx
import { useState, useEffect } from 'react';
import { api } from './services/api';

function DataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/endpoint/')
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## 🎯 Environment Variables

Create `.env.local` for environment variables:

```env
VITE_API_URL=http://localhost:8000/api
```

Usage:

```js
const API_URL = import.meta.env.VITE_API_URL;
```

⚠️ **Note:** Vite requires `VITE_` prefix for environment variables.

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

# Format code (if prettier is configured)
npm run format
```

## 🐛 Troubleshooting

### "Module not found" errors

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS errors when calling API

**Solution:**
- Ensure backend CORS is configured correctly
- Check API URL is correct
- Verify backend is running

### Tailwind classes not working

**Solution:**
- Check `tailwind.config.js` content paths
- Ensure `index.css` imports Tailwind directives
- Restart dev server

## 🎨 Styling Guidelines

### Use Tailwind Utility Classes

```jsx
<div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
  <h2 className="text-2xl font-bold text-gray-800">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click
  </button>
</div>
```

### Responsive Design

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## 🔒 Security Best Practices

- Never commit API keys to version control
- Use environment variables for sensitive data
- Sanitize user input
- Implement proper authentication
- Keep dependencies updated

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Flowbite React Documentation](https://flowbite-react.com/)