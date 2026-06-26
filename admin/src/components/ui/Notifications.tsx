import { Box, Flex, Popover, Text } from '@radix-ui/themes'
import { IoNotificationsOutline } from 'react-icons/io5'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getMyNotifications,
  getNotifications,
  markNotificationAsRead,
} from '@/api/NotificationAPI'
import { useAuth } from '@/stores/auth'
import { useSessionContext } from '@/providers/AuthProvider'

export function Notifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: sessionData } = useSessionContext()
  const sessionToken = sessionData?.session?.token

  const role = (user as any)?.role || ''
  const isStudentOrTeacher = role === 'student' || role === 'teacher'

  const { data: rawData } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => {
      if (isStudentOrTeacher) {
        return getMyNotifications()
      } else {
        return getNotifications()
      }
    },
    enabled: !!user,
  })

  // Ensure notifications is always an array and sorted by latest first
  const notifications = Array.isArray(rawData)
    ? [...rawData].sort((a: any, b: any) => {
        const timeA = new Date(
          a.createdAt || a.notification?.createdAt || 0,
        ).getTime()
        const timeB = new Date(
          b.createdAt || b.notification?.createdAt || 0,
        ).getTime()
        return timeB - timeA
      })
    : []

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', user?.id] })
      await queryClient.cancelQueries({ queryKey: ['notifications', role] })

      const prevUserNotifs = queryClient.getQueryData(['notifications', user?.id])
      const prevRoleNotifs = queryClient.getQueryData(['notifications', role])

      const updateReadStatus = (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((n: any) => n.id === id ? { ...n, isRead: true } : n)
      }

      queryClient.setQueryData(['notifications', user?.id], updateReadStatus)
      queryClient.setQueryData(['notifications', role], updateReadStatus)

      return { prevUserNotifs, prevRoleNotifs }
    },
    onError: (err, newId, context) => {
      queryClient.setQueryData(['notifications', user?.id], context?.prevUserNotifs)
      queryClient.setQueryData(['notifications', role], context?.prevRoleNotifs)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['notifications', role] })
    },
  })

  // --- WebSocket Setup ---
  useEffect(() => {
    if (!sessionToken) return

    let wsURL = ''
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

    if (baseURL.startsWith('http')) {
      wsURL =
        baseURL.replace(/^http/, 'ws') +
        `/notifications/ws?token=${sessionToken}`
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      wsURL = `${protocol}//${host}${baseURL}/notifications/ws?token=${sessionToken}`
    }

    const socket = new WebSocket(wsURL)

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      if (payload.type === 'NEW_NOTIFICATION') {
        // Invalidate queries so that the correct data (with isRead status) is fetched
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
        queryClient.invalidateQueries({ queryKey: ['notifications', role] })
        toast.success('New notification received!')
      }
    }

    return () => socket.close()
  }, [queryClient, sessionToken, role, user?.id])

  // --- Badge Logic (Read/Unread) ---
  const [readIds, setReadIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`readNotifs_${user?.id}`)
    return saved ? JSON.parse(saved) : []
  })

  // Synchronize across tabs or route changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(`readNotifs_${user?.id}`)
      if (saved) setReadIds(JSON.parse(saved))
    }
    window.addEventListener('storage', handleStorageChange)
    // Custom event for same-tab sync
    window.addEventListener('readNotifsUpdated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('readNotifsUpdated', handleStorageChange)
    }
  }, [user?.id])

  let unreadCount = 0
  if (isStudentOrTeacher) {
    unreadCount = notifications.filter((n: any) => !n.isRead).length
  } else {
    unreadCount = notifications.filter((n: any) => !readIds.includes(n.id)).length
  }

  const markAdminRead = (id: number) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id]
      setReadIds(newReadIds)
      localStorage.setItem(`readNotifs_${user?.id}`, JSON.stringify(newReadIds))
      window.dispatchEvent(new Event('readNotifsUpdated'))
    }
  }

  const handleOpenChange = (open: boolean) => {
    // We no longer automatically mark everything as read when opening.
    // They must click individual notifications.
  }

  return (
    <Popover.Root onOpenChange={handleOpenChange}>
      <Popover.Trigger>
        <button className="relative cursor-pointer flex items-center justify-center h-full px-2 border-none bg-transparent outline-none">
          <IoNotificationsOutline
            size="24"
            className="text-gray-600 dark:text-gray-200 hover:text-sky-600 transition-colors"
          />
          {unreadCount > 0 && (
            <Box
              style={{
                position: 'absolute',
                top: '-2px',
                right: '2px',
                background: 'red',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '9999px',
                padding: '2px 5px',
                lineHeight: 1,
                border: '2px solid white',
              }}
              className="dark:border-gray-900"
            >
              {unreadCount}
            </Box>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="end"
        style={{
          width: 360,
          maxHeight: 400,
          overflowY: 'auto',
          borderRadius: 12,
          padding: '16px',
        }}
        className="bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <Box
          mb="3"
          pb="2"
          style={{ borderBottom: '1px solid #eaeaea' }}
          className="dark:border-gray-700"
        >
          <Text
            size="3"
            weight="bold"
            className="text-gray-900 dark:text-gray-100"
          >
            Notifications
          </Text>
        </Box>

        <Flex direction="column" gap="1">
          {notifications.length > 0 ? (
            notifications.slice(0, 10).map((n: any, i: number) => {
              const title =
                n.notification?.title || n.title || 'សារជូនដំណឹងទូទៅ'
              const message = n.notification?.message || n.message || ''
              const time =
                n.createdAt ||
                n.notification?.createdAt ||
                new Date().toISOString()
              const isRead = isStudentOrTeacher ? !!n.isRead : readIds.includes(n.id || 0)

              return (
                <Popover.Close key={n.id || i}>
                  <Box
                    p="2"
                    onClick={() => {
                      if (isStudentOrTeacher && !isRead && n.id) {
                        markAsReadMutation.mutate(n.id)
                      } else if (!isStudentOrTeacher && !isRead && n.id) {
                        markAdminRead(n.id)
                      }
                    }}
                    style={{
                      borderRadius: 10,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    className={`transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                      !isRead ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                    }`}
                  >
                    <Link
                      to="/admin/notification"
                      style={{
                        display: 'flex',
                        width: '100%',
                        gap: '14px',
                        alignItems: 'flex-start',
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <div className="relative flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 shadow-sm text-white">
                          <IoNotificationsOutline size={20} />
                        </div>
                        {!isRead && (
                          <span className="absolute top-0 right-0 block w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                        )}
                      </div>

                      <Box width="100%" style={{ overflow: 'hidden' }}>
                        <Flex direction="column" gap="1">
                          <Flex justify="between" align="baseline">
                            <Text
                              size="2"
                              weight="bold"
                              className="text-gray-900 dark:text-gray-100"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                paddingRight: '8px',
                              }}
                            >
                              {title}
                            </Text>
                            <Text
                              size="1"
                              className="text-gray-500 dark:text-gray-400 font-medium"
                              style={{
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              {new Date(time).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Text>
                          </Flex>
                          <Text
                            size="2"
                            className="text-gray-600 dark:text-gray-400"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.5',
                            }}
                          >
                            {message}
                          </Text>
                        </Flex>
                      </Box>
                    </Link>
                  </Box>
                </Popover.Close>
              )
            })
          ) : (
            <Box py="6" style={{ textAlign: 'center' }}>
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <IoNotificationsOutline size="24" className="text-gray-400" />
              </div>
              <Text size="2" className="text-gray-500 dark:text-gray-400">
                You're all caught up!
              </Text>
            </Box>
          )}
        </Flex>

        {notifications.length > 0 && (
          <Box
            mt="3"
            style={{
              textAlign: 'center',
              borderTop: '1px solid #eaeaea',
              paddingTop: '12px',
            }}
            className="dark:border-gray-700"
          >
            <Link to="/admin/notification">
              <Text
                size="2"
                className="text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium"
                style={{ cursor: 'pointer' }}
              >
                View all notifications
              </Text>
            </Link>
          </Box>
        )}
      </Popover.Content>
    </Popover.Root>
  )
}
