import type { ForecastDay, WeatherData } from '../types/weather';

export function createDayWeather(weather: WeatherData, day: ForecastDay): WeatherData {
  const temperatures = day.hourly.map((hour) => hour.temp);
  const first = day.hourly[0];
  const humidityValues = day.hourly.flatMap((hour) => hour.humidity === undefined ? [] : [hour.humidity]);
  const averageHumidity = humidityValues.length
    ? Math.round(humidityValues.reduce((total, value) => total + value, 0) / humidityValues.length)
    : weather.main.humidity;
  const maxRain = Math.max(...day.hourly.map((hour) => hour.rain ?? 0));
  const averageClouds = day.hourly.length
    ? Math.round(day.hourly.reduce((total, hour) => total + (hour.clouds ?? first?.clouds ?? 0), 0) / day.hourly.length)
    : weather.clouds?.all;
  return {
    ...weather,
    main: {
      ...weather.main,
      temp: day.temp,
      feels_like: first?.feelsLike ?? day.temp,
      humidity: averageHumidity,
      temp_min: temperatures.length ? Math.min(...temperatures) : day.temp,
      temp_max: temperatures.length ? Math.max(...temperatures) : day.temp,
    },
    wind: {
      ...weather.wind,
      speed: Math.max(...day.hourly.map((hour) => hour.windSpeed ?? weather.wind.speed)),
      deg: first?.windDeg ?? weather.wind.deg,
    },
    clouds: averageClouds === undefined ? weather.clouds : { all: averageClouds },
    rain: maxRain > 0 ? { '3h': maxRain } : undefined,
    weather: [{ description: day.description, icon: first?.icon ?? day.icon }],
  };
}
