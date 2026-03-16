import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, Star as StarIcon, Truck, Archive, CheckCircle2, Clock, ArrowRight, Calendar, Timer, MessageCircle, ClipboardList, Calculator, Home, ListOrdered, Image } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressRing from '../components/ProgressRing'
import { useStats, useRooms, useActivityLog, useEssentials } from '../hooks/useStore'
import { getStatusColor, getStatusLabel, STATUS_OPTIONS } from '../lib/constants'
import { useTheme } from '../hooks/useTheme'
import { Flower, Leaf, Bunny, Bird, SmallFlower, TinyHouse, Sparkle, Butterfly, WavyDivider, ScatteredPattern } from '../components/Decorations'
import store from '../lib/store'

// AC-style colorful tile config for quick actions
const QUICK_TILES = [
  { to: '/unpack', icon: CheckCircle2, label: 'Unpack', bg: 'bg-emerald-100', iconColor: 'text-emerald-600', darkBg: 'dark:bg-emerald-500/10', darkIcon: 'dark:text-emerald-400' },
  { to: '/labels', icon: Package, label: 'Labels', bg: 'bg-sky-100', iconColor: 'text-sky-600', darkBg: 'dark:bg-sky-500/10', darkIcon: 'dark:text-sky-400' },
  { to: '/print/movers', icon: Truck, label: 'Movers', bg: 'bg-orange-100', iconColor: 'text-orange-600', darkBg: 'dark:bg-orange-500/10', darkIcon: 'dark:text-orange-400' },
  { to: '/essentials', icon: StarIcon, label: 'Essentials', bg: 'bg-yellow-100', iconColor: 'text-yellow-600', darkBg: 'dark:bg-yellow-500/10', darkIcon: 'dark:text-yellow-400' },
  { to: '/landlord', icon: MessageCircle, label: "LL Q's", bg: 'bg-purple-100', iconColor: 'text-purple-600', darkBg: 'dark:bg-purple-500/10', darkIcon: 'dark:text-purple-400' },
  { to: '/checklist', icon: ClipboardList, label: 'Checklist', bg: 'bg-rose-100', iconColor: 'text-rose-600', darkBg: 'dark:bg-rose-500/10', darkIcon: 'dark:text-rose-400' },
  { to: '/estimate', icon: Calculator, label: 'Estimate', bg: 'bg-teal-100', iconColor: 'text-teal-600', darkBg: 'dark:bg-teal-500/10', darkIcon: 'dark:text-teal-400' },
  { to: '/photos', icon: Image, label: 'Photos', bg: 'bg-pink-100', iconColor: 'text-pink-600', darkBg: 'dark:bg-pink-500/10', darkIcon: 'dark:text-pink-400' },
  { to: '/rooms', icon: Home, label: 'Rooms', bg: 'bg-amber-100', iconColor: 'text-amber-600', darkBg: 'dark:bg-amber-500/10', darkIcon: 'dark:text-amber-400' },
]

function StatCard({ icon: Icon, label, value, bg, iconColor, darkBg, darkIcon }) {
  return (
    <div className={`rounded-2xl border p-3 bg-white dark:bg-gray-900/60 border-[#e8ddd0]/60 dark:border-gray-800`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${bg} ${darkBg}`}>
        <Icon className={`w-4.5 h-4.5 ${iconColor} ${darkIcon}`} />
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
    <div className="space-y-5">
      {/* Hero / Progress */}
      <div className={`rounded-3xl p-6 text-center relative overflow-hidden ${
        dark
          ? 'bg-gray-900/60 border border-gray-800'
          : 'bg-white border border-[#e8ddd0]/60'
      }`}>
        {/* Scattered pattern in hero */}
        {!dark && <ScatteredPattern />}

        {/* Light mode decorations */}
        {!dark && (
          <>
            <Flower className="absolute top-3 left-4" size={28} />
            <Leaf className="absolute top-2 right-5 -rotate-12" size={24} />
            <SmallFlower className="absolute bottom-4 left-8" size={18} color="#b5cfe0" />
            <Butterfly className="absolute top-8 right-4" size={22} />
            <Sparkle className="absolute top-14 left-16" size={12} />
            <Sparkle className="absolute bottom-6 right-16" size={14} />
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
        <StatCard icon={Package} label="Total Boxes" value={stats.total} bg="bg-emerald-100" iconColor="text-emerald-600" darkBg="dark:bg-indigo-500/10" darkIcon="dark:text-indigo-400" />
        <StatCard icon={Clock} label="Packed Today" value={stats.packedToday} bg="bg-orange-100" iconColor="text-orange-600" darkBg="dark:bg-amber-500/10" darkIcon="dark:text-amber-400" />
        <StatCard icon={AlertTriangle} label="Fragile" value={stats.fragileCount} bg="bg-rose-100" iconColor="text-rose-600" darkBg="dark:bg-red-500/10" darkIcon="dark:text-red-400" />
        <StatCard icon={StarIcon} label="Priority" value={stats.priorityUnpacked} bg="bg-yellow-100" iconColor="text-yellow-600" darkBg="dark:bg-yellow-500/10" darkIcon="dark:text-yellow-400" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
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

      {/* Wavy divider — light mode only */}
      {!dark && <WavyDivider />}

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
            <Bunny className="absolute -right-1 -bottom-1 opacity-50" size={40} />
            <Sparkle className="absolute top-2 right-18 opacity-50" size={12} />
          </>
        )}
        <div className="flex items-center justify-between relative">
          <div>
            <h2 className={`font-semibold ${dark ? 'text-white' : 'text-[#3d3429]'}`}>Essentials Kit</h2>
            <p className={`text-sm mt-0.5 ${dark ? 'text-gray-400' : 'text-[#8a7e72]'}`}>
              {essentialsPacked} of {essentialsTotal} items packed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing value={essentialsPacked} total={essentialsTotal || 1} size={48} strokeWidth={4} color={dark ? '#f59e0b' : '#d4a166'} />
            <ArrowRight className={`w-4 h-4 ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`} />
          </div>
        </div>
      </button>

      {/* AC-Style Quick Actions Grid */}
      <div>
        <h2 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-[#3d3429]'}`}>Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_TILES.map(({ to, icon: Icon, label, bg, iconColor, darkBg, darkIcon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${
                dark ? `bg-gray-800 border border-gray-700` : `${bg} border border-white/60`
              }`}>
                <Icon className={`w-6 h-6 ${dark ? darkIcon : iconColor}`} />
              </div>
              <span className={`text-[11px] font-medium leading-tight ${dark ? 'text-gray-400' : 'text-[#5a4e42]'}`}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Another wavy divider */}
      {!dark && <WavyDivider />}

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
  const totalDays = 49 // 7 weeks total timeline

  const schedule = [
    { week: '6+ weeks', label: 'Storage & Garage', startDay: 0, endDay: 14, color: dark ? 'bg-sky-500/30' : 'bg-sky-200', barColor: dark ? 'bg-sky-500' : 'bg-sky-400', rooms: ['Storage Locker', 'Basement', 'Garage', 'Donate / Discard'], tip: 'Start with rooms you barely use.' },
    { week: '4-5 weeks', label: 'Office & Kids', startDay: 14, endDay: 28, color: dark ? 'bg-amber-500/30' : 'bg-amber-200', barColor: dark ? 'bg-amber-500' : 'bg-amber-400', rooms: ['Office', "Lydia's Room", "Miles's Room"], tip: "Kids' rooms, office books & files, wall art." },
    { week: '2-3 weeks', label: 'Bedrooms & Baths', startDay: 28, endDay: 42, color: dark ? 'bg-purple-500/30' : 'bg-purple-200', barColor: dark ? 'bg-purple-500' : 'bg-purple-400', rooms: ['Living Room', 'Primary Bedroom', 'Upstairs Bath', 'Basement Full Bath'], tip: 'Leave out 1 week of clothes/towels.' },
    { week: 'Final week', label: 'Kitchen & Last', startDay: 42, endDay: 49, color: dark ? 'bg-rose-500/30' : 'bg-rose-200', barColor: dark ? 'bg-rose-500' : 'bg-rose-400', rooms: ['Kitchen', 'Powder Room'], tip: 'Kitchen last. Use paper plates.' },
  ]

  const getPhaseForDays = (d) => {
    if (d > 35) return 0
    if (d > 21) return 1
    if (d > 7) return 2
    return 3
  }

  const currentPhase = getPhaseForDays(daysLeft)
  // Progress marker position (days elapsed from start)
  const elapsed = totalDays - daysLeft
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100))

  return (
    <div className={`rounded-2xl p-4 relative overflow-hidden ${
      dark ? 'bg-gray-900/60 border border-gray-800' : 'bg-white border border-[#e8ddd0]/60'
    }`}>
      {!dark && (
        <>
          <Bird className="absolute top-3 right-4 opacity-50" size={28} />
          <TinyHouse className="absolute bottom-3 right-3 opacity-30" size={32} />
          <SmallFlower className="absolute bottom-5 right-12 opacity-40" size={14} />
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

      <div className={`text-xs mb-4 ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>
        Move day: May 1, 2026 · ~{weeksLeft} weeks left
      </div>

      {/* Gantt Chart */}
      <div className="mb-5 relative">
        {/* Week markers */}
        <div className="flex justify-between mb-1 px-0.5">
          {['W7', 'W6', 'W5', 'W4', 'W3', 'W2', 'W1', 'Move!'].map((w, i) => (
            <span key={i} className={`text-[9px] font-medium ${dark ? 'text-gray-600' : 'text-[#b0a090]'}`}>{w}</span>
          ))}
        </div>

        {/* Bars */}
        <div className="space-y-1.5 relative">
          {schedule.map((phase, i) => {
            const left = (phase.startDay / totalDays) * 100
            const width = ((phase.endDay - phase.startDay) / totalDays) * 100
            const isCurrent = i === currentPhase
            const isPast = i < currentPhase
            const matchingRooms = rooms.filter(r => phase.rooms.some(pr => r.name.includes(pr) || pr.includes(r.name)))
            const roomBoxes = matchingRooms.flatMap(r => store.getBoxes().filter(b => b.destination_room_id === r.id))

            return (
              <div key={i} className="flex items-center gap-2">
                <div className="w-full relative">
                  {/* Track */}
                  <div className={`h-7 rounded-lg w-full ${dark ? 'bg-gray-800/50' : 'bg-[#f5f0ea]'}`}>
                    {/* Bar */}
                    <motion.div
                      className={`h-full rounded-lg relative flex items-center px-2 ${
                        isPast ? (dark ? 'bg-emerald-500/20' : 'bg-emerald-200') : phase.barColor
                      } ${isCurrent ? 'ring-2 ring-offset-1 ' + (dark ? 'ring-indigo-500 ring-offset-gray-900' : 'ring-[#9bb8a4] ring-offset-white') : ''}`}
                      style={{ marginLeft: `${left}%`, width: `${width}%` }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                    >
                      <span className={`text-[10px] font-semibold truncate ${
                        isPast ? (dark ? 'text-emerald-400' : 'text-emerald-700') : (dark ? 'text-white/80' : 'text-gray-700')
                      }`}>
                        {phase.label}
                        {isPast && ' ✓'}
                        {roomBoxes.length > 0 && ` (${roomBoxes.length})`}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Today marker */}
          <div
            className="absolute top-0 bottom-0 z-10 pointer-events-none"
            style={{ left: `${progressPct}%` }}
          >
            <div className={`w-0.5 h-full ${dark ? 'bg-indigo-400' : 'bg-[#7da88a]'}`} />
            <div className={`absolute -top-4 -translate-x-1/2 text-[8px] font-bold px-1 py-0.5 rounded ${
              dark ? 'bg-indigo-500 text-white' : 'bg-[#9bb8a4] text-white'
            }`}>
              TODAY
            </div>
          </div>
        </div>
      </div>

      {/* Detail cards */}
      <div className="space-y-2">
        {schedule.map((phase, i) => {
          const isCurrent = i === currentPhase
          const isPast = i < currentPhase

          return (
            <div
              key={i}
              className={`rounded-xl p-2.5 border transition-colors ${
                isCurrent
                  ? dark ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-[#9bb8a4] bg-[#edf5ef]'
                  : isPast
                  ? dark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[#c5d9cb] bg-[#f2f8f4]'
                  : dark ? 'border-gray-800' : 'border-[#e8ddd0]/60'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                {isPast && <CheckCircle2 className={`w-3.5 h-3.5 ${dark ? 'text-emerald-400' : 'text-[#95c9a8]'}`} />}
                {isCurrent && <div className={`w-2 h-2 rounded-full animate-pulse ${dark ? 'bg-indigo-500' : 'bg-[#9bb8a4]'}`} />}
                <span className={`text-xs font-medium ${
                  isCurrent ? (dark ? 'text-indigo-400' : 'text-[#4a7c5c]')
                    : isPast ? (dark ? 'text-emerald-400' : 'text-[#6a9b7a]')
                    : (dark ? 'text-gray-400' : 'text-[#6b5f53]')
                }`}>
                  {phase.week}
                </span>
                {isCurrent && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium text-white ${dark ? 'bg-indigo-500' : 'bg-[#9bb8a4]'}`}>NOW</span>}
              </div>
              <div className="flex flex-wrap gap-1 mb-0.5">
                {phase.rooms.map(r => (
                  <span key={r} className={`text-[10px] px-1.5 py-0.5 rounded-full ${dark ? 'bg-gray-800 text-gray-400' : 'bg-[#ede5db] text-[#5a4e42]'}`}>{r}</span>
                ))}
              </div>
              <p className={`text-[11px] ${dark ? 'text-gray-500' : 'text-[#8a7e72]'}`}>{phase.tip}</p>
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
