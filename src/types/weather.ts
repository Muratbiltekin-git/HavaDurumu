export interface WeatherData {
  city: string;
  province?: string;
  district?: string;
  name?: string;
  coord: { lon: number; lat: number };
  main: { temp: number; feels_like: number; humidity: number; pressure?: number; temp_min?: number; temp_max?: number };
  wind: { speed: number; deg?: number; gust?: number };
  visibility?: number;
  clouds?: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  sys?: { sunrise: number; sunset: number };
  timezone?: number;
  weather: Array<{ description: string; icon: string }>;
}

export interface ForecastDay {
  date: string;
  temp: number;
  description: string;
  icon: string;
  hourly: HourlyWeather[];
}

export interface HourlyWeather {
  time: number;
  temp: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  windDeg?: number;
  clouds?: number;
  precipitationProbability?: number;
  rain?: number;
  description: string;
  icon: string;
}

export interface WeatherResponse {
  current: WeatherData;
  forecast: ForecastDay[];
}

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface Coordinates {
  lat: number;
  lon: number;
}
