import { useState } from 'react'
import { ArrowLeft, Printer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useRooms } from '../hooks/useStore'
import { STATUS_OPTIONS } from '../lib/constants'
import store from '../lib/store'

export default function PrintLabels() {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const boxes = store.getBoxes()
  const [filter, setFilter] = useState('all')

  let filtered = boxes
  if (filter === 'fragile') filtered = boxes.filter(b => b.is_fragile)
  if (filter === 'priority') filtered = boxes.filter(b => b.is_priority)
  if (STATUS_OPTIONS.some(s => s.value === filter)) {
    filtered = boxes.filter(b => b.status === filter)
  }

  const handlePrint = () => window.print()

  return (
    <div>
      {/* Controls (hidden in print) */}
      <div className="no-print max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Print QR Labels</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[{ v: 'all', l: 'All' }, { v: 'fragile', l: 'Fragile' }, { v: 'priority', l: 'Priority' },
            ...STATUS_OPTIONS.map(s => ({ v: s.value, l: s.label }))
          ].map(f => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                filter === f.v ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {f.l}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-400">{filtered.length} labels to print</p>

        <button
          onClick={handlePrint}
          className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Labels
        </button>
      </div>

      {/* Print layout */}
      <div className="print:block max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
          {filtered.map(box => {
            const room = rooms.find(r => r.id === box.destination_room_id)
            const qrUrl = `${window.location.origin}/boxes/${box.id}`
            return (
              <div
                key={box.id}
                className="border-2 border-slate-300 rounded-lg p-3 text-center print:border-black print:rounded-none print:break-inside-avoid"
              >
                <div className="font-bold text-lg">Box #{box.box_number}</div>
                {box.label && <div className="text-sm text-slate-600">{box.label}</div>}
                <div className="my-2 flex justify-center">
                  <QRCodeSVG value={qrUrl} size={100} />
                </div>
                <div className="font-medium text-sm">{room?.name || 'No room'}</div>
                {box.is_fragile && (
                  <div className="text-red-600 font-bold text-xs mt-1">⚠ FRAGILE</div>
                )}
                {box.is_priority && (
                  <div className="text-yellow-600 font-bold text-xs">★ OPEN FIRST</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
