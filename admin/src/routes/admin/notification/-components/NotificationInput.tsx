import { Send } from 'lucide-react'

interface NotificationInputProps {
  role: string
  title: string
  setTitle: (title: string) => void
  message: string
  setMessage: (message: string) => void
  mutation: any
  handleSend: () => void
  selectedMajor: number | ''
}

export default function NotificationInput({
  role,
  title,
  setTitle,
  message,
  setMessage,
  mutation,
  handleSend,
  selectedMajor,
}: NotificationInputProps) {
  if (role === 'student' || role === 'teacher') return null

  return (
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
          Press <kbd className="font-sans border px-1 rounded">Enter</kbd> to
          broadcast to all students in this{' '}
          {selectedMajor ? 'major' : 'faculty'}.
        </p>
      </div>
    </div>
  )
}
