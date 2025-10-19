import { useEffect } from 'react'
import './App.css'
import { AppRouter } from './router'
import { useAuthStore } from './store/auth.store'

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return <AppRouter />
}

export default App
