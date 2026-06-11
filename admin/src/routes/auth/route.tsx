import { authClient } from '@/lib/auth-client'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session?.data) {
      throw redirect({ to: '/admin/dashboard' })
    }
  },
  component: RouteComponent,
})

import DarkMode from '@/components/ui/DarkMode'

function RouteComponent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
      <div className="absolute top-4 right-4">
        <DarkMode />
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
