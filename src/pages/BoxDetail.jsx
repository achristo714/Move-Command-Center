import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, AlertTriangle, Star, Camera, Upload, X, Share2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import StatusBadge from '../components/StatusBadge'
import { useRooms } from '../hooks/useStore'
import { STATUS_OPTIONS, getNextStatuses, getStatusLabel, getStatusColor } from '../lib/constants'
import store from '../lib/store'

export default function BoxDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const fileInputRef = useRef(null)

  const box = store.getBox(id)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  if (!box) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Box not found</p>
        <button onClick={() => navigate('/boxes')} className="text-blue-500 mt-2 text-sm">
          Back to boxes
        </button>
      </div>
    )
  }

  const room = rooms.find(r => r.id === box.destination_room_id)
  const nextStatuses = getNextStatuses(box.status)
  const qrUrl = `${window.location.origin}/boxes/${box.id}`

  const startEdit = () => {
    setEditData({
      label: box.label,
      destination_room_id: box.destination_room_id || '',
      is_fragile: box.is_fragile,
      is_priority: box.is_priority,
      handling_notes: box.handling_notes,
      manual_contents: box.manual_contents,
    })
    setEditing(true)
  }

  const saveEdit = () => {
    store.updateBox(box.id, editData)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm('Delete this box? This cannot be undone.')) {
      store.deleteBox(box.id)
      navigate('/boxes')
    }
  }

  const handleAdvance = (status) => {
    store.updateBox(box.id, { status })
  }

  const handleAddPhotos = (files) => {
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f))
    store.updateBox(box.id, {
      photo_urls: [...(box.photo_urls || []), ...newUrls],
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Box #{box.box_number}
              {box.label && <span className="text-slate-400 font-normal ml-2">{box.label}</span>}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={startEdit} className="p-2 text-slate-400">
            <Edit3 className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="p-2 text-red-400">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Status + Advance */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Status</label>
            <StatusBadge status={box.status} size="md" />
          </div>
          {nextStatuses.length > 0 && (
            <div className="flex gap-2">
              {nextStatuses.map(ns => (
                <motion.button
                  key={ns}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAdvance(ns)}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: getStatusColor(ns) }}
                >
                  Mark {getStatusLabel(ns)}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-2">
        {box.is_fragile && (
          <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            Fragile
          </div>
        )}
        {box.is_priority && (
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-full text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            Open First
          </div>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="text-xs font-medium text-slate-400 block mb-2">Photos</label>
        <div className="flex gap-2 flex-wrap">
          {(box.photo_urls || []).map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener" className="w-24 h-24 rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </a>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-1"
          >
            <Camera className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] text-slate-400">Add Photos</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleAddPhotos(e.target.files)}
        />
      </div>

      {/* Contents */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="text-xs font-medium text-slate-400 block mb-1">Contents</label>
        {box.ai_summary && (
          <div className="text-sm text-slate-600 bg-blue-50 rounded-lg p-2 mb-2">
            <span className="text-blue-600 font-medium text-xs">AI Summary: </span>
            {box.ai_summary}
          </div>
        )}
        {box.manual_contents ? (
          <p className="text-sm text-slate-700">{box.manual_contents}</p>
        ) : !box.ai_summary ? (
          <p className="text-sm text-slate-400 italic">No contents listed</p>
        ) : null}
      </div>

      {/* Destination */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="text-xs font-medium text-slate-400 block mb-1">Destination</label>
        <p className="text-sm text-slate-700">{room?.name || 'Not assigned'}</p>
      </div>

      {/* Handling Notes */}
      {box.handling_notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <label className="text-xs font-medium text-slate-400 block mb-1">Handling Notes</label>
          <p className="text-sm text-slate-700">{box.handling_notes}</p>
        </div>
      )}

      {/* QR Code */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
        <label className="text-xs font-medium text-slate-400 block mb-3">QR Code</label>
        <div className="inline-block bg-white p-3 rounded-lg">
          <QRCodeSVG value={qrUrl} size={160} />
        </div>
        <p className="text-xs text-slate-400 mt-2">Scan to view this box</p>
      </div>

      {/* Meta */}
      <div className="text-xs text-slate-400 text-center space-y-0.5">
        <p>Created by {box.created_by}</p>
        <p>{new Date(box.created_at).toLocaleString()}</p>
        {box.updated_at !== box.created_at && (
          <p>Updated {new Date(box.updated_at).toLocaleString()}</p>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white rounded-t-2xl w-full max-w-lg p-4 space-y-3 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800">Edit Box</h2>
              <button onClick={() => setEditing(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Label</label>
              <input
                type="text"
                value={editData.label}
                onChange={e => setEditData({ ...editData, label: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Room</label>
              <select
                value={editData.destination_room_id}
                onChange={e => setEditData({ ...editData, destination_room_id: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">No room</option>
                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editData.is_fragile}
                  onChange={e => setEditData({ ...editData, is_fragile: e.target.checked })}
                />
                <span className="text-sm">Fragile</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editData.is_priority}
                  onChange={e => setEditData({ ...editData, is_priority: e.target.checked })}
                />
                <span className="text-sm">Priority</span>
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Handling Notes</label>
              <input
                type="text"
                value={editData.handling_notes}
                onChange={e => setEditData({ ...editData, handling_notes: e.target.value })}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 block mb-1">Contents</label>
              <textarea
                value={editData.manual_contents}
                onChange={e => setEditData({ ...editData, manual_contents: e.target.value })}
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none"
              />
            </div>
            <button onClick={saveEdit} className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold">
              Save Changes
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
