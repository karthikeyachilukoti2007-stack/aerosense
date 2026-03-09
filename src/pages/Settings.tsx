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
      setWaqiKey(localStorage.getItem('aerosense-waqi-token') || '');
      setOpenaqKey(localStorage.getItem('aerosense-openaq-key') || '');
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
      const res = await fetchCityAQI(defaultCity || 'Delhi');
      setTestResult({ status: 'success', msg: `Success! Resolved via ${res.source}. AQI: ${res.aqi}` });
    } catch (e: any) {
      setTestResult({ status: 'error', msg: e.message || 'All APIs failed to return data.' });
    }
  };

  const themeDescriptions = {
    light: 'Clean, bright interface optimized for day use.',
    dark: 'Eye-friendly OLED-ready dark mode interface.',
    system: 'Follows your device system appearance.',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
      <motion.div {...fadeUp}>
        <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-tight">Settings</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1 font-bold italic">Preferences & API configuration</p>
      </motion.div>

      {/* Appearance */}
      <motion.div {...fadeUp} transition={{ delay: 0.1 }} className={`${glass} p-4 md:p-6`}>
        <div className="flex items-center gap-2 mb-6 px-1">
          <Palette className="text-emerald-500" size={20} />
          <h2 className="text-sm md:text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-wider">Appearance</h2>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <ThemeToggle size="lg" />
            <p className="text-xs md:text-sm text-slate-500 transition-colors duration-300 font-medium px-1">{themeDescriptions[theme]}</p>
          </div>
          <div className={`hidden sm:flex w-full lg:w-48 h-32 rounded-2xl overflow-hidden border ${isDark ? 'bg-gradient-to-br from-[#020617] via-[#0a0f2e] to-[#000d1a] border-white/10 shadow-2xl shadow-blue-900/10' : 'bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f8fafc] border-slate-200'}`}>
            <div className="p-4 w-full">
              <div className={`w-2/3 h-2 rounded-full ${isDark ? 'bg-white/20' : 'bg-slate-300'} mb-2`} />
              <div className={`w-1/2 h-2 rounded-full ${isDark ? 'bg-emerald-500/40' : 'bg-emerald-300'} mb-4`} />
              <div className="flex gap-2">
                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`} />
                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'}`} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Default City */}
      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${glass} p-4 md:p-6`}>
        <div className="flex items-center gap-2 mb-6 px-1">
          <MapPin className="text-emerald-500" size={20} />
          <h2 className="text-sm md:text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-wider">Default City</h2>
        </div>
        <div className="space-y-4">
          <p className="text-xs md:text-sm text-slate-500 transition-colors duration-300 font-bold px-1">Sets the primary monitor location on startup.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={defaultCity}
              onChange={e => setDefaultCity(e.target.value)}
              placeholder="Enter city name..."
              className="flex-1 px-4 py-3 bg-transparent rounded-xl border border-slate-300 dark:border-white/10 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white font-bold placeholder-slate-400 transition-all"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveCity}
              className="h-12 sm:h-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-black text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {savedCity ? <><Check size={16} /> Saved!</> : 'Save City'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* API Configuration */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${glass} p-4 md:p-6`}>
        <div className="flex items-center gap-2 mb-6 px-1">
          <Key className="text-emerald-500" size={20} />
          <h2 className="text-sm md:text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-wider">API Configuration</h2>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] md:text-xs text-slate-500 mb-2 block font-black uppercase tracking-[0.2em] px-1">WAQI Token (Primary)</label>
              <input
                type="password"
                value={waqiKey}
                onChange={e => setWaqiKey(e.target.value)}
                placeholder="Enter WAQI Token..."
                className="w-full px-4 py-3 bg-transparent rounded-xl border border-slate-300 dark:border-white/10 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white font-mono placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] md:text-xs text-slate-500 mb-2 block font-black uppercase tracking-[0.2em] px-1">OpenAQ Key (Fallback)</label>
              <input
                type="password"
                value={openaqKey}
                onChange={e => setOpenaqKey(e.target.value)}
                placeholder="Enter OpenAQ API Key..."
                className="w-full px-4 py-3 bg-transparent rounded-xl border border-slate-300 dark:border-white/10 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white font-mono placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <div className="text-[10px] md:text-xs text-purple-500 font-black uppercase tracking-[0.2em] mb-2 px-1 flex items-center gap-2">
                <CloudRain size={14} /> Open-Meteo (Live)
              </div>
              <p className="text-[10px] text-slate-400 italic px-1 font-bold">Always active for supplementary metrics. No key required.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSaveKeys}
              className="h-12 sm:h-auto flex-1 px-6 py-2 bg-slate-900 dark:bg-white/10 hover:bg-black dark:hover:bg-white/20 rounded-xl text-xs font-black text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest border border-white/5"
            >
              {savedKeys ? <><Check size={16} /> Keys Saved</> : 'Save Active Keys'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={testConnection}
              className="h-12 sm:h-auto flex-1 px-6 py-2 border-2 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-xs font-black transition-all uppercase tracking-widest"
            >
              Waterfall Test
            </motion.button>
          </div>

          {testResult.status !== 'idle' && (
            <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${testResult.status === 'testing' ? 'bg-slate-500/10 border-slate-500/20 text-slate-500' : testResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              {testResult.msg}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-bold leading-relaxed">
            <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
            <p className="uppercase tracking-tight">All API credentials are stored securely in your local device ecosystem. Clear browser data to reset.</p>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div {...fadeUp} transition={{ delay: 0.4 }} className={`${glass} p-4 md:p-6`}>
        <div className="flex items-center gap-2 mb-6 px-1">
          <Info className="text-emerald-500" size={20} />
          <h2 className="text-sm md:text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-wider">About AeroSense</h2>
        </div>
        <div className="space-y-4 text-[11px] md:text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300 font-bold">
          <p><strong>AeroSense.ai</strong> — Next-gen Air Quality & Health intelligence platform.</p>
          <p>Build 2.0.4-v1.2 stable</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {['React 19', 'TypeScript', 'TailwindCSS', 'Three.js', 'Framer Motion', 'WAQI', 'Vercel Edge'].map(t => (
              <span key={t} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase border border-emerald-500/10">{t}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}