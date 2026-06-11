import { Popover, Box, Text, Flex } from '@radix-ui/themes'
import { IoNotificationsOutline } from 'react-icons/io5'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  getMyNotifications,
  markNotificationAsRead,
} from '@/api/NotificationAPI'
import { useAuth } from '@/stores/auth'
import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSessionContext } from '@/providers/AuthProvider'
import toast from 'react-hot-toast'

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
      // Also invalidate the main notification page query so they stay in sync
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

  // --- Badge Logic (Hide when viewed) ---
  const [lastSeenId, setLastSeenId] = useState<number | null>(() => {
    const saved = localStorage.getItem(`lastSeenNotif_${user?.id}`)
    return saved ? parseInt(saved, 10) : null
  })

  // Re-calculate if notifications change, but badge will be based on lastSeenId for admins
  let unreadCount = 0
  if (isStudentOrTeacher) {
    unreadCount = notifications.filter((n: any) => !n.isRead).length
  } else {
    if (lastSeenId) {
      unreadCount = notifications.filter((n: any) => n.id > lastSeenId).length
    } else {
      unreadCount = notifications.length
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open && notifications.length > 0 && !isStudentOrTeacher) {
      // Find the maximum ID among all notifications for admins
      const maxId = Math.max(...notifications.map((n: any) => n.id))
      localStorage.setItem(`lastSeenNotif_${user?.id}`, maxId.toString())
      setLastSeenId(maxId)
    }
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
              const isRead = isStudentOrTeacher ? !!n.isRead : true

              return (
                <Popover.Close key={n.id || i}>
                  <Box
                    p="2"
                    onClick={() => {
                      if (isStudentOrTeacher && !isRead && n.id) {
                        markAsReadMutation.mutate(n.id)
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
