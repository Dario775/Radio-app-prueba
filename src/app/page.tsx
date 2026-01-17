'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchStations, getRandomStation, getStationsByLocation, getStationDetails, getAllCountries, getStatesForCountry } from '@/actions/radio';
import SearchBar from '@/components/SearchBar';
import StationCard from '@/components/StationCard';
import GenreSelector from '@/components/GenreSelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import Navbar from '@/components/Navbar';
import PlayerView from '../components/PlayerView';
import { useAudio } from '@/context/AudioContext';
import { useFavorites } from '@/hooks/useFavorites';
import type { RadioStation } from '@/types/radio';

interface Genre {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const genres: Genre[] = [
  { id: 'all', label: 'Para Ti', icon: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z', color: '#00bdc7' },
  { id: 'pop', label: 'Éxitos Pop', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', color: '#ff2d55' },
  { id: 'rock', label: 'Rock', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z', color: '#ff9500' },
  { id: 'jazz', label: 'Jazz', icon: 'M21 3l-6 1.45V14.65c-.48-.23-1.02-.35-1.58-.35-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5V6l4-1V3z', color: '#5856d6' },
  { id: 'classical', label: 'Clásica', icon: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V3h6v4h-4V3z', color: '#af52de' },
  { id: 'electronic', label: 'Electrónica', icon: 'M12 1a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0114 0v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z', color: '#34c759' },
  { id: 'hiphop', label: 'Hip Hop', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z', color: '#ff3b30' },
  { id: 'news', label: 'Noticias', icon: 'M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 12H7v2h10v-2zm0-4H7v2h10v-2zm0-4H7v2h10V7z', color: '#007aff' },
  { id: 'sports', label: 'Deportes', icon: 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z', color: '#5ac8fa' },
];

interface DiscoverViewProps {
  searchQuery: string;
  handleSearch: (query: string) => void;
  activeCategory: string;
  handleCategoryChange: (categoryId: string) => void;
  localStations: RadioStation[];
  userCountry: { name: string, code: string } | null;
  isPending: boolean;
  error: string | null;
  stations: RadioStation[];
  fetchStations: (query?: string, tag?: string) => void;
  handleRoulette: () => void;
  isRouletteLoading: boolean;
  topStations: RadioStation[];
  playStation: (station: RadioStation) => void;
}

export function DiscoverView({
  searchQuery,
  handleSearch,
  activeCategory,
  handleCategoryChange,
  localStations,
  userCountry,
  isPending,
  error,
  stations,
  fetchStations,
  handleRoulette,
  isRouletteLoading,
  topStations,
  playStation
}: DiscoverViewProps) {
  const [countries, setCountries] = useState<{ name: string, stationcount: number }[]>([]);
  const [states, setStates] = useState<{ name: string, stationcount: number }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('Argentina');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    getAllCountries().then(setCountries);
    getStatesForCountry('Argentina').then(setStates);
  }, []);

  const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedState('');

    try {
      const states = await getStatesForCountry(country);
      setStates(states);
    } catch (e) { setStates([]); }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setSelectedState(state);
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-dark border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Descubrir</h1>
              <p className="text-sm text-[var(--text-muted)]">Encuentra tu nueva radio favorita</p>
            </div>
          </div>

          {/* Search and Add Radio */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Buscar por nombre de emisora..."
                initialValue={searchQuery.startsWith('location:') ? '' : searchQuery}
              />
            </div>
            <Link
              href="/add-radio"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-[var(--primary)] hover:text-white transition-all"
              title="Añadir tu propia radio"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Genre Selector */}
      <div className="relative pt-6 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)] opacity-80">Explorar Música</h2>
              <p className="text-3xl font-black mt-1">¿Qué te apetece hoy?</p>
            </div>
            <button
              onClick={handleRoulette}
              disabled={isRouletteLoading}
              className="w-12 h-12 rounded-2xl glass hover:bg-[var(--primary)] hover:text-white transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
              title="¡Sorpréndeme!"
            >
              {isRouletteLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="text-2xl">🎲</span>}
            </button>
          </div>
        </div>

        <GenreSelector
          activeGenre={activeCategory}
          onGenreChange={handleCategoryChange}
        />

        {/* Location Filter */}
        <div className="max-w-4xl mx-auto px-4 mt-6 mb-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Explorar por Ubicación
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(`location:${selectedCountry}`)}
                  className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] transition-colors"
                >
                  <option value="" className="bg-black">Seleccionar País</option>
                  {countries.map(c => (
                    <option key={c.name} value={c.name} className="bg-black text-white">{c.name} ({c.stationcount})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                </div>
              </div>

              <div className="relative flex-1">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(`location:${selectedCountry}:${selectedState}`)}
                  disabled={!selectedCountry || states.length === 0}
                  className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] transition-colors disabled:opacity-50"
                >
                  <option value="" className="bg-black">Todas las Provincias/Estados</option>
                  {states.map(s => (
                    <option key={s.name} value={s.name} className="bg-black text-white">{s.name} ({s.stationcount})</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                </div>
              </div>

              <button
                onClick={() => handleSearch(selectedState ? `location:${selectedCountry}:${selectedState}` : `location:${selectedCountry}`)}
                className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-semibold rounded-xl transition-all active:scale-95 whitespace-nowrap"
              >
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {/* Top Stations Horizontal */}
        {
          !searchQuery && activeCategory === 'all' && topStations.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[var(--primary)] rounded-full" />
                  Tus Radios Top
                </h2>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                {topStations.map((station: RadioStation) => (
                  <div key={station.stationuuid} className="w-20 flex-shrink-0 flex flex-col items-center group cursor-pointer" onClick={() => playStation(station)}>
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-[var(--primary)] transition-all shadow-lg mb-2">
                      <img
                        src={station.favicon || `https://ui-avatars.com/api/?name=${encodeURIComponent(station.name)}&background=random`}
                        alt={station.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-center truncate w-full group-hover:text-[var(--primary)] transition-colors opacity-80">{station.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )
        }

        {/* Local Stations Horizontal */}
        {
          !searchQuery && activeCategory === 'all' && localStations.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-orange-400 rounded-full" />
                  Radios en {userCountry?.name}
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {localStations.map((station: RadioStation) => (
                  <div key={station.stationuuid} className="w-40 flex-shrink-0">
                    <div onClick={() => { }} className="group block cursor-pointer">
                      <StationCard station={station} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        }
        {
          isPending ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-[var(--text-muted)]">Cargando emisoras...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">{error}</p>
              <button
                onClick={() => fetchStations('', activeCategory)}
                className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:bg-[var(--primary-dark)] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : stations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">No se encontraron emisoras</p>
              <p className="text-sm text-[var(--text-muted)] mt-1">Prueba con otra búsqueda o categoría</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {searchQuery
                    ? `Resultados para "${searchQuery}"`
                    : activeCategory === 'all'
                      ? 'Recomendado para ti'
                      : `Emisoras de ${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">{stations.length} emisoras</span>
              </div>

              <div className="grid gap-3">
                {stations.map((station: any) => (
                  <StationCard key={station.stationuuid} station={station} />
                ))}
              </div>
            </>
          )
        }
      </main >
    </div >
  );
}

export default function Home() {
  const router = useRouter();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [localStations, setLocalStations] = useState<RadioStation[]>([]);
  const [userCountry, setUserCountry] = useState<{ name: string, code: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRouletteLoading, setIsRouletteLoading] = useState(false);
  const [relatedStations, setRelatedStations] = useState<RadioStation[]>([]);

  const fetchStations = useCallback((query: string = '', tag: string = '') => {
    setError(null);

    startTransition(async () => {
      try {
        let result;
        if (query.startsWith('location:')) {
          const parts = query.replace('location:', '').split(':');
          const country = parts[0];
          const state = parts[1] || undefined;
          result = await getStationsByLocation(undefined, state, country);
        } else {
          result = await searchStations(query, tag);
        }
        setStations(result);
      } catch (err) {
        console.error('Error fetching stations:', err);
        setError('Error al cargar las emisoras. Por favor, inténtalo de nuevo.');
        setStations([]);
      }
    });
  }, []);

  useEffect(() => {
    fetchStations('', activeCategory);
  }, [activeCategory, fetchStations]);

  // Detect location and fetch local stations
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code) {
          setUserCountry({ name: data.country_name, code: data.country_code });
          const local = await getStationsByLocation(data.country_code);
          setLocalStations(local);
        }
      } catch (err) {
        console.error('Location detection failed:', err);
      }
    };
    detectLocation();
  }, []);

  const handleRoulette = async () => {
    setIsRouletteLoading(true);
    try {
      const station = await getRandomStation();
      if (station) {
        playStation(station);
        setView('player');
      }
    } catch (err) {
      console.error('Roulette failed:', err);
    } finally {
      setIsRouletteLoading(false);
    }
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      fetchStations(query, '');
    } else if (query.length === 0) {
      fetchStations('', activeCategory);
    }
  }, [activeCategory, fetchStations]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
  };

  const { currentStation, playStation } = useAudio();
  const { getTopStations, addToRecent } = useFavorites();
  const [view, setView] = useState<'player' | 'discover'>('player');
  const topStations = getTopStations();

  // Track play when currentStation changes
  useEffect(() => {
    if (currentStation) {
      addToRecent(currentStation);
    }
  }, [currentStation?.stationuuid, addToRecent]);

  // Switch view automatically when a station is selected via search/roulette
  useEffect(() => {
    if (currentStation && view === 'discover') {
      setView('player');
    }
  }, [currentStation]);

  // If no station is playing, force discovery view
  useEffect(() => {
    if (!currentStation) {
      setView('discover');
      setRelatedStations([]);
    } else {
      // Fetch related stations when currentStation changes
      const fetchRelated = async () => {
        try {
          const { relatedStations } = await getStationDetails(currentStation.stationuuid);
          setRelatedStations(relatedStations);
        } catch (err) {
          console.error('Failed to fetch related stations:', err);
        }
      };
      fetchRelated();
    }
  }, [currentStation]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[var(--primary)] selection:text-white">
      {/* Global Ambient Glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 opacity-20"
        style={{
          background: view === 'player'
            ? `radial-gradient(circle at 50% 50%, var(--primary-dynamic) 0%, transparent 70%)`
            : 'none'
        }}
      />
      {view === 'player' && currentStation ? (
        <div className="animate-fade-in relative z-10">
          <PlayerView
            station={currentStation}
            relatedStations={relatedStations}
            onOpenDiscover={() => setView('discover')}
          />
        </div>
      ) : (
        <div className="animate-fade-in relative z-10 pb-32">
          <DiscoverView
            searchQuery={searchQuery}
            handleSearch={handleSearch}
            activeCategory={activeCategory}
            handleCategoryChange={handleCategoryChange}
            localStations={localStations}
            userCountry={userCountry}
            isPending={isPending}
            error={error}
            stations={stations}
            fetchStations={fetchStations}
            handleRoulette={handleRoulette}
            isRouletteLoading={isRouletteLoading}
            topStations={topStations}
            playStation={playStation}
          />
        </div>
      )}

      {/* Navigation Overlay */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10 safe-area-pb">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setView('player')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${view === 'player'
                ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <span className="text-[10px] font-medium">Reproductor</span>
            </button>

            <button
              onClick={() => setView('discover')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${view === 'discover'
                ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'
                }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[10px] font-medium">Explorar</span>
            </button>

            <Link
              href="/favorites"
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-[10px] font-medium">Librería</span>
            </Link>

            <Link
              href="/alarms"
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-[10px] font-medium">Alarmas</span>
            </Link>

            <Link
              href="/audio-preferences"
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-[10px] font-medium">Ajustes</span>
            </Link>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
