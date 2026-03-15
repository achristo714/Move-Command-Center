import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Filter, ArrowUpDown, CheckSquare, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import BoxCard from '../components/BoxCard'
import { useBoxes, useRooms } from '../hooks/useStore'
import { STATUS_OPTIONS } from '../lib/constants'

export default function BoxList() {
  const navigate = useNavigate()
  const { boxes, bulkUpdateStatus } = useBoxes()
  const { rooms } = useRooms()
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [flagFilter, setFlagFilter] = useState('')
  const [sortBy, setSortBy] = useState('number_desc')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState(new Set())

  let filtered = [...boxes]
  if (statusFilter) filtered = filtered.filter(b => b.status === statusFilter)
  if (roomFilter) filtered = filtered.filter(b => b.destination_room_id === roomFilter)
  if (flagFilter === 'fragile') filtered = filtered.filter(b => b.is_fragile)
  if (flagFilter === 'priority') filtered = filtered.filter(b => b.is_priority)

  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'number_asc': return a.box_number - b.box_number
      case 'number_desc': return b.box_number - a.box_number
      case 'date_desc': return new Date(b.updated_at) - new Date(a.updated_at)
      case 'room': return (a.destination_room_id || '').localeCompare(b.destination_room_id || '')
      default: return b.box_number - a.box_number
    }
  })

  const toggleSelect = (id) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const handleBulkStatus = (status) => {
    bulkUpdateStatus([...selected], status)
    setSelected(new Set())
    setSelectMode(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Boxes <span className="text-slate-400 font-normal text-base">({filtered.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectMode(!selectMode); setSelected(new Set()) }}
            className={`p-2 rounded-lg transition-colors ${selectMode ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'text-slate-400'}`}
          >
            <CheckSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 rounded-lg transition-colors ${filterOpen ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'text-slate-400'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/boxes/new')}
            className="bg-blue-500 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center gap-1 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Box
          </button>
        </div>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-3 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Status</label>
              <div className="flex flex-wrap gap-1">
                <FilterChip active={!statusFilter} onClick={() => setStatusFilter('')}>All</FilterChip>
                {STATUS_OPTIONS.map(s => (
                  <FilterChip key={s.value} active={statusFilter === s.value} onClick={() => setStatusFilter(s.value)}>
                    {s.label}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Room</label>
              <select value={roomFilter} onChange={e => setRoomFilter(e.target.value)} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
                <option value="">All rooms</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Flags</label>
              <div className="flex gap-1">
                <FilterChip active={!flagFilter} onClick={() => setFlagFilter('')}>All</FilterChip>
                <FilterChip active={flagFilter === 'fragile'} onClick={() => setFlagFilter('fragile')}>Fragile</FilterChip>
                <FilterChip active={flagFilter === 'priority'} onClick={() => setFlagFilter('priority')}>Priority</FilterChip>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Sort by</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
                <option value="number_desc">Newest first</option>
                <option value="number_asc">Oldest first</option>
                <option value="date_desc">Recently updated</option>
                <option value="room">By room</option>
              </select>
            </div>
          </div>
        )}
      </AnimatePresence>

      {selectMode && selected.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">{selected.size} selected</span>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(s => (
              <button key={s.value} onClick={() => handleBulkStatus(s.value)} className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: s.value === 'packed' ? '#3b82f6' : s.value === 'loaded' ? '#f97316' : s.value === 'in_storage' ? '#8b5cf6' : s.value === 'delivered' ? '#f59e0b' : '#22c55e' }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map(box => (
            <BoxCard key={box.id} box={box} selectable={selectMode} selected={selected.has(box.id)} onSelect={toggleSelect} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-medium text-slate-600 dark:text-slate-300">No boxes yet</h3>
          <p className="text-sm text-slate-400 mt-1">Let's get packing!</p>
          <button onClick={() => navigate('/boxes/new')} className="mt-4 bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium">
            Add your first box
          </button>
        </div>
      )}
    </div>
  )
}

function FilterChip({ children, active, onClick }) {
  return (
    <button onClick={onClick} className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${active ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 active:bg-slate-200'}`}>
      {children}
    </button>
  )
}
