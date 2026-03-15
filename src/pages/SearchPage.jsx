import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, MapPin, Package, AlertTriangle, Star, ChevronDown, ChevronUp, Image } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBadge from '../components/StatusBadge'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'

function SearchResultCard({ box }) {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const room = rooms.find(r => r.id === box.destination_room_id)
  const [expanded, setExpanded] = useState(false)
  const hasPhotos = box.photo_urls && box.photo_urls.length > 0
  const hasContents = box.manual_contents || box.ai_summary

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`bg-white dark:bg-slate-800/50 rounded-xl border overflow-hidden ${
        box.is_priority ? 'border-yellow-400 dark:border-yellow-500/40' : 'border-slate-200 dark:border-slate-700/50'
      }`}
    >
      {/* Main row */}
      <div
        className="p-3 flex items-center gap-3 cursor-pointer active:bg-slate-50 dark:active:bg-slate-700/30"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Thumbnail or icon */}
        {hasPhotos ? (
          <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden">
            <img src={box.photo_urls[0]} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-slate-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-white">#{box.box_number}</span>
            {box.label && (
              <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{box.label}</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusBadge status={box.status} />
            {room && (
              <span className="flex items-center gap-0.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3" />
                {room.name}
              </span>
            )}
          </div>
          {hasContents && !expanded && (
            <p className="text-xs text-slate-400 mt-1 truncate">
              {box.manual_contents || box.ai_summary}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {box.is_fragile && <AlertTriangle className="w-4 h-4 text-red-500" />}
          {box.is_priority && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          {hasPhotos && <Image className="w-3.5 h-3.5 text-blue-400" />}
          {(hasContents || hasPhotos) && (
            expanded
              ? <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
              : <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2 border-t border-slate-100 dark:border-slate-700/50 pt-2">
              {/* Photos row */}
              {hasPhotos && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {box.photo_urls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Box #${box.box_number} photo ${i + 1}`}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* Contents */}
              {box.ai_summary && (
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2">
                  <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">AI: </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{box.ai_summary}</span>
                </div>
              )}
              {box.manual_contents && (
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2">
                  <span className="text-xs font-medium text-slate-400">Contents: </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{box.manual_contents}</span>
                </div>
              )}
              {box.handling_notes && (
                <div className="text-xs text-slate-400">
                  <span className="font-medium">Notes: </span>{box.handling_notes}
                </div>
              )}

              {/* View full detail link */}
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/boxes/${box.id}`) }}
                className="text-xs text-blue-500 font-medium"
              >
                View full details →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    if (!query.trim()) return []
    return store.searchBoxes(query.trim())
  }, [query])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800 dark:text-white">Search</h1>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by room, contents, label, box #..."
          className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-3 bg-white dark:bg-slate-800 dark:text-white"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {query.trim() && (
        <p className="text-sm text-slate-400">
          {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="space-y-2">
        <AnimatePresence>
          {results.map(box => (
            <SearchResultCard key={box.id} box={box} />
          ))}
        </AnimatePresence>
      </div>

      {query.trim() && results.length === 0 && (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-slate-400 text-sm">No boxes match "{query}"</p>
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-12">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-slate-400 text-sm">
            Search by room name, contents, labels, or box number
          </p>
        </div>
      )}
    </div>
  )
}
