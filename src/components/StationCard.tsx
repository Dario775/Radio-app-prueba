'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import { useAudio } from '@/context/AudioContext';
import type { RadioStation } from '@/types/radio';

interface StationCardProps {
    station: RadioStation;
}

export default function StationCard({ station }: StationCardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [imageError, setImageError] = useState(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const { currentStation, isPlaying, isLoading, playStation } = useAudio();

    const isCurrent = currentStation?.stationuuid === station.stationuuid;

    const defaultImage = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect fill="#1a1a2e" width="100" height="100"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#00bdc7" stroke-width="2"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#00bdc7" stroke-width="2" opacity="0.6"/>
      <circle cx="50" cy="50" r="10" fill="#00bdc7"/>
    </svg>
  `);

    return (
        <div
            onClick={() => {
                playStation(station);
                if (pathname !== '/') {
                    router.push('/');
                }
            }}
            className={`group relative bg-[var(--surface)] rounded-2xl overflow-hidden card-hover border transition-all duration-300 cursor-pointer ${isCurrent ? 'border-[var(--primary)] shadow-[0_0_15px_rgba(0,189,199,0.1)]' : 'border-[var(--border)] hover:border-[var(--primary)]'
                }`}
        >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/0 to-[var(--primary)]/0 group-hover:from-[var(--primary)]/5 group-hover:to-[var(--primary)]/10 transition-all duration-300" />

            <div className="relative p-4 flex items-center gap-4">
                {/* Station Image */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex-shrink-0">
                    <img
                        src={imageError ? defaultImage : (station.favicon || defaultImage)}
                        alt={station.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                    {/* Play overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isCurrent ? 'bg-[var(--primary)]/20 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'
                        }`}>
                        {isCurrent && isLoading ? (
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : isCurrent && isPlaying ? (
                            <div className="flex items-end gap-1 h-5">
                                <div className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1 bg-white rounded-full animate-bounce" />
                            </div>
                        ) : (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Station Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                        {station.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-[var(--text-muted)] truncate">
                            {station.state ? `${station.state.split(',')[0]}, ` : ''}{station.country || 'Unknown'}
                        </span>
                        {station.bitrate > 0 && (
                            <>
                                <span className="text-[var(--text-muted)]">•</span>
                                <span className="text-xs text-[var(--text-muted)]">
                                    {station.bitrate}k {station.codec}
                                </span>
                            </>
                        )}
                    </div>
                    {station.tags && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                            {station.tags.split(',').slice(0, 2).map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                                >
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col items-end gap-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(station);
                        }}
                        className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${isFavorite(station.stationuuid) ? 'text-red-500 bg-red-500/5' : 'text-[var(--text-muted)] hover:bg-white/5'}`}
                    >
                        <svg className="w-5 h-5" fill={isFavorite(station.stationuuid) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    <div className="hidden sm:flex flex-col items-end gap-1 opacity-60">
                        <div className="flex items-center gap-1 text-[var(--text-muted)]">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="text-[10px]">{station.votes}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
