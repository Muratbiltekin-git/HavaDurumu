import type { ForecastDay } from '../types/weather';

export function ForecastList({ forecast, selectedDate, onSelect }: { forecast: ForecastDay[]; selectedDate: string; onSelect: (date: string) => void }) {
  return <section aria-labelledby="forecast-title"><div className="section-title"><p className="eyebrow">TAHMİN</p><h2 id="forecast-title">5 günlük tahmin</h2></div><div className="forecast-list">{forecast.map((day) => <button className={`forecast-card ${day.date === selectedDate ? 'selected' : ''}`} type="button" key={day.date} onClick={() => onSelect(day.date)} aria-pressed={day.date === selectedDate}><strong>{new Date(`${day.date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}</strong><span className="forecast-icon" aria-hidden="true">{day.icon.startsWith('01') ? '☀' : '☁'}</span><b>{day.temp}°</b><span>{day.description}</span></button>)}</div></section>;
}
