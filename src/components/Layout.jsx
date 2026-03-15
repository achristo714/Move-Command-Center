import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, MapPin, Search, Image, Plus, Settings, Moon, Sun, Menu, X, ClipboardList, Calculator, MessageCircle, CheckSquare, ListOrdered } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/boxes', icon: Package, label: 'Boxes' },
  { to: '/rooms', icon: MapPin, label: 'Rooms' },
  { to: '/search', icon: Search, label: 'Search' },
]

const moreItems = [
  { to: '/checklist', icon: ClipboardList, label: 'Move-In Checklist', desc: 'Utilities, address updates, setup tasks' },
  { to: '/estimate', icon: Calculator, label: 'Moving Estimate', desc: 'Box counts & furniture for movers' },
  { to: '/landlord', icon: MessageCircle, label: 'Landlord Q\'s', desc: 'Questions & requests' },
  { to: '/essentials', icon: CheckSquare, label: 'First Night Essentials', desc: 'Must-haves for day one' },
  { to: '/unpack', icon: ListOrdered, label: 'Unpacking Queue', desc: 'Priority unpack order' },
  { to: '/photos', icon: Image, label: 'Photo Feed', desc: 'All box photos' },
  { to: '/settings', icon: Settings, label: 'Settings', desc: 'Rooms, estimates, export data' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useTheme()
  const [moreOpen, setMoreOpen] = useState(false)
  const isPrintPage = location.pathname.startsWith('/print') || location.pathname === '/labels'

  if (isPrintPage) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 lg:pb-6">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-lg">MoveHQ</span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
            {moreItems.slice(0, 3).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/boxes/new')}
              className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
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
            <Outlet />
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
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl max-h-[70vh] overflow-auto safe-bottom"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-slate-800 dark:text-white">More</h2>
                  <button onClick={() => setMoreOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {moreItems.map(({ to, icon: Icon, label, desc }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-500/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/30 active:bg-slate-100'
                        }`
                      }
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700/50`}>
                        <Icon className="w-4.5 h-4.5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-white">{label}</div>
                        <div className="text-xs text-slate-400 truncate">{desc}</div>
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 safe-bottom lg:hidden">
        <div className="max-w-5xl mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-slate-400 active:text-slate-600'
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
              moreOpen ? 'text-blue-500' : 'text-slate-400 active:text-slate-600'
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
