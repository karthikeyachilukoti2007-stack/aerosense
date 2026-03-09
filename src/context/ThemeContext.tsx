import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (t: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'dark',
    setTheme: () => { },
    isDark: true,
});

function getStoredTheme(): ThemeMode {
    try {
        const stored = localStorage.getItem('aerosense-theme');
        if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
    } catch { }
    return 'dark';
}

function resolveIsDark(theme: ThemeMode): boolean {
    if (theme === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return theme === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
    const [isDark, setIsDark] = useState(() => resolveIsDark(getStoredTheme()));

    const setTheme = (t: ThemeMode) => {
        setThemeState(t);
        try { localStorage.setItem('aerosense-theme', t); } catch { }
    };

    useEffect(() => {
        const dark = resolveIsDark(theme);
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => {
                setIsDark(e.matches);
                document.documentElement.classList.toggle('dark', e.matches);
            };
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
