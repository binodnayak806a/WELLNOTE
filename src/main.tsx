// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './styles/globals.css'

// // Ensure the root element exists before rendering
// const rootElement = document.getElementById('root')

// if (!rootElement) {
//   console.error('Root element not found. Creating one...')
//   const newRoot = document.createElement('div')
//   newRoot.id = 'root'
//   document.body.appendChild(newRoot)
// }

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useAuthStore } from './store/auth'

// Initialize authentication state once when the app loads
useAuthStore.getState().initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)