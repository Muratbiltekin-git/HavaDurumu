import { z } from 'zod';

export const weatherSchema = z.object({
  coord: z.object({ lon: z.number(), lat: z.number() }),
  main: z.object({
    temp: z.number(),
    feels_like: z.number().optional().default(0),
    humidity: z.number(),
    pressure: z.number().optional(),
    temp_min: z.number().optional(),
    temp_max: z.number().optional(),
  }),
  wind: z.object({ speed: z.number(), deg: z.number().optional(), gust: z.number().optional() }),
  visibility: z.number().optional(),
  clouds: z.object({ all: z.number() }).optional(),
  rain: z.object({ '1h': z.number().optional(), '3h': z.number().optional() }).optional(),
  sys: z.object({ sunrise: z.number(), sunset: z.number() }).optional(),
  timezone: z.number().optional(),
  weather: z.array(z.object({ description: z.string(), icon: z.string() })).min(1),
});

export const forecastSchema = z.object({
  list: z.array(z.object({
    dt: z.number(),
    dt_txt: z.string(),
    main: z.object({ temp: z.number(), feels_like: z.number().optional(), humidity: z.number().optional() }),
    wind: z.object({ speed: z.number().optional(), deg: z.number().optional() }).optional(),
    clouds: z.object({ all: z.number() }).optional(),
    pop: z.number().optional(),
    rain: z.object({ '3h': z.number().optional() }).optional(),
    weather: z.array(z.object({ description: z.string(), icon: z.string() })).min(1),
  })),
});
