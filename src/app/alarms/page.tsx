'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAlarms } from '@/hooks/useAlarms';
import { useFavorites } from '@/hooks/useFavorites';
import type { RadioStation } from '@/types/radio';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function AlarmsPage() {
    const { alarms, addAlarm, removeAlarm, toggleAlarm, updateAlarm } = useAlarms();
    const { favorites, customRadios } = useFavorites();
    const [isAdding, setIsAdding] = useState(false);
    const [editingAlarm, setEditingAlarm] = useState<any>(null);

    // Form state
    const [time, setTime] = useState('07:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
    const [smart, setSmart] = useState(false);
    const [newsSource, setNewsSource] = useState<'bbc' | 'clarin' | 'lanacion' | 'infobae'>('bbc');
    const [alarmSound, setAlarmSound] = useState(true);
    const [reminderMessage, setReminderMessage] = useState('');

    React.useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const allStations = [...favorites, ...customRadios];

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStation) return;

        const alarmData = {
            time,
            days: selectedDays,
            station: selectedStation,
            smart,
            newsSource,
            alarmSound,
            reminderMessage: reminderMessage.trim() || undefined
        };

        if (editingAlarm) {
            updateAlarm(editingAlarm.id, alarmData);
        } else {
            addAlarm(time, selectedDays, selectedStation, smart, newsSource, alarmSound, reminderMessage.trim() || undefined);
        }

        setIsAdding(false);
        setEditingAlarm(null);
        setSelectedStation(null);
        setReminderMessage('');
    };

    const startEditing = (alarm: any) => {
        setEditingAlarm(alarm);
        setTime(alarm.time);
        setSelectedDays(alarm.days);
        setSelectedStation(alarm.station);
        setSmart(!!alarm.smart);
        setNewsSource(alarm.newsSource || 'bbc');
        setAlarmSound(alarm.alarmSound !== false);
        setReminderMessage(alarm.reminderMessage || '');
        setIsAdding(true);
    };

    const openCreate = () => {
        setEditingAlarm(null);
        setTime('07:00');
        setSelectedDays([1, 2, 3, 4, 5]);
        setSelectedStation(allStations[0] || null);
        setSmart(false);
        setAlarmSound(true);
        setReminderMessage('');
        setNewsSource('bbc');
        setIsAdding(true);
    };

    const toggleDay = (index: number) => {
        setSelectedDays(prev =>
            prev.includes(index)
                ? prev.filter(d => d !== index)
                : [...prev, index].sort()
        );
    };

    return (
<div className="min-h-screen bg-[var(--background)] pb-32">
            <header className="p-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">Alarmas de Radio</h1>
                        <p className="text-[var(--text-muted)] mt-1">Despierta con tu operadora favorita</p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-green-500">Monitoreando alarmas</span>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary-dynamic)] text-white font-medium shadow-lg hover:scale-105 transition-transform active:scale-95"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Nueva Alarma
                    </button>
                </div>
            </header>

            {/* Warning about mobile usage */}
            {alarms.length > 0 && (
                <div className="max-w-4xl mx-auto px-6 mb-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-sm font-bold text-amber-500">Importante para móviles</p>
                                <p className="text-xs text-amber-400/80 mt-1">Mantén la app abierta o en segundo plano (no la cierres completamente) para que la alarma funcione.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-6">
                {/* Alarms List */}
                <div className="space-y-4">
                    {alarms.length === 0 ? (
                        <div className="bg-[var(--surface)] rounded-3xl p-12 text-center border border-[var(--border)] border-dashed">
                            <div className="w-16 h-16 bg-[var(--primary-dynamic)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-[var(--primary-dynamic)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Sin alarmas configuradas</h3>
                            <p className="text-[var(--text-muted)] mb-6">Aún no has programado ninguna alarma de radio.</p>
                            <button
                                onClick={openCreate}
                                className="text-[var(--primary-dynamic)] font-bold hover:underline"
                            >
                                Crea tu primera alarma
                            </button>
                        </div>
                    ) : (
                        alarms.map(alarm => (
                            <div key={alarm.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between group hover:border-[var(--primary-dynamic)] transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="text-4xl font-bold tabular-nums">
                                        {alarm.time}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <img
                                                src={alarm.station.favicon || '/favicon.ico'}
                                                className="w-4 h-4 rounded-full object-cover"
                                                alt=""
                                            />
                                            <span className="font-semibold truncate max-w-[150px]">{alarm.station.name}</span>
                                        </div>
                                        <div className="flex gap-1 items-center flex-wrap">
                                            {DAYS.map((day, i) => (
                                                <span
                                                    key={day}
                                                    className={`text-[10px] uppercase font-bold ${alarm.days.includes(i) ? 'text-[var(--primary-dynamic)]' : 'text-[var(--text-muted)] opacity-30'}`}
                                                >
                                                    {day[0]}
                                                </span>
                                            ))}
                                            {alarm.smart && (
                                                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-500/30">IA</span>
                                            )}
                                            {alarm.smart && alarm.newsSource && (
                                                <span className="ml-1 text-[8px] text-purple-400/60 uppercase">
                                                    {alarm.newsSource === 'bbc' ? 'BBC' : alarm.newsSource === 'clarin' ? 'Clarin' : alarm.newsSource === 'lanacion' ? 'LN' : 'IB'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => startEditing(alarm)}
                                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary-dynamic)] hover:bg-[var(--primary-dynamic)]/10 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => toggleAlarm(alarm.id)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${alarm.enabled ? 'bg-[var(--primary-dynamic)]' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${alarm.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                    <button
                                        onClick={() => removeAlarm(alarm.id)}
                                        className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add Alarm Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
                    <div className="relative bg-[var(--surface)] w-full max-w-md max-h-[90vh] rounded-3xl border border-white/10 shadow-2xl animate-fade-in overflow-hidden flex flex-col">
                        <div className="p-6 overflow-y-auto flex-1">
                        <h2 className="text-2xl font-bold mb-6">{editingAlarm ? 'Editar Alarma' : 'Nueva Alarma'}</h2>
                        <form onSubmit={handleAdd} className="space-y-6">
                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-2 uppercase font-bold tracking-wider">Hora</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-3xl font-bold text-center focus:outline-none focus:border-[var(--primary-dynamic)] transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-3 uppercase font-bold tracking-wider">Repetir días</label>
                                <div className="flex justify-between">
                                    {DAYS.map((day, i) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(i)}
                                            className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${selectedDays.includes(i) ? 'bg-[var(--primary-dynamic)] text-white shadow-lg' : 'bg-white/5 text-[var(--text-muted)]'}`}
                                        >
                                            {day[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--text-muted)] mb-3 uppercase font-bold tracking-wider">Emisora de Radio</label>
                                {allStations.length === 0 ? (
                                    <p className="text-xs text-orange-400 p-3 bg-orange-400/10 rounded-lg">¡Necesitas añadir algunas emisoras a favoritas primero!</p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {allStations.map(station => (
                                            <button
                                                key={station.stationuuid}
                                                type="button"
                                                onClick={() => setSelectedStation(station)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${selectedStation?.stationuuid === station.stationuuid ? 'border-[var(--primary-dynamic)] bg-[var(--primary-dynamic)]/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                                            >
                                                <img src={station.favicon || '/favicon.ico'} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                                <span className="text-sm font-medium truncate">{station.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-4 bg-purple-500/5 rounded-2xl border border-purple-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Despertar Inteligente</p>
                                        <p className="text-[10px] text-purple-400/70">IA leerá clima y noticias antes de la radio</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSmart(!smart)}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${smart ? 'bg-purple-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${smart ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {smart && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="block text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Fuente de Noticias</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'bbc', name: 'BBC Mundo' },
                                            { id: 'clarin', name: 'Clarín' },
                                            { id: 'lanacion', name: 'La Nación' },
                                            { id: 'infobae', name: 'Infobae' }
                                        ].map((src) => (
                                            <button
                                                key={src.id}
                                                type="button"
                                                onClick={() => setNewsSource(src.id as any)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${newsSource === src.id ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-[var(--text-muted)] border-transparent hover:bg-white/10'}`}
                                            >
                                                {src.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sonido de Alarma */}
                            <div className="flex items-center justify-between p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Pitido de Alarma</p>
                                        <p className="text-[10px] text-orange-400/70">Sonido antes de reproducir</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAlarmSound(!alarmSound)}
                                    className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${alarmSound ? 'bg-orange-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${alarmSound ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {/* Recordatorio Personalizado */}
                            <div className="space-y-2">
                                <label className="block text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Mensaje de Recordatorio</label>
                                <input
                                    type="text"
                                    value={reminderMessage}
                                    onChange={(e) => setReminderMessage(e.target.value)}
                                    placeholder="Ej: No olvides la reunión a las 9"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-[var(--primary-dynamic)] transition-colors placeholder:text-gray-600"
                                />
                                <p className="text-[10px] text-gray-500">El asistente de voz leerá este mensaje antes de la radio</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-6 py-3 rounded-xl glass hover:bg-white/10 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={!selectedStation}
                                    className="flex-1 px-6 py-3 rounded-xl bg-[var(--primary-dynamic)] text-white font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
                                >
                                    {editingAlarm ? 'Guardar Cambios' : 'Guardar Alarma'}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
)}

            <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10 safe-area-pb">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex items-center justify-around py-2">
                        <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span className="text-[10px] font-medium">Reproductor</span>
                        </Link>

                        <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-[10px] font-medium">Explorar</span>
                        </Link>

                        <Link href="/favorites" className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-[10px] font-medium">Librería</span>
                        </Link>

                        <Link href="/alarms" className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--primary)] bg-[var(--primary)]/10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span className="text-[10px] font-medium">Alarmas</span>
                        </Link>

                        <Link href="/audio-preferences" className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[var(--text-muted)] hover:text-[var(--foreground)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-[10px] font-medium">Ajustes</span>
                        </Link>
                    </div>
                </div>
            </nav>
        </div>
    );
}
