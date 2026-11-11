import { useState } from 'react';
import type { HourlyWeather } from '../types/weather';

const windDirection = (degrees?: number) => {
  if (degrees === undefined) return '';
  return ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'][Math.round(degrees / 45) % 8];
};

const weatherIcon = (icon: string) => {
  if (icon.startsWith('01')) return '☀';
  if (icon.startsWith('02') || icon.startsWith('03') || icon.startsWith('04')) return '☁';
  if (icon.startsWith('09') || icon.startsWith('10')) return '☂';
  if (icon.startsWith('11')) return '⚡';
  if (icon.startsWith('13')) return '❄';
  return '☾';
};

export function HourlyList({ date, hourly }: { date: string; hourly: HourlyWeather[] }) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const temperatures = hourly.map((item) => item.temp);
  const min = Math.min(...temperatures);
  const max = Math.max(...temperatures);
  const average = Math.round(temperatures.reduce((total, temp) => total + temp, 0) / temperatures.length);
  const rainChance = Math.max(...hourly.map((item) => item.precipitationProbability ?? 0));
  const humidity = Math.round(hourly.reduce((total, item) => total + (item.humidity ?? 0), 0) / hourly.filter((item) => item.humidity !== undefined).length) || 0;
  const maxWind = Math.max(...hourly.map((item) => item.windSpeed ?? 0));
  const maxWindItem = hourly.find((item) => item.windSpeed === maxWind);
  const chartPoints = hourly.map((item, index) => ({
    item,
    x: 40 + index * (520 / Math.max(hourly.length - 1, 1)),
    y: 75 - (item.temp - min) * (max === min ? 0 : 50 / (max - min)),
  }));
  const points = chartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const dayName = new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  const active = activePoint === null ? undefined : chartPoints[activePoint];
  const activeTime = active && new Date(active.item.time * 1000).toLocaleTimeString('tr-TR', { hour: 'numeric', minute: '2-digit' });
  return <section className="hourly-section" aria-labelledby="hourly-title"><div className="section-title"><p className="eyebrow">SAATLİK TAHMİN</p><h2 id="hourly-title">{dayName}</h2></div><div className="temperature-chart" aria-label="Saatlik sıcaklık ve yağış grafiği"><svg viewBox="0 0 600 100" preserveAspectRatio="none" role="img"><polyline points={points} fill="none" stroke="#ff642f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{chartPoints.map(({ item, x, y }, index) => { const time = new Date(item.time * 1000).toLocaleTimeString('tr-TR', { hour: 'numeric', minute: '2-digit' }); const rain = item.precipitationProbability !== undefined ? `Yağış ihtimali %${item.precipitationProbability}` : 'Yağış bilgisi yok'; return <circle className="chart-point" key={item.time} cx={x} cy={y} r="10" tabIndex={0} aria-label={`${time}: ${item.temp} derece, ${rain}`} onMouseEnter={() => setActivePoint(index)} onMouseLeave={() => setActivePoint(null)} onFocus={() => setActivePoint(index)} onBlur={() => setActivePoint(null)} />; })}</svg>{active && <div className="chart-tooltip" style={{ left: `${(active.x / 600) * 100}%`, top: `${(active.y / 100) * 100}%` }} role="status"><strong>{activeTime}</strong><span>{active.item.temp}° sıcaklık</span><span>{active.item.precipitationProbability !== undefined ? `Yağış %${active.item.precipitationProbability}` : 'Yağış bilgisi yok'}</span></div>}</div><div className="hourly-list">{hourly.map((item) => <article className="hourly-card" key={item.time}><strong>{new Date(item.time * 1000).toLocaleTimeString('tr-TR', { hour: 'numeric', minute: '2-digit' })}</strong><span className="forecast-icon" aria-hidden="true">{weatherIcon(item.icon)}</span><b>{item.temp}°</b><span className="hourly-description">{item.description}</span><small>{item.precipitationProbability !== undefined ? `Yağış %${item.precipitationProbability}` : `${item.humidity ?? '-'}% nem`}</small></article>)}</div><div className="daily-summary" aria-label="Günün hava özeti"><div><span>En düşük / yüksek</span><strong>{min}° / {max}°</strong></div><div><span>Ortalama sıcaklık</span><strong>{average}°</strong></div><div><span>Yağış ihtimali</span><strong>{rainChance}%</strong></div><div><span>Nem ortalaması</span><strong>{humidity}%</strong></div><div><span>En yüksek rüzgar</span><strong>{maxWind.toFixed(1)} m/s {windDirection(maxWindItem?.windDeg)}</strong></div></div></section>;
}
