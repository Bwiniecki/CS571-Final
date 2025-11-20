import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // Import HashRouter
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  // 1. Removed <StrictMode> tags as per instructions.
  // 2. Added <HashRouter> to enable proper routing on GitHub Pages.
  <HashRouter>
    <App />
  </HashRouter>
)