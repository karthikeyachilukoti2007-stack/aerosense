export type AQIStatusType = 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface AeroSenseData {
    aqi: number;
    aqiStatus: AQIStatusType;
    aqiColor: string;
    city: string;
    station: string;
    lat: number;
    lon: number;
    lastUpdated: Date;
    source: 'WAQI' | 'OpenAQ' | 'Mixed';
    dominantPollutant: string;
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    dewPoint: number | null;
    pressure: number | null;
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    o3: number | null;
    so2: number | null;
    co: number | null;
    uvIndex: number | null;
    dust: number | null;
    forecast: {
        pm25: Array<{ day: string; avg: number; max: number; min: number }>;
        pm10: Array<{ day: string; avg: number; max: number; min: number }>;
        uvi: Array<{ day: string; avg: number; max: number; min: number }>;
    };
}

export function getAQIStatus(aqi: number): AQIStatusType {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

export function getAQIColor(aqi: number): string {
    if (aqi <= 50) return '#00e400';
    if (aqi <= 100) return '#ffff00';
    if (aqi <= 150) return '#ff7e00';
    if (aqi <= 200) return '#ff0000';
    if (aqi <= 300) return '#8f3f97';
    return '#7e0023';
}

const getOpenWeatherCoords = async (city: string): Promise<{ lat: number, lon: number }> => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('City geometry not found');
    return { lat: data[0].lat, lon: data[0].lon };
};

const fetchOpenMeteo = async (lat: number, lon: number) => {
    try {
        const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,pm10,uv_index,dust,european_aqi&forecast_days=7`);
        if (!res.ok) return null;
        const data = await res.json();

        // Find index for current hour
        const now = new Date();
        // Open-Meteo returns ISO hourly array, let's just grab the closest hour
        let currentIndex = 0;
        if (data.hourly && data.hourly.time) {
            const currentIso = now.toISOString().slice(0, 14) + '00:00';
            const exactIndex = data.hourly.time.indexOf(currentIso);
            currentIndex = exactIndex !== -1 ? exactIndex : 0;
        }

        return {
            uvIndex: data.hourly?.uv_index?.[currentIndex] ?? null,
            dust: data.hourly?.dust?.[currentIndex] ?? null
        };
    } catch {
        return null;
    }
};

const fetchOpenAQ = async (city: string): Promise<Partial<AeroSenseData> | null> => {
    let key = '';
    try { key = localStorage.getItem('aerosense-openaq-key') || import.meta.env.VITE_OPENAQ_KEY || ''; } catch { }

    try {
        const res = await fetch(`https://api.openaq.org/v2/latest?city=${encodeURIComponent(city)}&limit=1`, {
            headers: key ? { 'X-API-Key': key } : {}
        });
        const data = await res.json();
        if (!data.results || data.results.length === 0) return null;

        const result = data.results[0];
        const measurements: any[] = result.measurements || [];

        const getValue = (param: string) => {
            const m = measurements.find((m: any) => m.parameter === param);
            return m ? m.value : null;
        };

        const pm25 = getValue('pm25');
        const pm10 = getValue('pm10');
        // Calculate a rough AQI if missing (using PM2.5 mainly)
        const aqi = pm25 ? Math.round(pm25 * 3) : (pm10 ? Math.round(pm10) : 50);

        return {
            aqi,
            aqiStatus: getAQIStatus(aqi),
            aqiColor: getAQIColor(aqi),
            city: result.city || city,
            station: result.location || result.city,
            lat: result.coordinates?.latitude || 0,
            lon: result.coordinates?.longitude || 0,
            lastUpdated: new Date(measurements[0]?.lastUpdated || Date.now()),
            source: 'OpenAQ',
            dominantPollutant: 'pm25',
            pm25,
            pm10,
            no2: getValue('no2'),
            o3: getValue('o3'),
            so2: getValue('so2'),
            co: getValue('co'),
            temperature: null, humidity: null, windSpeed: null, dewPoint: null, pressure: null,
            forecast: { pm25: [], pm10: [], uvi: [] }
        };
    } catch (e) {
        return null;
    }
};

export async function fetchCityAQI(city: string): Promise<AeroSenseData> {
    let waqiToken = 'demo';
    try { waqiToken = localStorage.getItem('aerosense-waqi-token') || import.meta.env.VITE_WAQI_TOKEN || ''; } catch { }

    let baseData: Partial<AeroSenseData> | null = null;
    let usedSource: 'WAQI' | 'OpenAQ' | 'Mixed' = 'WAQI';

    // 1. Try WAQI
    try {
        const res = await fetch(`https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${waqiToken}`);
        const waqi = await res.json();

        if (waqi.status === 'ok' && waqi.data.aqi !== '-') {
            const d = waqi.data;
            const aqi = Number(d.aqi) || 50;
            baseData = {
                aqi,
                aqiStatus: getAQIStatus(aqi),
                aqiColor: getAQIColor(aqi),
                city: d.city.name.split(',')[0],
                station: d.city.name,
                lat: d.city.geo[0],
                lon: d.city.geo[1],
                lastUpdated: d.time.iso ? new Date(d.time.iso) : new Date(),
                source: 'WAQI',
                dominantPollutant: d.dominentpol || '',
                temperature: d.iaqi?.t?.v ?? null,
                humidity: d.iaqi?.h?.v ?? null,
                windSpeed: d.iaqi?.w?.v ?? null,
                dewPoint: d.iaqi?.dew?.v ?? null,
                pressure: d.iaqi?.p?.v ?? null,
                pm25: d.iaqi?.pm25?.v ?? null,
                pm10: d.iaqi?.pm10?.v ?? null,
                no2: d.iaqi?.no2?.v ?? null,
                o3: d.iaqi?.o3?.v ?? null,
                so2: d.iaqi?.so2?.v ?? null,
                co: d.iaqi?.co?.v ?? null,
                forecast: {
                    pm25: d.forecast?.daily?.pm25 || [],
                    pm10: d.forecast?.daily?.pm10 || [],
                    uvi: d.forecast?.daily?.uvi || [],
                }
            };
        }
    } catch { }

    // 2. Fallback to OpenAQ
    if (!baseData) {
        usedSource = 'OpenAQ';
        baseData = await fetchOpenAQ(city);
    }

    if (!baseData) {
        throw new Error(`Air quality data not found for "${city}" across all providers.`);
    }

    // 3. Fallback coordinates if OpenAQ didn't provide them
    let lat = baseData.lat!;
    let lon = baseData.lon!;
    if (!lat && !lon) {
        try {
            const coords = await getOpenWeatherCoords(city);
            lat = coords.lat;
            lon = coords.lon;
            baseData.lat = lat;
            baseData.lon = lon;
        } catch { }
    }

    // 4. Open-Meteo Supplement (Parallel)
    let meteoData = null;
    if (lat && lon) {
        meteoData = await fetchOpenMeteo(lat, lon);
    }

    if (meteoData && usedSource === 'OpenAQ') {
        usedSource = 'Mixed';
    }

    return {
        ...baseData,
        source: usedSource,
        uvIndex: meteoData?.uvIndex ?? null,
        dust: meteoData?.dust ?? null,
    } as AeroSenseData;
}
