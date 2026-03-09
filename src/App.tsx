import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import BackgroundScene from './components/BackgroundScene';
import { FloatingParticles } from './components/FloatingParticles';
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Settings from './pages/Settings';
import Health from './pages/Health';
import { useTheme } from './context/ThemeContext';

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
  return (
    <>
      <BackgroundScene />
      <FloatingParticles isDark={isDark} />
      <div className="flex min-h-screen relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatedRoutes />
        </main>
      </div>
    </>
  );
}

export default App;