import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, X, AlertTriangle, Star, ArrowLeft, Loader2, Pen, Sparkles, Tag } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { BOX_SIZES, generateBoxCode } from '../lib/boxSizes'
import { ai } from '../lib/ai'

export default function AddBox() {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const nextNumber = store.getState().next_box_number

  const [label, setLabel] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isFragile, setIsFragile] = useState(false)
  const [isPriority, setIsPriority] = useState(false)
  const [handlingNotes, setHandlingNotes] = useState('')
  const [manualContents, setManualContents] = useState('')
  const [boxSize, setBoxSize] = useState('')
  const [photos, setPhotos] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [aiSummary, setAiSummary] = useState('')

  const selectedRoom = rooms.find(r => r.id === roomId)
  const sharpieCode = generateBoxCode(nextNumber, selectedRoom?.name)

  const [suggestingLabel, setSuggestingLabel] = useState(false)

  const analyzePhoto = async (file) => {
    setAnalyzing(true)
    try {
      const reader = new FileReader()
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Try the direct API server first, fall back to Supabase Edge Function
      try {
        const description = await ai.describeBox(base64, file.type || 'image/jpeg')
        if (description) { setAiSummary(description); return }
      } catch {}

      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.functions.invoke('identify-box', {
          body: { image_base64: base64, mime_type: file.type || 'image/jpeg' },
        })
        if (error) throw error
        if (data?.summary) setAiSummary(data.summary)
      } else {
        setAiSummary('Photo captured — set up AI server to enable auto-identification.')
      }
    } catch (err) {
      console.error('AI analysis failed:', err)
      setAiSummary('Photo captured — describe contents manually below.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleFiles = (files) => {
    const newPhotos = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setPhotos(prev => [...prev, ...newPhotos])
    if (!aiSummary && files.length > 0) {
      analyzePhoto(files[0])
    }
  }

  const handleSuggestLabel = async () => {
    const contents = manualContents || aiSummary
    if (!contents) return
    setSuggestingLabel(true)
    try {
      const suggested = await ai.suggestLabel(contents, selectedRoom?.name)
      if (suggested) setLabel(suggested)
    } catch {
      // silently fail — optional feature
    } finally {
      setSuggestingLabel(false)
    }
  }

  const removePhoto = (index) => {
    setPhotos(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  const handleSave = () => {
    const box = store.addBox({
      label: label || sharpieCode,
      destination_room_id: roomId || null,
      is_fragile: isFragile,
      is_priority: isPriority,
      handling_notes: handlingNotes,
      manual_contents: manualContents,
      ai_summary: aiSummary,
      box_size: boxSize || null,
      photo_urls: photos.map(p => p.preview),
    })
    navigate(`/boxes/${box.id}`)
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Add Box #{nextNumber}</h1>
      </div>

      {/* Sharpie Code */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-xl border border-blue-200 dark:border-blue-500/20 p-4">
        <div className="flex items-center gap-2 mb-1">
          <Pen className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Write this on the box:</span>
        </div>
        <div className="text-3xl font-mono font-bold text-blue-700 dark:text-blue-400 tracking-wider">
          {sharpieCode}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {selectedRoom ? selectedRoom.name : 'Select a room below to generate code'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Photos</label>
        <div className="flex gap-2 flex-wrap">
          {photos.map((photo, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img src={photo.preview} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          <button onClick={() => cameraInputRef.current?.click()} className="w-20 h-20 bg-slate-50 dark:bg-slate-700/30 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center gap-1 active:bg-slate-100">
            <Camera className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] text-slate-400">Camera</span>
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 bg-slate-50 dark:bg-slate-700/30 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center gap-1 active:bg-slate-100">
            <Upload className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] text-slate-400">Upload</span>
          </button>
        </div>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFiles(e.target.files)} />
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
        {analyzing && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your stuff...
          </div>
        )}
        {aiSummary && !analyzing && (
          <div className="mt-2 text-sm text-slate-500 bg-blue-50 dark:bg-blue-500/10 rounded-lg p-2">
            <span className="font-medium text-blue-600 dark:text-blue-400">AI Summary: </span>{aiSummary}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Label (optional)</label>
        <div className="flex gap-2">
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Miles's toys, Kitchen essentials" className="flex-1 text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
          {(manualContents || aiSummary) && (
            <button
              type="button"
              onClick={handleSuggestLabel}
              disabled={suggestingLabel}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-500/20 disabled:opacity-50"
            >
              {suggestingLabel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              AI
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Destination Room</label>
        <select value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white">
          <option value="">Select a room...</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch flex gap-3">
        <button onClick={() => setIsFragile(!isFragile)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${isFragile ? 'border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'border-slate-200 dark:border-slate-600 text-slate-400'}`}>
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Fragile</span>
        </button>
        <button onClick={() => setIsPriority(!isPriority)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${isPriority ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'border-slate-200 dark:border-slate-600 text-slate-400'}`}>
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">Open First</span>
        </button>
      </div>

      {/* Box Size */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Box Size (optional)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BOX_SIZES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => setBoxSize(boxSize === s.value ? '' : s.value)}
              className={`text-left p-2 rounded-lg border-2 transition-colors ${boxSize === s.value ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-600'}`}
            >
              <div className={`text-sm font-medium ${boxSize === s.value ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{s.label}</div>
              <div className="text-[10px] text-slate-400">{s.dimensions}</div>
              <div className="text-[10px] text-slate-400">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Handling Notes (optional)</label>
        <input type="text" value={handlingNotes} onChange={e => setHandlingNotes(e.target.value)} placeholder="e.g. This side up, Heavy - two person lift" className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white" />
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 card-hatch">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Contents (optional)</label>
        <textarea value={manualContents} onChange={e => setManualContents(e.target.value)} placeholder="List what's in this box..." rows={3} className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 dark:text-white resize-none" />
      </div>

      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold text-base shadow-lg shadow-blue-500/30">
        Save Box #{nextNumber}
      </motion.button>
    </div>
  )
}
