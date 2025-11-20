import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // <-- 1. Must be imported
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
  // 2. Must wrap the <App /> component
  <HashRouter>
    <App />
  </HashRouter>
)