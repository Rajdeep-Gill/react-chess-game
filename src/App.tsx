import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className='text-8xl text-blue-300 bg-red-300'>
      Hello World
    </div>
    </>
  )
}

export default App
