import axios from 'axios';
import { forecastSchema, weatherSchema } from '../utils/validators';
import type { CitySuggestion, Coordinates, ForecastDay, HourlyWeather, WeatherData, WeatherResponse } from '../types/weather';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '';

const request = async <T>(path: string, params: Record<string, string>) => {
  try {
    const response = await axios.get<T>(`${API_BASE}/api/weather/${path}`, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new Error('API anahtarı geçersiz');
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Şehir bulunamadı');
    }
    throw new Error('Hava durumu servisi şu anda kullanılamıyor');
  }
};

const toForecastDays = (raw: unknown): ForecastDay[] => {
  const parsed = forecastSchema.parse(raw);
  const days = new Map<string, ForecastDay>();
  for (const item of parsed.list) {
    const date = item.dt_txt.slice(0, 10);
    const hourly: HourlyWeather = {
      time: item.dt,
      temp: Math.round(item.main.temp),
      feelsLike: item.main.feels_like === undefined ? undefined : Math.round(item.main.feels_like),
      humidity: item.main.humidity,
      windSpeed: item.wind?.speed,
      windDeg: item.wind?.deg,
      clouds: item.clouds?.all,
      precipitationProbability: item.pop === undefined ? undefined : Math.round(item.pop * 100),
      rain: item.rain?.['3h'],
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    };
    if (!days.has(date)) {
      days.set(date, {
        date,
        temp: Math.round(item.main.temp),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        hourly: [hourly],
      });
    } else {
      days.get(date)?.hourly.push(hourly);
    }
  }
  return [...days.values()].slice(0, 5);
};

const fetchWeatherData = async (params: Record<string, string>, fallbackCity: string): Promise<WeatherResponse> => {
  const [currentRaw, forecastRaw] = await Promise.all([
    request<WeatherData>('weather', params),
    request<unknown>('forecast', params),
  ]);
  const current = weatherSchema.parse(currentRaw);
  let province: string | undefined;
  let district: string | undefined;
  if (params.lat && params.lon) {
    try {
      const reverse = await axios.get<Array<{ name?: string; state?: string }>>(`${API_BASE}/api/weather/reverse`, { params });
      district = reverse.data[0]?.name;
      province = reverse.data[0]?.state;
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
    }
  }
  return {
    current: { ...current, city: currentRaw.name ?? fallbackCity, province, district },
    forecast: toForecastDays(forecastRaw),
  };
};

export const fetchWeather = async (city: string): Promise<WeatherResponse> => {
  const normalizedCity = city.replace(/\s*,\s*TR\s*$/i, '').trim();
  return fetchWeatherData({ q: `${normalizedCity},TR` }, normalizedCity);
};

export const fetchWeatherByCoords = async ({ lat, lon }: Coordinates): Promise<WeatherResponse> =>
  fetchWeatherData({ lat: lat.toString(), lon: lon.toString() }, 'Seçilen konum');

export const fetchCitySuggestions = async (query: string, context?: string): Promise<CitySuggestion[]> => {
  if (query.trim().length < 1) return [];
  const response = await axios.get<CitySuggestion[]>(`${API_BASE}/api/weather/geocode`, {
    params: { q: `${query.trim()}${context ? `,${context}` : ''},TR`, limit: '5' },
  });
  return response.data.filter((city) => city.country === 'TR');
};
