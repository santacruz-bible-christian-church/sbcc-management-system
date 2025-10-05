import { useState } from 'react'
import './App.css'
import { Button } from 'flowbite-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">SBCC Management System</h1>
        <Button color="blue">Flowbite Button</Button>
      </div>
    </>
  )
}

export default App
