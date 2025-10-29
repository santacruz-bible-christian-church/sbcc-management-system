import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const ACCENT = '#FDB54A'

const generateMockMembers = () => Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  name: 'Adrian Cruz',
  gender: 'Male',
  ministry: 'Music Ministry',
  present: i % 3 === 0,
}))

export default function AttendanceTracker() {
  const [query, setQuery] = useState('')
  const [ministry, setMinistry] = useState('')
  const [page, setPage] = useState(1)
  const [members, setMembers] = useState(() => generateMockMembers())
  const pageSize = 8

  const ministries = ['Music Ministry', 'Media Ministry', 'Worship Ministry']

  const filtered = useMemo(() => {
    return members.filter(m => {
      if (ministry && m.ministry !== ministry) return false
      if (!query) return true
      return m.name.toLowerCase().includes(query.toLowerCase())
    })
  }, [query, ministry, members])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div>
            <h2 className="text-gray-600 text-sm">Page/Attendance</h2>
            <h1 className="text-3xl font-semibold text-gray-800">Attendance</h1>
          </div>

          {/* Breadcrumb / small back link under the main title */}
          <div className="mt-3">
            <Link to="/attendance" className="flex items-center text-sm text-[#FDB54A] font-medium">
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Bible Study | October 2, 2025</span>
            </Link>
          </div>

          {/* Controls row: left = search pill, center = ministry + clear, right = save */}
          <div className="mt-4 flex items-center gap-4">
              {/* Search (restored original rectangular style) */}
              <div className="flex-1">
                <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                  <div className="pl-3 pr-2">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    value={query}
                    onChange={e => { setQuery(e.target.value); setPage(1) }}
                    placeholder="Search..."
                    className="flex-1 py-2 px-2 outline-none text-sm text-gray-700"
                  />
                    <button className="bg-[#FDB54A] text-white px-4 py-2 text-sm font-medium rounded-r-lg" style={{ backgroundColor: ACCENT }}>Search</button>
                </div>
              </div>

            {/* Ministry select + Clear (center) */}
            <div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="flex items-center justify-center px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FDB54A]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h8" />
                </svg>
              </div>

              <select
                value={ministry}
                onChange={e => setMinistry(e.target.value)}
                className="bg-transparent px-4 py-2 text-sm text-gray-600 outline-none border-0 min-w-[160px]"
              >
                <option value="">Ministry</option>
                {ministries.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <button
                onClick={() => { setMinistry(''); setQuery('') }}
                className="px-4 py-2 bg-[#FDB54A] text-white text-sm font-medium rounded-r-lg"
              >
                Clear
              </button>
            </div>

            {/* Save Changes (right) - match filter bar height */}
            <div>
              <button className="px-4 py-2 bg-[#FDB54A] text-white text-sm font-medium rounded-lg shadow-md" style={{ backgroundColor: ACCENT }}>Save Changes</button>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {/* header row */}
          <div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Gender</div>
            <div className="col-span-3">Ministry</div>
            <div className="col-span-1 text-right">Attendance</div>
          </div>

          {pageItems.map(member => (
            <div key={member.id} className="bg-white rounded-xl shadow-md py-4 px-6 grid grid-cols-12 items-center gap-4" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
              <div className="col-span-6 text-gray-800 font-medium">{member.name}</div>
              <div className="col-span-2 text-gray-600">{member.gender}</div>
              <div className="col-span-3">
                <span className="inline-block bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full">{member.ministry}</span>
              </div>
              <div className="col-span-1 text-right">
                <input
                  type="checkbox"
                  checked={member.present}
                  onChange={() => {
                    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, present: !m.present } : m))
                  }}
                  className="w-5 h-5 rounded border-gray-300"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center py-6">
            <nav className="inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
              <button className="p-2 rounded hover:bg-gray-100" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
              {Array.from({ length: pageCount }).map((_, idx) => {
                const num = idx + 1
                const active = num === page
                return (
                  <button key={num} onClick={() => setPage(num)} className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${active ? 'bg-[#FDB54A] text-white' : 'text-gray-600 hover:bg-gray-100'}`} style={{ backgroundColor: active ? ACCENT : undefined }}>{num}</button>
                )
              })}
              <button className="p-2 rounded hover:bg-gray-100" disabled={page === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))}><ChevronRight className="w-4 h-4 text-gray-600" /></button>
            </nav>
          </div>
        </div>
      </div>
    </main>
  )
}
