import http from 'node:http';

const port = Number(process.env.PORT ?? 8787);
const model = process.env.OPENROUTER_MODEL ?? 'openrouter/auto';
const appOrigin = process.env.APP_URL ?? 'https://weather-map.example';
const openWeatherKey = process.env.OPENWEATHER_API_KEY;
const openWeatherBase = 'https://api.openweathermap.org';

if (process.env.NODE_ENV === 'production' && !appOrigin.startsWith('https://')) {
  throw new Error('APP_URL production ortamında HTTPS olmalıdır');
}

const securityHeaders = (origin = appOrigin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
});

const send = (response, status, body, origin) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...securityHeaders(origin) });
  response.end(JSON.stringify(body));
};

const allowedOrigin = (requestOrigin) => requestOrigin === appOrigin
  || (process.env.NODE_ENV !== 'production' && requestOrigin === 'http://localhost:5173');

const proxyOpenWeather = async (path, params) => {
  if (!openWeatherKey) throw new Error('OPENWEATHER_API_KEY backend ortamında tanımlı değil');
  const url = new URL(`${openWeatherBase}${path}`);
  Object.entries({ ...params, appid: openWeatherKey, units: 'metric', lang: 'tr' }).forEach(([key, value]) => url.searchParams.set(key, value));
  const upstream = await fetch(url);
  const payload = await upstream.json();
  return { status: upstream.status, payload };
};

const server = http.createServer(async (request, response) => {
  const requestOrigin = request.headers.origin;
  const origin = allowedOrigin(requestOrigin) ? requestOrigin : appOrigin;
  if (request.method === 'OPTIONS') {
    response.writeHead(204, securityHeaders(origin));
    response.end();
    return;
  }

  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  if (request.method === 'GET' && requestUrl.pathname.startsWith('/api/weather/')) {
    const route = requestUrl.pathname.slice('/api/weather/'.length);
    const paths = {
      weather: '/data/2.5/weather',
      current: '/data/2.5/weather',
      forecast: '/data/2.5/forecast',
      geocode: '/geo/1.0/direct',
      reverse: '/geo/1.0/reverse',
    };
    if (!paths[route]) {
      send(response, 404, { error: 'Hava durumu endpointi bulunamadı' }, origin);
      return;
    }
    try {
      const params = Object.fromEntries(requestUrl.searchParams.entries());
      const result = await proxyOpenWeather(paths[route], params);
      send(response, result.status, result.payload, origin);
    } catch (error) {
      send(response, 503, { error: error instanceof Error ? error.message : 'Hava durumu servisi kullanılamıyor' }, origin);
    }
    return;
  }

  if (request.method !== 'POST' || requestUrl.pathname !== '/api/advice') {
    send(response, 404, { error: 'Endpoint bulunamadı' }, origin);
    return;
  }
  if (!process.env.OPENROUTER_API_KEY) {
    send(response, 503, { error: 'OPENROUTER_API_KEY backend ortamında tanımlı değil' }, origin);
    return;
  }

  let raw = '';
  for await (const chunk of request) raw += chunk;
  try {
    const weather = JSON.parse(raw);
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': appOrigin,
        'X-Title': 'WeatherMap',
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Türkçe hava durumu danışmanısın. Sağlık tavsiyesi veya kesin risk teşhisi verme. Yalnızca hava verisine dayalı, kısa ve uygulanabilir öneriler üret. JSON döndür: {"summary":"string","items":[{"icon":"emoji","text":"string"}]}. En fazla 4 madde.' },
          { role: 'user', content: `Şu hava verisini yorumla: ${JSON.stringify(weather)}` },
        ],
      }),
    });
    if (!upstream.ok) {
      send(response, 502, { error: 'Yapay zeka önerisi alınamadı' }, origin);
      return;
    }
    const payload = await upstream.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      send(response, 502, { error: 'Yapay zeka yanıtı geçersiz' }, origin);
      return;
    }
    send(response, 200, JSON.parse(content), origin);
  } catch {
    send(response, 400, { error: 'Öneri isteği işlenemedi' }, origin);
  }
});

server.listen(port, () => {
  console.log(`WeatherMap API listening on port ${port}`);
});
