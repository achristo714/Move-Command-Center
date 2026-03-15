import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Package, MapPin, Edit3, Check, Camera, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBoxes, useRooms } from '../hooks/useStore'
import StatusBadge from '../components/StatusBadge'
import store from '../lib/store'

export default function PhotoFeed() {
  const navigate = useNavigate()
  const { boxes } = useBoxes()
  const { rooms } = useRooms()
  const [selectedPhoto, setSelectedPhoto] = useState(null) // { boxId, photoIndex }
  const [editingContents, setEditingContents] = useState(false)
  const [contentsValue, setContentsValue] = useState('')
  const fileInputRef = useRef(null)

  // Build flat feed of all photos with box context
  const feed = boxes.flatMap(box =>
    (box.photo_urls || []).map((url, i) => ({
      url,
      photoIndex: i,
      box,
      room: rooms.find(r => r.id === box.destination_room_id),
    }))
  ).sort((a, b) => new Date(b.box.updated_at) - new Date(a.box.updated_at))

  const selectedBox = selectedPhoto ? store.getBox(selectedPhoto.boxId) : null
  const selectedRoom = selectedBox ? rooms.find(r => r.id === selectedBox.destination_room_id) : null

  // Get all photos for the selected box for carousel navigation
  const selectedBoxPhotos = selectedBox?.photo_urls || []

  const openPhoto = (boxId, photoIndex) => {
    setSelectedPhoto({ boxId, photoIndex })
    setEditingContents(false)
    const box = store.getBox(boxId)
    setContentsValue(box?.manual_contents || '')
  }

  const closePhoto = () => {
    setSelectedPhoto(null)
    setEditingContents(false)
  }

  const navigatePhoto = (direction) => {
    if (!selectedPhoto || selectedBoxPhotos.length <= 1) return
    const next = (selectedPhoto.photoIndex + direction + selectedBoxPhotos.length) % selectedBoxPhotos.length
    setSelectedPhoto({ ...selectedPhoto, photoIndex: next })
  }

  const startEditContents = () => {
    setContentsValue(selectedBox?.manual_contents || '')
    setEditingContents(true)
  }

  const saveContents = () => {
    if (selectedBox) {
      store.updateBox(selectedBox.id, { manual_contents: contentsValue })
    }
    setEditingContents(false)
  }

  const handleAddPhotos = (files) => {
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f))
    // Add to the first box or prompt — for now, we just show a message
    // This is handled per-box on the detail page
  }

  if (feed.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No photos yet</h2>
        <p className="text-sm text-slate-400">Add photos when creating or editing boxes</p>
        <button
          onClick={() => navigate('/boxes/new')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
        >
          Add a Box
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Photo Feed</h1>
        <span className="text-sm text-slate-400">{feed.length} photo{feed.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Scrollable photo grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5">
        {feed.map((item, i) => (
          <motion.button
            key={`${item.box.id}-${item.photoIndex}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => openPhoto(item.box.id, item.photoIndex)}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img
              src={item.url}
              alt={`Box #${item.box.box_number}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Overlay with box info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
                  #{item.box.box_number}
                </span>
                {item.room && (
                  <span className="text-[10px] text-white bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5 truncate">
                    {item.room.name}
                  </span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Photo detail overlay */}
      <AnimatePresence>
        {selectedPhoto && selectedBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 text-white">
              <button onClick={closePhoto} className="p-1">
                <X className="w-6 h-6" />
              </button>
              <button
                onClick={() => navigate(`/boxes/${selectedBox.id}`)}
                className="flex items-center gap-1.5 text-sm bg-white/10 rounded-full px-3 py-1.5"
              >
                <Package className="w-4 h-4" />
                Box #{selectedBox.box_number}
              </button>
            </div>

            {/* Photo with navigation */}
            <div className="flex-1 relative flex items-center justify-center min-h-0 px-2">
              {selectedBoxPhotos.length > 1 && (
                <button
                  onClick={() => navigatePhoto(-1)}
                  className="absolute left-2 z-10 p-2 bg-black/40 rounded-full text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <img
                src={selectedBoxPhotos[selectedPhoto.photoIndex]}
                alt=""
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {selectedBoxPhotos.length > 1 && (
                <button
                  onClick={() => navigatePhoto(1)}
                  className="absolute right-2 z-10 p-2 bg-black/40 rounded-full text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Photo counter */}
              {selectedBoxPhotos.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white bg-black/40 rounded-full px-2 py-0.5">
                  {selectedPhoto.photoIndex + 1} / {selectedBoxPhotos.length}
                </div>
              )}
            </div>

            {/* Box info panel */}
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-t-2xl p-4 space-y-3 max-h-[40vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    Box #{selectedBox.box_number}
                    {selectedBox.label && (
                      <span className="font-normal text-slate-400 ml-1.5 text-sm">{selectedBox.label}</span>
                    )}
                  </h3>
                  <StatusBadge status={selectedBox.status} />
                </div>
                {selectedRoom && (
                  <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedRoom.name}
                  </div>
                )}
              </div>

              {/* Contents section — editable */}
              <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">Contents</label>
                  {!editingContents ? (
                    <button
                      onClick={startEditContents}
                      className="flex items-center gap-1 text-xs text-blue-500 font-medium"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={saveContents}
                      className="flex items-center gap-1 text-xs text-green-500 font-medium"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                  )}
                </div>

                {editingContents ? (
                  <textarea
                    value={contentsValue}
                    onChange={e => setContentsValue(e.target.value)}
                    rows={3}
                    autoFocus
                    placeholder="Describe what's in this box..."
                    className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white resize-none"
                  />
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {selectedBox.ai_summary && (
                      <div className="bg-blue-50 dark:bg-blue-500/10 rounded p-2 mb-1.5">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">AI: </span>
                        {selectedBox.ai_summary}
                      </div>
                    )}
                    {selectedBox.manual_contents || (
                      <span className="text-slate-400 italic">No contents listed — tap Edit to add</span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick flags */}
              <div className="flex gap-2 text-xs">
                {selectedBox.is_fragile && (
                  <span className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                    Fragile
                  </span>
                )}
                {selectedBox.is_priority && (
                  <span className="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                    Open First
                  </span>
                )}
                {selectedBox.handling_notes && (
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                    {selectedBox.handling_notes}
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
