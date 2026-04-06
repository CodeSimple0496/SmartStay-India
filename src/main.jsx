import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { MarketProvider } from './contexts/MarketContext'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MarketProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </MarketProvider>
    </AuthProvider>
  </StrictMode>,
)
