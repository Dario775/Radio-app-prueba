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

const BANDS = ['60Hz', '230Hz', '910Hz', '3.6k', '14k'];

export default function EqualizerPanel({ isOpen, onClose }: EqualizerPanelProps) {
    const { eqGains, setEqGain } = useAudio();

    if (!isOpen) return null;

    const applyPreset = (gains: number[]) => {
        gains.forEach((gain, i) => setEqGain(i, gain));
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md glass-dark border border-white/10 rounded-3xl p-6 shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white">Ecualizador Pro</h2>
                        <p className="text-xs text-[var(--primary-dynamic)] font-medium uppercase tracking-widest opacity-80">Sonido Premium</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* EQ Sliders */}
                <div className="flex justify-between items-end h-48 mb-8 px-2">
                    {BANDS.map((label, i) => (
                        <div key={label} className="flex flex-col items-center h-full group">
                            <div className="relative flex-1 w-1.5 bg-white/5 rounded-full mb-3 flex flex-col justify-end overflow-hidden">
                                {/* Track Highlight */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--primary-dynamic)] to-cyan-400 rounded-full transition-all duration-300"
                                    style={{ height: `${((eqGains[i] + 12) / 24) * 100}%` }}
                                />
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    step="1"
                                    value={eqGains[i]}
                                    onChange={(e) => setEqGain(i, parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [writing-mode:bt-lr] appearance-slider-vertical"
                                />
                            </div>
                            <span className="text-[10px] font-bold text-white/40 group-hover:text-[var(--primary-dynamic)] transition-colors">{label}</span>
                            <span className="text-[10px] font-mono mt-1 text-[var(--primary-dynamic)]">{eqGains[i] > 0 ? `+${eqGains[i]}` : eqGains[i]}dB</span>
                        </div>
                    ))}
                </div>

                {/* Presets */}
                <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-1">Presets</p>
                    <div className="grid grid-cols-3 gap-2">
                        {PRESETS.map((preset) => {
                            const isActive = JSON.stringify(preset.gains) === JSON.stringify(eqGains);
                            return (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset.gains)}
                                    className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${isActive
                                            ? 'bg-[var(--primary-dynamic)] text-white border-[var(--primary-dynamic)] shadow-lg shadow-[var(--primary-dynamic)]/20'
                                            : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {preset.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl bg-white text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Listo
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .appearance-slider-vertical {
                    appearance: none;
                    background: transparent;
                }
            `}</style>
        </div>
    );
}
