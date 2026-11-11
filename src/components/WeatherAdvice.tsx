import { useEffect, useMemo, useState } from 'react';
import type { ForecastDay, WeatherData } from '../types/weather';
import { createDayWeather } from '../utils/forecastWeather';

const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '';

interface Advice {
  summary: string;
  items: Array<{ icon: string; text: string }>;
}

export function WeatherAdvice({ weather, selectedDay }: { weather: WeatherData; selectedDay?: ForecastDay }) {
  const adviceWeather = useMemo(() => selectedDay ? createDayWeather(weather, selectedDay) : weather, [weather, selectedDay]);
  const [advice, setAdvice] = useState<Advice>(() => createAdvice(adviceWeather));
  const [isAiLoading, setIsAiLoading] = useState(false);
  const selectedDayLabel = selectedDay
    ? new Date(`${selectedDay.date}T12:00:00`).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'bugün';

  useEffect(() => {
    let cancelled = false;
    setAdvice(createAdvice(adviceWeather));
    setIsAiLoading(true);
    fetch(`${API_BASE}/api/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: adviceWeather.city,
        condition: adviceWeather.weather[0].description,
        temperature: adviceWeather.main.temp,
        feelsLike: adviceWeather.main.feels_like,
        humidity: adviceWeather.main.humidity,
        windSpeed: adviceWeather.wind.speed,
        windGust: adviceWeather.wind.gust,
        rain: adviceWeather.rain,
        clouds: adviceWeather.clouds,
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('AI advice unavailable');
        return response.json() as Promise<Advice>;
      })
      .then((result) => {
        if (!cancelled && result.summary && Array.isArray(result.items)) setAdvice({ summary: result.summary, items: result.items.slice(0, 4) });
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setIsAiLoading(false);
      });
    return () => { cancelled = true; };
  }, [adviceWeather]);

  return (
    <section className="advice-card" aria-labelledby="advice-title">
      <div className="advice-header">
        <span className="advice-icon" aria-hidden="true">✦</span>
        <div>
          <p className="eyebrow">AKILLI ÖNERİ</p>
          <h2 id="advice-title">{selectedDayLabel} için öneriler {isAiLoading && <span className="advice-loading">•</span>}</h2>
        </div>
      </div>
      <p className="advice-summary">{advice.summary}</p>
      <div className="advice-list">
        {advice.items.map((item) => <div className="advice-item" key={item.icon + item.text}><span aria-hidden="true">{item.icon}</span><p>{item.text}</p></div>)}
      </div>
    </section>
  );
}

function createAdvice(weather: WeatherData) {
  const condition = weather.weather[0].description.toLocaleLowerCase('tr-TR');
  const rain = weather.rain?.['1h'] ?? weather.rain?.['3h'] ?? 0;
  const temp = weather.main.temp;
  const items: Array<{ icon: string; text: string }> = [];

  if (rain > 0 || /yağmur|sağanak|drizzle/.test(condition)) {
    items.push({ icon: '☂', text: 'Şemsiye veya yağmurluk almayı unutmayın.' });
    items.push({ icon: '☕', text: 'Kapalı alanlarda kitap okumak, film izlemek veya sıcak bir içecek için iyi bir gün.' });
  } else if (/kar|snow|sleet/.test(condition)) {
    items.push({ icon: '🧣', text: 'Kalın giyinin, kaygan zeminlere karşı dikkatli olun.' });
    items.push({ icon: '☕', text: 'Evde sıcak bir içecek ve sakin bir aktivite için uygun.' });
  } else if (/açık|güneş|clear/.test(condition) || temp >= 20) {
    items.push({ icon: '🕶', text: 'Güneş gözlüğü ve güneş koruyucu kullanın.' });
    items.push({ icon: '🚶', text: 'Yürüyüş, bisiklet veya açık hava etkinliği için güzel bir gün.' });
  } else {
    items.push({ icon: '🧥', text: 'Hafif bir mont almanız konforunuzu artırabilir.' });
    items.push({ icon: '🌿', text: 'Kısa bir yürüyüş için uygun, ılıman bir hava.' });
  }

  if (temp < 8) items.push({ icon: '❄', text: 'Soğuk havaya karşı katmanlı giyinmeye özen gösterin.' });
  if (temp > 30) items.push({ icon: '💧', text: 'Bol su için ve öğle saatlerinde doğrudan güneş altında kalmayın.' });
  if ((weather.wind.gust ?? weather.wind.speed) > 10) items.push({ icon: '💨', text: 'Rüzgar kuvvetli; açık alanlarda ve deniz kenarında dikkatli olun.' });
  if (weather.main.humidity > 80) items.push({ icon: '💧', text: 'Nem yüksek; sıkışık ve havasız ortamlarda uzun süre kalmamaya çalışın.' });

  return {
    summary: `${weather.city} için hava durumuna göre günlük planınızı şöyle yapabilirsiniz:`,
    items: items.slice(0, 4),
  };
}
