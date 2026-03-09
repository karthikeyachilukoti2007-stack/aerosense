import { useState } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, LayoutDashboard, BarChart3, Heart, Settings as SettingsIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BackgroundScene from './components/BackgroundScene';
import { FloatingParticles } from './components/FloatingParticles';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Settings from './pages/Settings';
import Health from './pages/Health';
import { useTheme } from './context/ThemeContext';

const bottomNavItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Forecast', path: '/forecast', icon: BarChart3 },
  { name: 'Health', path: '/health', icon: Heart },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
];

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/health" element={<Health />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const { isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <BackgroundScene />
      <FloatingParticles isDark={isDark} />

      <div className="flex min-h-screen relative z-10 overflow-hidden">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-white/80 dark:bg-black/80 backdrop-blur-md border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 lg:hidden shadow-lg"
        >
          <Menu size={24} />
        </button>

        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          <AnimatedRoutes />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-black/10 dark:border-white/10 z-40 flex items-center justify-around px-4 lg:hidden">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} className="flex flex-col items-center gap-1 group">
                <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-emerald-500/20 text-emerald-500' : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  <Icon size={24} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight uppercase transition-colors duration-300 ${active ? 'text-emerald-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default App;