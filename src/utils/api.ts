import type { CityData, ForecastItem } from '../types';
import { convertAQI, getAQIStatus, getPollutantColor } from './aqiHelpers';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '4ab7c9be231a99f5b29124948dd0eebf';
const BASE = 'https://api.openweathermap.org';

async function getCoordinates(city: string) {
    const res = await fetch(`${BASE}/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('City not found');
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].name as string };
}

export async function fetchCityData(cityName: string): Promise<{ cityData: CityData; forecast: ForecastItem[] }> {
    const { lat, lon, name } = await getCoordinates(cityName);

    const [pollutionRes, weatherRes, forecastRes] = await Promise.all([
        fetch(`${BASE}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
        fetch(`${BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
        fetch(`${BASE}/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`),
    ]);

    const [pollution, weather, forecastData] = await Promise.all([
        pollutionRes.json(),
        weatherRes.json(),
        forecastRes.json(),
    ]);

    const air = pollution.list[0];
    const aqi = convertAQI(air.main.aqi);

    const pollutants = [
        { name: 'PM2.5', value: air.components.pm2_5, unit: 'µg/m³' },
        { name: 'PM10', value: air.components.pm10, unit: 'µg/m³' },
        { name: 'NO2', value: air.components.no2, unit: 'µg/m³' },
        { name: 'O3', value: air.components.o3, unit: 'µg/m³' },
    ].map(p => ({
        ...p,
        status: getAQIStatus(p.value),
        color: getPollutantColor(p.name),
    }));

    const forecast: ForecastItem[] = forecastData.list
        .slice(0, 12)
        .map((item: any) => ({
            time: new Date(item.dt * 1000).getHours() + ':00',
            pm25: item.components.pm2_5,
            pm10: item.components.pm10,
            aqi: convertAQI(item.main.aqi),
        }));

    return {
        cityData: {
            aqi,
            city: name,
            temperature: weather.main.temp,
            humidity: weather.main.humidity,
            windSpeed: weather.wind.speed,
            description: weather.weather?.[0]?.description || 'clear',
            pollutants,
        },
        forecast,
    };
}
