import type { WeatherData } from '../types/weather';
import type { ForecastDay } from '../types/weather';
import { createDayWeather } from '../utils/forecastWeather';

export function WeatherCard({ weather, selectedDay, province, district }: { weather: WeatherData; selectedDay?: ForecastDay; province?: string; district?: string }) {
  const displayWeather = selectedDay ? createDayWeather(weather, selectedDay) : weather;
  const condition = displayWeather.weather[0];
  const selectedDayLabel = selectedDay ? new Date(`${selectedDay.date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  const provinceName = province || displayWeather.province || displayWeather.city;
  const districtName = district || displayWeather.district;
  return (
    <section className="weather-card" aria-labelledby="current-weather-title">
      <div className="weather-visual">
        <div className="card-heading">
          <div><p className="eyebrow">{selectedDay ? 'SEÇİLİ GÜNÜN HAVA DURUMU' : 'GÜNCEL HAVA DURUMU'}</p><h2 id="current-weather-title">{provinceName}</h2>{districtName && districtName !== provinceName && <p className="location-district">{districtName}</p>}</div>
          <span className="weather-icon" aria-hidden="true">{iconFor(condition.icon)}</span>
        </div>
        <div className="weather-time">{selectedDayLabel || new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="weather-summary">
          <div className="temperature">{Math.round(displayWeather.main.temp)}<span>°C</span></div>
          <div className="weather-description"><p className="condition">{condition.description}</p><p className="feels-like">Hissedilen {Math.round(displayWeather.main.feels_like)}°</p></div>
        </div>
      </div>
      <div className="metrics">
        <Metric label="Hissedilen" value={`${Math.round(displayWeather.main.feels_like)}°`} icon="◌" help="Rüzgar ve nemin etkisiyle vücudunuzun hissettiği sıcaklık." />
        <Metric label="Nem" value={`${displayWeather.main.humidity}%`} icon="◒" help="Havadaki su buharı oranı. Yüksek değerler havayı daha bunaltıcı hissettirebilir." />
        <Metric label="Rüzgar" value={`${displayWeather.wind.speed.toFixed(1)} m/s ${windDirection(displayWeather.wind.deg)}`} icon="➤" help="Rüzgarın hızı ve yönü. GB, güneybatı yönünü ifade eder." />
        {displayWeather.main.pressure && <Metric label="Basınç" value={`${displayWeather.main.pressure} hPa`} icon="◈" help="Atmosfer basıncı. Deniz seviyesinde ortalama değer yaklaşık 1013 hPa'dır." />}
        {displayWeather.visibility !== undefined && <Metric label="Görüş mesafesi" value={`${(displayWeather.visibility / 1000).toFixed(1)} km`} icon="◉" help="Açık havada net şekilde görülebilen yaklaşık uzaklık." />}
        {displayWeather.clouds && <Metric label="Bulutluluk" value={`${displayWeather.clouds.all}%`} icon="☁" help="Gökyüzünün bulutlarla kaplı tahmini yüzdesi." />}
        {displayWeather.rain?.['1h'] !== undefined && <Metric label="Son 1 saat yağış" value={`${displayWeather.rain['1h']} mm`} icon="☂" help="Son bir saat içinde ölçülen yağış miktarı." />}
        {displayWeather.main.temp_min !== undefined && displayWeather.main.temp_max !== undefined && <Metric label="Min / Maks" value={`${Math.round(displayWeather.main.temp_min)}° / ${Math.round(displayWeather.main.temp_max)}°`} icon="↕" help="Bugün için beklenen minimum ve maksimum sıcaklık." />}
        {displayWeather.sys && <Metric label="Gün doğumu" value={formatTime(displayWeather.sys.sunrise, displayWeather.timezone)} icon="☀" help="Güneşin doğduğu yerel saat." />}
        {displayWeather.sys && <Metric label="Gün batımı" value={formatTime(displayWeather.sys.sunset, displayWeather.timezone)} icon="◐" help="Güneşin battığı yerel saat." />}
      </div>
    </section>
  );
}

function Metric({ label, value, icon, help }: { label: string; value: string; icon: string; help: string }) {
  return <div className="metric-item" tabIndex={0} title={help} aria-label={`${label}: ${value}. ${help}`}><span><i aria-hidden="true">{icon}</i>{label}<b className="metric-help" aria-hidden="true">?</b></span><strong>{value}</strong><span className="metric-tooltip" role="tooltip">{help}</span></div>;
}

function windDirection(degrees?: number) {
  if (degrees === undefined) return '';
  return ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'][Math.round(degrees / 45) % 8];
}

function formatTime(timestamp: number, timezone = 0) {
  return new Date((timestamp + timezone) * 1000).toLocaleTimeString('tr-TR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
}

function iconFor(icon: string) {
  if (icon.startsWith('01')) return '☀';
  if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04')) return '☁';
  if (icon.startsWith('09') || icon.startsWith('10')) return '☂';
  if (icon.startsWith('11')) return 'ϟ';
  return '❄';
}
