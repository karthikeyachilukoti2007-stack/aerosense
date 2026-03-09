import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, MapPin, Key, Info, Check, AlertTriangle, CloudRain } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import { fetchCityAQI } from '../services/airQualityService';

const glass = 'backdrop-blur-2xl rounded-2xl border transition-all duration-300 bg-white/70 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-xl dark:shadow-none';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

export default function Settings() {
  const { theme, isDark } = useTheme();
  const [defaultCity, setDefaultCity] = useState('');
  const [waqiKey, setWaqiKey] = useState('');
  const [openaqKey, setOpenaqKey] = useState('');
  const [savedCity, setSavedCity] = useState(false);
  const [savedKeys, setSavedKeys] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error', msg: string }>({ status: 'idle', msg: '' });

  useEffect(() => {
    try {
      setDefaultCity(localStorage.getItem('aerosense-default-city') || 'Delhi');
      setWaqiKey(localStorage.getItem('aerosense-waqi-token') || import.meta.env.VITE_WAQI_TOKEN || '');
      setOpenaqKey(localStorage.getItem('aerosense-openaq-key') || import.meta.env.VITE_OPENAQ_KEY || '');
    } catch { }
  }, []);

  const handleSaveCity = () => {
    try { localStorage.setItem('aerosense-default-city', defaultCity.trim() || 'Delhi'); } catch { }
    setSavedCity(true);
    setTimeout(() => setSavedCity(false), 2000);
  };

  const handleSaveKeys = () => {
    try {
      localStorage.setItem('aerosense-waqi-token', waqiKey.trim());
      localStorage.setItem('aerosense-openaq-key', openaqKey.trim());
    } catch { }
    setSavedKeys(true);
    setTimeout(() => setSavedKeys(false), 2000);
  };

  const testConnection = async () => {
    setTestResult({ status: 'testing', msg: 'Testing API waterfall...' });
    try {
      // Force temporary local storage so the service picks it up immediately
      localStorage.setItem('aerosense-waqi-token', waqiKey.trim());
      localStorage.setItem('aerosense-openaq-key', openaqKey.trim());

      const res = await fetchCityAQI(defaultCity || 'London');
      setTestResult({ status: 'success', msg: `Success! Resolved via ${res.source}. AQI: ${res.aqi}` });
    } catch (e: any) {
      setTestResult({ status: 'error', msg: e.message || 'All APIs failed to return data.' });
    }
  };

  const themeDescriptions = {
    light: 'Clean, bright interface optimized for well-lit environments.',
    dark: 'Eye-friendly dark interface with deep space gradients.',
    system: 'Automatically matches your operating system preference.',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <motion.div {...fadeUp}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your AeroSense experience</p>
      </motion.div>

      {/* Appearance */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className={`${glass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="text-emerald-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">Appearance</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <ThemeToggle size="lg" />
            <p className="text-sm text-slate-500 transition-colors duration-300">{themeDescriptions[theme]}</p>
          </div>
          <div className={`w-48 h-28 rounded-xl overflow-hidden border ${isDark ? 'bg-gradient-to-br from-[#020617] via-[#0a0f2e] to-[#000d1a] border-white/10' : 'bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f8fafc] border-slate-200'}`}>
            <div className="p-3">
              <div className={`w-16 h-2 rounded ${isDark ? 'bg-white/20' : 'bg-slate-300'} mb-2`} />
              <div className={`w-12 h-2 rounded ${isDark ? 'bg-emerald-500/40' : 'bg-emerald-300'} mb-3`} />
              <div className="flex gap-2">
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'}`} />
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'}`} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Default City */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${glass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-emerald-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">Default City</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4 transition-colors duration-300">Set the city that loads automatically when you open the app.</p>
        <div className="flex gap-3">
          <input
            value={defaultCity}
            onChange={e => setDefaultCity(e.target.value)}
            placeholder="Enter city name..."
            className="flex-1 px-4 py-2 bg-transparent rounded-xl border border-slate-300 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveCity}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {savedCity ? <><Check size={16} /> Saved!</> : 'Save'}
          </motion.button>
        </div>
      </motion.div>

      {/* API Configuration */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${glass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Key className="text-emerald-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">API Configuration (Waterfall)</h2>
        </div>
        <div className="space-y-4">

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block font-semibold tracking-wide">WAQI Token (Primary)</label>
              <input
                type="password"
                value={waqiKey}
                onChange={e => setWaqiKey(e.target.value)}
                placeholder="Enter WAQI Token..."
                className="w-full px-4 py-2 bg-transparent rounded-xl border border-slate-300 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white font-mono placeholder-slate-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block font-semibold tracking-wide">OpenAQ Key (Fallback level 1)</label>
              <input
                type="password"
                value={openaqKey}
                onChange={e => setOpenaqKey(e.target.value)}
                placeholder="Enter OpenAQ API Key (Optional)..."
                className="w-full px-4 py-2 bg-transparent rounded-xl border border-slate-300 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white font-mono placeholder-slate-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1 block font-semibold tracking-wide flex items-center gap-1.5 text-purple-500"><CloudRain size={12} /> Open-Meteo (Supplementary)</label>
              <div className="text-xs text-slate-400 italic">Always runs in parallel. No API key required.</div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveKeys}
              className="px-5 py-2 bg-slate-800 dark:bg-white/10 hover:bg-slate-700 dark:hover:bg-white/20 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2"
            >
              {savedKeys ? <><Check size={16} /> Keys Saved</> : 'Save Keys Offline'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={testConnection}
              className="px-5 py-2 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-sm font-semibold transition-all"
            >
              Run Waterfall Test
            </motion.button>
          </div>

          {testResult.status !== 'idle' && (
            <div className={`p-3 rounded-lg text-sm font-medium border ${testResult.status === 'testing' ? 'bg-slate-500/10 border-slate-500/20 text-slate-500' : testResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {testResult.msg}
            </div>
          )}

          <div className="flex items-start gap-3 p-3 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
            <p>API keys are saved in local device storage. If using a proxy backend later, remove them here.</p>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div {...fadeUp} transition={{ delay: 0.4 }} className={`${glass} p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-emerald-500" size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">About AeroSense</h2>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
          <p><strong>AeroSense.ai</strong> — Multi-source Air Quality & Health Monitor</p>
          <p>Version: 2.0.0 beta</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['React 19', 'TypeScript', 'TailwindCSS', 'Three.js', 'Framer Motion', 'WAQI', 'OpenAQ', 'Open-Meteo'].map(t => (
              <span key={t} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-colors duration-300">{t}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}