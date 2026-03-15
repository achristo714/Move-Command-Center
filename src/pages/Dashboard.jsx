import { useNavigate } from 'react-router-dom'
import { Package, AlertTriangle, Star, Truck, Archive, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressRing from '../components/ProgressRing'
import { useStats, useRooms, useActivityLog, useEssentials } from '../hooks/useStore'
import { getStatusColor, getStatusLabel, STATUS_OPTIONS } from '../lib/constants'
import store from '../lib/store'

function StatCard({ icon: Icon, label, value, color = 'text-slate-800', bgColor = 'bg-slate-100' }) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-3 geo-border">
      <div className={`w-8 h-8 ${bgColor} dark:bg-opacity-20 rounded-lg flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const stats = useStats()
  const { rooms } = useRooms()
  const activity = useActivityLog()
  const { essentials } = useEssentials()

  const essentialsPacked = essentials.filter(e => e.is_packed).length
  const essentialsTotal = essentials.length

  const statusIcons = {
    packed: Package,
    loaded: Truck,
    in_storage: Archive,
    delivered: Clock,
    unpacked: CheckCircle2,
  }

  return (
    <div className="space-y-6">
      {/* Hero / Progress */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 text-center dot-grid glow-blue">
        <h1 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Move Command Center</h1>
        <p className="text-sm text-slate-400 mb-4">
          {stats.total === 0
            ? "No boxes yet — let's get packing!"
            : stats.unpacked === stats.total
            ? 'Welcome home! Everything is unpacked.'
            : `${stats.toUnpack} boxes to go`}
        </p>
        <div className="flex justify-center">
          <ProgressRing
            value={stats.unpacked}
            total={stats.total || 1}
            size={140}
            strokeWidth={12}
            color="#22c55e"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.total > 0 ? Math.round((stats.unpacked / stats.total) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">unpacked</div>
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Boxes" value={stats.total} bgColor="bg-blue-50" color="text-blue-500" />
        <StatCard icon={Clock} label="Packed Today" value={stats.packedToday} bgColor="bg-orange-50" color="text-orange-500" />
        <StatCard icon={AlertTriangle} label="Fragile" value={stats.fragileCount} bgColor="bg-red-50" color="text-red-500" />
        <StatCard icon={Star} label="Priority (Unpacked)" value={stats.priorityUnpacked} bgColor="bg-yellow-50" color="text-yellow-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Status Breakdown</h2>
          <div className="space-y-2">
            {STATUS_OPTIONS.map(({ value, label }) => {
              const count = stats.byStatus[value] || 0
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
              const Icon = statusIcons[value] || Package
              return (
                <div key={value} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: getStatusColor(value) }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300 w-20">{label}</span>
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: getStatusColor(value) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Room Overview */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800 dark:text-white">Rooms</h2>
            <button
              onClick={() => navigate('/rooms')}
              className="text-sm text-blue-500 font-medium"
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
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 active:bg-slate-100 transition-colors"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{room.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {roomUnpacked}/{roomBoxes.length} unpacked
                    </span>
                    {roomBoxes.length > 0 && roomUnpacked === roomBoxes.length && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Essentials Kit Progress */}
      <button
        onClick={() => navigate('/essentials')}
        className="w-full bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 rounded-2xl border border-yellow-200 dark:border-yellow-500/20 p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800 dark:text-white">Essentials Kit</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {essentialsPacked} of {essentialsTotal} items packed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProgressRing value={essentialsPacked} total={essentialsTotal || 1} size={48} strokeWidth={4} color="#eab308" />
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </button>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/unpack')}
          className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 text-left active:scale-[0.98] transition-transform"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 mb-2" />
          <div className="font-medium text-sm text-slate-800 dark:text-white">Unpacking Queue</div>
          <div className="text-xs text-slate-400 mt-0.5">{stats.toUnpack} remaining</div>
        </button>
        <button
          onClick={() => navigate('/labels')}
          className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 text-left active:scale-[0.98] transition-transform"
        >
          <Package className="w-5 h-5 text-blue-500 mb-2" />
          <div className="font-medium text-sm text-slate-800 dark:text-white">Print Labels</div>
          <div className="text-xs text-slate-400 mt-0.5">QR codes for boxes</div>
        </button>
        <button
          onClick={() => navigate('/print/movers')}
          className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 text-left active:scale-[0.98] transition-transform"
        >
          <Truck className="w-5 h-5 text-orange-500 mb-2" />
          <div className="font-medium text-sm text-slate-800 dark:text-white">Mover Sheet</div>
          <div className="text-xs text-slate-400 mt-0.5">Print for movers</div>
        </button>
        <button
          onClick={() => navigate('/essentials')}
          className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 text-left active:scale-[0.98] transition-transform"
        >
          <Star className="w-5 h-5 text-yellow-500 mb-2" />
          <div className="font-medium text-sm text-slate-800 dark:text-white">Essentials</div>
          <div className="text-xs text-slate-400 mt-0.5">First night kit</div>
        </button>
      </div>

      {/* Activity Feed */}
      {activity.length > 0 && (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-4">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {activity.slice(0, 5).map(entry => {
              const box = store.getBox(entry.box_id)
              const timeAgo = getTimeAgo(entry.created_at)
              return (
                <div key={entry.id} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-slate-600 dark:text-slate-300">
                    {entry.action === 'created' && `Box #${entry.details?.box_number} packed`}
                    {entry.action === 'status_changed' && `Box #${box?.box_number || '?'} → ${getStatusLabel(entry.details?.status)}`}
                  </span>
                  <span className="text-slate-300 dark:text-slate-500 ml-auto text-xs">{timeAgo}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
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
