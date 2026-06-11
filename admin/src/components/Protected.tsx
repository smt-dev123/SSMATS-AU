import React, { type ReactNode } from 'react'
import { useAuth } from '@/stores/auth'
import { Navigate } from '@tanstack/react-router'

interface Props {
  children: ReactNode
  policy?: (user: any) => boolean
}

export const ProtectedLayout: React.FC<Props> = ({ children, policy }) => {
  const { user, isPending } = useAuth()

  if (isPending) return null // or a spinner
  if (!user) return <Navigate to="/auth/login" />
  if (policy && !policy(user)) return <h2>Access Denied</h2>

  return <>{children}</>
}
