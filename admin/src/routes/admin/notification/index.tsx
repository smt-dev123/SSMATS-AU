import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, BookOpen, MessageSquare, ChevronRight, Bell } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFaculties } from '@/api/FacultyAPI'
import { getGeneration } from '@/api/GenerationAPI'
import {
  getNotifications,
  broadcastNotification,
  getMyNotifications,
  markNotificationAsRead,
} from '@/api/NotificationAPI'
import { getMajors } from '@/api/MajorAPI'
import type { FacultiesType, GenerationsType, MajorsType } from '@/types'
import toast from 'react-hot-toast'
import { useSessionContext } from '@/providers/AuthProvider'

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
  const { data: rawFaculties } = useQuery<FacultiesType[]>({
    queryKey: ['faculties'],
    queryFn: getFaculties,
  })

  const { data: rawGenerations } = useQuery<GenerationsType[]>({
    queryKey: ['generations'],
    queryFn: getGeneration,
  })

  const { data: rawNotifications } = useQuery<Message[]>({
    queryKey: ['notifications', role],
    queryFn: () => {
      if (role === 'student' || role === 'teacher') {
        return getMyNotifications()
      }
      return getNotifications()
    },
  })

  const { data: rawMajors } = useQuery<MajorsType[]>({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', role] })
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
      {/* Sidebar */}
      {role !== 'student' && role !== 'teacher' && (
        <aside className="w-80 flex flex-col border-r border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900">
          <div className="p-6 border-b border-slate-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-sky-600 p-2 rounded-lg text-white">
                <Bell size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                Notifications
              </h1>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                ជំនាន់ (Generation)
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-sm"
              >
                {generations.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 px-4">
              Faculties
            </h3>
            <nav className="space-y-1">
              {faculties.map((f) => {
                const facultyMajors = majors.filter((m) => m.facultyId === f.id)
                const isFacultySelected = selectedFaculty === f.id

                return (
                  <div key={f.id} className="mb-2">
                    <button
                      onClick={() => {
                        setSelectedFaculty(f.id!)
                        setSelectedMajor('')
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                        isFacultySelected && !selectedMajor
                          ? 'bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-sm border border-slate-200 dark:border-gray-700'
                          : 'text-slate-500 hover:bg-white dark:hover:bg-gray-800 hover:text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen
                          size={18}
                          className={
                            isFacultySelected && !selectedMajor
                              ? 'text-sky-500'
                              : 'text-slate-400'
                          }
                        />
                        <span className="truncate max-w-[160px]">{f.name}</span>
                      </div>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isFacultySelected && !selectedMajor ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'} ${isFacultySelected ? 'rotate-90' : ''}`}
                      />
                    </button>

                    {/* Majors List under Faculty */}
                    {isFacultySelected && facultyMajors.length > 0 && (
                      <div className="mt-1 ml-4 pl-3 border-l border-slate-200 dark:border-gray-700 space-y-1">
                        {facultyMajors.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setSelectedMajor(m.id!)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                              selectedMajor === m.id
                                ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                            <span className="truncate text-left">{m.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
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

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] custom-scrollbar"
        >
          {filteredMessages.length > 0 ? (
            [...filteredMessages].reverse().map((msg: any) => {
              const isStudentOrTeacher =
                role === 'student' || role === 'teacher'
              const actualMsg = isStudentOrTeacher ? msg.notification : msg
              if (!actualMsg) return null

              const isRead = isStudentOrTeacher ? msg.isRead : true

              let displayTitle = actualMsg.title || 'សារជូនដំណឹងទូទៅ'

              const handleCardClick = () => {
                if (isStudentOrTeacher && !isRead) {
                  markReadMutation.mutate(msg.id)
                }
              }

              return (
                <div
                  key={msg.id}
                  onClick={handleCardClick}
                  className={`w-full max-w-3xl mx-auto text-left p-5 rounded-2xl shadow-sm border transition-all ${
                    isRead
                      ? 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 opacity-80'
                      : 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 cursor-pointer hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4
                      className={`text-lg font-bold ${isRead ? 'text-slate-700 dark:text-slate-200' : 'text-sky-700 dark:text-sky-300'}`}
                    >
                      {displayTitle}
                    </h4>
                    {!isRead && (
                      <span className="flex h-3 w-3 rounded-full bg-sky-500 animate-pulse"></span>
                    )}
                  </div>
                  <div
                    className={`text-[15px] leading-relaxed whitespace-pre-wrap ${isRead ? 'text-slate-600 dark:text-slate-300' : 'text-sky-800 dark:text-sky-200'}`}
                  >
                    {actualMsg.message}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Admin
                    </span>
                    <span className="text-[10px] text-slate-400 opacity-80">
                      {actualMsg.createdAt
                        ? new Date(actualMsg.createdAt).toLocaleString()
                        : ''}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <MessageSquare size={48} className="mb-4 stroke-[1.5]" />
              <p className="text-lg font-medium">
                No messages found for this selection
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        {role !== 'student' && role !== 'teacher' && (
          <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="max-w-4xl mx-auto relative group">
              <div className="relative flex flex-col gap-2 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-xl shadow-slate-200/50 dark:shadow-none focus-within:border-sky-500 transition-colors">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={mutation.isPending}
                  placeholder="ចំណងជើង (Optional Title)"
                  className="w-full bg-transparent border-b border-slate-100 dark:border-gray-700 focus:border-sky-500 focus:ring-0 text-[15px] font-medium p-2 outline-none dark:text-white placeholder:text-slate-400 placeholder:font-normal"
                />
                <div className="flex items-end gap-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    disabled={mutation.isPending}
                    placeholder="សរសេរសារជូនដំណឹងនៅទីនេះ..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] p-2 resize-none max-h-40 min-h-[50px] outline-none dark:text-white"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || mutation.isPending}
                    className="bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-sky-200 dark:shadow-none"
                  >
                    <Send
                      size={20}
                      className={mutation.isPending ? 'animate-pulse' : ''}
                    />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-center mt-3 text-slate-400">
                Press <kbd className="font-sans border px-1 rounded">Enter</kbd>{' '}
                to broadcast to all students in this{' '}
                {selectedMajor ? 'major' : 'faculty'}.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
