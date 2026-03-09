import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, AlertTriangle, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

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
            <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-200 dark:text-slate-700" />
                <motion.circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: 'easeOut' }} transform="rotate(-90 70 70)" />
                <text x="70" y="65" textAnchor="middle" className="fill-slate-900 dark:fill-white text-xl font-bold">{value}</text>
                <text x="70" y="85" textAnchor="middle" className="fill-slate-400 text-[10px]">{unit}</text>
            </svg>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 transition-colors duration-300">{label}</p>
        </div>
    );
}

export default function Health() {
    const [spo2, setSpo2] = useState(97);
    const [heartRate, setHeartRate] = useState(72);
    const [o2Sat, setO2Sat] = useState(98);
    const [history, setHistory] = useState<SpO2Point[]>([]);
    const [aqi, setAqi] = useState(0);

    // Mock SpO2/HR data
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

    // Fetch AQI for health tips
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
        ? ['Great conditions for outdoor exercise', 'Deep breathing exercises recommended', 'No respiratory risks']
        : aqi <= 100
            ? ['Light outdoor activity is fine', 'Monitor any breathing changes', 'Stay hydrated']
            : aqi <= 200
                ? ['Limit strenuous outdoor activity', 'Wear N95 mask outdoors', 'Keep inhaler accessible', 'Use air purifier indoors']
                : ['Stay indoors', 'Use medical-grade air purifier', 'Seek medical help if symptomatic', 'Avoid all outdoor exertion'];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div {...fadeUp}>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">Health Monitor</h1>
                <p className="text-slate-500 text-sm mt-1">Vital signs & air quality health impact</p>
            </motion.div>

            {/* Disclaimer */}
            <motion.div {...fadeUp} transition={{ delay: 0.05 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Simulated Data</p>
                    <p className="text-xs text-amber-500/80">SpO2 and heart rate values are mock data. Connect hardware sensors for real readings.</p>
                </div>
            </motion.div>

            {/* Vitals Gauges */}
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${glass} p-6 flex justify-center`}>
                    <CircularGauge value={spo2} max={100} label="SpO2" color="#10b981" unit="%" />
                </div>
                <div className={`${glass} p-6 flex flex-col items-center justify-center`}>
                    <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        <Heart className="text-red-500" size={44} fill="#ef4444" />
                    </motion.div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-3 transition-colors duration-300">{heartRate}</p>
                    <p className="text-sm text-slate-500">BPM</p>
                </div>
                <div className={`${glass} p-6 flex justify-center`}>
                    <CircularGauge value={o2Sat} max={100} label="O₂ Saturation" color="#06b6d4" unit="%" />
                </div>
            </motion.div>

            {/* Vitals Chart */}
            <motion.div {...fadeUp} transition={{ delay: 0.2 }} className={`${glass} p-6`}>
                <div className="flex items-center gap-2 mb-4">
                    <Activity size={16} className="text-emerald-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">Vitals Timeline</h3>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={history}>
                        <XAxis dataKey="t" stroke="#94a3b8" fontSize={10} />
                        <YAxis domain={[60, 100]} stroke="#94a3b8" fontSize={10} />
                        <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                        <Line type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} dot={false} name="SpO2" />
                        <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} name="Heart Rate" />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            {/* AQI Health Advisory */}
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className={`${glass} p-6`}>
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-emerald-500" size={18} />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors duration-300">AQI Health Advisory</h3>
                    {aqi > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${color}20`, color }}>{getAQILabel(aqi)}</span>
                    )}
                </div>
                <div className="space-y-2">
                    {tips.map((tip, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.08 }}
                            className={`${glass} p-3 flex items-center gap-3 border-l-2`}
                            style={{ borderLeftColor: color }}>
                            <p className="text-sm text-slate-600 dark:text-slate-300 transition-colors duration-300">{tip}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
