'use client';

import React, { useRef, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';

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

interface GenreSelectorProps {
    activeGenre: string;
    onGenreChange: (id: string) => void;
}

export default function GenreSelector({ activeGenre, onGenreChange }: GenreSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { dominantColor } = useAudio();

    // Scroll active item into view
    useEffect(() => {
        const activeItem = scrollRef.current?.querySelector(`[data-id="${activeGenre}"]`);
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeGenre]);

    return (
        <div className="relative w-full overflow-hidden">
            <div
                ref={scrollRef}
                className="flex gap-2.5 overflow-x-auto px-6 py-2 no-scrollbar snap-x snap-mandatory"
            >
                {genres.map((genre) => {
                    const isActive = activeGenre === genre.id;
                    const themeColor = genre.id === 'all' ? dominantColor : genre.color;

                    return (
                        <button
                            key={genre.id}
                            data-id={genre.id}
                            onClick={() => onGenreChange(genre.id)}
                            className="relative flex-shrink-0 snap-center"
                        >
                            <div
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${isActive
                                    ? 'bg-white text-black border-white shadow-lg'
                                    : 'bg-white/[0.04] text-white/50 border-white/5 hover:bg-white/[0.08]'
                                    }`}
                            >
                                <svg
                                    className="w-4 h-4 transition-colors"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    style={{ color: isActive ? themeColor : 'inherit' }}
                                >
                                    <path d={genre.icon} />
                                </svg>

                                <span className="text-[14px] font-bold tracking-tight whitespace-nowrap">
                                    {genre.label}
                                </span>

                                {isActive && (
                                    <div
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full blur-[1px]"
                                        style={{ backgroundColor: themeColor }}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
