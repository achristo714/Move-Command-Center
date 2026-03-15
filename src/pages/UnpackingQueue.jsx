import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Star, AlertTriangle, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressRing from '../components/ProgressRing'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'

export default function UnpackingQueue() {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const boxes = store.getBoxes()
  const delivered = boxes.filter(b => b.status === 'delivered')
  const unpacked = boxes.filter(b => b.status === 'unpacked')
  const totalToUnpack = delivered.length + unpacked.length

  const queue = useMemo(() => [...delivered].sort((a, b) => {
    if (a.is_priority !== b.is_priority) return b.is_priority ? 1 : -1
    if (a.is_fragile !== b.is_fragile) return b.is_fragile ? 1 : -1
    return a.box_number - b.box_number
  }), [delivered])

  const handleUnpack = (id) => store.updateBox(id, { status: 'unpacked' })

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Unpacking Queue</h1>
      </div>
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 text-center dot-grid">
        <div className="flex justify-center mb-3">
          <ProgressRing value={unpacked.length} total={totalToUnpack || 1} size={100} strokeWidth={8} color="#22c55e">
            <div className="text-center"><div className="text-xl font-bold text-slate-800 dark:text-white">{unpacked.length}/{totalToUnpack}</div><div className="text-[10px] text-slate-400">unpacked</div></div>
          </ProgressRing>
        </div>
        {delivered.length === 0 && unpacked.length > 0 ? <p className="text-sm text-green-600 dark:text-green-400 font-medium">Everything's unpacked. Welcome home!</p> : delivered.length === 0 ? <p className="text-sm text-slate-400">No delivered boxes to unpack yet</p> : <p className="text-sm text-slate-500 dark:text-slate-400">{delivered.length} boxes ready to unpack</p>}
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {queue.map((box, i) => {
            const room = rooms.find(r => r.id === box.destination_room_id)
            return (
              <motion.div key={box.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100, scale: 0.8 }} transition={{ delay: i * 0.03 }} className={`bg-white dark:bg-slate-800/50 rounded-xl border p-3 flex items-center gap-3 ${box.is_priority ? 'border-yellow-400 dark:border-yellow-500/40' : 'border-slate-200 dark:border-slate-700/50'}`}>
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700/50 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-slate-400" /></div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/boxes/${box.id}`)}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-white">#{box.box_number}</span>
                    {box.label && <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{box.label}</span>}
                    {box.is_priority && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    {box.is_fragile && <AlertTriangle className="w-3 h-3 text-red-500" />}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{room?.name || 'No room'} {box.manual_contents || box.ai_summary ? `· ${(box.manual_contents || box.ai_summary).slice(0, 40)}` : ''}</div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleUnpack(box.id)} className="flex-shrink-0 bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md shadow-green-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      {queue.length === 0 && totalToUnpack === 0 && <div className="text-center py-8"><div className="text-3xl mb-2">📦</div><p className="text-sm text-slate-400">No boxes have been delivered yet.</p><p className="text-xs text-slate-300 dark:text-slate-500 mt-1">Boxes will appear here once marked as "Delivered"</p></div>}
    </div>
  )
}
