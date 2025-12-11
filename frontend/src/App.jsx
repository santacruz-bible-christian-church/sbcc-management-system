import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AppRouter } from './router'
import { useAuthStore } from './store/auth.store'

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#22c55e',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }}
      />
      <AppRouter />
    </>
  )
}

export default App
