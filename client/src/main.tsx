import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme/light.css'

// apply light theme class on the HTML element so our overrides take effect
if (typeof document !== 'undefined') {
  document.documentElement.classList.add('theme-light')
}
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
