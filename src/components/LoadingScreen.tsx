import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-xl bg-black/30 dark:bg-black/50"
        >
            {/* Pulsing rings */}
            <div className="relative w-32 h-32">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
                        animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                    />
                ))}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/40 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">AQI</span>
                </div>
            </div>
            <motion.p
                className="mt-8 text-slate-300 text-sm tracking-wide"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                Fetching air quality data...
            </motion.p>
        </motion.div>
    );
}
