import { queryOptions } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'

export const sessionQueryOptions = queryOptions({
  queryKey: ['session'],
  queryFn: () => authClient.getSession(),
  staleTime: 10000, // 10 seconds cache is enough to prevent flood during drag
})
