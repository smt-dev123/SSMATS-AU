import {
  Outlet,
  createRootRouteWithContext,
  useRouteContext,
} from '@tanstack/react-router'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanstackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient} from '@tanstack/react-query';

export interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const { queryClient } = useRouteContext({ from: '__root__' })
    return (
      <>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
        {/* <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'AU Schedule & Students Attendance Management',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
      </>
    )
  },
})
