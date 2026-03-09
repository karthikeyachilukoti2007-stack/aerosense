import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
    theme: Theme;
    setTheme: (t: Theme) => void;
    resolved: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => { }, resolved: 'dark' });

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('aerosense-theme') as Theme) || 'dark');

    const getResolved = (t: Theme): 'light' | 'dark' => {
        if (t === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return t;
    };

    const [resolved, setResolved] = useState<'light' | 'dark'>(getResolved(theme));

    useEffect(() => {
        localStorage.setItem('aerosense-theme', theme);
        const r = getResolved(theme);
        setResolved(r);
        document.documentElement.classList.toggle('dark', r === 'dark');

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => {
                setResolved(e.matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', e.matches);
            };
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [theme]);

    return <ThemeContext.Provider value={{ theme, setTheme, resolved }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
