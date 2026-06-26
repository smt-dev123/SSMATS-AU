import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl.startsWith('http')) return envUrl + '/auth'
  return window.location.origin + envUrl + '/auth'
}

const fetchPromises = new Map<string, Promise<Response>>()

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (init?.method && init.method.toUpperCase() !== 'GET') {
    return fetch(input, init)
  }

  const url = input.toString()

  if (fetchPromises.has(url)) {
    const sharedPromise = fetchPromises.get(url)!
    try {
      const response = await sharedPromise
      return response.clone()
    } catch (error) {
      fetchPromises.delete(url)
      throw error
    }
  }

  const promise = fetch(input, init)

  fetchPromises.set(url, promise)

  setTimeout(() => {
    fetchPromises.delete(url)
  }, 1000)

  try {
    const finalResponse = await promise
    return finalResponse.clone()
  } catch (error) {
    fetchPromises.delete(url)
    throw error
  }
}

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),
  plugins: [adminClient()],
  fetchOptions: {
    customFetchImpl: customFetch,
  },
})

export const { signIn, signUp, useSession, signOut, admin } = authClient
