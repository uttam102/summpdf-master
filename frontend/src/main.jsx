import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  document.body.innerHTML = `
  <div style="font-family: sans-serif; padding: 20px; color: #ef4444; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px;">
  <h1 style="margin: 0 0 10px 0;">SummPDF Configuration Error</h1>
  <p><b>Missing Clerk Publishable Key!</b> Please check your <code>.env</code> file in the <code>frontend</code> folder.</p>
  <p>Ensure it contains: <code>VITE_CLERK_PUBLISHABLE_KEY=your_key_here</code></p>
  </div>
  `;
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </ErrorBoundary>
)