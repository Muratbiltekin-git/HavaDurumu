import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { fetchCitySuggestions } from '../services/weatherApi';
import type { CitySuggestion } from '../types/weather';

const TURKISH_CITY_NAMES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik',
  'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum',
  'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis',
  'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

const TURKISH_CITIES: CitySuggestion[] = TURKISH_CITY_NAMES.map((name) => ({
  name,
  country: 'TR',
  lat: 0,
  lon: 0,
}));

export const TURKISH_DISTRICTS: Record<string, CitySuggestion[]> = {
  Adana: ['Seyhan', 'Yüreğir', 'Çukurova', 'Sarıçam', 'Ceyhan'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Ankara: ['Çankaya', 'Keçiören', 'Mamak', 'Etimesgut', 'Sincan', 'Yenimahalle', 'Gölbaşı'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Antalya: ['Alanya', 'Muratpaşa', 'Kepez', 'Konyaaltı', 'Manavgat', 'Lara'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Bursa: ['Osmangazi', 'Nilüfer', 'Yıldırım', 'İnegöl', 'Gemlik'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Gaziantep: ['Şahinbey', 'Şehitkamil', 'Nizip', 'İslahiye'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  İstanbul: ['Kadıköy', 'Beşiktaş', 'Bakırköy', 'Beykoz', 'Beyoğlu', 'Esenler', 'Esenyurt', 'Fatih', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sarıyer', 'Şişli', 'Ümraniye', 'Üsküdar', 'Zeytinburnu'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  İzmir: ['Bornova', 'Buca', 'Çeşme', 'Konak', 'Karşıyaka', 'Menemen', 'Urla'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Kayseri: ['Melikgazi', 'Kocasinan', 'Talas', 'Develi'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Konya: ['Selçuklu', 'Meram', 'Karatay', 'Ereğli'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Mersin: ['Yenişehir', 'Mezitli', 'Toroslar', 'Akdeniz', 'Tarsus'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Muğla: ['Bodrum', 'Datça', 'Fethiye', 'Marmaris', 'Milas'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Samsun: ['Atakum', 'Canik', 'İlkadım', 'Tekkeköy'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
  Trabzon: ['Ortahisar', 'Akçaabat', 'Araklı', 'Of'].map((name) => ({ name, country: 'TR', lat: 0, lon: 0 })),
};

const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

interface SearchBarProps {
  value: string;
  onSearch: (city: string) => void;
  onNoResults?: (value: string) => void;
  placeholder?: string;
  label?: string;
  localSuggestions?: boolean | CitySuggestion[];
  suggestionContext?: string;
}

export function SearchBar({ value, onSearch, onNoResults, placeholder = 'Şehir ara...', label = 'Şehir ara', localSuggestions = true, suggestionContext }: SearchBarProps) {
  const [input, setInput] = useState(value);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const requestId = useRef(0);
  useEffect(() => setInput(value), [value]);
  useEffect(() => {
    const query = input.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }
    const source = Array.isArray(localSuggestions) ? localSuggestions : localSuggestions ? TURKISH_CITIES : [];
    const localResults = source.filter((city) => normalize(city.name).startsWith(normalize(query))).slice(0, 8);
    setSuggestions(localResults);
    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const results = await fetchCitySuggestions(query, suggestionContext);
        if (currentRequest === requestId.current) {
          const seen = new Set(localResults.map((city) => normalize(city.name)));
          setSuggestions([...localResults, ...results.filter((city) => !seen.has(normalize(city.name)))].slice(0, 8));
        }
      } catch {
        if (currentRequest === requestId.current) setSuggestions(localResults);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [input, suggestionContext]);
  const chooseSuggestion = (suggestion: CitySuggestion) => {
    const label = [suggestion.name, suggestion.state, suggestion.country].filter(Boolean).join(', ');
    setInput(label);
    setSuggestions([]);
    onSearch(suggestion.name);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const city = input.trim().replace(/\s*,\s*TR\s*$/i, '');
    if (activeIndex >= 0 && suggestions[activeIndex]) chooseSuggestion(suggestions[activeIndex]);
    else if (city) {
      const source = Array.isArray(localSuggestions) ? localSuggestions : localSuggestions ? TURKISH_CITIES : [];
      const localMatch = source.some((item) => normalize(item.name) === normalize(city));
      if (localMatch || suggestions.some((item) => normalize(item.name) === normalize(city))) {
        setSuggestions([]);
        onSearch(city);
        return;
      }
      try {
        const results = await fetchCitySuggestions(city, suggestionContext);
        const exactResult = results.some((item) => normalize(item.name) === normalize(city));
        if (exactResult) {
          setSuggestions([]);
          onSearch(city);
        } else {
          onNoResults?.(city);
        }
      } catch {
        onNoResults?.(city);
      }
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === 'Escape') {
      setSuggestions([]);
    }
  };
  return (
    <form className="search-bar" onSubmit={submit} role="search" onFocus={() => setIsFocused(true)} onBlur={() => window.setTimeout(() => setIsFocused(false), 150)}>
      <label htmlFor={`search-${label}`}>{label}</label>
      <div className="search-input-wrap">
        <input id={`search-${label}`} aria-label={label} role="combobox" aria-expanded={isFocused && suggestions.length > 0} aria-controls={`suggestions-${label}`} aria-activedescendant={activeIndex >= 0 ? `suggestion-${label}-${activeIndex}` : undefined} value={input} onChange={(e) => { setInput(e.target.value); setActiveIndex(-1); }} onKeyDown={handleKeyDown} onFocus={() => setIsFocused(true)} placeholder={placeholder} autoComplete="off" />
        {input && <button type="button" className="clear-button" aria-label="Clear search" onClick={() => setInput('')}>×</button>}
        <button className="search-button" type="submit">Ara</button>
      </div>
      {isFocused && suggestions.length > 0 && <ul className="suggestions" id={`suggestions-${label}`} role="listbox">{suggestions.map((suggestion, index) => <li key={`${suggestion.name}-${suggestion.lat}`}><button type="button" id={`suggestion-${label}-${index}`} role="option" aria-selected={index === activeIndex} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSuggestion(suggestion)}><strong>{suggestion.name}</strong><span>{[suggestion.state, suggestion.country].filter(Boolean).join(', ')}</span></button></li>)}</ul>}
    </form>
  );
}
