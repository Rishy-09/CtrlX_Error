import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Set fixed light theme (remove dark mode functionality)
document.documentElement.classList.remove('dark')
localStorage.setItem('theme', 'light')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
