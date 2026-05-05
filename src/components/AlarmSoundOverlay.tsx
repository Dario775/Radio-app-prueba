'use client';

import { useAudio } from '@/context/AudioContext';

export default function AlarmSoundOverlay() {
    const { isAlarmSoundPlaying, stopAlarmSound } = useAudio();

    if (!isAlarmSoundPlaying) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 animate-fade-in">
            <div className="text-center p-8">
                <div className="mb-8">
                    <div className="w-24 h-24 mx-auto rounded-full bg-orange-500/20 flex items-center justify-center animate-pulse">
                        <svg className="w-12 h-12 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-6">¡Alarma!</h2>
                    <p className="text-orange-400 mt-2">Tocá para silenciar</p>
                </div>
                
                <button
                    onClick={stopAlarmSound}
                    className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xl shadow-lg active:scale-95 transition-all"
                >
                    Silenciar Tono 🔔
                </button>
                
                <p className="text-gray-500 text-sm mt-6">
                    Después del tono, escucharás las noticias y tu radio
                </p>
            </div>
        </div>
    );
}