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
      className={`bg-white dark:bg-gray-900/60 rounded-2xl border transition-all active:scale-[0.98] card-hatch ${
        box.is_priority
          ? 'border-[#e8c55a]/60 dark:border-yellow-500/40 ring-1 ring-[#f5ecd0] dark:ring-yellow-500/20'
          : 'border-[#e8ddd0]/60 dark:border-gray-800'
      } ${selected ? 'ring-2 ring-[#9bb8a4] dark:ring-indigo-500' : ''}`}
      onClick={() => navigate(`/boxes/${box.id}`)}
    >
      <div className="p-3 flex items-center gap-3">
        {selectable && (
          <button
            onClick={handleSelect}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              selected ? 'bg-[#9bb8a4] border-[#9bb8a4] dark:bg-indigo-500 dark:border-indigo-500' : 'border-[#d4c8ba] dark:border-gray-600'
            }`}
          >
            {selected && <span className="text-white text-xs">✓</span>}
          </button>
        )}

        <div className="flex-shrink-0 w-10 h-10 bg-[#f0ebe4] dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-[#8a7e72] dark:text-gray-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#3d3429] dark:text-white">#{box.box_number}</span>
            {box.label && (
              <span className="text-sm text-[#6b5f53] dark:text-gray-400 truncate">{box.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={box.status} />
            {room && (
              <span className="text-xs text-[#8a7e72] dark:text-gray-500 truncate">{room.name}</span>
            )}
          </div>
          {(box.ai_summary || box.manual_contents) && (
            <p className="text-xs text-[#8a7e72] dark:text-gray-500 mt-1 truncate">
              {box.manual_contents || box.ai_summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {box.is_fragile && (
            <AlertTriangle className="w-4 h-4 text-[#e8928a] dark:text-red-400" />
          )}
          {box.is_priority && (
            <Star className="w-4 h-4 text-[#d4a03a] dark:text-yellow-400 fill-[#f0d58c] dark:fill-yellow-400" />
          )}
          {showAdvance && nextStatuses.length > 0 ? (
            <button
              onClick={handleAdvance}
              className="ml-1 p-1.5 rounded-full bg-[#f0ebe4] dark:bg-gray-800 active:bg-[#e8ddd0] dark:active:bg-gray-700 transition-colors"
              title={`Mark as ${getStatusLabel(nextStatuses[0])}`}
            >
              <ArrowRight className="w-4 h-4 text-[#6b5f53] dark:text-gray-400" />
            </button>
          ) : (
            <ChevronRight className="w-4 h-4 text-[#d4c8ba] dark:text-gray-600 ml-1" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
