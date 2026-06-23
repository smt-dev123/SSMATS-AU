import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl.startsWith('http')) return envUrl + '/auth'
  return window.location.origin + envUrl + '/auth'
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [adminClient()],
})

export const { signIn, signUp, useSession, signOut, admin } = authClient
