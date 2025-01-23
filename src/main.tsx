import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'
import './index.css'

console.log('Initializing application...')

const init = async () => {
  try {
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      console.error('Failed to find the root element')
      throw new Error('Failed to find the root element')
    }

    console.log('Creating root and rendering app...')
    const root = createRoot(rootElement)
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
    
    console.log('App rendered successfully')
  } catch (error) {
    console.error('Error during initialization:', error)
  }
}

// Ensure DOM is fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}