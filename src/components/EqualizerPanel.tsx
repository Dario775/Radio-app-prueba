'use client';

import React from 'react';
import { useAudio } from '@/context/AudioContext';

interface EqualizerPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRESETS = [
    { name: 'Plano', gains: [0, 0, 0, 0, 0] },
    { name: 'Pop', gains: [2, 1, 3, 4, 3] },
    { name: 'Rock', gains: [5, 3, -1, 3, 5] },
    { name: 'Jazz', gains: [3, 2, 1, 3, 2] },
    { name: 'Bajos', gains: [8, 4, 0, 0, 0] },
    { name: 'Voz', gains: [-2, 0, 4, 2, -1] }
];

const BANDS = [
    { label: '60Hz', sub: 'Bajos' },
    { label: '230Hz', sub: 'Med-Baj' },
    { label: '910Hz', sub: 'Medios' },
    { label: '3.6k', sub: 'Med-Alt' },
    { label: '14k', sub: 'Agudos' }
];

export default function EqualizerPanel({ isOpen, onClose }: EqualizerPanelProps) {
    const { eqGains, setEqGain } = useAudio();

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const applyPreset = (gains: number[]) => {
        gains.forEach((gain, i) => setEqGain(i, gain));
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4 touch-none">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg glass-dark border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-panel-up">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Equalizer Pro</h2>
                        <p className="text-xs text-[var(--primary-dynamic)] font-bold uppercase tracking-widest opacity-80">Ajuste de Precisión</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* EQ Sliders - Re-engineered for reliability */}
                <div className="flex justify-between items-stretch h-64 mb-10 px-2 gap-4">
                    {BANDS.map((band, i) => (
                        <div key={band.label} className="flex-1 flex flex-col items-center group">
                            <div className="text-[10px] font-mono mb-2 text-[var(--primary-dynamic)] font-black">
                                {eqGains[i] > 0 ? `+${eqGains[i].toFixed(1)}` : eqGains[i].toFixed(1)}
                            </div>

                            <div className="relative flex-1 w-full bg-white/5 rounded-2xl flex flex-col items-center py-4">
                                {/* Visual Track */}
                                <div className="absolute inset-y-6 w-1 bg-white/10 rounded-full" />

                                {/* Fill Track */}
                                <div
                                    className="absolute bottom-6 w-1 bg-gradient-to-t from-[var(--primary-dynamic)] to-cyan-400 rounded-full shadow-[0_0_15px_rgba(var(--primary-dynamic-rgb),0.3)]"
                                    style={{
                                        height: `${((eqGains[i] + 20) / 40) * 100}%`,
                                        maxHeight: 'calc(100% - 3rem)'
                                    }}
                                />

                                {/* THE INPUT - Standard horizontal rotated for cross-browser stability */}
                                <input
                                    type="range"
                                    min="-20"
                                    max="20"
                                    step="0.1"
                                    value={eqGains[i]}
                                    onInput={(e) => setEqGain(i, parseFloat(e.currentTarget.value))}
                                    className="absolute inset-0 w-[200px] h-full cursor-pointer z-10 opacity-0 -rotate-90 origin-center touch-none"
                                />

                                {/* Handle Visual */}
                                <div
                                    className="absolute w-5 h-5 bg-white rounded-full shadow-xl border-2 border-[var(--primary-dynamic)] pointer-events-none z-20"
                                    style={{
                                        bottom: `calc(${((eqGains[i] + 20) / 40) * 100}% + 1.2rem)`,
                                        transform: 'translateY(50%)'
                                    }}
                                />
                            </div>

                            <div className="mt-3 flex flex-col items-center">
                                <span className="text-[10px] font-bold text-white/80">{band.label}</span>
                                <span className="text-[8px] text-white/30 uppercase font-black tracking-tighter">{band.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Presets */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 ml-1">
                        <div className="w-1 h-3 bg-[var(--primary-dynamic)] rounded-full" />
                        <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Presets</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {PRESETS.map((preset) => {
                            const isActive = JSON.stringify(preset.gains) === JSON.stringify(eqGains);
                            return (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset.gains)}
                                    className={`py-3 px-2 rounded-2xl text-[10px] font-black transition-all border-2 ${isActive
                                        ? 'bg-[var(--primary-dynamic)] text-white border-[var(--primary-dynamic)] shadow-xl shadow-[var(--primary-dynamic)]/20 scale-[1.05]'
                                        : 'bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white'
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
                        className="w-full py-4 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                    >
                        Confirmar Ajustes
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes panel-up {
                    from { transform: translateY(100%) scale(0.95); opacity: 0; }
                    to { transform: translateY(0) scale(1); opacity: 1; }
                }
                .animate-panel-up {
                    animation: panel-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
