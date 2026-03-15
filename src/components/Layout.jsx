import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, MapPin, Search, Image, Plus, Settings, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/boxes', icon: Package, label: 'Boxes' },
  { to: '/rooms', icon: MapPin, label: 'Rooms' },
  { to: '/photos', icon: Image, label: 'Photos' },
  { to: '/search', icon: Search, label: 'Search' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle } = useTheme()
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
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <Settings className="w-5 h-5" />
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
        </div>
      </nav>
    </div>
  )
}
