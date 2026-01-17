'use client';

import React, { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import Visualizer from '@/components/Visualizer';

interface CarModeProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CarMode({ isOpen, onClose }: CarModeProps) {
    const { currentStation, isPlaying, togglePlay, volume, setVolume, audioRef, isLoading } = useAudio();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!isOpen || !currentStation) return null;

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col p-6 animate-fade-in select-none touch-none">
            {/* Header: Clock and Station */}
            <div className="flex justify-between items-start mb-12">
                <div className="flex flex-col">
                    <span className="text-6xl font-black text-white tracking-tighter">{timeString}</span>
                    <button
                        onClick={onClose}
                        className="mt-4 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 text-white/50 font-bold uppercase tracking-widest text-xs active:scale-95 transition-all w-fit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Salir
                    </button>
                </div>

                <div className="text-right flex flex-col items-end">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 mb-3">
                        <img
                            src={currentStation.favicon || '/favicon.ico'}
                            alt={currentStation.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-[var(--primary-dynamic)] font-black uppercase tracking-widest text-[10px]">Reproduciendo</span>
                    <h2 className="text-2xl font-bold text-white line-clamp-1 max-w-[200px]">{currentStation.name}</h2>
                </div>
            </div>

            {/* Main Center: Big Play/Pause */}
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="mb-12 w-full h-32 flex items-center justify-center">
                    <Visualizer isPlaying={isPlaying} audioRef={audioRef} color="var(--primary-dynamic)" height={120} />
                </div>

                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={`w-64 h-64 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-2xl relative group ${isPlaying ? 'bg-white/5 border-4 border-white/20' : 'bg-[var(--primary-dynamic)]'}`}
                >
                    {isLoading ? (
                        <div className="w-20 h-20 border-8 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : isPlaying ? (
                        <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                    ) : (
                        <svg className="w-32 h-32 text-white translate-x-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    )}

                    {/* Pulsing Aura in Play Mode */}
                    {isPlaying && (
                        <div className="absolute -inset-8 rounded-full bg-[var(--primary-dynamic)] opacity-10 animate-ping pointer-events-none" />
                    )}
                </button>
            </div>

            {/* Bottom: Giant Volume Slider */}
            <div className="mt-auto pt-10 pb-6 space-y-6">
                <div className="flex items-center gap-6">
                    <svg className="w-10 h-10 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3z" />
                    </svg>
                    <div className="flex-1 h-12 bg-white/5 rounded-3xl relative overflow-hidden ring-4 ring-white/5">
                        <div
                            className="absolute inset-y-0 left-0 bg-white transition-all duration-200"
                            style={{ width: `${volume * 100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className={`text-xl font-black mix-blend-difference ${volume > 0.5 ? 'text-black' : 'text-white'}`}>
                                VOLUMEN: {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </div>
                    <svg className="w-10 h-10 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                </div>

                <p className="text-center text-white/20 text-xs font-black uppercase tracking-[0.5em]">Modo Conducción Activo</p>
            </div>

            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
