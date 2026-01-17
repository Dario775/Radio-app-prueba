'use client';

import { useAudio } from '@/context/AudioContext';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import CastButton from './CastButton';

export default function MiniPlayer() {
    const { currentStation, isPlaying, togglePlay, isLoading, dominantColor } = useAudio();
    const pathname = usePathname();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show only if a station is playing/loaded
        // AND we are not on the full-screen player view
        setIsVisible(pathname !== '/');
    }, [pathname, currentStation]);

    if (!currentStation || !isVisible) return null;

    return (
        <div
            className="fixed bottom-[80px] left-4 right-4 z-40 animate-slide-up"
            onClick={() => router.push('/')}
        >
            <div className="glass-dark border border-white/10 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-2xl cursor-pointer hover:bg-white/5 transition-all">
                {/* Station Icon */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                    <img
                        src={currentStation.favicon || '/favicon.ico'}
                        alt={currentStation.name}
                        className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : ''}`}
                    />
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{currentStation.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">
                        {isPlaying ? 'Reproduciendo' : 'Pausado'} • {currentStation.country || 'En vivo'}
                    </p>
                </div>

                {/* Controls */}
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                    <CastButton />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePlay();
                        }}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-[var(--primary-dynamic)] text-white shadow-lg active:scale-95"
                        style={{ backgroundColor: 'var(--primary-dynamic)' }}
                    >
                        {isPlaying ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
