import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Download, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import AttendanceSheetInput from '../components/AttendanceSheetInput'

const ACCENT = '#FDB54A'

const mockData = Array.from({ length: 24 }).map((_, i) => ({
	id: i + 1,
	title: 'Bible Study',
	date: new Date(2025, 9, 2 + (i % 10)),
}))

function formatDate(d) {
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const dd = String(d.getDate()).padStart(2, '0')
	const yyyy = d.getFullYear()
	return `${mm}/${dd}/${yyyy}`
}

export default function AttendanceSheetPage() {
	const [showModal, setShowModal] = useState(false)
    const navigate = useNavigate()

	const [query, setQuery] = useState('')
	const [page, setPage] = useState(1)
	const pageSize = 8

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return mockData
		return mockData.filter(item => item.title.toLowerCase().includes(q) || formatDate(item.date).includes(q))
	}, [query])

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

					{/* Controls - placed below the header */}
					<div className="mt-4 flex items-center gap-3">
						<button
							type="button"
							className="flex items-center justify-center h-10 px-3 bg-[#FDB54A] text-white rounded-lg shadow-sm hover:opacity-95"
							onClick={() => setShowModal(true)}
							style={{ backgroundColor: ACCENT }}
						>
							<Plus className="w-4 h-4 text-white" />
						</button>

						<div className="flex items-center bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
							<div className="pl-3 pr-2">
								<Search className="w-4 h-4 text-gray-400" />
							</div>
							<input
								value={query}
								onChange={e => { setQuery(e.target.value); setPage(1) }}
								placeholder="Search..."
								className="w-80 md:w-96 py-2 px-2 outline-none text-sm text-gray-700"
							/>
							<button
								onClick={() => { /* perform search - currently filter is live */ }}
								className="bg-[#FDB54A] text-white px-4 py-2 text-sm font-medium"
								style={{ backgroundColor: ACCENT }}
							>
								Search
							</button>
						</div>
					</div>

					{/* Attendance create modal */}
					<AttendanceSheetInput open={showModal} onClose={() => setShowModal(false)} onCreate={(data) => { console.info('create', data); setShowModal(false) }} />
				</div>

				<div className="grid gap-4">
					{/* Header row for the list */}
					<div className="grid grid-cols-12 gap-4 text-sm text-gray-500 px-2">
						<div className="col-span-6">Title</div>
						<div className="col-span-3">Date</div>
						<div className="col-span-3 text-right">Command</div>
					</div>

					{/* List items */}
					{pageItems.map(item => (
						<div
							key={item.id}
							className="bg-white rounded-xl shadow-md py-4 px-6 grid grid-cols-12 items-center gap-4"
							style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
						>
							<div className="col-span-6 text-gray-700 font-medium">{item.title}</div>
							<div className="col-span-3 text-gray-600">{formatDate(item.date)}</div>
							<div className="col-span-3 text-right flex items-center justify-end gap-4">
								<button title="Download" onClick={() => console.info('download', item.id)} className="p-2 rounded-lg hover:bg-gray-50">
									<Download className="w-4 h-4 text-[#FDB54A]" />
								</button>
								<button
									title="Open tracker"
									onClick={() => navigate('/attendance/tracker', { state: { attendanceId: item.id } })}
									className="p-2 rounded-lg hover:bg-gray-50"
								>
									<Edit2 className="w-4 h-4 text-[#FDB54A]" />
								</button>
								<button title="Delete" onClick={() => console.info('delete', item.id)} className="p-2 rounded-lg hover:bg-gray-50">
									<Trash2 className="w-4 h-4 text-red-400" />
								</button>
							</div>
						</div>
					))}

					{/* Pagination */}
					<div className="flex items-center justify-center py-6">
						<nav className="inline-flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
							<button
								className="p-2 rounded hover:bg-gray-100"
								disabled={page === 1}
								onClick={() => setPage(p => Math.max(1, p - 1))}
							>
								<ChevronLeft className="w-4 h-4 text-gray-600" />
							</button>

							{Array.from({ length: pageCount }).map((_, idx) => {
								const num = idx + 1
								const active = num === page
								return (
									<button
										key={num}
										onClick={() => setPage(num)}
										className={`w-8 h-8 rounded-md text-sm flex items-center justify-center ${active ? 'bg-[#FDB54A] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
										style={{ backgroundColor: active ? ACCENT : undefined }}
									>
										{num}
									</button>
								)
							})}

							<button
								className="p-2 rounded hover:bg-gray-100"
								disabled={page === pageCount}
								onClick={() => setPage(p => Math.min(pageCount, p + 1))}
							>
								<ChevronRight className="w-4 h-4 text-gray-600" />
							</button>
						</nav>
					</div>
				</div>
			</div>
		</main>
	)
}
