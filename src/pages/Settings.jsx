import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Download, RotateCcw, MapPin, Calculator, Moon, Sun, Pencil, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRooms } from '../hooks/useStore'
import { useTheme } from '../hooks/useTheme'
import store from '../lib/store'

export default function Settings() {
  const navigate = useNavigate()
  const { rooms, addRoom, removeRoom, renameRoom } = useRooms()
  const { dark, toggle } = useTheme()
  const [newRoom, setNewRoom] = useState('')
  const [editingRoom, setEditingRoom] = useState(null)
  const [editName, setEditName] = useState('')

  const handleAddRoom = (e) => { e.preventDefault(); if (!newRoom.trim()) return; addRoom(newRoom.trim()); setNewRoom('') }

  const handleExportCSV = () => {
    const boxes = store.getBoxes()
    const header = 'Box #,Label,Room,Status,Fragile,Priority,Contents,Handling Notes,Created'
    const rows = boxes.map(b => {
      const room = rooms.find(r => r.id === b.destination_room_id)
      return [b.box_number, `"${b.label || ''}"`, `"${room?.name || ''}"`, b.status, b.is_fragile, b.is_priority, `"${(b.manual_contents || b.ai_summary || '').replace(/"/g, '""')}"`, `"${(b.handling_notes || '').replace(/"/g, '""')}"`, b.created_at].join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `move-inventory-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (confirm('Reset all data? This will delete all boxes, tasks, and settings. This cannot be undone.')) { store.reset(); navigate('/') }
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h1>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {dark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
            <span className="font-semibold text-slate-800 dark:text-white">Appearance</span>
          </div>
          <button onClick={toggle} className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-blue-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">{dark ? 'Dark mode' : 'Light mode'}</p>
      </div>

      {/* Rooms */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" />Manage Rooms</h2>
        <div className="space-y-1 mb-3">
          {rooms.map(room => {
            const boxCount = store.getBoxes().filter(b => b.destination_room_id === room.id).length
            const isEditing = editingRoom === room.id
            return (
              <div key={room.id} className="flex items-center justify-between py-1.5 gap-2">
                {isEditing ? (
                  <form onSubmit={(e) => { e.preventDefault(); renameRoom(room.id, editName); setEditingRoom(null) }} className="flex-1 flex items-center gap-1">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 text-sm border border-blue-400 dark:border-blue-500 rounded px-2 py-1 bg-white dark:bg-slate-800 dark:text-white" autoFocus />
                    <button type="submit" className="text-green-500"><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={() => setEditingRoom(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                  </form>
                ) : (
                  <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{room.name}</span>
                )}
                {!isEditing && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{boxCount} boxes</span>
                    <button onClick={() => { setEditingRoom(room.id); setEditName(room.name) }} className="text-slate-300 hover:text-blue-400"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (boxCount > 0) { alert(`Can't remove "${room.name}" — it has ${boxCount} boxes assigned.`); return }; removeRoom(room.id) }} className="text-slate-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <form onSubmit={handleAddRoom} className="flex gap-2">
          <input type="text" value={newRoom} onChange={e => setNewRoom(e.target.value)} placeholder="Add a room..." className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          <button type="submit" className="bg-blue-500 text-white rounded-lg px-3 py-2"><Plus className="w-4 h-4" /></button>
        </form>
      </div>

      {/* Estimates */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><Calculator className="w-4 h-4 text-purple-500" />Box Count Estimates</h2>
        <p className="text-xs text-slate-400 mb-3">Estimate how many boxes each room will need</p>
        <div className="space-y-2">
          {rooms.map(room => {
            const actual = store.getBoxes().filter(b => b.destination_room_id === room.id).length
            const estimate = store.getRoomEstimate(room.id)
            return (
              <div key={room.id} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{room.name}</span>
                <span className="text-xs text-slate-400">{actual} actual</span>
                <input type="number" min="0" value={estimate || ''} onChange={e => store.setRoomEstimate(room.id, parseInt(e.target.value) || 0)} placeholder="est." className="w-16 text-sm border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-center bg-white dark:bg-slate-800 dark:text-white" />
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Quick Links</h2>
        {[{ to: '/labels', label: 'Print QR Labels' }, { to: '/print/movers', label: 'Mover Instructions' }, { to: '/essentials', label: 'Essentials Checklist' }, { to: '/unpack', label: 'Unpacking Queue' }].map(l => (
          <button key={l.to} onClick={() => navigate(l.to)} className="w-full text-left text-sm text-blue-500 py-1">{l.label} →</button>
        ))}
      </div>

      {/* Export / Reset */}
      <div className="space-y-2">
        <button onClick={handleExportCSV} className="w-full bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 flex items-center gap-3 active:bg-slate-50 dark:active:bg-slate-700/30">
          <Download className="w-5 h-5 text-green-500" />
          <div className="text-left"><div className="font-medium text-sm text-slate-800 dark:text-white">Export to CSV</div><div className="text-xs text-slate-400">Download full inventory</div></div>
        </button>
        <button onClick={handleReset} className="w-full bg-white dark:bg-slate-800/50 rounded-xl border border-red-200 dark:border-red-500/20 p-4 flex items-center gap-3 active:bg-red-50 dark:active:bg-red-500/5">
          <RotateCcw className="w-5 h-5 text-red-500" />
          <div className="text-left"><div className="font-medium text-sm text-red-600 dark:text-red-400">Reset All Data</div><div className="text-xs text-slate-400">Delete everything and start over</div></div>
        </button>
      </div>
    </div>
  )
}
