import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const glass = 'backdrop-blur-2xl rounded-2xl border transition-all duration-300 bg-white/70 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-xl dark:shadow-none';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

type AQIStatus = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

interface HourlyPoint { time: string; hour: number; pm25: number; pm10: number; aqi: number; dayIndex: number; }
interface DaySummary { dayName: string; avgAqi: number; maxAqi: number; dominantPollutant: string; status: AQIStatus; points: HourlyPoint[]; }

const convertAQI = (v: number) => ({ 1: 25, 2: 75, 3: 125, 4: 175, 5: 250 }[v] || 50);
const getStatus = (v: number): AQIStatus => {
  if (v <= 50) return 'Good'; if (v <= 100) return 'Moderate'; if (v <= 150) return 'Unhealthy for Sensitive Groups';
  if (v <= 200) return 'Unhealthy'; if (v <= 300) return 'Very Unhealthy'; return 'Hazardous';
};
const getColor = (v: number) => {
  if (v <= 50) return '#10b981'; if (v <= 100) return '#eab308'; if (v <= 150) return '#f97316';
  if (v <= 200) return '#ef4444'; return '#8b5cf6';
};

export default function Forecast() {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [allPoints, setAllPoints] = useState<HourlyPoint[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('Delhi');

  const loadForecast = useCallback(async (c: string) => {
    try {
      setLoading(true); setError(null);
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${c}&limit=1&appid=${API_KEY}`);
      const geo = await geoRes.json();
      if (!Array.isArray(geo) || !geo.length) throw new Error('City not found');
      const { lat, lon } = geo[0];

      const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
      const data = await res.json();
      const points: HourlyPoint[] = data.list.slice(0, 96).map((item: Record<string, any>, idx: number) => {
        const d = new Date(item.dt * 1000);
        return {
          time: `${d.getHours()}:00`,
          hour: d.getHours(),
          pm25: item.components.pm2_5,
          pm10: item.components.pm10,
          aqi: convertAQI(item.main.aqi),
          dayIndex: Math.floor(idx / 24),
        };
      });
      setAllPoints(points);

      const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4'];
      const grouped: DaySummary[] = [];
      for (let d = 0; d < 4; d++) {
        const dp = points.filter(p => p.dayIndex === d);
        if (!dp.length) continue;
        const avgAqi = Math.round(dp.reduce((s, p) => s + p.aqi, 0) / dp.length);
        const maxAqi = Math.max(...dp.map(p => p.aqi));
        const maxPm25 = Math.max(...dp.map(p => p.pm25));
        const maxPm10 = Math.max(...dp.map(p => p.pm10));
        grouped.push({
          dayName: dayNames[d] || `Day ${d + 1}`,
          avgAqi, maxAqi,
          dominantPollutant: maxPm25 > maxPm10 ? 'PM2.5' : 'PM10',
          status: getStatus(avgAqi),
          points: dp,
        });
      }
      setDays(grouped);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load forecast');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let c = 'Delhi';
    try { c = localStorage.getItem('aerosense-last-city') || 'Delhi'; } catch { }
    setCity(c);
    loadForecast(c);
  }, [loadForecast]);

  const activeDayData = days[activeDay]?.points || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div {...fadeUp}>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Air Quality Forecast</h1>
        <p className="text-slate-500 text-sm mt-1">{city} — 4-day prediction</p>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-emerald-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading forecast...
        </div>
      )}
      {error && <div className={`${glass} p-3 border-red-500/30 bg-red-500/10 dark:bg-red-500/10 text-red-400 text-sm`}>{error}</div>}

      {!loading && days.length > 0 && (
        <>
          {/* Day Cards */}
          <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {days.map((d, i) => {
              const c = getColor(d.avgAqi);
              return (
                <motion.div key={i} whileHover={{ scale: 1.03, y: -4 }}
                  onClick={() => setActiveDay(i)}
                  className={`${glass} p-5 cursor-pointer ${activeDay === i ? 'ring-2 ring-emerald-500/50' : ''}`}>
                  <p className="text-sm font-medium text-slate-500 transition-colors duration-300">{d.dayName}</p>
                  <p className="text-3xl font-bold mt-2 transition-colors duration-300" style={{ color: c }}>{d.avgAqi}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(d.avgAqi / 3, 100)}%` }}
                      transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: c }} />
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${c}20`, color: c }}>{d.status}</span>
                  <p className="text-[10px] text-slate-400 mt-1">Peak: {d.maxAqi} · {d.dominantPollutant}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Day Tabs */}
          <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="flex gap-2">
            {days.map((d, i) => (
              <button key={i} onClick={() => setActiveDay(i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDay === i ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 dark:bg-white/5 text-slate-400 hover:text-white'}`}>
                {d.dayName}
              </button>
            ))}
          </motion.div>

          {/* Hourly Chart */}
          <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${glass} p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-emerald-400" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">
                Hourly Breakdown — {days[activeDay]?.dayName}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={activeDayData}>
                <defs>
                  <linearGradient id="fcgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="pm25" stroke="#34d399" fill="url(#fcgrad)" strokeWidth={2} name="PM2.5" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Full 4-day LineChart */}
          <motion.div {...fadeUp} transition={{ delay: 0.4 }} className={`${glass} p-6`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 transition-colors duration-300">Full 4-Day PM2.5 Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={allPoints}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} interval={5} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="pm25" stroke="#10b981" strokeWidth={2} dot={false} name="PM2.5" />
                <Line type="monotone" dataKey="pm10" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="PM10" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Trend Summary */}
          <motion.div {...fadeUp} transition={{ delay: 0.5 }} className={`${glass} p-5`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 transition-colors duration-300">Forecast Summary</h3>
            {(() => {
              const first = days[0]?.avgAqi || 0;
              const last = days[days.length - 1]?.avgAqi || 0;
              const diff = last - first;
              return (
                <div className="flex items-center gap-3">
                  {diff > 0 ? <TrendingUp className="text-red-400" size={20} /> : <TrendingDown className="text-emerald-400" size={20} />}
                  <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">
                    AQI is expected to {diff > 0 ? 'worsen' : 'improve'} by {Math.abs(diff)} points over the next 4 days.
                    {diff > 20 ? ' Consider limiting outdoor activities.' : diff < -20 ? ' Conditions are improving!' : ''}
                  </p>
                </div>
              );
            })()}
          </motion.div>
        </>
      )}
    </div>
  );
}