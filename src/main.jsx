// src/main.jsx
import './styles/globals.css';

if (import.meta.env.DEV) {
  await import('./dev-block-redirects.js');
  await import('./dev-block-network.js');
  await import('./dev-mock-base44.js');
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
