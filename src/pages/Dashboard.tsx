import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { Search, MapPin, Thermometer, Droplets, Wind, Loader2, Clock, RefreshCw } from 'lucide-react';
import WindAnimation from '../components/WindAnimation';
import ParticleCard from '../components/ParticleCard';
import LoadingScreen from '../components/LoadingScreen';

const glass = 'backdrop-blur-2xl rounded-2xl border transition-all duration-300 bg-white/70 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-xl dark:shadow-none';

type AQIStatus = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

interface Pollutant {
  name: string;
  value: number;
  unit: string;
  status: AQIStatus;
}

interface AQIData {
  aqi: number;
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pollutants: Pollutant[];
}

interface HistoricalData {
  time: string;
  pm25: number;
}

const CITY_PROFILES = {
  // NORTH INDIA — HIGH POLLUTION BELT
  Delhi: { aqi: 168, temperature: 26, humidity: 52, windSpeed: 2.1, pm25: 110, pm10: 195, no2: 58, o3: 38 },
  Noida: { aqi: 175, temperature: 25, humidity: 50, windSpeed: 1.9, pm25: 118, pm10: 205, no2: 62, o3: 40 },
  Gurugram: { aqi: 170, temperature: 26, humidity: 49, windSpeed: 2.0, pm25: 115, pm10: 200, no2: 60, o3: 39 },
  Faridabad: { aqi: 178, temperature: 27, humidity: 51, windSpeed: 1.8, pm25: 120, pm10: 210, no2: 64, o3: 41 },
  Ghaziabad: { aqi: 182, temperature: 26, humidity: 53, windSpeed: 1.7, pm25: 125, pm10: 215, no2: 65, o3: 42 },
  Agra: { aqi: 155, temperature: 28, humidity: 48, windSpeed: 2.2, pm25: 98, pm10: 172, no2: 52, o3: 35 },
  Lucknow: { aqi: 162, temperature: 27, humidity: 56, windSpeed: 2.0, pm25: 105, pm10: 185, no2: 55, o3: 36 },
  Kanpur: { aqi: 172, temperature: 28, humidity: 54, windSpeed: 1.9, pm25: 115, pm10: 198, no2: 59, o3: 38 },
  Varanasi: { aqi: 158, temperature: 27, humidity: 58, windSpeed: 1.8, pm25: 100, pm10: 178, no2: 53, o3: 35 },
  Jaipur: { aqi: 148, temperature: 29, humidity: 42, windSpeed: 2.8, pm25: 90, pm10: 170, no2: 48, o3: 34 },
  Jodhpur: { aqi: 140, temperature: 32, humidity: 35, windSpeed: 3.5, pm25: 82, pm10: 162, no2: 44, o3: 32 },
  Chandigarh: { aqi: 122, temperature: 24, humidity: 55, windSpeed: 2.6, pm25: 74, pm10: 130, no2: 42, o3: 30 },
  Amritsar: { aqi: 135, temperature: 23, humidity: 58, windSpeed: 2.3, pm25: 82, pm10: 148, no2: 46, o3: 32 },
  Meerut: { aqi: 165, temperature: 26, humidity: 54, windSpeed: 1.9, pm25: 108, pm10: 190, no2: 57, o3: 38 },

  // EAST INDIA
  Kolkata: { aqi: 145, temperature: 29, humidity: 75, windSpeed: 2.4, pm25: 88, pm10: 155, no2: 50, o3: 33 },
  Patna: { aqi: 168, temperature: 27, humidity: 60, windSpeed: 1.8, pm25: 112, pm10: 198, no2: 56, o3: 37 },
  Ranchi: { aqi: 130, temperature: 26, humidity: 62, windSpeed: 2.2, pm25: 78, pm10: 142, no2: 44, o3: 30 },
  Bhubaneswar: { aqi: 118, temperature: 30, humidity: 70, windSpeed: 2.8, pm25: 70, pm10: 122, no2: 40, o3: 27 },
  Guwahati: { aqi: 115, temperature: 27, humidity: 75, windSpeed: 2.5, pm25: 68, pm10: 118, no2: 38, o3: 26 },

  // WEST INDIA
  Mumbai: { aqi: 112, temperature: 31, humidity: 72, windSpeed: 3.8, pm25: 68, pm10: 115, no2: 42, o3: 28 },
  Pune: { aqi: 98, temperature: 27, humidity: 62, windSpeed: 3.2, pm25: 58, pm10: 98, no2: 36, o3: 24 },
  Nagpur: { aqi: 108, temperature: 30, humidity: 55, windSpeed: 2.9, pm25: 64, pm10: 108, no2: 38, o3: 26 },
  Ahmedabad: { aqi: 138, temperature: 32, humidity: 45, windSpeed: 3.0, pm25: 84, pm10: 158, no2: 48, o3: 32 },
  Surat: { aqi: 125, temperature: 31, humidity: 68, windSpeed: 3.4, pm25: 75, pm10: 135, no2: 44, o3: 29 },
  Indore: { aqi: 118, temperature: 28, humidity: 52, windSpeed: 2.7, pm25: 70, pm10: 125, no2: 42, o3: 28 },
  Bhopal: { aqi: 112, temperature: 27, humidity: 55, windSpeed: 2.5, pm25: 66, pm10: 118, no2: 40, o3: 27 },

  // SOUTH INDIA
  Chennai: { aqi: 95, temperature: 32, humidity: 78, windSpeed: 4.2, pm25: 55, pm10: 88, no2: 35, o3: 22 },
  Bangalore: { aqi: 105, temperature: 24, humidity: 65, windSpeed: 2.9, pm25: 62, pm10: 98, no2: 38, o3: 25 },
  Hyderabad: { aqi: 118, temperature: 28, humidity: 58, windSpeed: 3.1, pm25: 72, pm10: 125, no2: 44, o3: 30 },
  Vijayawada: { aqi: 108, temperature: 32, humidity: 66, windSpeed: 3.4, pm25: 64, pm10: 110, no2: 38, o3: 26 },
  Gudivada: { aqi: 88, temperature: 31, humidity: 70, windSpeed: 3.6, pm25: 48, pm10: 82, no2: 28, o3: 20 },
  Visakhapatnam: { aqi: 102, temperature: 31, humidity: 74, windSpeed: 3.9, pm25: 60, pm10: 95, no2: 36, o3: 24 },
  Coimbatore: { aqi: 88, temperature: 29, humidity: 68, windSpeed: 3.8, pm25: 48, pm10: 82, no2: 30, o3: 20 },
  Kochi: { aqi: 72, temperature: 30, humidity: 82, windSpeed: 4.5, pm25: 38, pm10: 65, no2: 25, o3: 18 },
  Thiruvananthapuram: { aqi: 65, temperature: 30, humidity: 84, windSpeed: 4.8, pm25: 32, pm10: 58, no2: 22, o3: 16 },
  Mysuru: { aqi: 82, temperature: 25, humidity: 66, windSpeed: 3.0, pm25: 44, pm10: 75, no2: 28, o3: 20 },
  Belagavi: { aqi: 90, temperature: 26, humidity: 64, windSpeed: 3.2, pm25: 50, pm10: 85, no2: 30, o3: 21 },
  Mangalore: { aqi: 75, temperature: 29, humidity: 80, windSpeed: 4.2, pm25: 40, pm10: 68, no2: 26, o3: 18 },

  // CENTRAL & INDUSTRIAL
  Raipur: { aqi: 148, temperature: 29, humidity: 55, windSpeed: 2.3, pm25: 92, pm10: 165, no2: 50, o3: 34 },

  // HILL STATIONS — CLEAN AIR
  Shimla: { aqi: 42, temperature: 14, humidity: 70, windSpeed: 3.5, pm25: 18, pm10: 32, no2: 12, o3: 15 },
  Dehradun: { aqi: 95, temperature: 22, humidity: 60, windSpeed: 2.4, pm25: 55, pm10: 90, no2: 34, o3: 24 }
} as const;

type CityKey = keyof typeof CITY_PROFILES;

const DEFAULT_PROFILE = { aqi: 125, temperature: 28, humidity: 60, windSpeed: 3.0, pm25: 78, pm10: 132, no2: 45, o3: 28 };

function getPollutantStatus(name: string, value: number): AQIStatus {
  if (name === 'PM2.5') {
    if (value < 12) return 'Good';
    if (value < 35) return 'Moderate';
    if (value < 55) return 'Unhealthy for Sensitive Groups';
    if (value < 150) return 'Unhealthy';
    if (value < 250) return 'Very Unhealthy';
    return 'Hazardous';
  }
  if (name === 'PM10') {
    if (value < 54) return 'Good';
    if (value < 154) return 'Moderate';
    if (value < 254) return 'Unhealthy';
    if (value < 354) return 'Very Unhealthy';
    return 'Hazardous';
  }
  if (name === 'NO₂') {
    if (value < 53) return 'Good';
    if (value < 100) return 'Moderate';
    if (value < 360) return 'Unhealthy';
    return 'Very Unhealthy';
  }
  if (name === 'O₃') {
    if (value < 54) return 'Good';
    if (value < 70) return 'Moderate';
    if (value < 85) return 'Unhealthy for Sensitive Groups';
    return 'Unhealthy';
  }
  return 'Moderate';
}

function getAQIStatus(aqi: number): AQIStatus {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAQIStyles(aqi: number) {
  if (aqi <= 50) return { color: '#059669', label: 'Good' };
  if (aqi <= 100) return { color: '#ca8a04', label: 'Moderate' };
  if (aqi <= 150) return { color: '#ea580c', label: 'Unhealthy for Sensitive Groups' };
  if (aqi <= 200) return { color: '#dc2626', label: 'Unhealthy' };
  if (aqi <= 300) return { color: '#7c3aed', label: 'Very Unhealthy' };
  return { color: '#9f1239', label: 'Hazardous' };
}

const getHealthAdvice = (aqi: number) => {
  if (aqi <= 50) return ['✅ Air is clean and safe', '🏃 Great for outdoor exercise', '🪟 Open windows freely'];
  if (aqi <= 100) return ['😷 Acceptable air quality', '🚶 Outdoor activities fine for most', '💧 Stay hydrated'];
  if (aqi <= 150) return ['⚠️ Sensitive groups take care', '😷 Wear mask if sensitive to dust', '🌿 Use indoor purifier'];
  if (aqi <= 200) return ['🚫 Limit outdoor activity', '😷 N95 mask needed outdoors', '🏠 Keep windows closed', '💊 Keep inhaler ready'];
  if (aqi <= 300) return ['🔴 Health emergency risk', '🏠 Stay indoors with purifier', '🚑 Seek help if breathless', '⛔ No outdoor exercise'];
  return ['⛔ DO NOT go outside', '🚨 Hazardous air alert', '😷 Full respirator if going out', '🏥 Seek medical help immediately'];
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<AQIData | null>(null);
  const [history, setHistory] = useState<HistoricalData[]>([]);
  const [inputCity, setInputCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

  async function loadCityData(cityName: string) {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const matchedKey = (Object.keys(CITY_PROFILES) as CityKey[]).find(
        k => k.toLowerCase() === cityName.trim().toLowerCase()
      );
      const profile = matchedKey ? CITY_PROFILES[matchedKey] : DEFAULT_PROFILE;
      const displayCity = matchedKey ? matchedKey : `${cityName} (Sample)`;

      const aqiData: AQIData = {
        aqi: profile.aqi,
        city: displayCity,
        temperature: profile.temperature,
        humidity: profile.humidity,
        windSpeed: profile.windSpeed,
        pollutants: [
          { name: 'PM2.5', value: profile.pm25, unit: 'μg/m³', status: getPollutantStatus('PM2.5', profile.pm25) },
          { name: 'PM10', value: profile.pm10, unit: 'μg/m³', status: getPollutantStatus('PM10', profile.pm10) },
          { name: 'NO₂', value: profile.no2, unit: 'μg/m³', status: getPollutantStatus('NO₂', profile.no2) },
          { name: 'O₃', value: profile.o3, unit: 'μg/m³', status: getPollutantStatus('O₃', profile.o3) }
        ]
      };

      const offsets = [0, 4, 8, 5, -3, -6, -2, 3, 7, 10, 6, 2];
      const now = new Date();
      const historyData: HistoricalData[] = offsets.map((offset, i) => {
        const hour = (now.getHours() + i) % 24;
        return {
          time: `${String(hour).padStart(2, '0')}:00`,
          pm25: profile.pm25 + offset
        };
      });

      setData(aqiData);
      setHistory(historyData);
      setSecondsSinceUpdate(0);
      try { localStorage.setItem('aerosense-last-city', cityName); } catch { }
    } catch (err) {
      setError('Failed to load city data. Please try another city.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let initialCity = 'Delhi';
    try {
      initialCity = localStorage.getItem('aerosense-last-city') || 'Delhi';
    } catch { }
    setInputCity(initialCity);
    loadCityData(initialCity);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setSecondsSinceUpdate(s => s + 1), 1000);
    return () => clearInterval(tick);
  }, [data]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputCity.trim()) loadCityData(inputCity.trim());
  };

  const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  const mins = Math.floor(secondsSinceUpdate / 60);
  const secs = secondsSinceUpdate % 60;
  const updateLabel = mins > 0 ? `${mins}m ${secs}s ago` : `${secs}s ago`;

  let aqiStyles = { color: '#10b981', label: 'Good' };
  if (data) {
    aqiStyles = getAQIStyles(data.aqi);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-2 sm:px-0">
      {isLoading && !data && <LoadingScreen />}

      {/* Header / Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <motion.form {...fadeUp} onSubmit={handleSearch} className={`${glass} p-2 sm:p-3 flex flex-col sm:flex-row gap-3 flex-1 w-full max-w-xl`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={inputCity}
              onChange={e => setInputCity(e.target.value)}
              placeholder="Search global city..."
              className="w-full pl-10 pr-4 py-3 sm:py-2 bg-transparent rounded-xl text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all duration-300 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm lg:text-base font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shimmer h-12 sm:h-auto"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Search className="sm:hidden" size={18} />}
            <span className="sm:inline">Search</span>
          </button>
        </motion.form>
      </div>

      {error && (
        <motion.div {...fadeUp} className={`${glass} p-4 border-red-500/30 bg-red-500/10 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-sm flex font-medium`}>
          {error}
        </motion.div>
      )}

      {data && (
        <>
          {/* AQI Hero */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="flex flex-col items-center py-4 lg:py-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin size={18} className="text-emerald-500" />
                <span className="text-xl lg:text-2xl font-black">{data.city}</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">Simulated Data</span>
            </div>

            <div className="relative">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: `${aqiStyles.color}40`, margin: `-${(i + 1) * 12}px md:-${(i + 1) * 16}px` }}
                  animate={{ scale: [1, 1.1 + i * 0.1, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-[130px] h-[130px] md:w-[160px] md:h-[160px] lg:w-[200px] lg:h-[200px] rounded-full flex flex-col items-center justify-center text-white relative z-10"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${aqiStyles.color}, #0f172a)`,
                  boxShadow: `0 0 60px ${aqiStyles.color}80`,
                }}
              >
                <motion.span
                  key={data.aqi}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl md:text-5xl lg:text-7xl font-black drop-shadow-xl"
                >
                  {data.aqi}
                </motion.span>
                <span className="text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.25em] opacity-80 mt-1 font-medium italic">US AQI</span>
              </motion.div>
            </div>

            <div className="mt-8 text-center space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex px-5 py-2 rounded-full text-sm md:text-base font-bold shadow-sm"
                style={{ backgroundColor: `${aqiStyles.color}20`, color: aqiStyles.color, border: `1px solid ${aqiStyles.color}40` }}
              >
                {getAQIStatus(data.aqi)}
              </motion.div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => loadCityData(data.city)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 active:scale-95 transition-all"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Tap to refresh
                </button>
                <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                  <Clock size={12} /> Updated {updateLabel}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weather Row */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: Thermometer, label: 'Temp', val: data.temperature !== null ? `${data.temperature}°C` : '—', col: 'text-orange-500' },
              { icon: Droplets, label: 'Humid', val: data.humidity !== null ? `${data.humidity}%` : '—', col: 'text-blue-500' },
              { icon: Wind, label: 'Wind', val: data.windSpeed !== null ? `${data.windSpeed}m/s` : '—', col: 'text-teal-400' },
            ].map((s) => (
              <motion.div key={s.label} whileHover={{ y: -2 }} className={`${glass} p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-1 sm:gap-2`}>
                <s.icon className={`${s.col} w-5 h-5 sm:w-6 sm:h-6`} />
                <div>
                  <div className="text-[8px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-bold">{s.label}</div>
                  <div className="text-sm sm:text-base lg:text-lg font-black text-slate-900 dark:text-white mt-0.5">{s.val}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Wind Animation Widget */}
          {data.windSpeed !== null && (
            <motion.div {...fadeUp} transition={{ delay: 0.25 }} className={`${glass} p-4 hidden sm:block`}>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-black flex items-center gap-2">
                <Wind size={14} className="text-cyan-500" /> Wind Visualization
              </div>
              <WindAnimation windSpeed={data.windSpeed} />
            </motion.div>
          )}

          {/* Pollutant Cards */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {data.pollutants.map((p, i) => {
              const styles = getAQIStyles(p.name === 'PM2.5' ? p.value : p.value * 0.8);
              const isUnhealthy = p.status.includes('Unhealthy') || p.status === 'Hazardous';
              return (
                <motion.div key={p.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className={`${glass} overflow-hidden flex flex-col h-full`}>
                  <div className="p-3 sm:p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="text-[10px] sm:text-xs text-slate-500 font-black tracking-wider">{p.name}</div>
                      <div className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter" style={{ backgroundColor: `${styles.color}20`, color: styles.color }}>{p.status.split(' ')[0]}</div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{p.value !== null ? p.value : '—'}</span>
                      <span className="text-[9px] sm:text-[11px] text-slate-400 font-bold">{p.unit}</span>
                    </div>
                  </div>
                  {p.value !== null && <ParticleCard color={styles.color} isUnhealthy={isUnhealthy} />}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Historical Forecast */}
          {history.length > 0 && (
            <motion.div {...fadeUp} transition={{ delay: 0.4 }} className={`${glass} p-4 sm:p-5 overflow-hidden`}>
              <div className="flex items-center gap-4 mb-4 sm:mb-6 border-b border-slate-200 dark:border-white/10 pb-2">
                <h3 className="pb-2 text-xs sm:text-sm font-black transition-colors text-emerald-500 border-b-2 border-emerald-500 uppercase tracking-widest leading-relaxed">12-Hour PM2.5 Forecast</h3>
              </div>

              <div className="h-[200px] lg:h-[300px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.1} vertical={false} />
                    <XAxis dataKey="time" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} minTickGap={20} />
                    <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={10} />
                    <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="pm25" stroke="#10b981" fillOpacity={1} fill="url(#colorPm25)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Health Suggestions */}
          <motion.div {...fadeUp} transition={{ delay: 0.5 }} className={`${glass} p-4 sm:p-5`}>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-[0.2em] opacity-80">Health Precautions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3">
              {getHealthAdvice(data.aqi).map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/40 dark:bg-black/20 border-l-4 h-full"
                  style={{ borderColor: aqiStyles.color, borderTopWidth: '1px', borderRightWidth: '1px', borderBottomWidth: '1px', borderBottomColor: 'rgba(255,255,255,0.05)', borderTopColor: 'rgba(255,255,255,0.05)', borderRightColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{tip}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;