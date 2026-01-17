'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';

interface EqualizerPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESETS = [
    { name: 'Plano', gains: [0, 0, 0, 0, 0] },
    { name: 'Pop', gains: [4, 2, 6, 8, 6] },
    { name: 'Rock', gains: [10, 6, -2, 6, 10] },
    { name: 'Jazz', gains: [6, 4, 2, 6, 4] },
    { name: 'Bajos', gains: [12, 8, 0, 0, 0] },
    { name: 'Voz', gains: [-4, 0, 8, 4, -2] }
];

const BANDS = [
    { label: '60Hz', sub: 'Bajos' },
    { label: '230Hz', sub: 'Med-Baj' },
    { label: '910Hz', sub: 'Medios' },
    { label: '3.6k', sub: 'Med-Alt' },
    { label: '14k', sub: 'Agudos' }
];

export default function EqualizerPanel({ isOpen, onClose }: EqualizerPanelProps) {
    const { eqGains, setEqGain, setMultipleEqGains } = useAudio();
    const [activeBand, setActiveBand] = useState<number | null>(null);
    const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (activeBand === null) return;

        const container = containerRefs.current[activeBand];
        if (!container) return;

        const rect = container.getBoundingClientRect();
        // Calculate gain based on vertical position within the container
        // -20dB at the bottom, +20dB at the top
        const padding = 24; // top/bottom padding in pixels
        const height = rect.height - (padding * 2);
        const y = e.clientY - rect.top - padding;

        let percentage = 1 - (y / height);
        percentage = Math.max(0, Math.min(1, percentage));

        const gain = (percentage * 40) - 20;
        setEqGain(activeBand, parseFloat(gain.toFixed(1)));
    }, [activeBand, setEqGain]);

    const handlePointerUp = useCallback(() => {
        setActiveBand(null);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    }, [handlePointerMove]);

    const handlePointerDown = (index: number, e: React.PointerEvent) => {
        setActiveBand(index);
        // Immediate update on click
        const container = containerRefs.current[index];
        if (container) {
            const rect = container.getBoundingClientRect();
            const padding = 24;
            const height = rect.height - (padding * 2);
            const y = e.clientY - rect.top - padding;
            let percentage = 1 - (y / height);
            percentage = Math.max(0, Math.min(1, percentage));
            const gain = (percentage * 40) - 20;
            setEqGain(index, parseFloat(gain.toFixed(1)));
        }

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-4 touch-none select-none">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-xl glass-dark border border-white/10 rounded-[3rem] p-8 sm:p-10 shadow-2xl animate-panel-up">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Equalizer Pro</h2>
                        <p className="text-[10px] text-[var(--primary-dynamic)] font-black uppercase tracking-[0.3em] opacity-80">Ingeniería Acústica</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* EQ Sliders - COMPLETELY REDESIGNED FOR SMOOTH VERTICAL DRAGGING */}
                <div className="flex justify-between items-stretch h-72 mb-12 px-2 gap-3 sm:gap-6">
                    {BANDS.map((band, i) => (
                        <div key={band.label} className="flex-1 flex flex-col items-center group">
                            {/* DB Value Display */}
                            <div className="text-[10px] font-mono mb-3 text-[var(--primary-dynamic)] font-black bg-[var(--primary-dynamic)]/10 px-2 py-0.5 rounded-md">
                                {eqGains[i] > 0 ? `+${eqGains[i].toFixed(1)}` : eqGains[i].toFixed(1)}
                            </div>

                            {/* CUSTOM VERTICAL SLIDER CONTAINER */}
                            <div
                                ref={el => { containerRefs.current[i] = el; }}
                                onPointerDown={(e) => handlePointerDown(i, e)}
                                className="relative flex-1 w-full bg-white/5 rounded-3xl flex flex-col items-center py-6 cursor-ns-resize overflow-hidden active:bg-white/10 transition-colors"
                            >
                                {/* Center Track Background */}
                                <div className="absolute inset-y-6 w-1.5 bg-white/10 rounded-full" />

                                {/* 0dB Grid Line */}
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 pointer-events-none" />

                                {/* Fill Track - Dynamic Height */}
                                <div
                                    className="absolute bottom-6 w-1.5 bg-gradient-to-t from-[var(--primary-dynamic)] to-cyan-400 rounded-full shadow-[0_0_20px_rgba(var(--primary-dynamic-rgb),0.4)]"
                                    style={{
                                        height: `${((eqGains[i] + 20) / 40) * 100}%`,
                                        maxHeight: 'calc(100% - 3rem)'
                                    }}
                                />

                                {/* Handle Visual - Precise Positioning */}
                                <div
                                    className={`absolute w-7 h-7 bg-white rounded-full shadow-2xl border-2 border-[var(--primary-dynamic)] pointer-events-none z-20 transition-transform ${activeBand === i ? 'scale-125' : 'scale-100'}`}
                                    style={{
                                        bottom: `calc(${((eqGains[i] + 20) / 40) * 100}% + 1.5rem)`,
                                        transform: 'translateY(50%)'
                                    }}
                                >
                                    <div className="absolute inset-1 rounded-full bg-[var(--primary-dynamic)] opacity-10 animate-pulse" />
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col items-center">
                                <span className="text-[10px] font-black text-white/90">{band.label}</span>
                                <span className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-0.5">{band.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Presets - NOW WORKING WITH MULTIPLE UPDATES */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 ml-1">
                        <div className="w-1.5 h-4 bg-[var(--primary-dynamic)] rounded-full shadow-[0_0_10px_var(--primary-dynamic)]" />
                        <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40 italic">Presets Maestros</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {PRESETS.map((preset) => {
                            const isCurrent = JSON.stringify(preset.gains) === JSON.stringify(eqGains.map(g => Math.round(g)));
                            return (
                                <button
                                    key={preset.name}
                                    onClick={() => setMultipleEqGains(preset.gains)}
                                    className={`py-4 px-2 rounded-2xl text-[10px] font-black transition-all border-2 active:scale-95 ${isCurrent
                                            ? 'bg-[var(--primary-dynamic)] text-white border-[var(--primary-dynamic)] shadow-xl shadow-[var(--primary-dynamic)]/30 scale-[1.02]'
                                            : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white hover:border-white/5'
                                        }`}
                                >
                                    {preset.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-10">
                    <button
                        onClick={onClose}
                        className="w-full py-5 rounded-[2rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-white/10"
                    >
                        Finalizar Ajuste
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes panel-up {
                    from { transform: translateY(100%) scale(0.9); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-panel-up {
                    animation: panel-up 0.6s cubic-bezier(0.2, 1, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
}
