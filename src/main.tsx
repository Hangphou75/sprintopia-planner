import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './index.css';

console.log("🚀 Application initialization starting...");

const container = document.getElementById('root');

if (!container) {
  console.error("❌ Root element not found! Check if index.html contains <div id='root'></div>");
  throw new Error('Failed to find the root element');
}

console.log("✅ Root element found, creating React root...");

const root = createRoot(container);

console.log("✅ React root created, rendering application...");

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log("✅ Initial render complete!");