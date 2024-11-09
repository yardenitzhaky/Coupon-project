import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// PrimeReact styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Setup Mock Service Worker in development
if (process.env.NODE_ENV === 'development') {
  const { worker } = await import('./mock-api')
  worker.start({
    onUnhandledRequest: 'bypass'
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)