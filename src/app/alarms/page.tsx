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

    React.useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const allStations = [...favorites, ...customRadios];

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStation) return;

        if (editingAlarm) {
            updateAlarm(editingAlarm.id, {
                time,
                days: selectedDays,
                station: selectedStation
            });
        } else {
            addAlarm(time, selectedDays, selectedStation);
        }

        setIsAdding(false);
        setEditingAlarm(null);
        // Reset
        setSelectedStation(null);
    };

    const startEditing = (alarm: any) => {
        setEditingAlarm(alarm);
        setTime(alarm.time);
        setSelectedDays(alarm.days);
        setSelectedStation(alarm.station);
        setIsAdding(true);
    };

    const openCreate = () => {
        setEditingAlarm(null);
        setTime('07:00');
        setSelectedDays([1, 2, 3, 4, 5]);
        setSelectedStation(allStations[0] || null);
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
                        <p className="text-[var(--text-muted)] mt-1">Despierta con tu emisora favorita</p>
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
                                        <div className="flex gap-1">
                                            {DAYS.map((day, i) => (
                                                <span
                                                    key={day}
                                                    className={`text-[10px] uppercase font-bold ${alarm.days.includes(i) ? 'text-[var(--primary-dynamic)]' : 'text-[var(--text-muted)] opacity-30'}`}
                                                >
                                                    {day[0]}
                                                </span>
                                            ))}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
                    <div className="relative bg-[var(--surface)] w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
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
            )}
        </div>
    );
}
