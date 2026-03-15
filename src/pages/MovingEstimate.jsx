import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Truck, Package, Sofa, ChevronDown, ChevronUp, Copy, Wrench } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../hooks/useStore'
import store from '../lib/store'
import { BOX_SIZES } from '../lib/boxSizes'

const FURNITURE_SIZES = [
  { value: 'small', label: 'Small', desc: 'Nightstand, end table, small chair' },
  { value: 'medium', label: 'Medium', desc: 'Dresser, desk, dining table' },
  { value: 'large', label: 'Large', desc: 'Couch, bed frame, bookcase' },
  { value: 'xlarge', label: 'Extra Large', desc: 'Sectional, piano, armoire' },
]

export default function MovingEstimate() {
  const navigate = useNavigate()
  useStore()
  const boxes = store.getBoxes()
  const rooms = store.getRooms()
  const furniture = store.getFurniture()

  const [showAddFurniture, setShowAddFurniture] = useState(false)
  const [furnitureName, setFurnitureName] = useState('')
  const [furnitureRoom, setFurnitureRoom] = useState('')
  const [furnitureSize, setFurnitureSize] = useState('medium')
  const [furnitureDisassembly, setFurnitureDisassembly] = useState(false)
  const [furnitureNotes, setFurnitureNotes] = useState('')
  const [expandedRoom, setExpandedRoom] = useState(null)
  const [copied, setCopied] = useState(false)

  // Box counts by size
  const boxCounts = {}
  BOX_SIZES.forEach(s => { boxCounts[s.value] = 0 })
  boxes.forEach(b => {
    const size = b.box_size || 'medium'
    boxCounts[size] = (boxCounts[size] || 0) + 1
  })
  const totalBoxes = boxes.length

  // Boxes by room + size
  const boxesByRoom = {}
  boxes.forEach(b => {
    const roomId = b.destination_room_id || '_unassigned'
    if (!boxesByRoom[roomId]) boxesByRoom[roomId] = {}
    const size = b.box_size || 'medium'
    boxesByRoom[roomId][size] = (boxesByRoom[roomId][size] || 0) + 1
  })

  // Furniture by room
  const furnitureByRoom = {}
  furniture.forEach(f => {
    const roomId = f.room_id || '_unassigned'
    if (!furnitureByRoom[roomId]) furnitureByRoom[roomId] = []
    furnitureByRoom[roomId].push(f)
  })

  const getRoomName = (id) => {
    if (id === '_unassigned') return 'Unassigned'
    const room = rooms.find(r => r.id === id)
    return room ? room.name : 'Unknown Room'
  }

  // All room IDs that have boxes or furniture
  const allRoomIds = [...new Set([
    ...Object.keys(boxesByRoom),
    ...Object.keys(furnitureByRoom),
  ])].sort((a, b) => getRoomName(a).localeCompare(getRoomName(b)))

  const handleAddFurniture = () => {
    if (!furnitureName.trim()) return
    store.addFurniture(furnitureName.trim(), furnitureRoom || null, furnitureSize, furnitureDisassembly, furnitureNotes.trim())
    setFurnitureName('')
    setFurnitureRoom('')
    setFurnitureSize('medium')
    setFurnitureDisassembly(false)
    setFurnitureNotes('')
  }

  // Generate text summary for movers
  const generateSummary = () => {
    let lines = ['MOVING ESTIMATE', '═'.repeat(40), '']

    lines.push('BOX SUMMARY')
    lines.push('─'.repeat(20))
    BOX_SIZES.forEach(s => {
      if (boxCounts[s.value] > 0) {
        lines.push(`  ${s.label.padEnd(14)} ${String(boxCounts[s.value]).padStart(3)}    (${s.dimensions})`)
      }
    })
    lines.push(`  ${'TOTAL'.padEnd(14)} ${String(totalBoxes).padStart(3)}`)
    lines.push('')

    if (furniture.length > 0) {
      lines.push('FURNITURE & LARGE ITEMS')
      lines.push('─'.repeat(20))
      const grouped = {}
      furniture.forEach(f => {
        const rn = getRoomName(f.room_id || '_unassigned')
        if (!grouped[rn]) grouped[rn] = []
        grouped[rn].push(f)
      })
      Object.keys(grouped).sort().forEach(rn => {
        lines.push(`  ${rn}:`)
        grouped[rn].forEach(f => {
          let line = `    • ${f.name} (${f.size})`
          if (f.needs_disassembly) line += ' [DISASSEMBLY NEEDED]'
          if (f.notes) line += ` — ${f.notes}`
          lines.push(line)
        })
      })
      lines.push('')
      lines.push(`  Total furniture pieces: ${furniture.length}`)
      lines.push(`  Need disassembly: ${furniture.filter(f => f.needs_disassembly).length}`)
    }

    return lines.join('\n')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateSummary())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Moving Estimate</h1>
          <p className="text-xs text-slate-400">Summary for movers</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg active:scale-95 transition-transform"
        >
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy Estimate'}
        </button>
      </div>

      {/* Box Size Summary */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-sm text-slate-800 dark:text-white">Box Count by Size</h2>
          <span className="ml-auto text-xs font-medium bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
            {totalBoxes} total
          </span>
        </div>

        <div className="space-y-2">
          {BOX_SIZES.map(size => {
            const count = boxCounts[size.value]
            const pct = totalBoxes > 0 ? (count / totalBoxes) * 100 : 0
            return (
              <div key={size.value} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 w-20 text-right">{size.label}</span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700/50 rounded-lg overflow-hidden relative">
                  <motion.div
                    className="h-full bg-blue-400 dark:bg-blue-500/60 rounded-lg"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  {count > 0 && (
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-slate-700 dark:text-slate-200">
                      {count} — {size.dimensions}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Room Breakdown */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-4 h-4 text-green-500" />
          <h2 className="font-semibold text-sm text-slate-800 dark:text-white">By Room</h2>
        </div>

        <div className="space-y-1">
          {allRoomIds.map(roomId => {
            const roomBoxes = boxesByRoom[roomId] || {}
            const roomFurn = furnitureByRoom[roomId] || []
            const roomBoxTotal = Object.values(roomBoxes).reduce((s, n) => s + n, 0)
            const isExpanded = expandedRoom === roomId

            return (
              <div key={roomId}>
                <button
                  onClick={() => setExpandedRoom(isExpanded ? null : roomId)}
                  className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 text-left">
                    {getRoomName(roomId)}
                  </span>
                  {roomBoxTotal > 0 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                      {roomBoxTotal} box{roomBoxTotal !== 1 ? 'es' : ''}
                    </span>
                  )}
                  {roomFurn.length > 0 && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      {roomFurn.length} furniture
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pb-2 space-y-1">
                        {BOX_SIZES.map(s => {
                          const c = roomBoxes[s.value] || 0
                          if (c === 0) return null
                          return (
                            <div key={s.value} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <Package className="w-3 h-3" />
                              <span>{s.label}: {c}</span>
                            </div>
                          )
                        })}
                        {roomFurn.map(f => (
                          <div key={f.id} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <Sofa className="w-3 h-3 text-amber-500" />
                            <span className="flex-1">{f.name} ({f.size}){f.needs_disassembly ? ' ⚙️' : ''}</span>
                            <button onClick={() => store.removeFurniture(f.id)} className="p-0.5 text-slate-300 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {allRoomIds.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">No boxes or furniture added yet</p>
        )}
      </div>

      {/* Furniture Section */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sofa className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-sm text-slate-800 dark:text-white">Furniture & Large Items</h2>
          <span className="ml-auto text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
            {furniture.length} item{furniture.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Furniture list */}
        <div className="space-y-1.5 mb-3">
          <AnimatePresence>
            {furniture.map(f => (
              <motion.div
                key={f.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60 }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{f.name}</span>
                    {f.needs_disassembly && (
                      <span className="flex items-center gap-0.5 text-xs text-orange-500 flex-shrink-0">
                        <Wrench className="w-3 h-3" /> disassemble
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{getRoomName(f.room_id || '_unassigned')}</span>
                    <span>•</span>
                    <span>{f.size}</span>
                    {f.notes && <><span>•</span><span className="truncate">{f.notes}</span></>}
                  </div>
                </div>
                <button onClick={() => store.removeFurniture(f.id)} className="p-1 text-slate-300 hover:text-red-500 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add furniture form */}
        <button
          onClick={() => setShowAddFurniture(!showAddFurniture)}
          className="flex items-center gap-1.5 text-xs text-blue-500 font-medium mb-2"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddFurniture ? 'Cancel' : 'Add Furniture'}
        </button>

        <AnimatePresence>
          {showAddFurniture && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 bg-slate-50 dark:bg-slate-700/20 rounded-lg p-3">
                <input
                  type="text"
                  value={furnitureName}
                  onChange={e => setFurnitureName(e.target.value)}
                  placeholder="Item name (e.g., Queen bed frame)"
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={furnitureRoom}
                    onChange={e => setFurnitureRoom(e.target.value)}
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select room...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <select
                    value={furnitureSize}
                    onChange={e => setFurnitureSize(e.target.value)}
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
                  >
                    {FURNITURE_SIZES.map(s => (
                      <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  value={furnitureNotes}
                  onChange={e => setFurnitureNotes(e.target.value)}
                  placeholder="Notes (optional — e.g., heavy, fragile glass top)"
                  className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={furnitureDisassembly}
                      onChange={e => setFurnitureDisassembly(e.target.checked)}
                      className="rounded"
                    />
                    Needs disassembly
                  </label>

                  <button
                    onClick={handleAddFurniture}
                    disabled={!furnitureName.trim()}
                    className="px-4 py-2 bg-amber-500 text-white text-sm rounded-lg disabled:opacity-40 active:scale-95 transition-transform font-medium"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats for Movers */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <h2 className="font-semibold text-sm text-slate-800 dark:text-white mb-3">Quick Reference</h2>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalBoxes}</div>
            <div className="text-xs text-blue-500">Total Boxes</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{furniture.length}</div>
            <div className="text-xs text-amber-500">Furniture Pieces</div>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{boxes.filter(b => b.is_fragile).length}</div>
            <div className="text-xs text-red-500">Fragile Boxes</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-3">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{furniture.filter(f => f.needs_disassembly).length}</div>
            <div className="text-xs text-orange-500">Need Disassembly</div>
          </div>
        </div>
      </div>
    </div>
  )
}
