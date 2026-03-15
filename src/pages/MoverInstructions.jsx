import { ArrowLeft, Printer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRooms } from '../hooks/useStore'
import store from '../lib/store'

export default function MoverInstructions() {
  const navigate = useNavigate()
  const { rooms } = useRooms()
  const boxes = store.getBoxes()

  const roomGroups = rooms
    .map(room => ({
      room,
      boxes: boxes.filter(b => b.destination_room_id === room.id).sort((a, b) => a.box_number - b.box_number),
    }))
    .filter(g => g.boxes.length > 0)

  const unassigned = boxes.filter(b => !b.destination_room_id)

  return (
    <div>
      <div className="no-print max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">Mover Instructions</h1>
        </div>
        <p className="text-sm text-slate-400">
          Print-friendly reference sheet for your movers. Shows all boxes grouped by destination room.
        </p>
        <button
          onClick={() => window.print()}
          className="w-full bg-blue-500 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2"
        >
          <Printer className="w-5 h-5" />
          Print Instructions
        </button>
      </div>

      {/* Print content */}
      <div className="max-w-3xl mx-auto px-4 print:px-8 print:py-4">
        <h1 className="text-2xl font-bold text-center mb-1 hidden print:block">Moving Day Box Guide</h1>
        <p className="text-center text-sm text-slate-400 mb-6 hidden print:block">
          {boxes.length} total boxes · {new Date().toLocaleDateString()}
        </p>

        {roomGroups.map(({ room, boxes: roomBoxes }) => (
          <div key={room.id} className="mb-6 print:break-inside-avoid">
            <h2 className="text-lg font-bold border-b-2 border-slate-800 pb-1 mb-2">{room.name}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase">
                  <th className="py-1 w-16">Box #</th>
                  <th className="py-1">Contents</th>
                  <th className="py-1 w-24">Notes</th>
                </tr>
              </thead>
              <tbody>
                {roomBoxes.map(box => (
                  <tr key={box.id} className="border-t border-slate-200">
                    <td className="py-1.5 font-medium">
                      #{box.box_number}
                      {box.is_fragile && <span className="text-red-600 ml-1">⚠</span>}
                    </td>
                    <td className="py-1.5 text-slate-600">
                      {box.label && <span className="font-medium">{box.label}</span>}
                      {box.label && (box.manual_contents || box.ai_summary) && ' · '}
                      {(box.manual_contents || box.ai_summary || '').slice(0, 60)}
                    </td>
                    <td className="py-1.5 text-slate-500">
                      {[
                        box.is_fragile && 'FRAGILE',
                        box.is_priority && 'OPEN FIRST',
                        box.handling_notes,
                      ].filter(Boolean).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-1">
              {roomBoxes.length} box{roomBoxes.length !== 1 ? 'es' : ''}
              {roomBoxes.some(b => b.is_fragile) && ` · ${roomBoxes.filter(b => b.is_fragile).length} fragile`}
            </p>
          </div>
        ))}

        {unassigned.length > 0 && (
          <div className="mb-6 print:break-inside-avoid">
            <h2 className="text-lg font-bold border-b-2 border-slate-800 pb-1 mb-2">Unassigned</h2>
            <table className="w-full text-sm">
              <tbody>
                {unassigned.map(box => (
                  <tr key={box.id} className="border-t border-slate-200">
                    <td className="py-1.5 w-16 font-medium">#{box.box_number}</td>
                    <td className="py-1.5 text-slate-600">{box.label || box.manual_contents || box.ai_summary || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
