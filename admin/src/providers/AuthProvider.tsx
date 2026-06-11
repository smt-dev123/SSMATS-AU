import { createContext, useContext, type ReactNode } from 'react'
import { useSession } from '@/lib/auth-client'

const AuthContext = createContext<ReturnType<typeof useSession> | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const session = useSession()

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

export const useSessionContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSessionContext must be used within an AuthProvider')
  }
  return context
}
