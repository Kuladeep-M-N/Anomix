import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// StrictMode is intentionally removed: it double-invokes useEffect in dev,
// which breaks Three.js / WebGL imperative canvas lifecycle.
createRoot(document.getElementById('root')!).render(
  <App />
)
