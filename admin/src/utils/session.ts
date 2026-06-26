import { queryOptions } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: () => authClient.getSession(),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnMount: false,
})
