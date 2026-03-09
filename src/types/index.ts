export type AQIStatus = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface Pollutant {
    name: string;
    value: number;
    unit: string;
    status: AQIStatus;
    color: string;
}

export interface CityData {
    aqi: number;
    city: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    description: string;
    pollutants: Pollutant[];
}

export interface ForecastItem {
    time: string;
    pm25: number;
    pm10: number;
    aqi: number;
}

export interface SpO2Data {
    spo2: number;
    heartRate: number;
    o2Saturation: number;
    timestamp: Date;
}

export type Theme = 'light' | 'dark' | 'system';
