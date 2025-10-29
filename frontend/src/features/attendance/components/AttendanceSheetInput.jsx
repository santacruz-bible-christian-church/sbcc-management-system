import React, { useState, useEffect, useRef } from 'react'
import { X, Calendar as CalIcon } from 'lucide-react'

const ACCENT = '#FDB54A'

// Minimal calendar mock for the right pane (visual only)
function MiniCalendar({ selected, onSelect }) {
  // selected can be a string (mm/dd/yyyy) or a Date
  const toDate = (d) => {
    if (!d) return null
    if (d instanceof Date) return d
    // try parse mm/dd/yyyy
    const parts = String(d).split('/')
    if (parts.length === 3) {
      const mm = parseInt(parts[0], 10) - 1
      const dd = parseInt(parts[1], 10)
      const yyyy = parseInt(parts[2], 10)
      return new Date(yyyy, mm, dd)
    }
    const parsed = new Date(d)
    return isNaN(parsed) ? null : parsed
  }

  const selectedDate = toDate(selected)
  const today = new Date()

  const [view, setView] = useState(() => {
    if (selectedDate) return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  useEffect(() => {
    // if external selected changes to another month, update view to show it
    if (selectedDate) {
      setView(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

  const prevMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))
  const nextMonth = () => setView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))

  const year = view.getFullYear()
  const month = view.getMonth()
  const monthLabel = view.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  const firstDayIndex = new Date(year, month, 1).getDay() // 0..6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  // build 6x7 grid
  const cells = []
  for (let i = 0; i < 42; i++) {
    const dayIndex = i - firstDayIndex + 1
    if (i < firstDayIndex) {
      // previous month
      const day = daysInPrev - (firstDayIndex - 1 - i)
      const dateObj = new Date(year, month - 1, day)
      cells.push({ day, inMonth: false, date: dateObj })
    } else if (dayIndex <= daysInMonth) {
      const day = dayIndex
      const dateObj = new Date(year, month, day)
      cells.push({ day, inMonth: true, date: dateObj })
    } else {
      // next month
      const day = dayIndex - daysInMonth
      const dateObj = new Date(year, month + 1, day)
      cells.push({ day, inMonth: false, date: dateObj })
    }
  }

  const isSameDay = (a, b) => {
    if (!a || !b) return false
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  const formatDay = (n) => String(n)

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100">←</button>
        <div className="font-medium">{monthLabel}</div>
        <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="text-xs text-gray-400">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mt-2">
        {cells.map((c, idx) => {
          const selectedHere = selectedDate && isSameDay(c.date, selectedDate)
          const todayHere = isSameDay(c.date, today)
          return (
            <button
              key={idx}
              onClick={() => onSelect(c.date)}
              className={`py-2 rounded ${c.inMonth ? 'text-gray-800' : 'text-gray-400'} flex items-center justify-center ${selectedHere ? 'bg-[#FDB54A] text-white' : todayHere ? 'ring-1 ring-gray-200' : 'hover:bg-gray-100'}`}
            >
              <span className="text-sm">{formatDay(c.day)}</span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={() => onSelect(null)} className="px-4 py-2 rounded bg-gray-100">Clear</button>
        <button onClick={() => onSelect(today)} className="px-4 py-2 rounded" style={{ backgroundColor: ACCENT, color: 'white' }}>Today</button>
      </div>
    </div>
  )
}

export default function AttendanceSheetInput({ open = false, onClose = () => {}, onCreate = () => {} }) {
  const [title, setTitle] = useState('Bible Study')
  const [date, setDate] = useState('10/2/2025')

  const parseMMDDYYYY = (s) => {
    if (!s) return null
    const parts = String(s).split('/')
    if (parts.length !== 3) return null
    const mm = parseInt(parts[0], 10) - 1
    const dd = parseInt(parts[1], 10)
    const yyyy = parseInt(parts[2], 10)
    const d = new Date(yyyy, mm, dd)
    return isNaN(d) ? null : d
  }

  const formatMMDDYYYY = (d) => {
    if (!d) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`
  }

  const [selectedDate, setSelectedDate] = useState(() => parseMMDDYYYY('10/2/2025'))
  const dateRef = useRef(null)

  useEffect(() => {
    // initialize flowbite-datepicker on the date input if available
    let dp
    import('flowbite-datepicker').then(mod => {
      const Datepicker = mod.Datepicker || mod.default || mod
      if (dateRef.current && Datepicker) {
        try {
          dp = new Datepicker(dateRef.current, { format: 'mm/dd/yyyy' })
        } catch (e) {
          // ignore init errors in dev
          // console.warn('datepicker init failed', e)
        }
      }
    }).catch(() => {
      // ignore if module not found
    })

    return () => {
      if (dp && dp.destroy) dp.destroy()
    }
  }, [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        <div className="flex">
          {/* Left form */}
          <div className="w-1/2 p-8">
            <div className="flex items-start justify-start">
              <h2 className="text-3xl font-bold text-gray-900">Create New
                <br />Attendance Sheet
              </h2>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Event Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Date of birth <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 w-56 bg-white">
                    <CalIcon className="w-4 h-4 text-[#FDB54A]" />
                    <input
                      ref={dateRef}
                      id="attendance-datepicker"
                      value={date}
                      onChange={e => {
                        const v = e.target.value
                        setDate(v)
                        const parsed = parseMMDDYYYY(v)
                        setSelectedDate(parsed)
                      }}
                      className="outline-none text-sm text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onCreate({ title, date, selectedDate })}
                  className="w-44 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: ACCENT }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>

          {/* Right calendar pane */}
          <div className="w-1/2 p-8 bg-gray-50 flex items-center justify-center relative">
            <button onClick={onClose} aria-label="Close modal" title="Close" className="absolute top-4 right-6 p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="w-full max-w-sm">
              <MiniCalendar
                selected={selectedDate}
                onSelect={d => {
                  // d is a Date or null
                  setSelectedDate(d)
                  setDate(d ? formatMMDDYYYY(d) : '')
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
