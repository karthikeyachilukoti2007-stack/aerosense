import { useState, useEffect } from 'react';
import type { SpO2Data } from '../types';

export function useSpO2Mock() {
    const generate = (): SpO2Data => ({
        spo2: Math.floor(Math.random() * 5) + 95,
        heartRate: Math.floor(Math.random() * 30) + 65,
        o2Saturation: Math.floor(Math.random() * 4) + 96,
        timestamp: new Date(),
    });

    const [data, setData] = useState<SpO2Data>(generate);
    const [history, setHistory] = useState<SpO2Data[]>([generate()]);

    useEffect(() => {
        const interval = setInterval(() => {
            const d = generate();
            setData(d);
            setHistory(prev => [...prev.slice(-19), d]);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return { data, history };
}
