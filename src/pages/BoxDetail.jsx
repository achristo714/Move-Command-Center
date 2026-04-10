import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, AlertTriangle, Star, Camera, X, Warehouse } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import StatusBadge from '../components/StatusBadge'
import { useRooms } from '../hooks/useStore'
import { STATUS_OPTIONS, getNextStatuses, getStatusLabel, getStatusColor } from '../lib/constants'
import { BOX_SIZES } from '../lib/boxSizes'
import store from '../lib/store'

export default function BoxDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const fileInputRef = useRef(null)

  const box = store.getBox(id)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  // Lazy-load photos for this box (not included in bulk query)
  useEffect(() => { if (id) store.loadBoxPhotos(id) }, [id])

  if (!box) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Box not found</p>
        <button onClick={() => navigate('/boxes')} className="text-blue-500 mt-2 text-sm">Back to boxes</button>
      </div>
    )
  }

  const room = rooms.find(r => r.id === box.destination_room_id)
  const nextStatuses = getNextStatuses(box.status)
  const qrUrl = `${window.location.origin}/boxes/${box.id}`

  const startEdit = () => {
    setEditData({ box_number: String(box.box_number), label: box.label, destination_room_id: box.destination_room_id || '', is_fragile: box.is_fragile, is_priority: box.is_priority, is_temporary_storage: box.is_temporary_storage || false, box_size: box.box_size || '', handling_notes: box.handling_notes, manual_contents: box.manual_contents })
    setEditing(true)
  }

  const saveEdit = () => {
    const { box_number: boxNumStr, ...rest } = editData
    const newNum = parseInt(boxNumStr)
    const updates = { ...rest }
    if (newNum && newNum !== box.box_number) updates.box_number = newNum
    store.updateBox(box.id, updates)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Delete this box? This cannot be undone.')) { store.deleteBox(box.id); navigate('/boxes') }
  }

  const handleAdvance = (status) => { store.updateBox(box.id, { status }) }

  const handleAddPhotos = async (files) => {
    const newUrls = await Promise.all(
      Array.from(files).map(f => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(f)
      }))
    )
    store.updateBox(box.id, { photo_urls: [...(box.photo_urls || []), ...newUrls] })
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Box #{box.box_number}
              {box.label && <span className="text-slate-400 font-normal ml-2">{box.label}</span>}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={startEdit} className="p-2 text-slate-400"><Edit3 className="w-5 h-5" /></button>
          <button onClick={handleDelete} className="p-2 text-red-400"><Trash2 className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Status</label>
            <StatusBadge status={box.status} size="md" />
          </div>
          {nextStatuses.length > 0 && (
            <div className="flex gap-2">
              {nextStatuses.map(ns => (
                <motion.button key={ns} whileTap={{ scale: 0.95 }} onClick={() => handleAdvance(ns)} className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: getStatusColor(ns) }}>
                  Mark {getStatusLabel(ns)}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {box.is_fragile && <div className="flex items-center gap-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-sm font-medium"><AlertTriangle className="w-4 h-4" />Fragile</div>}
        {box.is_priority && <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium"><Star className="w-4 h-4 fill-current" />Open First</div>}
        {box.is_temporary_storage && <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-sm font-medium"><Warehouse className="w-4 h-4" />Temp Storage</div>}
        {box.box_size && <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium">{BOX_SIZES.find(s => s.value === box.box_size)?.label || box.box_size}</div>}
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <label className="text-xs font-medium text-slate-400 block mb-2">Photos</label>
        <div className="flex gap-2 flex-wrap">
          {(box.photo_urls || []).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener" className="w-24 h-24 rounded-lg overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover" /></a>
          ))}
          <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-slate-50 dark:bg-slate-700/30 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center gap-1">
            <Camera className="w-5 h-5 text-slate-400" /><span className="text-[10px] text-slate-400">Add Photos</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleAddPhotos(e.target.files)} />
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <label className="text-xs font-medium text-slate-400 block mb-1">Contents</label>
        {box.ai_summary && <div className="text-sm text-slate-600 dark:text-slate-300 bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2 mb-2"><span className="text-blue-600 dark:text-blue-400 font-medium text-xs">AI Summary: </span>{box.ai_summary}</div>}
        {box.manual_contents ? <p className="text-sm text-slate-700 dark:text-slate-300">{box.manual_contents}</p> : !box.ai_summary ? <p className="text-sm text-slate-400 italic">No contents listed</p> : null}
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
        <label className="text-xs font-medium text-slate-400 block mb-1">Destination</label>
        <p className="text-sm text-slate-700 dark:text-slate-300">{room?.name || 'Not assigned'}</p>
      </div>

      {box.handling_notes && (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
          <label className="text-xs font-medium text-slate-400 block mb-1">Handling Notes</label>
          <p className="text-sm text-slate-700 dark:text-slate-300">{box.handling_notes}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 text-center">
        <label className="text-xs font-medium text-slate-400 block mb-3">QR Code</label>
        <div className="inline-block bg-white p-3 rounded-lg"><QRCodeSVG value={qrUrl} size={160} /></div>
        <p className="text-xs text-slate-400 mt-2">Scan to view this box</p>
      </div>

      <div className="text-xs text-slate-400 text-center space-y-0.5">
        <p>Created by {box.created_by || 'Andy'}</p>
        <p>{new Date(box.created_at).toLocaleString()}</p>
        {box.updated_at !== box.created_at && <p>Updated {new Date(box.updated_at).toLocaleString()}</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="bg-white dark:bg-slate-800 rounded-t-2xl w-full max-w-lg p-4 space-y-3 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">Edit Box</h2>
              <button onClick={() => setEditing(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Box Number</label>
              <input type="text" inputMode="numeric" value={editData.box_number} onChange={e => setEditData({ ...editData, box_number: e.target.value.replace(/[^0-9]/g, '') })} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white font-mono" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Label</label>
              <input type="text" value={editData.label} onChange={e => setEditData({ ...editData, label: e.target.value })} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Room</label>
              <select value={editData.destination_room_id} onChange={e => setEditData({ ...editData, destination_room_id: e.target.value })} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white">
                <option value="">No room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm dark:text-slate-300"><input type="checkbox" checked={editData.is_fragile} onChange={e => setEditData({ ...editData, is_fragile: e.target.checked })} />Fragile</label>
              <label className="flex items-center gap-2 text-sm dark:text-slate-300"><input type="checkbox" checked={editData.is_priority} onChange={e => setEditData({ ...editData, is_priority: e.target.checked })} />Priority</label>
              <label className="flex items-center gap-2 text-sm dark:text-slate-300"><input type="checkbox" checked={editData.is_temporary_storage} onChange={e => setEditData({ ...editData, is_temporary_storage: e.target.checked })} />Temp Storage</label>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">Box Size</label>
              <div className="grid grid-cols-3 gap-1.5">
                {BOX_SIZES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setEditData({ ...editData, box_size: editData.box_size === s.value ? '' : s.value })}
                    className={`text-left p-1.5 rounded-lg border-2 transition-colors ${editData.box_size === s.value ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-600'}`}
                  >
                    <div className={`text-xs font-medium ${editData.box_size === s.value ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{s.label}</div>
                    <div className="text-[9px] text-slate-400">{s.dimensions}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Handling Notes</label>
              <input type="text" value={editData.handling_notes} onChange={e => setEditData({ ...editData, handling_notes: e.target.value })} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1">Contents</label>
              <textarea value={editData.manual_contents} onChange={e => setEditData({ ...editData, manual_contents: e.target.value })} rows={3} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 dark:text-white resize-none" />
            </div>
            <button onClick={saveEdit} className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold">Save Changes</button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
