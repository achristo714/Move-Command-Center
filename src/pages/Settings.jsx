import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Download, RotateCcw, MapPin, Calculator } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'

export default function Settings() {
  const navigate = useNavigate()
  const { rooms, addRoom, removeRoom } = useRooms()
  const [newRoom, setNewRoom] = useState('')

  const handleAddRoom = (e) => {
    e.preventDefault()
    if (!newRoom.trim()) return
    addRoom(newRoom.trim())
    setNewRoom('')
  }

  const handleExportCSV = () => {
    const boxes = store.getBoxes()
    const header = 'Box #,Label,Room,Status,Fragile,Priority,Contents,Handling Notes,Created'
    const rows = boxes.map(b => {
      const room = rooms.find(r => r.id === b.destination_room_id)
      return [
        b.box_number,
        `"${b.label || ''}"`,
        `"${room?.name || ''}"`,
        b.status,
        b.is_fragile,
        b.is_priority,
        `"${(b.manual_contents || b.ai_summary || '').replace(/"/g, '""')}"`,
        `"${(b.handling_notes || '').replace(/"/g, '""')}"`,
        b.created_at,
      ].join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `move-inventory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    if (confirm('Reset all data? This will delete all boxes, tasks, and settings. This cannot be undone.')) {
      store.reset()
      navigate('/')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
      </div>

      {/* Rooms management */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          Manage Rooms
        </h2>
        <div className="space-y-1 mb-3">
          {rooms.map(room => {
            const boxCount = store.getBoxes().filter(b => b.destination_room_id === room.id).length
            return (
              <div key={room.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-slate-700">{room.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{boxCount} boxes</span>
                  <button
                    onClick={() => {
                      if (boxCount > 0) {
                        alert(`Can't remove "${room.name}" — it has ${boxCount} boxes assigned.`)
                        return
                      }
                      removeRoom(room.id)
                    }}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <form onSubmit={handleAddRoom} className="flex gap-2">
          <input
            type="text"
            value={newRoom}
            onChange={e => setNewRoom(e.target.value)}
            placeholder="Add a room..."
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2"
          />
          <button type="submit" className="bg-blue-500 text-white rounded-lg px-3 py-2">
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Box Count Estimates */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-purple-500" />
          Box Count Estimates
        </h2>
        <p className="text-xs text-slate-400 mb-3">Estimate how many boxes each room will need</p>
        <div className="space-y-2">
          {rooms.map(room => {
            const actual = store.getBoxes().filter(b => b.destination_room_id === room.id).length
            const estimate = store.getRoomEstimate(room.id)
            return (
              <div key={room.id} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 flex-1">{room.name}</span>
                <span className="text-xs text-slate-400">{actual} actual</span>
                <input
                  type="number"
                  min="0"
                  value={estimate || ''}
                  onChange={e => store.setRoomEstimate(room.id, parseInt(e.target.value) || 0)}
                  placeholder="est."
                  className="w-16 text-sm border border-slate-200 rounded px-2 py-1 text-center"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
        <h2 className="font-semibold text-slate-800 mb-2">Quick Links</h2>
        <button
          onClick={() => navigate('/labels')}
          className="w-full text-left text-sm text-blue-500 py-1"
        >
          Print QR Labels →
        </button>
        <button
          onClick={() => navigate('/print/movers')}
          className="w-full text-left text-sm text-blue-500 py-1"
        >
          Mover Instructions →
        </button>
        <button
          onClick={() => navigate('/essentials')}
          className="w-full text-left text-sm text-blue-500 py-1"
        >
          Essentials Checklist →
        </button>
        <button
          onClick={() => navigate('/unpack')}
          className="w-full text-left text-sm text-blue-500 py-1"
        >
          Unpacking Queue →
        </button>
      </div>

      {/* Export / Reset */}
      <div className="space-y-2">
        <button
          onClick={handleExportCSV}
          className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 active:bg-slate-50"
        >
          <Download className="w-5 h-5 text-green-500" />
          <div className="text-left">
            <div className="font-medium text-sm text-slate-800">Export to CSV</div>
            <div className="text-xs text-slate-400">Download full inventory</div>
          </div>
        </button>

        <button
          onClick={handleReset}
          className="w-full bg-white rounded-xl border border-red-200 p-4 flex items-center gap-3 active:bg-red-50"
        >
          <RotateCcw className="w-5 h-5 text-red-500" />
          <div className="text-left">
            <div className="font-medium text-sm text-red-600">Reset All Data</div>
            <div className="text-xs text-slate-400">Delete everything and start over</div>
          </div>
        </button>
      </div>
    </div>
  )
}
