import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProgressRing from '../components/ProgressRing'
import { useEssentials } from '../hooks/useStore'

export default function Essentials() {
  const navigate = useNavigate()
  const { essentials, toggleEssential, addEssential, removeEssential } = useEssentials()
  const [newItem, setNewItem] = useState('')
  const packed = essentials.filter(e => e.is_packed).length
  const total = essentials.length
  const handleAdd = (e) => { e.preventDefault(); if (!newItem.trim()) return; addEssential(newItem.trim()); setNewItem('') }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Essentials Kit</h1>
      </div>
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 rounded-2xl border border-yellow-200 dark:border-yellow-500/20 p-6 text-center dot-grid">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">First Night Survival Kit</p>
        <div className="flex justify-center mb-3">
          <ProgressRing value={packed} total={total || 1} size={100} strokeWidth={8} color="#eab308">
            <div className="text-center"><div className="text-xl font-bold text-slate-800 dark:text-white">{packed}/{total}</div><div className="text-[10px] text-slate-400">packed</div></div>
          </ProgressRing>
        </div>
        {packed === total && total > 0 ? <p className="text-sm text-green-600 dark:text-green-400 font-medium">All essentials packed! You're ready.</p> : <p className="text-sm text-slate-500 dark:text-slate-400">{total - packed} items still need packing</p>}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add an essential item..." className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
        <button type="submit" className="bg-yellow-500 text-white rounded-lg px-3 py-2"><Plus className="w-4 h-4" /></button>
      </form>
      <div className="space-y-1">
        {essentials.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 px-3 py-2.5">
            <button onClick={() => toggleEssential(item.id)} className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.is_packed ? 'bg-green-500 border-green-500 scale-110' : 'border-slate-300 dark:border-slate-600'}`}>
              {item.is_packed && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${item.is_packed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{item.item_name}</span>
            <button onClick={() => removeEssential(item.id)} className="text-slate-300"><Trash2 className="w-3.5 h-3.5" /></button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
