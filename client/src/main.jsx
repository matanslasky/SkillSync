import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { initErrorTracking } from './services/errorTracking'

// Initialize Sentry error tracking
// To enable: Set VITE_ENABLE_ERROR_TRACKING=true and add VITE_SENTRY_DSN to .env
initErrorTracking()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
