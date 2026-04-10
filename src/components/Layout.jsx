import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Package, MapPin, Search, Image, Plus, Settings, Moon, Sun, Menu, X, ClipboardList, Calculator, MessageCircle, CheckSquare, ListOrdered } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'
import { SmallFlower } from './Decorations'
import { useStore } from '../hooks/useStore'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/boxes', icon: Package, label: 'Boxes' },
  { to: '/rooms', icon: MapPin, label: 'Rooms' },
  { to: '/search', icon: Search, label: 'Search' },
]

// Desktop nav includes these extra items with short labels
const desktopExtraItems = [
  { to: '/checklist', icon: ClipboardList, label: 'Checklist' },
  { to: '/estimate', icon: Calculator, label: 'Estimate' },
  { to: '/landlord', icon: MessageCircle, label: "LL Q's" },
]

const moreItems = [
  { to: '/checklist', icon: ClipboardList, label: 'Checklist', desc: 'Utilities, address updates, setup tasks', iconBg: 'bg-rose-100 dark:bg-rose-500/10', iconColor: 'text-rose-600 dark:text-rose-400' },
  { to: '/estimate', icon: Calculator, label: 'Estimate', desc: 'Box counts & furniture for movers', iconBg: 'bg-teal-100 dark:bg-teal-500/10', iconColor: 'text-teal-600 dark:text-teal-400' },
  { to: '/landlord', icon: MessageCircle, label: "Landlord Q's", desc: 'Questions & requests', iconBg: 'bg-purple-100 dark:bg-purple-500/10', iconColor: 'text-purple-600 dark:text-purple-400' },
  { to: '/essentials', icon: CheckSquare, label: 'Essentials', desc: 'Must-haves for day one', iconBg: 'bg-yellow-100 dark:bg-yellow-500/10', iconColor: 'text-yellow-600 dark:text-yellow-400' },
  { to: '/unpack', icon: ListOrdered, label: 'Unpack Queue', desc: 'Priority unpack order', iconBg: 'bg-emerald-100 dark:bg-emerald-500/10', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  { to: '/photos', icon: Image, label: 'Photos', desc: 'All box photos', iconBg: 'bg-pink-100 dark:bg-pink-500/10', iconColor: 'text-pink-600 dark:text-pink-400' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Rooms, estimates, export data', iconBg: 'bg-gray-100 dark:bg-gray-500/10', iconColor: 'text-gray-600 dark:text-gray-400' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)
  const { state: appState } = useStore()
  const isPrintPage = location.pathname.startsWith('/print') || location.pathname === '/labels'

  if (isPrintPage) {
    return <Outlet />
  }

  return (
    <div className={`min-h-screen pb-20 lg:pb-6 ${
      dark
        ? 'bg-gray-950'
        : 'ac-bg'
    }`}>
      <header className={`sticky top-0 z-40 backdrop-blur-lg border-b ${
        dark
          ? 'bg-gray-950/80 border-gray-800'
          : 'bg-[#faf6f0]/80 border-[#e8ddd0]'
      }`}>
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${
              dark
                ? 'bg-indigo-600'
                : 'bg-gradient-to-br from-[#9bb8a4] to-[#7da88a]'
            }`}>
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight ${
              dark ? 'text-white' : 'text-[#3d3429]'
            }`}>MoveHQ</span>
            {!dark && <SmallFlower className="ml-0.5 -mt-1" size={12} color="#eab8be" />}
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {[...navItems, ...desktopExtraItems].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? dark
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'bg-[#d4e4d9] text-[#4a7c5c]'
                      : dark
                        ? 'text-gray-400 hover:bg-gray-800/60'
                        : 'text-[#6b5f53] hover:bg-[#f0e8de]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className={`p-2 rounded-lg transition-colors ${
                dark
                  ? 'text-gray-400 hover:text-yellow-300 hover:bg-gray-800'
                  : 'text-[#7a6b5d] hover:text-[#7a6b5d] hover:bg-[#f0e8de]'
              }`}
              title={dark ? 'Switch to Hers' : 'Switch to His'}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/boxes/new')}
              className={`text-white rounded-full w-10 h-10 flex items-center justify-center active:scale-95 transition-transform ${
                dark
                  ? 'bg-indigo-600 shadow-lg shadow-indigo-500/30'
                  : 'bg-gradient-to-br from-[#9bb8a4] to-[#7da88a] shadow-lg shadow-[#9bb8a4]/30'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {!appState.initialized && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your move...</p>
              </div>
            )}
            {appState.lastError && (
              <div className="mb-3 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-2 text-sm text-red-500 dark:text-red-400">
                {appState.lastError}
              </div>
            )}
            {appState.initialized && <Outlet />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/25 z-50"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl max-h-[70vh] overflow-auto safe-bottom ${
                dark ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <div className="p-5">
                <div className={`w-10 h-1 rounded-full mx-auto mb-4 ${
                  dark ? 'bg-gray-700' : 'bg-[#e0d5c8]'
                }`} />
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold ${dark ? 'text-white' : 'text-[#3d3429]'}`}>More</h2>
                  <button onClick={() => setMoreOpen(false)} className={dark ? 'p-1 text-gray-500' : 'p-1 text-[#7a6b5d]'}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {moreItems.map(({ to, icon: Icon, label, desc, iconBg, iconColor }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                          isActive
                            ? dark ? 'bg-indigo-500/10' : 'bg-[#edf5ef]'
                            : dark ? 'hover:bg-gray-800' : 'hover:bg-[#f8f2ec] active:bg-[#f0e8de]'
                        }`
                      }
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${iconBg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${dark ? 'text-white' : 'text-[#3d3429]'}`}>{label}</div>
                        <div className={`text-xs truncate ${dark ? 'text-gray-500' : 'text-[#7a6b5d]'}`}>{desc}</div>
                      </div>
                    </NavLink>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t safe-bottom lg:hidden ${
        dark
          ? 'bg-gray-950/80 border-gray-800'
          : 'bg-white/80 border-[#e8ddd0]'
      }`}>
        <div className="max-w-5xl mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? dark ? 'text-indigo-400' : 'text-[#7da88a]'
                    : dark ? 'text-gray-500 active:text-gray-300' : 'text-[#7a6b5d] active:text-[#6b5f53]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              moreOpen
                ? dark ? 'text-indigo-400' : 'text-[#7da88a]'
                : dark ? 'text-gray-500 active:text-gray-300' : 'text-[#7a6b5d] active:text-[#6b5f53]'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
