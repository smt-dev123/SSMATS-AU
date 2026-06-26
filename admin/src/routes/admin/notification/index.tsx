import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { FacultiesType, GenerationsType, MajorsType } from '@/types'
import { getFaculties } from '@/api/FacultyAPI'
import { getGeneration } from '@/api/GenerationAPI'
import {
  broadcastNotification,
  getMyNotifications,
  getNotifications,
  markNotificationAsRead,
} from '@/api/NotificationAPI'
import { getMajors } from '@/api/MajorAPI'
import { useSessionContext } from '@/providers/AuthProvider'

import NotificationSidebar from './-components/NotificationSidebar'
import NotificationList from './-components/NotificationList'
import NotificationInput from './-components/NotificationInput'
import NotificationModal from './-components/NotificationModal'

export const Route = createFileRoute('/admin/notification/')({
  component: RouteComponent,
})

type Message = {
  id: number
  title?: string
  message: string
  facultyId: number
  targetGeneration?: number
  targetSkill?: number
  createdAt?: string
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: sessionData } = useSessionContext()
  const role = (sessionData?.user as any)?.role || ''

  // --- Data Fetching with Safety Defaults ---
  const { data: rawFaculties } = useQuery<Array<FacultiesType>>({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })

  const { data: rawGenerations } = useQuery<Array<GenerationsType>>({
    queryKey: ['generations'],
    queryFn: getGeneration,
  })

  const { data: rawNotifications } = useQuery<Array<Message>>({
    queryKey: ['notifications', role],
    queryFn: () => {
      if (role === 'student' || role === 'teacher') {
        return getMyNotifications()
      }
      return getNotifications()
    },
  })

  const { data: rawMajors } = useQuery<Array<MajorsType>>({
    queryKey: ['majors'],
    queryFn: getMajors,
  })

  // Normalize data to ensure they are ALWAYS arrays
  const faculties = useMemo(
    () => (Array.isArray(rawFaculties) ? rawFaculties : []),
    [rawFaculties],
  )
  const generations = useMemo(
    () => (Array.isArray(rawGenerations) ? rawGenerations : []),
    [rawGenerations],
  )
  const notifications = useMemo(
    () => (Array.isArray(rawNotifications) ? rawNotifications : []),
    [rawNotifications],
  )
  const majors = useMemo(
    () => (Array.isArray(rawMajors) ? rawMajors : []),
    [rawMajors],
  )

  const [selectedYear, setSelectedYear] = useState<number | ''>('')
  const [selectedFaculty, setSelectedFaculty] = useState<number | ''>('')
  const [selectedMajor, setSelectedMajor] = useState<number | ''>('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<any>(null)

  // --- Admin Read/Unread Sync ---
  const [readIds, setReadIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(`readNotifs_${sessionData?.user?.id}`)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(`readNotifs_${sessionData?.user?.id}`)
      if (saved) setReadIds(JSON.parse(saved))
    }
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('readNotifsUpdated', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('readNotifsUpdated', handleStorageChange)
    }
  }, [sessionData?.user?.id])

  const markAdminRead = (id: number) => {
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id]
      setReadIds(newReadIds)
      localStorage.setItem(`readNotifs_${sessionData?.user?.id}`, JSON.stringify(newReadIds))
      window.dispatchEvent(new Event('readNotifsUpdated'))
    }
  }

  // --- Selection Logic ---
  useEffect(() => {
    if (faculties.length > 0 && selectedFaculty === '') {
      setSelectedFaculty(faculties[0].id || '')
    }
  }, [faculties, selectedFaculty])

  useEffect(() => {
    if (generations.length > 0 && selectedYear === '') {
      setSelectedYear(generations[0].id || '')
    }
  }, [generations, selectedYear])

  // --- Mutation ---
  const mutation = useMutation({
    mutationFn: broadcastNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', role] })
      setMessage('')
      setTitle('')
      toast.success('Notification sent successfully')
    },
    onError: () => toast.error('Failed to send notification'),
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', role] })
      await queryClient.cancelQueries({ queryKey: ['notifications', sessionData?.user?.id] })
      
      const prevRoleNotifs = queryClient.getQueryData(['notifications', role])
      const prevUserNotifs = queryClient.getQueryData(['notifications', sessionData?.user?.id])

      const updateReadStatus = (old: any) => {
        if (!Array.isArray(old)) return old
        return old.map((n: any) => n.id === id ? { ...n, isRead: true } : n)
      }

      queryClient.setQueryData(['notifications', role], updateReadStatus)
      queryClient.setQueryData(['notifications', sessionData?.user?.id], updateReadStatus)

      return { prevRoleNotifs, prevUserNotifs }
    },
    onError: (err, newId, context) => {
      queryClient.setQueryData(['notifications', role], context?.prevRoleNotifs)
      queryClient.setQueryData(['notifications', sessionData?.user?.id], context?.prevUserNotifs)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', role] })
      queryClient.invalidateQueries({ queryKey: ['notifications', sessionData?.user?.id] })
    },
  })

  // --- Filtering & Helper Vars ---
  const filteredMessages =
    role === 'student' || role === 'teacher'
      ? notifications
      : notifications.filter(
          (m) =>
            m.facultyId === Number(selectedFaculty) &&
            (!selectedYear ||
              !m.targetGeneration ||
              m.targetGeneration === Number(selectedYear)) &&
            (!selectedMajor ||
              !m.targetSkill ||
              m.targetSkill === Number(selectedMajor)),
        )

  const selectedFacultyName =
    faculties.find((f) => f.id === Number(selectedFaculty))?.name ||
    'Loading...'
  const selectedMajorName = selectedMajor
    ? majors.find((m) => m.id === Number(selectedMajor))?.name
    : null
  const selectedYearName =
    generations.find((g) => g.id === Number(selectedYear))?.name || ''

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredMessages])

  const handleSend = () => {
    if (!message.trim() || selectedFaculty === '') return
    mutation.mutate({
      title: title.trim() || '',
      message: message,
      facultyId: Number(selectedFaculty),
      targetGeneration: selectedYear ? Number(selectedYear) : undefined,
      targetSkill: selectedMajor ? Number(selectedMajor) : undefined,
      priority: 'normal',
    })
  }

  return (
    <div className="flex h-[calc(100vh-150px)] w-full rounded-lg bg-white dark:bg-gray-950 overflow-hidden text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-gray-800">
      
      <NotificationSidebar
        role={role}
        faculties={faculties}
        generations={generations}
        majors={majors}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedFaculty={selectedFaculty}
        setSelectedFaculty={setSelectedFaculty}
        selectedMajor={selectedMajor}
        setSelectedMajor={setSelectedMajor}
      />

      <main className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-none mb-1">
              {role === 'student' || role === 'teacher'
                ? 'សារជូនដំណឹង (Notifications)'
                : selectedFacultyName}
              {role !== 'student' &&
                role !== 'teacher' &&
                selectedMajorName && (
                  <span className="ml-2 text-lg font-medium text-slate-400">
                    / {selectedMajorName}
                  </span>
                )}
            </h2>
            {role !== 'student' && role !== 'teacher' && (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedYearName}
                </span>
              </div>
            )}
          </div>
        </header>

        <NotificationList
          filteredMessages={filteredMessages}
          role={role}
          readIds={readIds}
          markReadMutation={markReadMutation}
          markAdminRead={markAdminRead}
          setSelectedMessage={setSelectedMessage}
          scrollRef={scrollRef}
        />

        <NotificationInput
          role={role}
          title={title}
          setTitle={setTitle}
          message={message}
          setMessage={setMessage}
          mutation={mutation}
          handleSend={handleSend}
          selectedMajor={selectedMajor}
        />
      </main>

      <NotificationModal
        selectedMessage={selectedMessage}
        setSelectedMessage={setSelectedMessage}
      />
    </div>
  )
}

export default RouteComponent
