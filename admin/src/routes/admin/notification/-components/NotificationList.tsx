import { MessageSquare } from 'lucide-react'

interface NotificationListProps {
  filteredMessages: any[]
  role: string
  readIds: number[]
  markReadMutation: any
  markAdminRead: (id: number) => void
  setSelectedMessage: (msg: any) => void
  scrollRef: React.RefObject<HTMLDivElement | null>
}

export default function NotificationList({
  filteredMessages,
  role,
  readIds,
  markReadMutation,
  markAdminRead,
  setSelectedMessage,
  scrollRef,
}: NotificationListProps) {
  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-8 space-y-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:20px_20px] custom-scrollbar"
    >
      {filteredMessages.length > 0 ? (
        [...filteredMessages].reverse().map((msg: any) => {
          const isStudentOrTeacher = role === 'student' || role === 'teacher'
          const actualMsg = isStudentOrTeacher ? msg.notification : msg
          if (!actualMsg) return null

          const isRead = isStudentOrTeacher
            ? msg.isRead
            : readIds.includes(msg.id)

          const displayTitle = actualMsg.title || 'សារជូនដំណឹងទូទៅ'

          const handleCardClick = () => {
            if (isStudentOrTeacher && !isRead) {
              markReadMutation.mutate(msg.id)
            } else if (!isStudentOrTeacher && !isRead) {
              markAdminRead(msg.id)
            }
            setSelectedMessage({ ...actualMsg, displayTitle })
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
                  className={`text-lg font-bold ${
                    isRead
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-sky-700 dark:text-sky-300'
                  }`}
                >
                  {displayTitle}
                </h4>
                {!isRead && (
                  <span className="flex h-3 w-3 rounded-full bg-sky-500 animate-pulse"></span>
                )}
              </div>
              <div
                className={`text-[15px] leading-relaxed whitespace-pre-wrap line-clamp-3 ${
                  isRead
                    ? 'text-slate-600 dark:text-slate-300'
                    : 'text-sky-800 dark:text-sky-200'
                }`}
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
  )
}
