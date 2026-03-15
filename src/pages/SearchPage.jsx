import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import BoxCard from '../components/BoxCard'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const { rooms } = useRooms()

  const results = useMemo(() => {
    if (!query.trim()) return []
    return store.searchBoxes(query.trim())
  }, [query])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Search</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Where did we pack the...?"
          className="w-full text-sm border border-slate-200 rounded-xl pl-10 pr-10 py-3 bg-white"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
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
            <BoxCard key={box.id} box={box} showAdvance={false} />
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
          <p className="text-slate-400 text-sm">Search across all box contents, labels, and notes</p>
        </div>
      )}
    </div>
  )
}
