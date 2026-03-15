import { useNavigate } from 'react-router-dom'
import { MapPin, Package, AlertTriangle, Star, CheckCircle2, ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRooms } from '../hooks/useStore'
import { getStatusColor } from '../lib/constants'
import store from '../lib/store'

export default function RoomDashboard() {
  const navigate = useNavigate()
  const { rooms } = useRooms()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Rooms</h1>

      <div className="space-y-3">
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

          return (
            <motion.button
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/rooms/${room.id}`)}
              className={`w-full bg-white rounded-xl border p-4 text-left active:scale-[0.98] transition-transform ${
                allUnpacked ? 'border-green-300 bg-green-50/50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold text-slate-800">{room.name}</span>
                  {allUnpacked && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </div>
                <span className="text-sm text-slate-400">
                  {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
                  {estimate > 0 && <span className="text-slate-300"> / ~{estimate} est.</span>}
                </span>
              </div>

              {/* Status mini-bar */}
              {boxes.length > 0 && (
                <div className="flex h-2 rounded-full overflow-hidden mb-2">
                  {['packed', 'loaded', 'in_storage', 'delivered', 'unpacked'].map(s => {
                    const count = byStatus[s] || 0
                    if (count === 0) return null
                    return (
                      <div
                        key={s}
                        style={{
                          width: `${(count / boxes.length) * 100}%`,
                          backgroundColor: getStatusColor(s),
                        }}
                      />
                    )
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
                  {fragile > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="w-3 h-3" /> {fragile} fragile
                    </span>
                  )}
                  {priority > 0 && (
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-current" /> {priority} priority
                    </span>
                  )}
                  {pendingTasks > 0 && (
                    <span className="flex items-center gap-1 text-blue-500">
                      <ClipboardList className="w-3 h-3" /> {pendingTasks} tasks
                    </span>
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
