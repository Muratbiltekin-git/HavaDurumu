import axios from 'axios';
import type { Coordinates } from '../types/weather';

interface IpLocationResponse {
  city?: string;
  country_code?: string;
  latitude?: number;
  longitude?: number;
}

export const getLocationByBrowser = (): Promise<Coordinates> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Tarayıcı konumu desteklemiyor'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
      () => reject(new Error('Tarayıcı konum izni verilmedi')),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    );
  });

export const getLocationByIP = async (): Promise<Coordinates & { city: string }> => {
  const response = await axios.get<IpLocationResponse>('https://ipapi.co/json/');
  if (response.data.country_code !== 'TR' || typeof response.data.latitude !== 'number' || typeof response.data.longitude !== 'number') {
    throw new Error('Türkiye konumu belirlenemedi');
  }
  return {
    lat: response.data.latitude,
    lon: response.data.longitude,
    city: response.data.city ?? 'Konumunuz',
  };
};
