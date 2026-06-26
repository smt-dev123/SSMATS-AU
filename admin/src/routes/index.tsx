import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session?.data) {
      throw redirect({ to: '/admin/dashboard' })
    } else {
      throw redirect({ to: '/auth/login' })
    }
  },
})
