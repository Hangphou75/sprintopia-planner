
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./contexts/AuthContext"
import App from './App'
import './index.css'

console.log('Initializing application...')

const queryClient = new QueryClient()

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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
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
