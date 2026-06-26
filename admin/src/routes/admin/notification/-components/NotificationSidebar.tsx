import { Bell, BookOpen, ChevronRight } from 'lucide-react'
import type { FacultiesType, GenerationsType, MajorsType } from '@/types'

interface NotificationSidebarProps {
  role: string
  faculties: FacultiesType[]
  generations: GenerationsType[]
  majors: MajorsType[]
  selectedYear: number | ''
  setSelectedYear: (year: number | '') => void
  selectedFaculty: number | ''
  setSelectedFaculty: (faculty: number | '') => void
  selectedMajor: number | ''
  setSelectedMajor: (major: number | '') => void
}

export default function NotificationSidebar({
  role,
  faculties,
  generations,
  majors,
  selectedYear,
  setSelectedYear,
  selectedFaculty,
  setSelectedFaculty,
  selectedMajor,
  setSelectedMajor,
}: NotificationSidebarProps) {
  if (role === 'student' || role === 'teacher') return null

  return (
    <aside className="w-80 flex flex-col border-r border-slate-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900">
      <div className="p-6 border-b border-slate-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-sky-600 p-2 rounded-lg text-white">
            <Bell size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Notifications</h1>
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
  )
}
