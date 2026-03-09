import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Heart, Settings, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Forecast', path: '/forecast', icon: BarChart3 },
  { name: 'Health', path: '/health', icon: Heart },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-r border-black/10 dark:border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Close button - Mobile only */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white lg:hidden"
        >
          <X size={24} />
        </button>

        {/* Animated edge gradient line */}
        <div className="absolute right-0 top-0 bottom-0 w-px">
          <motion.div
            className="w-full h-1/3 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent"
            animate={{ y: ['0%', '200%', '0%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Particle BG */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-emerald-400/30"
              style={{ left: `${15 + i * 14}%`, bottom: '10%' }}
              animate={{ y: [0, -80 - i * 30, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
        </div>

        {/* Logo */}
        <div className="p-6 pb-2">
          <Link to="/" className="block">
            <h2 className="text-xl lg:text-2xl font-black">
              <span className="text-slate-900 dark:text-white">Aero</span>
              <span className="text-emerald-500">Sense</span>
              <motion.span
                className="text-emerald-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                .ai
              </motion.span>
            </h2>
          </Link>
          <p className="text-[10px] text-slate-400 mt-1 tracking-wider uppercase">Air Quality Monitor</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 px-4 py-4 lg:py-3 rounded-xl transition-all duration-200 ${active
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/10 border-l-2 border-emerald-500 shadow-lg shadow-emerald-500/5"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="relative z-10 font-medium text-sm lg:text-base">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Theme + Version */}
        <div className="p-4 space-y-3 border-t border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-md">
          <ThemeToggle size="sm" />
          <p className="text-[10px] text-slate-400 text-center tracking-wider">v1.2 stable</p>
        </div>
      </aside>
    </>
  );
}