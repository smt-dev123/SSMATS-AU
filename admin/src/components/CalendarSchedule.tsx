import React, { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

// Simple types
type CalEvent = {
  id: string
  title: string
  start: string // ISO string
  end?: string // ISO string
  color?: string // optional badge color
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

// --- EventChip component
function EventChip({ evt, onClick }: { evt: CalEvent; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer truncate text-left w-full rounded-xl px-2 py-1 text-xs shadow-sm hover:shadow transition border bg-white/80 dark:bg-gray-600 backdrop-blur-sm"
      style={{ borderColor: evt.color || '#e5e7eb' }}
      title={`${evt.title} — ${format(parseISO(evt.start), 'PP p')}`}
    >
      <span
        className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
        style={{ background: evt.color || '#6b7280' }}
      />
      <span className="align-middle">{evt.title}</span>
    </div>
  )
}

// --- Quick inline dialog
function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-700 p-4 shadow-xl"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

// --- Main component
export default function CalendarSchedule() {
  const [month, setMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [query, setQuery] = useState('')
  const [events, setEvents] = useState<CalEvent[]>([
    {
      id: uid(),
      title: 'Team standup',
      start: new Date().toISOString(),
      color: '#10b981',
    },
    {
      id: uid(),
      title: 'Design review',
      start: addDays(new Date(), 1).toISOString(),
      color: '#6366f1',
    },
  ])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState<{ date: Date; title: string }>({
    date: new Date(),
    title: '',
  })

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 }) // Sunday
    const end = endOfMonth(month)
    const days: Date[] = []
    let cur = start
    while (cur <= end || days.length % 7 !== 0) {
      days.push(cur)
      cur = addDays(cur, 1)
    }
    while (days.length < 42) days.push(addDays(days[days.length - 1], 1))
    return days
  }, [month])

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    for (const evt of events) {
      const d = format(parseISO(evt.start), 'yyyy-MM-dd')
      if (!map[d]) map[d] = []
      map[d].push(evt)
    }
    return map
  }, [events])

  const filteredAgenda = useMemo(() => {
    const dayKey = format(selectedDate, 'yyyy-MM-dd')
    const dayEvents = eventsByDay[dayKey] || []
    if (!query.trim()) return dayEvents
    return dayEvents.filter((e) =>
      e.title.toLowerCase().includes(query.toLowerCase()),
    )
  }, [eventsByDay, selectedDate, query])

  function openCreate(date: Date) {
    setDraft({ date, title: '' })
    setDialogOpen(true)
  }

  function createEvent() {
    if (!draft.title.trim()) return
    setEvents((prev) => [
      ...prev,
      {
        id: uid(),
        title: draft.title.trim(),
        start: draft.date.toISOString(),
        color: randomColor(),
      },
    ])
    setDialogOpen(false)
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  function randomColor() {
    const palette = [
      '#ef4444',
      '#f59e0b',
      '#10b981',
      '#06b6d4',
      '#6366f1',
      '#a855f7',
    ]
    return palette[Math.floor(Math.random() * palette.length)]
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Calendar & Schedule
            </h1>
            <p className="text-md text-slate-500">
              Lightweight month view + daily agenda
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth(addMonths(month, -1))}
              className="rounded-2xl border px-3 py-2 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              Prev
            </button>
            <button
              onClick={() => setMonth(new Date())}
              className="rounded-2xl border px-3 py-2 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              Today
            </button>
            <button
              onClick={() => setMonth(addMonths(month, 1))}
              className="rounded-2xl border px-3 py-2 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>

        {/* Month label */}
        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {format(month, 'MMMM yyyy')}
          </h2>
          <input
            placeholder="Search agenda…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-56 rounded-2xl border px-3 py-2 text-md shadow-sm focus:outline-none"
          />
        </div>

        {/* Layout: calendar grid + agenda */}
        <div className="mt-4 grid gap-4 md:grid-cols-[1.5fr,1fr]">
          {/* Calendar grid */}
          <div className="rounded-2xl border bg-white dark:bg-gray-800 p-2 shadow-sm">
            <div className="grid grid-cols-7 text-md font-bold text-slate-500 dark:text-slate-50">
              {'SUN,MON,TUE,WED,THU,FRI,SAT'.split(',').map((d) => (
                <div key={d} className="px-2 py-2 text-center">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 p-2">
              {grid.map((day, idx) => {
                const key = format(day, 'yyyy-MM-dd')
                const dayEvents = eventsByDay[key] || []
                const inactive = !isSameMonth(day, month)
                const active = isSameDay(day, selectedDate)
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    onDoubleClick={() => openCreate(day)}
                    className={`group h-28 rounded-2xl border p-2 text-left transition ${
                      active ? 'ring-2 ring-indigo-500' : ''
                    } ${inactive ? 'opacity-50' : ''} bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer`}
                  >
                    <div className="flex items-center  justify-between">
                      <div
                        className={`text-md ${isToday(day) ? 'font-bold' : ''}`}
                      >
                        {format(day, 'd')}
                      </div>
                      {isToday(day) && (
                        <span className="text-[12px] bg-red-500 font-bold rounded-full border px-2 py-0.5">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                      <AnimatePresence>
                        {dayEvents.slice(0, 3).map((evt) => (
                          <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            <EventChip
                              evt={evt}
                              onClick={() => setSelectedDate(day)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {dayEvents.length > 3 && (
                        <div className="text-[11px] text-slate-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="px-3 pb-2 text-xs text-slate-400">
              Tip: double-click a day to add an event.
            </p>
          </div>

          {/* Agenda */}
          <div className="rounded-2xl border bg-white dark:bg-gray-800 p-3 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-semibold">
                Agenda — {format(selectedDate, 'PPPP')}
              </h3>
              <button
                onClick={() => openCreate(selectedDate)}
                className="rounded-xl border px-3 py-1.5 text-md hover:bg-slate-50"
              >
                + Add
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {filteredAgenda.length === 0 && (
                <div className="rounded-xl border border-dashed p-4 text-md text-slate-500">
                  No events for this day.
                </div>
              )}
              <AnimatePresence>
                {filteredAgenda.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: evt.color || '#6b7280' }}
                        />
                        <p className="truncate font-medium">{evt.title}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {format(parseISO(evt.start), 'PP p')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteEvent(evt.id)}
                        className="rounded-xl border px-2 py-1 text-xs hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <h4 className="text-lg font-semibold">Create event</h4>
        <p className="mt-1 text-md text-slate-500">
          {format(draft.date, 'PPPP')}
        </p>
        <div className="mt-3">
          <label className="text-md text-slate-600">Title</label>
          <input
            autoFocus
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createEvent()
            }}
            placeholder="e.g., Project kickoff"
            className="mt-1 w-full rounded-xl border px-3 py-2 shadow-sm focus:outline-none"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setDialogOpen(false)}
            className="rounded-xl border px-3 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={createEvent}
            className="rounded-xl bg-indigo-600 px-3 py-2 text-white shadow hover:brightness-110"
          >
            Create
          </button>
        </div>
      </Dialog>
    </div>
  )
}
