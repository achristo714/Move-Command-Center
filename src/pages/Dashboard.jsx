import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, Star as StarIcon, Truck, Archive, CheckCircle2, Clock, ArrowRight, Calendar, Timer, MessageCircle, ClipboardList, Calculator } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressRing from '../components/ProgressRing'
import { useStats, useRooms, useActivityLog, useEssentials } from '../hooks/useStore'
import { getStatusColor, getStatusLabel, STATUS_OPTIONS } from '../lib/constants'
import { useTheme } from '../hooks/useTheme'
import { Flower, Leaf, Bunny, Bird, SmallFlower, TinyHouse, Sparkle, Butterfly, VineDivider } from '../components/Decorations'
import store from '../lib/store'

function StatCard({ icon: Icon, label, value, color, bgColor, darkBgColor, darkColor }) {
  return (
    <div className={`rounded-2xl border p-3 bg-white dark:bg-gray-900/60 border-[#e8ddd0]/60 dark:border-gray-800`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${bgColor} ${darkBgColor}`}>
        <Icon className={`w-4 h-4 ${color} ${darkColor}`} />
      </div>
      <div className="text-2xl font-bold text-[#3d3429] dark:text-white">{value}</div>
      <div className="text-xs text-[#8a7e72] dark:text-gray-500">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const stats = useStats()
  const { rooms } = useRooms()
  const activity = useActivityLog()
  const { essentials } = useEssentials()
  const { dark } = useTheme()

  const essentialsPacked = essentials.filter(e => e.is_packed).length
  const essentialsTotal = essentials.length

  const statusIcons = {
    packed: Package,
    loaded: Truck,
    in_storage: Archive,
    delivered: Clock,
    unpacked: CheckCircle2,
  }

  const progressColor = dark ? '#818cf8' : '#95c9a8'

  return (
    <div className="space-y-6">
      {/* Hero / Progress */}
      <div className={`rounded-3xl p-6 text-center dot-grid glow-warm relative overflow-hidden ${
        dark
          ? 'bg-gray-900/60 border border-gray-800'
          : 'bg-white border border-[#e8ddd0]/60'
      }`}>
        {/* Light mode decorations */}
        {!dark && (
          <>
            <Flower className="absolute top-3 left-4 opacity-60" size={26} />
            <Leaf className="absolute top-2 right-5 opacity-50 -rotate-12" size={22} />
            <SmallFlower className="absolute bottom-4 left-6 opacity-40" size={16} color="#b5cfe0" />
            <Butterfly className="absolute top-6 right-3 opacity-40" size={18} />
            <Sparkle className="absolute top-12 left-16 opacity-50" size={8} />
            <Sparkle className="absolute bottom-8 right-14 opacity-40" size={10} />
          </>
        )}

        <h1 className={`text-lg font-bold mb-1 relative ${dark ? 'text-white' : 'text-[#3d3429]'}`}>
          {dark ? 'Command Center' : 'Our New Home'}
        </h1>
        <p className={`text-sm mb-4 relative ${dark ? 'text-gray-400' : 'text-[#7a6b5d]'}`}>
          {stats.total === 0
            ? dark ? "No boxes tracked yet." : "No boxes yet — let's get packing!"
            : stats.unpacked === stats.total
            ? dark ? 'Mission complete. All unpacked.' : 'Welcome home! Everything is unpacked.'
            : `${stats.toUnpack} boxes to go`}
        </p>
        <div className="flex justify-center relative">
          <ProgressRing
            value={stats.unpacked}
            total={stats.total || 1}
            size={140}
            strokeWidth={12}
            color={progressColor}
          >
            <div className="text-center">
              <div className={`text-3xl font-bold ${dark ? 'text-white' : 'text-[#3d3429]'}`}>
                {stats.total > 0 ? Math.round((stats.unpacked / stats.total) * 100) : 0}%
              </div>
              <div className={`text-xs ${dark ? 'text-gray-500' : 'text-[#7a6b5d]'}`}>unpacked</div>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Boxes" value={stats.total} bgColor="bg-[#d4e4d9]" color="text-[#6a9b7a]" darkBgColor="dark:bg-indigo-500/10" darkColor="dark:text-indigo-400" />
        <StatCard icon={Clock} label="Packed Today" value={stats.packedToday} bgColor="bg-[#f5e6d0]" color="text-[#c4935a]" darkBgColor="dark:bg-amber-500/10" darkColor="dark:text-amber-400" />
        <StatCard icon={AlertTriangle} label="Fragile" value={stats.fragileCount} bgColor="bg-[#f5d5d2]" color="text-[#c97a74]" darkBgColor="dark:bg-red-500/10" darkColor="dark:text-red-400" />
        <StatCard icon={StarIcon} label="Priority" value={stats.priorityUnpacked} bgColor="bg-[#f5ecd0]" color="text-[#c4a03a]" darkBgColor="dark:bg-yellow-500/10" darkColor="dark:text-yellow-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className={`rounded-2xl p-4 ${
          dark ? 'bg-gray-900/60 border border-gray-800' : 'bg-white border border-[#e8ddd0]/60'
        }`}>
          <h2 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-[#3d3429]'}`}>Status Breakdown</h2>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(({ value, label }) => {
              const count = stats.byStatus[value] || 0
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
              const Icon = statusIcons[value] || Package
              return (
                <div key={value} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: getStatusColor(value) }} />
                  <span className={`text-sm w-20 ${dark ? 'text-gray-300' : 'text-[#5a4e42]'}`}>{label}</span>
                  <div className={`flex-1 h-6 rounded-full overflow-hidden ${dark ? 'bg-gray-800' : 'bg-[#f0ebe4]'}`}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getStatusColor(value) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-8 text-right ${dark ? 'text-gray-200' : 'text-[#5a4e42]'}`}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Room Overview */}
        <div className={`rounded-2xl p-4 ${
          dark ? 'bg-gray-900/60 border border-gray-800' : 'bg-white border border-[#e8ddd0]/60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className={`font-semibold ${dark ? 'text-white' : 'text-[#3d3429]'}`}>Rooms</h2>
            <button
              onClick={() => navigate('/rooms')}
              className={`text-sm font-medium ${dark ? 'text-indigo-400' : 'text-[#7da88a]'}`}
            >
              View all
            </button>
          </div>
          <div className="space-y-2">
            {rooms.slice(0, 6).map(room => {
              const roomBoxes = store.getBoxes().filter(b => b.destination_room_id === room.id)
              const roomUnpacked = roomBoxes.filter(b => b.status === 'unpacked').length
              return (
                <button
                  key={room.id}
                  onClick={() => navigate(`/rooms/${room.id}`)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                    dark ? 'hover:bg-gray-800 active:bg-gray-700' : 'hover:bg-[#f8f2ec] active:bg-[#f0e8de]'
                  }`}
                >
                  <span className={`text-sm ${dark ? 'text-gray-300' : 'text-[#5a4e42]'}`}>{room.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>
                      {roomUnpacked}/{roomBoxes.length} unpacked
                    </span>
                    {roomBoxes.length > 0 && roomUnpacked === roomBoxes.length && (
                      <CheckCircle2 className={`w-4 h-4 ${dark ? 'text-emerald-400' : 'text-[#95c9a8]'}`} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vine divider — light mode only */}
      {!dark && <VineDivider className="my-1" />}

      {/* Essentials Kit Progress */}
      <button
        onClick={() => navigate('/essentials')}
        className={`w-full rounded-2xl border p-4 text-left relative overflow-hidden ${
          dark
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-gradient-to-r from-[#faf0e4] to-[#f5e6d0] border-[#e8d5be]'
        }`}
      >
        {!dark && (
          <>
            <Bunny className="absolute -right-1 -bottom-1 opacity-30" size={36} />
            <Sparkle className="absolute top-2 right-16 opacity-40" size={10} />
          </>
        )}
        <div className="flex items-center justify-between relative">
          <div>
            <h2 className={`font-semibold ${dark ? 'text-white' : 'text-[#3d3429]'}`}>Essentials Kit</h2>
            <p className={`text-sm mt-0.5 ${dark ? 'text-gray-400' : 'text-[#b0a090]'}`}>
              {essentialsPacked} of {essentialsTotal} items packed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing value={essentialsPacked} total={essentialsTotal || 1} size={48} strokeWidth={4} color={dark ? '#f59e0b' : '#d4a166'} />
            <ArrowRight className={`w-4 h-4 ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`} />
          </div>
        </div>
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { to: '/unpack', icon: CheckCircle2, label: 'Unpacking Queue', sub: `${stats.toUnpack} remaining`, iconColor: dark ? 'text-emerald-400' : 'text-[#95c9a8]' },
          { to: '/labels', icon: Package, label: 'Print Labels', sub: 'QR codes for boxes', iconColor: dark ? 'text-indigo-400' : 'text-[#9bb8a4]' },
          { to: '/print/movers', icon: Truck, label: 'Mover Sheet', sub: 'Print for movers', iconColor: dark ? 'text-amber-400' : 'text-[#c4935a]' },
          { to: '/essentials', icon: StarIcon, label: 'Essentials', sub: 'First night kit', iconColor: dark ? 'text-yellow-400' : 'text-[#c4a03a]' },
          { to: '/landlord', icon: MessageCircle, label: 'Landlord Q\'s', sub: 'Questions & requests', iconColor: dark ? 'text-purple-400' : 'text-[#b8a9c9]' },
          { to: '/checklist', icon: ClipboardList, label: 'Move-In Checklist', sub: 'Utilities, address, setup', iconColor: dark ? 'text-cyan-400' : 'text-[#8bb8a8]' },
          { to: '/estimate', icon: Calculator, label: 'Moving Estimate', sub: 'Box counts & furniture', iconColor: dark ? 'text-lime-400' : 'text-[#7da88a]' },
        ].map(({ to, icon: Icon, label, sub, iconColor }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`rounded-2xl border p-4 text-left active:scale-[0.98] transition-transform ${
              dark
                ? 'bg-gray-900/60 border-gray-800 hover:border-gray-700'
                : 'bg-white border-[#e8ddd0]/60 hover:border-[#d4c8ba]'
            }`}
          >
            <Icon className={`w-5 h-5 mb-2 ${iconColor}`} />
            <div className={`font-medium text-sm ${dark ? 'text-white' : 'text-[#3d3429]'}`}>{label}</div>
            <div className={`text-xs mt-0.5 ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>{sub}</div>
          </button>
        ))}
      </div>

      {/* Another vine divider */}
      {!dark && <VineDivider className="my-1" />}

      {/* Countdown + Packing Schedule */}
      <PackingSchedule rooms={rooms} store={store} dark={dark} />

      {/* Activity Feed */}
      {activity.length > 0 && (
        <div className={`rounded-2xl p-4 ${
          dark ? 'bg-gray-900/60 border border-gray-800' : 'bg-white border border-[#e8ddd0]/60'
        }`}>
          <h2 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-[#3d3429]'}`}>Recent Activity</h2>
          <div className="space-y-2">
            {activity.slice(0, 5).map(entry => {
              const box = store.getBox(entry.box_id)
              const timeAgo = getTimeAgo(entry.created_at)
              return (
                <div key={entry.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dark ? 'bg-indigo-400' : 'bg-[#9bb8a4]'}`} />
                  <span className={dark ? 'text-gray-300' : 'text-[#5a4e42]'}>
                    {entry.action === 'created' && `Box #${entry.details?.box_number} packed`}
                    {entry.action === 'status_changed' && `Box #${box?.box_number || '?'} → ${getStatusLabel(entry.details?.status)}`}
                  </span>
                  <span className={`ml-auto text-xs ${dark ? 'text-gray-600' : 'text-[#8a7e72]'}`}>{timeAgo}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PackingSchedule({ rooms, store, dark }) {
  const moveDate = new Date('2026-05-01')
  const today = new Date()
  const daysLeft = Math.max(0, Math.ceil((moveDate - today) / (1000 * 60 * 60 * 24)))
  const weeksLeft = Math.ceil(daysLeft / 7)

  const schedule = [
    { week: 'Now (6+ weeks out)', priority: 'low', rooms: ['Storage Locker', 'Basement', 'Garage', 'Donate / Discard'], tip: 'Start with rooms you barely use. Seasonal items, storage, decorations.' },
    { week: '4-5 weeks out', priority: 'medium', rooms: ['Office', "Lydia's Room", "Miles's Room"], tip: "Kids' rooms (except daily essentials), office books & files, wall art." },
    { week: '2-3 weeks out', priority: 'high', rooms: ['Living Room', 'Primary Bedroom', 'Upstairs Bath', 'Basement Full Bath'], tip: 'Leave out 1 week of clothes/towels. Pack everything else.' },
    { week: 'Final week', priority: 'urgent', rooms: ['Kitchen', 'Powder Room'], tip: 'Kitchen last (you need it). Use paper plates the final days. Pack essentials box.' },
  ]

  const getPhaseForDays = (d) => {
    if (d > 35) return 0
    if (d > 21) return 1
    if (d > 7) return 2
    return 3
  }

  const currentPhase = getPhaseForDays(daysLeft)

  return (
    <div className={`rounded-2xl p-4 relative overflow-hidden ${
      dark ? 'bg-gray-900/60 border border-gray-800' : 'bg-white border border-[#e8ddd0]/60'
    }`}>
      {!dark && (
        <>
          <Bird className="absolute top-3 right-4 opacity-40" size={24} />
          <TinyHouse className="absolute bottom-3 right-3 opacity-20" size={28} />
          <SmallFlower className="absolute bottom-5 right-10 opacity-30" size={12} />
        </>
      )}
      <div className="flex items-center justify-between mb-4 relative">
        <h2 className={`font-semibold flex items-center gap-2 ${dark ? 'text-white' : 'text-[#3d3429]'}`}>
          <Calendar className={`w-4 h-4 ${dark ? 'text-indigo-400' : 'text-[#9bb8a4]'}`} />
          Packing Schedule
        </h2>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          dark ? 'bg-indigo-500/10' : 'bg-[#d4e4d9]'
        }`}>
          <Timer className={`w-3.5 h-3.5 ${dark ? 'text-indigo-400' : 'text-[#6a9b7a]'}`} />
          <span className={`text-sm font-bold ${dark ? 'text-indigo-400' : 'text-[#4a7c5c]'}`}>{daysLeft}</span>
          <span className={`text-xs ${dark ? 'text-indigo-400/60' : 'text-[#6a9b7a]'}`}>days</span>
        </div>
      </div>

      <div className={`text-xs mb-3 ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>
        Move day: May 1, 2026 · ~{weeksLeft} weeks left
      </div>

      <div className="space-y-3">
        {schedule.map((phase, i) => {
          const isCurrent = i === currentPhase
          const isPast = i < currentPhase
          const matchingRooms = rooms.filter(r => phase.rooms.some(pr => r.name.includes(pr) || pr.includes(r.name)))
          const roomBoxes = matchingRooms.flatMap(r => store.getBoxes().filter(b => b.destination_room_id === r.id))
          const packedCount = roomBoxes.length

          return (
            <div
              key={i}
              className={`rounded-xl p-3 border transition-colors ${
                isCurrent
                  ? dark
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-[#9bb8a4] bg-[#edf5ef]'
                  : isPast
                  ? dark
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-[#c5d9cb] bg-[#f2f8f4]'
                  : dark
                    ? 'border-gray-800'
                    : 'border-[#e8ddd0]/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {isPast && <CheckCircle2 className={`w-4 h-4 ${dark ? 'text-emerald-400' : 'text-[#95c9a8]'}`} />}
                  {isCurrent && <div className={`w-2 h-2 rounded-full animate-pulse ${dark ? 'bg-indigo-500' : 'bg-[#9bb8a4]'}`} />}
                  <span className={`text-sm font-medium ${
                    isCurrent
                      ? dark ? 'text-indigo-400' : 'text-[#4a7c5c]'
                      : isPast
                      ? dark ? 'text-emerald-400' : 'text-[#6a9b7a]'
                      : dark ? 'text-gray-400' : 'text-[#6b5f53]'
                  }`}>
                    {phase.week}
                  </span>
                  {isCurrent && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white ${
                      dark ? 'bg-indigo-500' : 'bg-[#9bb8a4]'
                    }`}>NOW</span>
                  )}
                </div>
                {packedCount > 0 && <span className={`text-xs ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>{packedCount} packed</span>}
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                {phase.rooms.map(r => (
                  <span key={r} className={`text-xs px-2 py-0.5 rounded-full ${
                    dark ? 'bg-gray-800 text-gray-400' : 'bg-[#ede5db] text-[#5a4e42]'
                  }`}>{r}</span>
                ))}
              </div>
              <p className={`text-xs ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>{phase.tip}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
