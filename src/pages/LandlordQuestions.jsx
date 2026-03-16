import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Check, MessageCircle, Edit3, Trash2, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../hooks/useStore'
import store from '../lib/store'

const DEFAULT_CATEGORIES = [
  { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  { value: 'repairs', label: 'Repairs', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  { value: 'rules', label: 'Rules / Policy', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
  { value: 'utilities', label: 'Utilities', color: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' },
]

const CUSTOM_COLORS = [
  'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
  'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
]

function getCategories(questions) {
  const cats = [...DEFAULT_CATEGORIES]
  const known = new Set(cats.map(c => c.value))
  // Discover custom categories from existing questions
  questions.forEach(q => {
    if (q.category && !known.has(q.category)) {
      known.add(q.category)
      const colorIdx = (cats.length - DEFAULT_CATEGORIES.length) % CUSTOM_COLORS.length
      cats.push({ value: q.category, label: q.category, color: CUSTOM_COLORS[colorIdx] })
    }
  })
  return cats
}

export default function LandlordQuestions() {
  const navigate = useNavigate()
  useStore() // subscribe to updates
  const questions = store.getLandlordQuestions()
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'open' | 'answered'
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const CATEGORIES = getCategories(questions)

  const handleAdd = () => {
    if (!newText.trim()) return
    store.addLandlordQuestion(newText.trim(), newCategory)
    setNewText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  const handleAddCategory = () => {
    const name = newCategoryName.trim()
    if (!name) return
    const value = name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    if (!CATEGORIES.find(c => c.value === value)) {
      // Category will be auto-discovered from the question data
    }
    setNewCategory(value)
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const startEdit = (q) => {
    setEditingId(q.id)
    setEditText(q.text)
    setEditAnswer(q.answer || '')
    setEditCategory(q.category)
  }

  const saveEdit = () => {
    if (editingId) {
      store.updateLandlordQuestion(editingId, { text: editText, answer: editAnswer, category: editCategory })
      setEditingId(null)
    }
  }

  const filtered = questions.filter(q => {
    if (filter === 'open') return !q.is_answered
    if (filter === 'answered') return q.is_answered
    return true
  })

  const openCount = questions.filter(q => !q.is_answered).length
  const answeredCount = questions.filter(q => q.is_answered).length

  // For the "new category" input, figure out the value from the name
  const pendingCategoryValue = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_')
  const allCatsForNew = CATEGORIES.find(c => c.value === pendingCategoryValue)
    ? CATEGORIES
    : newCategoryName.trim()
      ? [...CATEGORIES, { value: pendingCategoryValue, label: newCategoryName.trim(), color: CUSTOM_COLORS[CATEGORIES.length % CUSTOM_COLORS.length] }]
      : CATEGORIES

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Landlord Questions</h1>
          <p className="text-xs text-slate-400">{openCount} open · {answeredCount} answered</p>
        </div>
      </div>

      {/* Add new question */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 space-y-3 card-hatch">
        <div className="flex gap-2">
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a question, request, or note..."
            rows={2}
            className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="self-end px-3 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
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
          {showNewCategory ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddCategory()
                  if (e.key === 'Escape') { setShowNewCategory(false); setNewCategoryName('') }
                }}
                placeholder="Category name..."
                className="text-xs border border-blue-300 dark:border-blue-500 rounded-full px-2.5 py-1 bg-white dark:bg-slate-800 dark:text-white outline-none w-28"
              />
              <button onClick={handleAddCategory} className="text-xs text-blue-500 font-medium px-1">Add</button>
              <button onClick={() => { setShowNewCategory(false); setNewCategoryName('') }} className="text-xs text-slate-400 px-1">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCategory(true)}
              className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-700/30 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-dashed border-slate-300 dark:border-slate-600"
            >
              + New
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg p-1">
        {[
          { key: 'all', label: `All (${questions.length})` },
          { key: 'open', label: `Open (${openCount})` },
          { key: 'answered', label: `Done (${answeredCount})` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              filter === f.key
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.map(q => {
            const cat = CATEGORIES.find(c => c.value === q.category) || CATEGORIES[0]
            const isEditing = editingId === q.id

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`bg-white dark:bg-slate-800/50 rounded-xl border p-3 ${
                  q.is_answered
                    ? 'border-green-200 dark:border-green-500/20'
                    : 'border-slate-200 dark:border-slate-700/50'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={2}
                      className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white resize-none"
                    />
                    <textarea
                      value={editAnswer}
                      onChange={e => setEditAnswer(e.target.value)}
                      rows={2}
                      placeholder="Landlord's answer or notes..."
                      className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-green-50 dark:bg-green-500/5 dark:text-white resize-none"
                    />
                    {/* Category picker in edit mode */}
                    <div className="flex gap-1.5 flex-wrap items-center">
                      <Tag className="w-3 h-3 text-slate-400" />
                      {CATEGORIES.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setEditCategory(c.value)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium transition-all ${
                            editCategory === c.value
                              ? c.color + ' ring-2 ring-offset-1 ring-blue-300 dark:ring-blue-500/50 dark:ring-offset-slate-800'
                              : 'bg-slate-100 dark:bg-slate-700/30 text-slate-400'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="text-xs text-slate-400 px-2 py-1">Cancel</button>
                      <button onClick={saveEdit} className="text-xs text-blue-500 font-medium px-2 py-1">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => store.toggleLandlordQuestion(q.id)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        q.is_answered
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {q.is_answered && <Check className="w-3 h-3 text-white" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${q.is_answered ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                        {q.text}
                      </p>
                      {q.answer && (
                        <div className="mt-1.5 bg-green-50 dark:bg-green-500/10 rounded-lg p-2">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Answer: </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300">{q.answer}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.color}`}>
                          {cat.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(q)} className="p-1 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => store.removeLandlordQuestion(q.id)} className="p-1 text-slate-300 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && questions.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-400">No {filter === 'open' ? 'open' : 'answered'} questions</p>
        </div>
      )}

      {questions.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400">No questions yet — add one above</p>
        </div>
      )}
    </div>
  )
}
