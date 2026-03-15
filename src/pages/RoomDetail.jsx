import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Package, ClipboardList, Sparkles, Loader2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import BoxCard from '../components/BoxCard'
import { useRooms, useRoomTasks } from '../hooks/useStore'
import store from '../lib/store'
import { ai } from '../lib/ai'

export default function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const { tasks, addTask, toggleTask, removeTask } = useRoomTasks(id)
  const [tab, setTab] = useState('boxes')
  const [newTask, setNewTask] = useState('')
  const [taskPhase, setTaskPhase] = useState('before_move')
  const [loadingTips, setLoadingTips] = useState(false)
  const [tips, setTips] = useState(null)

  const room = rooms.find(r => r.id === id)
  if (!room) return <div className="text-center py-12"><p className="text-slate-400">Room not found</p><button onClick={() => navigate('/rooms')} className="text-blue-500 mt-2 text-sm">Back to rooms</button></div>

  const boxes = store.getBoxes().filter(b => b.destination_room_id === id)
  const estimate = store.getRoomEstimate(id)
  const beforeTasks = tasks.filter(t => t.phase === 'before_move')
  const afterTasks = tasks.filter(t => t.phase === 'after_move')

  const handleAddTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; addTask(newTask.trim(), taskPhase); setNewTask('') }

  const handleGetTips = async () => {
    setLoadingTips(true)
    try {
      const boxLabels = boxes.map(b => b.label || b.manual_contents).filter(Boolean)
      const result = await ai.packingTips(room.name, boxLabels)
      setTips(result)
    } catch {
      setTips('Could not load tips — make sure the AI server is running.')
    } finally {
      setLoadingTips(false)
    }
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/rooms')} className="p-1"><ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{room.name}</h1>
          <p className="text-sm text-slate-400">{boxes.length} box{boxes.length !== 1 ? 'es' : ''}{estimate > 0 && ` / ~${estimate} estimated`}</p>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        <button onClick={() => setTab('boxes')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'boxes' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>
          <Package className="w-4 h-4" />Boxes ({boxes.length})
        </button>
        <button onClick={() => setTab('tasks')} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'tasks' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>
          <ClipboardList className="w-4 h-4" />Tasks ({tasks.filter(t => !t.is_done).length})
        </button>
      </div>

      {/* AI Packing Tips */}
      {!tips && (
        <button
          onClick={handleGetTips}
          disabled={loadingTips}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-200 dark:border-purple-500/20 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50"
        >
          {loadingTips ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Get AI Packing Tips
        </button>
      )}
      {tips && (
        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI Packing Tips</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line">{tips}</div>
        </div>
      )}

      {tab === 'boxes' && (
        <div className="space-y-2">
          <AnimatePresence>{boxes.map(box => <BoxCard key={box.id} box={box} />)}</AnimatePresence>
          {boxes.length === 0 && <div className="text-center py-8"><p className="text-sm text-slate-400">No boxes assigned to this room yet</p><button onClick={() => navigate('/boxes/new')} className="mt-2 text-sm text-blue-500 font-medium">Add a box</button></div>}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a task..." className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
            <select value={taskPhase} onChange={e => setTaskPhase(e.target.value)} className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 bg-white dark:bg-slate-800 dark:text-white">
              <option value="before_move">Before</option>
              <option value="after_move">After</option>
            </select>
            <button type="submit" className="bg-blue-500 text-white rounded-lg px-3 py-2"><Plus className="w-4 h-4" /></button>
          </form>
          {beforeTasks.length > 0 && <div><h3 className="text-xs font-medium text-slate-400 uppercase mb-2">Before Move</h3><div className="space-y-1">{beforeTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />)}</div></div>}
          {afterTasks.length > 0 && <div><h3 className="text-xs font-medium text-slate-400 uppercase mb-2">After Move</h3><div className="space-y-1">{afterTasks.map(task => <TaskItem key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />)}</div></div>}
          {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No tasks yet</p>}
        </div>
      )}
    </div>
  )
}

function TaskItem({ task, onToggle, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 px-3 py-2">
      <button onClick={() => onToggle(task.id)} className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${task.is_done ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
        {task.is_done && <span className="text-white text-xs">✓</span>}
      </button>
      <span className={`flex-1 text-sm ${task.is_done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{task.task_text}</span>
      <button onClick={() => onRemove(task.id)} className="text-slate-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  )
}
