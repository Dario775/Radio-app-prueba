'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { useAudio } from '@/context/AudioContext';
import type { RadioStation, AudioPreferences } from '@/types/radio';
import Visualizer from '@/components/Visualizer';
import CastButton from '@/components/CastButton';

interface PlayerViewProps {
    station?: RadioStation;
    stationuuid?: string;
    relatedStations?: RadioStation[];
    onOpenDiscover?: () => void;
}

export default function PlayerView({ station, stationuuid, relatedStations, onOpenDiscover }: PlayerViewProps) {
    const {
        currentStation,
        isPlaying,
        isLoading,
        volume,
        setVolume,
        togglePlay,
        playStation,
        audioRef
    } = useAudio();

    const [imageError, setImageError] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const { toggleFavorite, isFavorite } = useFavorites();

    const defaultImage = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a2e"/>
          <stop offset="100%" style="stop-color:#16213e"/>
        </linearGradient>
      </defs>
      <rect fill="url(#bg)" width="400" height="400"/>
      <circle cx="200" cy="200" r="80" fill="none" stroke="#00bdc7" stroke-width="4"/>
      <circle cx="200" cy="200" r="50" fill="none" stroke="#00bdc7" stroke-width="3" opacity="0.6"/>
      <circle cx="200" cy="200" r="20" fill="#00bdc7"/>
    </svg>
  `);

    // Handle initial load or custom station search
    useEffect(() => {
        if (station) {
            // Only play if it's not already playing or it's a different station
            if (currentStation?.stationuuid !== station.stationuuid) {
                playStation(station);
            }
        } else if (stationuuid && !currentStation) {
            // If we land directly on a URL with a custom UUID
            const stored = localStorage.getItem('radio_custom');
            if (stored) {
                const customOnes: RadioStation[] = JSON.parse(stored);
                const found = customOnes.find(s => s.stationuuid === stationuuid);
                if (found) playStation(found);
            }
        }
    }, [station, stationuuid, currentStation, playStation]);

    // Sleep Timer Logic
    useEffect(() => {
        const stored = localStorage.getItem('audioPreferences');
        if (stored) {
            const prefs: AudioPreferences = JSON.parse(stored);
            if (prefs.sleepTimer && isPlaying) {
                if (timeLeft === null) {
                    setTimeLeft(prefs.sleepTimer * 60);
                }
            } else {
                setTimeLeft(null);
            }
        }
    }, [isPlaying, currentStation, timeLeft]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeLeft !== null && timeLeft > 0 && isPlaying) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev && prev <= 1) {
                        clearInterval(timer);
                        if (isPlaying) togglePlay();
                        return 0;
                    }
                    return prev ? prev - 1 : 0;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [timeLeft, isPlaying, togglePlay]);

    const formatTimeLeft = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleShare = async () => {
        if (!currentStation) return;
        const shareData = {
            title: currentStation.name,
            text: `¡Estoy escuchando ${currentStation.name} en RadioWave!`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('¡Enlace copiado al portapapeles!');
            }
        } catch (err) {
            console.error('Error al compartir:', err);
        }
    };

    if (!currentStation && isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin mb-4" />
                <p className="text-[var(--text-muted)] italic">Conectando con la emisora...</p>
            </div>
        );
    }

    if (!currentStation) return null;

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden">
            {/* Background with station image and Aurora effect */}
            <div className="absolute inset-0 overflow-hidden bg-black">
                {/* Aurora Orbs */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-40 animate-aurora mix-blend-screen"
                    style={{ backgroundColor: 'var(--primary-dynamic)' }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-30 animate-aurora mix-blend-screen"
                    style={{ backgroundColor: 'var(--primary-dynamic)', animationDirection: 'reverse', animationDuration: '25s' }}
                />

                <div
                    className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110"
                    style={{
                        backgroundImage: `url('${imageError ? '' : (currentStation.favicon || '')}')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header */}
                <header className="flex items-center justify-between p-4">
                    {onOpenDiscover ? (
                        <button
                            onClick={onOpenDiscover}
                            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm font-medium">Descubrir</span>
                        </button>
                    ) : (
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm font-medium">Atrás</span>
                        </Link>
                    )}

                    <div className="flex items-center gap-2">
                        <CastButton />
                        <button
                            onClick={handleShare}
                            className="p-3 rounded-full glass hover:bg-white/10 transition-colors"
                            title="Compartir emisora"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>

                        <button
                            onClick={() => toggleFavorite(currentStation)}
                            className={`p-3 rounded-full glass hover:bg-white/10 transition-colors ${isFavorite(currentStation.stationuuid) ? 'text-red-500' : ''}`}
                        >
                            <svg className="w-5 h-5" fill={isFavorite(currentStation.stationuuid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
                    {/* Album art */}
                    <div className="relative mb-8">
                        <div
                            className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-700 ${isPlaying ? 'animate-pulse-ring' : ''}`}
                            style={{ backgroundColor: 'var(--primary-dynamic)', opacity: 0.3 }}
                        />
                        <div
                            className="relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-700"
                            style={{ boxShadow: isPlaying ? '0 0 50px -10px var(--primary-dynamic)' : '' }}
                        >
                            <img
                                src={imageError ? defaultImage : (currentStation.favicon || defaultImage)}
                                alt={currentStation.name}
                                className={`w-full h-full object-cover ${isPlaying ? 'animate-float' : ''}`}
                                onError={() => setImageError(true)}
                            />

                            {/* Playing indicator */}
                            {isPlaying && (
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 shadow-lg">
                                    <div className="flex items-end gap-0.5 h-3">
                                        <div className="w-0.5 rounded-full equalizer-bar" style={{ backgroundColor: 'var(--primary-dynamic)' }} />
                                        <div className="w-0.5 rounded-full equalizer-bar" style={{ backgroundColor: 'var(--primary-dynamic)' }} />
                                        <div className="w-0.5 rounded-full equalizer-bar" style={{ backgroundColor: 'var(--primary-dynamic)' }} />
                                    </div>
                                    <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'var(--primary-dynamic)' }}>En vivo</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visualizer */}
                    <div className="mb-8 w-full max-w-xs flex flex-col items-center">
                        <div className="w-full h-8 flex items-center justify-center relative">
                            <Visualizer isPlaying={isPlaying} audioRef={audioRef} color="var(--primary-dynamic)" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Station info */}
                    <div className="text-center mb-6 max-w-md w-full">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2">{currentStation.name}</h1>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[var(--text-muted)] flex items-center justify-center gap-2">
                                <span>{currentStation.country || 'Ubicación desconocida'}</span>
                                {currentStation.bitrate > 30 && (
                                    <>
                                        <span>•</span>
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/5">{currentStation.bitrate}k {currentStation.codec}</span>
                                    </>
                                )}
                            </p>
                            {timeLeft !== null && timeLeft > 0 && isPlaying && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Apagado: {formatTimeLeft(timeLeft)}
                                </div>
                            )}
                        </div>
                        {currentStation.tags && (
                            <div className="flex gap-2 justify-center mt-3 flex-wrap">
                                {currentStation.tags.split(',').slice(0, 3).map((tag, i) => (
                                    <span
                                        key={i}
                                        className="text-xs px-3 py-1 rounded-full border transition-colors duration-500"
                                        style={{
                                            backgroundColor: 'rgba(var(--primary-dynamic-rgb), 0.1)',
                                            borderColor: 'var(--primary-dynamic)',
                                            color: 'var(--primary-dynamic)'
                                        }}
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Alternative Sources */}
                    {relatedStations && relatedStations.length > 0 && (
                        <div className="mb-8 w-full max-w-sm">
                            <div className="text-xs text-[var(--text-muted)] text-center mb-2">Canales Disponibles</div>
                            <button
                                onClick={() => station && playStation(station)}
                                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${currentStation.stationuuid === station?.stationuuid
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'glass hover:bg-white/10'
                                    }`}
                            >
                                Principal {station?.bitrate ? `(${station.bitrate}k)` : ''}
                            </button>
                            {relatedStations.map((s) => (
                                <button
                                    key={s.stationuuid}
                                    onClick={() => playStation(s)}
                                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all duration-500 ${currentStation.stationuuid === s.stationuuid
                                        ? 'text-white'
                                        : 'glass hover:bg-white/10'
                                        }`}
                                    style={{
                                        backgroundColor: currentStation.stationuuid === s.stationuuid ? 'var(--primary-dynamic)' : ''
                                    }}
                                >
                                    Canal {s.bitrate ? `${s.bitrate}k` : ''}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-10 mb-8">
                        <button className="p-3 rounded-full text-white/20 hover:text-white/40 transition-colors btn-premium">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                            </svg>
                        </button>

                        <button
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="relative w-24 h-24 rounded-full text-white shadow-2xl transition-all duration-500 flex items-center justify-center btn-premium group"
                        >
                            {/* Inner Glow */}
                            <div
                                className={`absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity ${isPlaying ? 'animate-pulse' : ''}`}
                                style={{ backgroundColor: 'var(--primary-dynamic)' }}
                            />

                            <div
                                className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden border border-white/20 shadow-inner"
                                style={{ backgroundColor: 'var(--primary-dynamic)' }}
                            >
                                {isLoading ? (
                                    <svg className="w-12 h-12 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : isPlaying ? (
                                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-12 h-12 translate-x-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </div>
                        </button>

                        <button className="p-3 rounded-full text-white/20 hover:text-white/40 transition-colors btn-premium">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Volume control */}
                    <div className="flex items-center gap-4 w-full max-w-xs">
                        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                        </svg>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="flex-1 h-2 rounded-full appearance-none bg-[var(--border)] cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                            style={{
                                accentColor: 'var(--primary-dynamic)',
                            }}
                        />
                        <svg className="w-5 h-5 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                    </div>
                </main>

                {/* Info footer */}
                <footer className="glass-dark border-t border-white/5 p-4 mb-20">
                    <div className="max-w-md mx-auto flex items-center justify-between text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {currentStation.votes}
                            </span>
                        </div>
                        {currentStation.homepage && (
                            <a
                                href={currentStation.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-[var(--primary)] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Sitio Web
                            </a>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
}
