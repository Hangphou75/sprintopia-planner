import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log("Initializing application...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
  throw new Error('Failed to find the root element');
}

console.log("Root element found, creating React root...");

const root = createRoot(rootElement);

console.log("Rendering application...");

root.render(
  <App />
);

console.log("Application rendered!");