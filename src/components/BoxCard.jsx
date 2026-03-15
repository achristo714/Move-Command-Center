import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, Star, ChevronRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import StatusBadge from './StatusBadge'
import { getNextStatuses, getStatusLabel } from '../lib/constants'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'

export default function BoxCard({ box, showAdvance = true, selectable = false, selected = false, onSelect }) {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const room = rooms.find(r => r.id === box.destination_room_id)
  const nextStatuses = getNextStatuses(box.status)

  const handleAdvance = (e) => {
    e.stopPropagation()
    store.advanceStatus(box.id)
  }

  const handleSelect = (e) => {
    e.stopPropagation()
    onSelect?.(box.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white rounded-xl border transition-all active:scale-[0.98] ${
        box.is_priority ? 'border-yellow-400 ring-1 ring-yellow-200' : 'border-slate-200'
      } ${selected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => navigate(`/boxes/${box.id}`)}
    >
      <div className="p-3 flex items-center gap-3">
        {selectable && (
          <button
            onClick={handleSelect}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              selected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
            }`}
          >
            {selected && <span className="text-white text-xs">✓</span>}
          </button>
        )}

        <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">#{box.box_number}</span>
            {box.label && (
              <span className="text-sm text-slate-500 truncate">{box.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={box.status} />
            {room && (
              <span className="text-xs text-slate-400 truncate">{room.name}</span>
            )}
          </div>
          {(box.ai_summary || box.manual_contents) && (
            <p className="text-xs text-slate-400 mt-1 truncate">
              {box.manual_contents || box.ai_summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {box.is_fragile && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          {box.is_priority && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          )}
          {showAdvance && nextStatuses.length > 0 ? (
            <button
              onClick={handleAdvance}
              className="ml-1 p-1.5 rounded-full bg-slate-100 active:bg-slate-200 transition-colors"
              title={`Mark as ${getStatusLabel(nextStatuses[0])}`}
            >
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
