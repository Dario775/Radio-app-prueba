'use client';

import { useState, useEffect } from 'react';
import type { RadioAlarm, RadioStation } from '@/types/radio';

export function useAlarms() {
    const [alarms, setAlarms] = useState<RadioAlarm[]>(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('radio_alarms');
        return stored ? JSON.parse(stored) : [];
    });

    const saveAlarms = (newAlarms: RadioAlarm[]) => {
        setAlarms(newAlarms);
        localStorage.setItem('radio_alarms', JSON.stringify(newAlarms));
    };

    const addAlarm = (time: string, days: number[], station: RadioStation, smart: boolean = false, newsSource?: 'bbc' | 'clarin' | 'lanacion' | 'infobae') => {
        const newAlarm: RadioAlarm = {
            id: Math.random().toString(36).substr(2, 9),
            time,
            days,
            enabled: true,
            smart,
            newsSource: newsSource || 'bbc',
            station
        };
        saveAlarms([...alarms, newAlarm]);
    };

    const removeAlarm = (id: string) => {
        saveAlarms(alarms.filter(a => a.id !== id));
    };

    const toggleAlarm = (id: string) => {
        saveAlarms(alarms.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        ));
    };

    const updateAlarm = (id: string, updates: Partial<RadioAlarm>) => {
        saveAlarms(alarms.map(a =>
            a.id === id ? { ...a, ...updates } : a
        ));
    };

    return {
        alarms,
        addAlarm,
        removeAlarm,
        toggleAlarm,
        updateAlarm
    };
}
