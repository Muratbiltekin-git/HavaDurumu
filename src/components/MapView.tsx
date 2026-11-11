import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { LatLngExpression } from 'leaflet';
import type { WeatherData } from '../types/weather';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

const markerIcon = new L.Icon({ iconUrl: markerIconUrl, iconRetinaUrl: markerIconRetinaUrl, shadowUrl: markerShadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });

export function MapView({ weather, onMapSelect }: { weather?: WeatherData; onMapSelect: (lat: number, lon: number) => void }) {
  const position: LatLngExpression = weather ? [weather.coord.lat, weather.coord.lon] : [39.0, 35.0];
  return <div className="map-panel" aria-label="Türkiye hava durumu haritası"><MapContainer center={position} zoom={weather ? 9 : 6} scrollWheelZoom className="map"><TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapClick onSelect={onMapSelect} />{weather && <><Marker position={position} icon={markerIcon} title={weather.city} /><Recenter position={position} /></>}</MapContainer>{!weather && <div className="map-empty">Haritadan Türkiye içinde bir konum seçin</div>}</div>;
}

function MapClick({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  useMapEvents({ click: ({ latlng }) => { if (latlng.lat >= 35.8 && latlng.lat <= 42.2 && latlng.lng >= 25.5 && latlng.lng <= 45) onSelect(latlng.lat, latlng.lng); } });
  return null;
}

function Recenter({ position }: { position: LatLngExpression }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, 9); }, [map, position]);
  return null;
}
