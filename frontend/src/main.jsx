import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './context/userContext'
import { ChatProvider } from './context/ChatContext'
import { SpeedInsights } from "@vercel/speed-insights/react"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
      <ChatProvider>
        <App />
        <SpeedInsights />
      </ChatProvider>
    </UserProvider>
  </StrictMode>,
)
