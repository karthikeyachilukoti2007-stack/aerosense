import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props { onSearch: (city: string) => void; currentCity: string; }

export default function SearchBar({ onSearch, currentCity }: Props) {
    const [input, setInput] = useState(currentCity);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (input.trim()) onSearch(input.trim());
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="flex gap-3 w-full max-w-md"
        >
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Search city..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
                />
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition"
            >
                Search
            </motion.button>
        </motion.form>
    );
}
