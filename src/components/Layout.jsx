import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, MapPin, Search, Plus, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/boxes', icon: Package, label: 'Boxes' },
  { to: '/rooms', icon: MapPin, label: 'Rooms' },
  { to: '/search', icon: Search, label: 'Search' },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isPrintPage = location.pathname.startsWith('/print') || location.pathname === '/labels'

  if (isPrintPage) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-lg">MoveHQ</span>
          </NavLink>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 text-slate-400 active:text-slate-600"
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

      <main className="max-w-lg mx-auto px-4 py-4">
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

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-slate-200 safe-bottom">
        <div className="max-w-lg mx-auto flex justify-around py-2">
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
