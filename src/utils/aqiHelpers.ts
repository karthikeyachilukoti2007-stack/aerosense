import type { AQIStatus } from '../types';

export function convertAQI(owAqi: number): number {
    const map: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 300 };
    return map[owAqi] || 50;
}

export function getAQIStatus(value: number): AQIStatus {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

export function getAQIColor(aqi: number): string {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#991b1b';
}

export function getAQIGradient(aqi: number) {
    if (aqi <= 50) return { gradient: 'radial-gradient(circle at 30% 30%, #4ade80, #064e3b)', glow: 'rgba(16,185,129,0.6)' };
    if (aqi <= 100) return { gradient: 'radial-gradient(circle at 30% 30%, #facc15, #78350f)', glow: 'rgba(234,179,8,0.6)' };
    if (aqi <= 150) return { gradient: 'radial-gradient(circle at 30% 30%, #fb923c, #7f1d1d)', glow: 'rgba(249,115,22,0.6)' };
    if (aqi <= 200) return { gradient: 'radial-gradient(circle at 30% 30%, #f87171, #4c0519)', glow: 'rgba(239,68,68,0.6)' };
    return { gradient: 'radial-gradient(circle at 30% 30%, #a78bfa, #312e81)', glow: 'rgba(139,92,246,0.6)' };
}

export function getHealthTips(aqi: number): string[] {
    if (aqi <= 50) return ['Air quality is excellent — enjoy outdoor activities!', 'Perfect for jogging, cycling, or walking.', 'No health precautions needed.'];
    if (aqi <= 100) return ['Air quality is acceptable.', 'Sensitive individuals should limit prolonged outdoor exertion.', 'Consider keeping windows closed during peak traffic.'];
    if (aqi <= 150) return ['Sensitive groups may experience health effects.', 'Reduce prolonged outdoor exertion.', 'Wear a mask if you have respiratory conditions.', 'Use HEPA air purifiers indoors.'];
    if (aqi <= 200) return ['Everyone may begin to experience health effects.', 'Wear an N95 mask outdoors.', 'Use HEPA air purifiers at all times.', 'Avoid outdoor exercise.', 'Keep windows and doors closed.'];
    if (aqi <= 300) return ['Health alert! Significant risk.', 'Stay indoors with air purification.', 'Wear N95 mask if going outside.', 'Avoid all outdoor exertion.'];
    return ['HAZARDOUS! Emergency conditions.', 'Do NOT go outside.', 'Seal windows and doors.', 'Use medical-grade purifiers.', 'Seek medical attention if symptomatic.'];
}

export function getPollutantColor(name: string): string {
    const colors: Record<string, string> = { 'PM2.5': '#ef4444', 'PM10': '#f97316', 'NO2': '#8b5cf6', 'O3': '#06b6d4' };
    return colors[name] || '#10b981';
}
