import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { applyThemeClassToDocument, readStoredTheme } from './lib/themeStorage'
import '@roadmapsnap/tokens/css'
import '@roadmapsnap/tokens/components.css'
import './index.css'

// Apply last-known theme before paint (React/API would otherwise default to light briefly).
const storedTheme = readStoredTheme()
if (storedTheme) {
  applyThemeClassToDocument(storedTheme)
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: (import.meta.env.VITE_AUTH0_REDIRECT_URI || window.location.origin) + '/callback',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      cacheLocation="localstorage"
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>
)
