import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Theme } from '@radix-ui/themes'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

import '@radix-ui/themes/styles.css'
import './styles.css'

// Create a new router instance
const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import { AuthProvider } from './providers/AuthProvider'

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Theme radius="small" accentColor="blue">
        <main>
          <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RouterProvider router={router} />
              </AuthProvider>
            </QueryClientProvider>
          </I18nextProvider>
        </main>
      </Theme>
    </StrictMode>,
  )
}
