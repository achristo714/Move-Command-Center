import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Check, Trash2, ClipboardList, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../hooks/useStore'
import store from '../lib/store'

const CATEGORIES = [
  { value: 'before_move', label: 'Before Move', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  { value: 'address', label: 'Address Updates', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  { value: 'utilities', label: 'Utilities & Services', color: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
  { value: 'new_home', label: 'New Home Setup', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  { value: 'kids', label: 'Kids', color: 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400' },
  { value: 'vehicles', label: 'Vehicles', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
]

const DEFAULT_ITEMS = [
  // Before move
  { text: 'Book movers / confirm moving date', category: 'before_move' },
  { text: 'Get moving insurance / check homeowners policy', category: 'before_move' },
  { text: 'Declutter & donate what we don\'t need', category: 'before_move' },
  { text: 'Start using up freezer & pantry food', category: 'before_move' },
  { text: 'Back up computers & important files', category: 'before_move' },
  { text: 'Take photos of electronics wiring before disconnecting', category: 'before_move' },
  { text: 'Return anything borrowed from neighbors/friends', category: 'before_move' },
  { text: 'Refill prescriptions so we\'re stocked through the move', category: 'before_move' },

  // Address updates
  { text: 'USPS mail forwarding', category: 'address' },
  { text: 'Update address with bank / credit cards', category: 'address' },
  { text: 'Update address with DMV / driver\'s license', category: 'address' },
  { text: 'Update address with car insurance', category: 'address' },
  { text: 'Update address with health insurance', category: 'address' },
  { text: 'Update address with employer / payroll', category: 'address' },
  { text: 'Update address with Amazon, subscriptions, etc.', category: 'address' },
  { text: 'Update voter registration', category: 'address' },
  { text: 'Update address with doctors / dentist / pediatrician', category: 'address' },
  { text: 'Update address with kids\' school / daycare', category: 'address' },
  { text: 'Notify friends & family of new address', category: 'address' },

  // Utilities & services
  { text: 'Set up electric at new place', category: 'utilities' },
  { text: 'Set up gas at new place', category: 'utilities' },
  { text: 'Set up water at new place', category: 'utilities' },
  { text: 'Set up internet / Wi-Fi', category: 'utilities' },
  { text: 'Cancel / transfer old electric', category: 'utilities' },
  { text: 'Cancel / transfer old gas', category: 'utilities' },
  { text: 'Cancel / transfer old water', category: 'utilities' },
  { text: 'Cancel / transfer old internet', category: 'utilities' },
  { text: 'Set up trash / recycling pickup', category: 'utilities' },
  { text: 'Transfer or get new home/renters insurance', category: 'utilities' },

  // New home setup
  { text: 'Get copies of all keys made', category: 'new_home' },
  { text: 'Change locks / rekey', category: 'new_home' },
  { text: 'Deep clean before moving in', category: 'new_home' },
  { text: 'Check smoke detectors & CO detectors', category: 'new_home' },
  { text: 'Check fire extinguisher', category: 'new_home' },
  { text: 'Install baby gates / childproof as needed', category: 'new_home' },
  { text: 'Figure out thermostat / HVAC', category: 'new_home' },
  { text: 'Get EV charger / car charger set up', category: 'new_home' },
  { text: 'Set up garage door opener', category: 'new_home' },
  { text: 'Install curtains / blinds for bedrooms', category: 'new_home' },
  { text: 'Get a plunger & basic cleaning supplies over there', category: 'new_home' },
  { text: 'Test all outlets and light switches', category: 'new_home' },
  { text: 'Locate water shutoff, breaker box, gas shutoff', category: 'new_home' },
  { text: 'Set up smart home stuff (doorbell, cameras, etc.)', category: 'new_home' },

  // Kids
  { text: 'Tour / register kids at new school if needed', category: 'kids' },
  { text: 'Transfer medical records to new pediatrician', category: 'kids' },
  { text: 'Find new daycare / babysitter if needed', category: 'kids' },
  { text: 'Scope out nearby parks and playgrounds', category: 'kids' },
  { text: 'Set up kids\' rooms first so they feel settled', category: 'kids' },

  // Vehicles
  { text: 'Update vehicle registration if changing counties', category: 'vehicles' },
  { text: 'Get new parking permits if needed', category: 'vehicles' },
  { text: 'Update EZ-Pass / toll account address', category: 'vehicles' },
  { text: 'Find new mechanic / tire shop nearby', category: 'vehicles' },
]

export default function MoveChecklist() {
  const navigate = useNavigate()
  useStore()
  const checklist = store.getMoveChecklist()
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('before_move')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showDone, setShowDone] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // Seed defaults on first visit (batch to avoid animation churn)
  const [seeded, setSeeded] = useState(false)
  useEffect(() => {
    if (checklist.length === 0 && !seeded) {
      setSeeded(true)
      DEFAULT_ITEMS.forEach((item) => {
        store.addChecklistItem(item.text, item.category)
      })
    }
  }, []) // eslint-disable-line

  const handleAdd = () => {
    if (!newText.trim()) return
    store.addChecklistItem(newText.trim(), newCategory)
    setNewText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const filtered = checklist.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false
    if (!showDone && item.is_done) return false
    return true
  })

  // Group by category
  const grouped = {}
  CATEGORIES.forEach(c => { grouped[c.value] = [] })
  filtered.forEach(item => {
    if (grouped[item.category]) grouped[item.category].push(item)
    else {
      if (!grouped['general']) grouped['general'] = []
      grouped['general'].push(item)
    }
  })

  const totalItems = checklist.length
  const doneItems = checklist.filter(i => i.is_done).length
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Move-In Checklist</h1>
          <p className="text-xs text-slate-400">{doneItems} of {totalItems} done</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{pct}% complete</span>
          <span className="text-xs text-slate-400">{totalItems - doneItems} remaining</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Add new item */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a to-do..."
            className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setNewCategory(c.value)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                newCategory === c.value
                  ? c.color + ' ring-2 ring-offset-1 ring-blue-300 dark:ring-blue-500/50 dark:ring-offset-slate-800'
                  : 'bg-slate-100 dark:bg-slate-700/30 text-slate-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1 flex-1 min-w-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              filterCategory === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-400'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setFilterCategory(c.value)}
              className={`text-xs font-medium py-1.5 px-2 rounded-md transition-colors truncate ${
                filterCategory === c.value
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              {c.label.split(' ')[0]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowDone(!showDone)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex-shrink-0 ${
            showDone
              ? 'border-slate-200 dark:border-slate-700 text-slate-400'
              : 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
          }`}
        >
          {showDone ? 'Hide done' : 'Show done'}
        </button>
      </div>

      {/* Grouped checklist */}
      {CATEGORIES.map(cat => {
        const items = grouped[cat.value]
        if (!items || items.length === 0) return null
        if (filterCategory !== 'all' && filterCategory !== cat.value) return null

        const catDone = items.filter(i => i.is_done).length

        return (
          <div key={cat.value} className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
                <span className="text-xs text-slate-400">{catDone}/{items.length}</span>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -80 }}
                  className={`bg-white dark:bg-slate-800/50 rounded-lg border p-3 flex items-center gap-3 ${
                    item.is_done
                      ? 'border-green-200 dark:border-green-500/20'
                      : 'border-slate-200 dark:border-slate-700/50'
                  }`}
                >
                  <button
                    onClick={() => store.toggleChecklistItem(item.id)}
                    className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      item.is_done
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {item.is_done && <Check className="w-3 h-3 text-white" />}
                  </button>

                  {editingId === item.id ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={() => {
                        if (editText.trim() && editText.trim() !== item.text) {
                          store.updateChecklistItem(item.id, { text: editText.trim() })
                        }
                        setEditingId(null)
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') e.target.blur()
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="flex-1 text-sm border border-blue-300 dark:border-blue-500 rounded px-2 py-0.5 bg-white dark:bg-slate-800 dark:text-white outline-none"
                    />
                  ) : (
                    <span
                      onClick={() => { setEditingId(item.id); setEditText(item.text) }}
                      className={`flex-1 text-sm cursor-pointer ${
                        item.is_done
                          ? 'text-slate-400 line-through'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {item.text}
                    </span>
                  )}

                  <button
                    onClick={() => store.removeChecklistItem(item.id)}
                    className="p-1 text-slate-300 hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">
            {checklist.length > 0 ? 'All done! Nothing to show.' : 'No items yet — add one above'}
          </p>
        </div>
      )}
    </div>
  )
}
