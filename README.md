# WeatherMap Web

OpenWeather verilerini interaktif harita, güncel hava kartı ve beş günlük tahmin olarak gösteren React + Vite uygulaması. Uygulama yalnızca Türkiye şehirlerini destekler; başlangıçta IP konumunu algılar, haritaya tıklayarak yeni konum seçmenize ve gün seçerek saatlik tahmini görmenize izin verir.

## Başlatma

```powershell
npm install
Copy-Item .env.example .env
# .env içinde OPENWEATHER_API_KEY ve OPENROUTER_API_KEY değerlerini doldurun
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır. Test ve production build:

```powershell
npm run test
npm run build
```

API anahtarları yalnızca backend ortamındaki `.env` içinde tutulur ve `.gitignore` ile Git'e alınmaz. OpenWeather çağrıları backend proxy üzerinden yapılır; anahtar frontend bundle'a dahil edilmez. Uygulama konum için IP adresi kullanmaz; yalnızca tarayıcının cihaz konumu izniyle alınan GPS/Wi-Fi konumunu kullanır.

## Yapay zeka önerileri

OpenRouter önerileri için `.env` içine `OPENROUTER_API_KEY` ekleyin. Geliştirme sırasında iki terminal açın:

```powershell
npm run server
npm run dev
```

OpenRouter kullanılamadığında uygulama güvenli kural tabanlı önerilere geri döner.
