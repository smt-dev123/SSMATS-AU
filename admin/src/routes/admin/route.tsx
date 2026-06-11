import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { sessionQueryOptions } from '@/utils/session'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    const session =
      await context.queryClient.ensureQueryData(sessionQueryOptions)

    if (!session?.data) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <Navbar />

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-gray-800 custom-scrollbar">
            <div className="min-h-full flex flex-col">
              <div className="flex-1 p-4">
                <Outlet />
              </div>

              <Footer />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  )
}
