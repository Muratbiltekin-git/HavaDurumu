import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeatherCard } from './WeatherCard';

describe('WeatherCard', () => {
  it('renders the city, temperature and condition', () => {
    render(<WeatherCard weather={{ city: 'London', coord: { lon: 0, lat: 51 }, main: { temp: 18, feels_like: 17, humidity: 70 }, wind: { speed: 3.2 }, weather: [{ description: 'clear sky', icon: '01d' }] }} />);
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('clear sky')).toBeInTheDocument();
  });
});
