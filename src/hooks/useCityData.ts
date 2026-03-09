import { useState, useEffect, useCallback } from 'react';
import type { CityData, ForecastItem } from '../types';
import { fetchCityData } from '../utils/api';

export function useCityData(initialCity = 'Delhi') {
    const [city, setCity] = useState(initialCity);
    const [data, setData] = useState<CityData | null>(null);
    const [forecast, setForecast] = useState<ForecastItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async (c: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await fetchCityData(c);
            setData(result.cityData);
            setForecast(result.forecast);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(city);
        const interval = setInterval(() => loadData(city), 60000);
        return () => clearInterval(interval);
    }, [city, loadData]);

    const searchCity = (c: string) => {
        if (c.trim()) setCity(c.trim());
    };

    return { data, forecast, city, isLoading, error, searchCity, refresh: () => loadData(city) };
}
