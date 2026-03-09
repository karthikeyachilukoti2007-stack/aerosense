import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, AlertTriangle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const glass = 'backdrop-blur-2xl rounded-2xl border transition-all duration-300 bg-white/70 dark:bg-white/5 border-white/60 dark:border-white/10 shadow-xl dark:shadow-none';
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const convertAQI = (v: number) => ({ 1: 25, 2: 75, 3: 125, 4: 175, 5: 250 }[v] || 50);
const getAQIColor = (v: number) => {
    if (v <= 50) return '#10b981'; if (v <= 100) return '#eab308'; if (v <= 150) return '#f97316';
    if (v <= 200) return '#ef4444'; return '#8b5cf6';
};
const getAQILabel = (v: number) => {
    if (v <= 50) return 'Good'; if (v <= 100) return 'Moderate'; if (v <= 150) return 'Unhealthy for Sensitive Groups';
    if (v <= 200) return 'Unhealthy'; if (v <= 300) return 'Very Unhealthy'; return 'Hazardous';
};

interface SpO2Point { spo2: number; hr: number; t: number; }

function CircularGauge({ value, max, label, color, unit }: { value: number; max: number; label: string; color: string; unit: string }) {
    const r = 55; const circ = 2 * Math.PI * r;
    const offset = circ - ((value / max) * circ);
    return (
        <div className="flex flex-col items-center">
            <svg width="120" height="120" md-width="140" md-height="140" viewBox="0 0 140 140" className="w-[110px] h-[110px] md:w-[140px] md:h-[140px]">
                <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-200 dark:text-slate-800" />
                <motion.circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }} transform="rotate(-90 70 70)" />
                <text x="70" y="65" textAnchor="middle" className="fill-slate-900 dark:fill-white text-xl md:text-2xl font-black">{value}</text>
                <text x="70" y="85" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold uppercase tracking-wider">{unit}</text>
            </svg>
            <p className="text-xs md:text-sm font-black text-slate-600 dark:text-slate-300 mt-2 transition-colors duration-300 uppercase tracking-widest">{label}</p>
        </div>
    );
}

export default function Health() {
    const [spo2, setSpo2] = useState(97);
    const [heartRate, setHeartRate] = useState(72);
    const [o2Sat, setO2Sat] = useState(98);
    const [history, setHistory] = useState<SpO2Point[]>([]);
    const [aqi, setAqi] = useState(0);

    useEffect(() => {
        const gen = () => {
            const s = Math.floor(Math.random() * 5) + 95;
            const h = Math.floor(Math.random() * 30) + 65;
            const o = Math.floor(Math.random() * 4) + 96;
            setSpo2(s); setHeartRate(h); setO2Sat(o);
            setHistory(prev => [...prev.slice(-19), { spo2: s, hr: h, t: prev.length }]);
        };
        gen();
        const iv = setInterval(gen, 3000);
        return () => clearInterval(iv);
    }, []);

    const fetchAqi = useCallback(async () => {
        try {
            let city = 'Delhi';
            try { city = localStorage.getItem('aerosense-last-city') || 'Delhi'; } catch { }
            const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
            const geo = await geoRes.json();
            if (Array.isArray(geo) && geo.length) {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${geo[0].lat}&lon=${geo[0].lon}&appid=${API_KEY}`);
                const data = await res.json();
                setAqi(convertAQI(data.list[0].main.aqi));
            }
        } catch { }
    }, []);

    useEffect(() => { fetchAqi(); }, [fetchAqi]);

    const color = getAQIColor(aqi);
    const tips = aqi <= 50
        ? ['Great conditions for outdoor exercise', 'Deep breathing exercises recommended', 'No respiratory risks detected']
        : aqi <= 100
            ? ['Light outdoor activity is fine', 'Monitor heart rate changes', 'Stay properly hydrated']
            : aqi <= 200
                ? ['Limit strenuous outdoor activity', 'Wear N95 mask outdoors', 'Keep inhaler accessible', 'Use indoor air purifier']
                : ['Stay indoors strictly', 'Use medical-grade indoor air purifier', 'Seek help if breathless', 'Avoid all heavy exertion'];

    return (
        <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
            <motion.div {...fadeUp}>
                <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-tight">Health Monitor</h1>
                <p className="text-slate-500 text-xs md:text-sm mt-1 font-bold italic">Real-time vital signs & AQI impact</p>
            </motion.div>

            {/* Disclaimer */}
            <motion.div {...fadeUp} transition={{ delay: 0.05 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Simulated Data</p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium leading-relaxed mt-1">Vitals are currently mock data. Connect hardware sensors for clinical-grade readings.</p>
                </div>
            </motion.div>

            {/* Vitals Gauges */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className={`${glass} p-4 md:p-6 flex justify-center h-full`}>
                    <CircularGauge value={spo2} max={100} label="SpO2" color="#10b981" unit="%" />
                </div>
                <div className={`${glass} p-6 md:p-8 flex flex-col items-center justify-center min-h-[160px]`}>
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        <Heart className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" size={56} fill="#ef4444" />
                    </motion.div>
                    <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 transition-colors duration-300 tracking-tighter">{heartRate}</p>
                    <p className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest mt-1">BPM</p>
                </div>
                <div className={`${glass} p-4 md:p-6 flex justify-center h-full`}>
                    <CircularGauge value={o2Sat} max={100} label="O₂ Saturation" color="#06b6d4" unit="%" />
                </div>
            </motion.div>

            {/* Vitals Chart */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${glass} p-4 md:p-6 overflow-hidden`}>
                <div className="flex items-center gap-2 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                    <Activity size={18} className="text-emerald-500" />
                    <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-wider">Vitals Timeline</h3>
                </div>
                <div className="h-[200px] md:h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.1} vertical={false} />
                            <XAxis dataKey="t" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={3} dot={false} name="SpO2" />
                            <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={3} dot={false} name="Heart Rate" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* AQI Health Advisory */}
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${glass} p-4 md:p-6`}>
                <div className="flex items-center gap-2 mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                    <Shield className="text-emerald-500" size={20} />
                    <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white transition-colors duration-300 uppercase tracking-wider">AQI Health Advisory</h3>
                    {aqi > 0 && (
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter" style={{ backgroundColor: `${color}20`, color }}>{getAQILabel(aqi)}</span>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {tips.map((tip, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className={`${glass} p-4 flex items-center gap-4 border-l-4 h-full`}
                            style={{ borderLeftColor: color }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{tip}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
