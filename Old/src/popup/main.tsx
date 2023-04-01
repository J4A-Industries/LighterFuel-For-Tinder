import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/popup/App'
import '@/popup/index.css'

const root = document.getElementById('root');

if(!root) {
  throw new Error('root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
