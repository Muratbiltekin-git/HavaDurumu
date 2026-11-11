import { useQuery } from '@tanstack/react-query';
import { fetchWeather, fetchWeatherByCoords } from '../services/weatherApi';
import type { Coordinates } from '../types/weather';

export const useWeather = (city: string, coordinates?: Coordinates) =>
  useQuery({
    queryKey: ['weather', city, coordinates],
    queryFn: () => coordinates ? fetchWeatherByCoords(coordinates) : fetchWeather(city),
    enabled: city.trim().length > 0 || Boolean(coordinates),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
