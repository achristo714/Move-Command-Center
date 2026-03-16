import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, AlertTriangle, Star, CheckCircle2, ClipboardList, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRooms } from '../hooks/useStore'
import { getStatusColor } from '../lib/constants'
import store from '../lib/store'

export default function RoomDashboard() {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')

  const startEdit = (room, e) => {
    e.stopPropagation()
    setEditingId(room.id)
    setEditName(room.name)
  }

  const saveEdit = (e) => {
    e?.stopPropagation()
    if (editName.trim() && editingId) {
      store.renameRoom(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    const boxes = store.getBoxes().filter(b => b.destination_room_id === id)
    if (boxes.length > 0) {
      if (!confirm(`This room has ${boxes.length} box(es). Boxes will become unassigned. Delete?`)) return
    }
    store.removeRoom(id)
  }

  const handleAdd = () => {
    if (!newName.trim()) return
    store.addRoom(newName.trim())
    setNewName('')
    setShowAdd(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Rooms</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl bg-[#d4e4d9] text-[#4a7c5c] dark:bg-indigo-500/10 dark:text-indigo-400 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Add room input */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-3 flex gap-2">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false) }}
                placeholder="Room name..."
                className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
              />
              <button onClick={handleAdd} disabled={!newName.trim()} className="px-3 py-2 bg-[#9bb8a4] text-white rounded-lg disabled:opacity-40 text-sm font-medium">
                Add
              </button>
              <button onClick={() => { setShowAdd(false); setNewName('') }} className="px-2 py-2 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 gap-3">
        {rooms.map((room, i) => {
          const boxes = store.getBoxes().filter(b => b.destination_room_id === room.id)
          const byStatus = {}
          boxes.forEach(b => { byStatus[b.status] = (byStatus[b.status] || 0) + 1 })
          const fragile = boxes.filter(b => b.is_fragile).length
          const priority = boxes.filter(b => b.is_priority).length
          const allUnpacked = boxes.length > 0 && boxes.every(b => b.status === 'unpacked')
          const estimate = store.getRoomEstimate(room.id)
          const tasks = store.getRoomTasks(room.id)
          const pendingTasks = tasks.filter(t => !t.is_done).length
          const isEditing = editingId === room.id

          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => !isEditing && navigate(`/rooms/${room.id}`)}
              className={`w-full bg-white dark:bg-slate-800/50 rounded-xl border p-4 text-left cursor-pointer active:scale-[0.98] transition-transform ${allUnpacked ? 'border-green-300 dark:border-green-500/30 bg-green-50/50 dark:bg-green-500/5' : 'border-slate-200 dark:border-slate-700/50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 text-sm font-semibold border border-blue-300 dark:border-blue-500 rounded px-2 py-0.5 bg-white dark:bg-slate-800 dark:text-white outline-none"
                    />
                  ) : (
                    <span className="font-semibold text-slate-800 dark:text-white truncate">{room.name}</span>
                  )}
                  {allUnpacked && !isEditing && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} className="p-1 text-green-500 hover:text-green-600">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null) }} className="p-1 text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => startEdit(room, e)} className="p-1 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => handleDelete(room.id, e)} className="p-1 text-slate-300 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  <span className="text-sm text-slate-400 ml-1">
                    {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
                    {estimate > 0 && <span className="text-slate-300 dark:text-slate-500"> / ~{estimate}</span>}
                  </span>
                </div>
              </div>
              {boxes.length > 0 && (
                <div className="flex h-2 rounded-full overflow-hidden mb-2">
                  {['packed', 'loaded', 'in_storage', 'delivered', 'unpacked'].map(s => {
                    const count = byStatus[s] || 0
                    if (count === 0) return null
                    return <div key={s} style={{ width: `${(count / boxes.length) * 100}%`, backgroundColor: getStatusColor(s) }} />
                  })}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-400">
                {Object.entries(byStatus).map(([status, count]) => (
                  <span key={status} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(status) }} />
                    {count} {status.replace('_', ' ')}
                  </span>
                ))}
              </div>
              {(fragile > 0 || priority > 0 || pendingTasks > 0) && (
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {fragile > 0 && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3" /> {fragile} fragile</span>}
                  {priority > 0 && <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3 h-3 fill-current" /> {priority} priority</span>}
                  {pendingTasks > 0 && <span className="flex items-center gap-1 text-blue-500"><ClipboardList className="w-3 h-3" /> {pendingTasks} tasks</span>}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
