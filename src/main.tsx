import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { SessionProvider } from './context/SessionContext'
import { DialogProvider } from './context/DialogContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <DialogProvider>
          <App />
        </DialogProvider>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
