import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ApiKeyProvider } from './context/ApiKeyContext.tsx'

// Remove StrictMode for react-beautiful-dnd compatibility
createRoot(document.getElementById('root')!).render(
  <ApiKeyProvider>
    <App />
  </ApiKeyProvider>
)
