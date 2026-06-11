import { signOut as betterSignOut } from '@/lib/auth-client'
import { useSessionContext } from '@/providers/AuthProvider'

export const useAuth = () => {
  const { data, isPending } = useSessionContext()
  return {
    user: data?.user || null,
    isPending,
    logout: async () => {
      await betterSignOut()
      window.location.href = '/auth/login'
    },
  }
}
