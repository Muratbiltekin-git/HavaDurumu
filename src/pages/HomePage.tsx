import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useWeather } from '../hooks/useWeather';
import { SearchBar, TURKISH_DISTRICTS } from '../components/SearchBar';
import { WeatherCard } from '../components/WeatherCard';
import { ForecastList } from '../components/ForecastList';
import { HourlyList } from '../components/HourlyList';
import { WeatherAdvice } from '../components/WeatherAdvice';
import { MapView } from '../components/MapView';
import { getLocationByBrowser } from '../services/ipLocation';
import type { Coordinates } from '../types/weather';

export function HomePage() {
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [isLocationReady, setIsLocationReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const userSelectedLocation = useRef(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('weathermap-theme') === 'dark');
  const query = useWeather(searchLocation, coordinates);
  const search = (nextCity: string) => {
    userSelectedLocation.current = true;
    setCoordinates(undefined);
    setSelectedDate('');
    setCity(nextCity.replace(/\s*,\s*TR\s*$/i, '').trim());
    setDistrict('');
    setSearchLocation(nextCity.replace(/\s*,\s*TR\s*$/i, '').trim());
  };
  const showInvalidCity = (value: string) => {
    toast.error(`"${value}" Türkiye'de kayıtlı bir il değil.`);
  };
  const searchDistrict = (nextDistrict: string) => {
    userSelectedLocation.current = true;
    setCoordinates(undefined);
    setSelectedDate('');
    setDistrict(nextDistrict);
    setSearchLocation(city ? `${nextDistrict}, ${city}` : nextDistrict);
  };
  const showInvalidDistrict = (value: string) => {
    toast.error(`"${value}" seçilen ilde kayıtlı bir ilçe değil.`);
  };
  const requestBrowserLocation = async () => {
    setIsLocating(true);
    try {
      const location = await getLocationByBrowser();
      userSelectedLocation.current = false;
      setCoordinates(location);
      setCity('');
      setDistrict('');
      setSearchLocation('');
      setIsLocationReady(true);
    } catch {
      toast.error('Konum izni alınamadı. Tarayıcı ayarlarından bu siteye konum izni verin.');
    } finally {
      setIsLocating(false);
    }
  };
  const errorMessage = query.error instanceof Error ? query.error.message : '';
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('weathermap-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  useEffect(() => {
    if (query.error) toast.error(errorMessage);
  }, [query.error, errorMessage]);
  useEffect(() => {
    if (query.data?.forecast[0]) setSelectedDate((current) => current || query.data.forecast[0].date);
  }, [query.data]);
  useEffect(() => {
    let cancelled = false;
    const applyLocation = (location: Coordinates, locationCity?: string) => {
      if (cancelled || userSelectedLocation.current) return;
      setCoordinates((current) => current ?? location);
      setCity((current) => current || locationCity || '');
      setSearchLocation((current) => current || locationCity || '');
      setIsLocationReady(true);
    };
    getLocationByBrowser()
      .then((location) => applyLocation(location))
      .catch(() => {
          if (!cancelled) setIsLocationReady(true);
      });
    return () => { cancelled = true; };
  }, []);
  const selectedForecast = query.data?.forecast.find((day) => day.date === selectedDate) ?? query.data?.forecast[0];
  const selectMapLocation = (lat: number, lon: number) => {
    userSelectedLocation.current = true;
    setCoordinates({ lat, lon });
    setCity('Seçilen konum');
    setDistrict('');
    setSearchLocation('');
  };
  return <div className="app-shell"><header className="topbar"><a className="brand" href="/" aria-label="WeatherMap ana sayfa"><span className="brand-mark">W</span>WeatherMap</a><div className="header-actions"><SearchBar value={city} onSearch={search} onNoResults={showInvalidCity} /><SearchBar value={district} onSearch={searchDistrict} onNoResults={showInvalidDistrict} placeholder="İlçe ara..." label="İlçe ara" localSuggestions={city ? (TURKISH_DISTRICTS[city] ?? []) : []} suggestionContext={city || undefined} /><button className="location-button" type="button" onClick={requestBrowserLocation} disabled={isLocating} aria-label="Cihaz konumunu kullan">{isLocating ? 'Konum aranıyor...' : 'Konumumu bul'}</button><button className="theme-toggle" type="button" aria-label={isDark ? 'Gündüz moduna geç' : 'Gece moduna geç'} aria-pressed={isDark} onClick={() => setIsDark((dark) => !dark)}>{isDark ? '☀' : '☾'}</button></div></header><main className="dashboard"><div className="forecast-strip">{query.data && <ForecastList forecast={query.data.forecast} selectedDate={selectedForecast?.date ?? ''} onSelect={setSelectedDate} />}</div><div className="weather-layout"><div className="weather-column">{query.data && <><WeatherCard weather={query.data.current} selectedDay={selectedForecast} province={city} district={district} /><WeatherAdvice weather={query.data.current} selectedDay={selectedForecast} /></>}</div><div className="details">{query.isLoading && <LoadingState />}{query.error && <div className="error-card" role="alert"><h2>Hava durumu yüklenemedi</h2><p>{errorMessage}</p><button onClick={() => query.refetch()}>Tekrar dene</button></div>}{query.data && !query.isLoading && selectedForecast && <HourlyList date={selectedForecast.date} hourly={selectedForecast.hourly} />}{!city && !district && isLocationReady && !query.isLoading && <div className="empty-state"><span>◎</span><h2>Hava durumunu görmek için şehir veya ilçe arayın</h2><p>Canlı hava durumu ve beş günlük tahmin alın.</p></div>}</div></div><section className="map-section" aria-label="Türkiye hava durumu haritası"><MapView weather={query.data?.current} onMapSelect={selectMapLocation} /></section></main><footer>Hava durumu verileri <a href="https://openweathermap.org/" target="_blank" rel="noreferrer">OpenWeather</a> tarafından sağlanır · Harita © OpenStreetMap</footer></div>;
}

function LoadingState() {
  return <div className="loading-state" aria-label="Hava durumu yükleniyor"><div className="skeleton skeleton-title" /><div className="skeleton skeleton-temp" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /></div>;
}
