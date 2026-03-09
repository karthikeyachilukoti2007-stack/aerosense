import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const modes = [
    { key: 'light' as const, icon: Sun, label: 'Light' },
    { key: 'system' as const, icon: Monitor, label: 'System' },
    { key: 'dark' as const, icon: Moon, label: 'Dark' },
] as const;

interface ThemeToggleProps {
    size?: 'sm' | 'lg';
}

export default function ThemeToggle({ size = 'sm' }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const isLg = size === 'lg';

    return (
        <div className={`relative flex items-center ${isLg ? 'gap-1 p-1.5' : 'gap-0.5 p-1'} rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10`}>
            {modes.map(({ key, icon: Icon, label }) => {
                const active = theme === key;
                return (
                    <button
                        key={key}
                        onClick={() => setTheme(key)}
                        title={label}
                        className={`relative z-10 flex items-center gap-1.5 ${isLg ? 'px-4 py-2.5' : 'px-3 py-1.5'} rounded-xl transition-colors duration-200 ${active ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        {active && (
                            <motion.div
                                layoutId={`theme-indicator-${size}`}
                                className="absolute inset-0 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <Icon size={isLg ? 18 : 14} className="relative z-10" />
                        {isLg && <span className="relative z-10 text-sm font-medium">{label}</span>}
                    </button>
                );
            })}
        </div>
    );
}
