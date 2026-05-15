import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { SessionProvider } from './context/SessionContext'
import { DialogProvider } from './context/DialogContext'
import { HubManagerProvider } from './context/HubManagerContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <HubManagerProvider>
          <DialogProvider>
            <App />
          </DialogProvider>
        </HubManagerProvider>
      </SessionProvider>
    </BrowserRouter>
  </StrictMode>,
)
