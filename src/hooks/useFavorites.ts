'use client';

import { useState, useEffect, useCallback } from 'react';
import { RadioStation } from '@/types/radio';

export function useFavorites() {
    const [favorites, setFavorites] = useState<RadioStation[]>([]);
    const [customRadios, setCustomRadios] = useState<RadioStation[]>([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState<RadioStation[]>([]);
    const [playCounts, setPlayCounts] = useState<Record<string, number>>({});

    // Initialize from localStorage
    useEffect(() => {
        const storedFavs = localStorage.getItem('radio_favorites');
        const storedCustom = localStorage.getItem('radio_custom');
        const storedRecent = localStorage.getItem('radio_recent');
        const storedCounts = localStorage.getItem('radio_play_counts');

        if (storedFavs) {
            try {
                setFavorites(JSON.parse(storedFavs));
            } catch (e) {
                console.error('Failed to parse favorites', e);
            }
        }

        if (storedCustom) {
            try {
                setCustomRadios(JSON.parse(storedCustom));
            } catch (e) {
                console.error('Failed to parse custom radios', e);
            }
        }

        if (storedRecent) {
            try {
                setRecentlyPlayed(JSON.parse(storedRecent));
            } catch (e) {
                console.error('Failed to parse recent radios', e);
            }
        }
    }, []);

    const toggleFavorite = useCallback((station: RadioStation) => {
        setFavorites(prev => {
            const exists = prev.find(s => s.stationuuid === station.stationuuid);
            let newFavs;
            if (exists) {
                newFavs = prev.filter(s => s.stationuuid !== station.stationuuid);
            } else {
                newFavs = [...prev, station];
            }
            localStorage.setItem('radio_favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    }, []);

    const isFavorite = useCallback((uuid: string) => {
        return favorites.some(s => s.stationuuid === uuid);
    }, [favorites]);

    const addCustomRadio = useCallback((name: string, url: string, favicon: string = '') => {
        const newRadio: RadioStation = {
            stationuuid: `custom-${Date.now()}`,
            name,
            url,
            url_resolved: url,
            homepage: '',
            favicon,
            tags: 'custom',
            country: 'Custom',
            countrycode: '',
            state: '',
            language: '',
            languagecodes: '',
            votes: 0,
            lastchangetime: new Date().toISOString(),
            codec: 'unknown',
            bitrate: 0,
            hls: 0,
            lastcheckok: 1,
            clickcount: 0,
            clicktrend: 0,
            geo_lat: null,
            geo_long: null
        };

        setCustomRadios(prev => {
            const next = [...prev, newRadio];
            localStorage.setItem('radio_custom', JSON.stringify(next));
            return next;
        });

        return newRadio;
    }, []);

    const removeCustomRadio = useCallback((uuid: string) => {
        setCustomRadios(prev => {
            const next = prev.filter(s => s.stationuuid !== uuid);
            localStorage.setItem('radio_custom', JSON.stringify(next));
            return next;
        });
    }, []);

    const addToRecent = useCallback((station: RadioStation) => {
        setRecentlyPlayed(prev => {
            const filtered = prev.filter(s => s.stationuuid !== station.stationuuid);
            const next = [station, ...filtered].slice(0, 10);
            localStorage.setItem('radio_recent', JSON.stringify(next));
            return next;
        });

        setPlayCounts(prev => {
            const next = { ...prev, [station.stationuuid]: (prev[station.stationuuid] || 0) + 1 };
            localStorage.setItem('radio_play_counts', JSON.stringify(next));
            return next;
        });
    }, []);

    const getTopStations = useCallback(() => {
        // Combine all known stations
        const all = [...favorites, ...customRadios, ...recentlyPlayed];
        const unique = Array.from(new Map(all.map(s => [s.stationuuid, s])).values());

        return unique
            .filter(s => playCounts[s.stationuuid] > 0)
            .sort((a, b) => (playCounts[b.stationuuid] || 0) - (playCounts[a.stationuuid] || 0))
            .slice(0, 6);
    }, [favorites, customRadios, recentlyPlayed, playCounts]);

    return {
        favorites,
        customRadios,
        recentlyPlayed,
        toggleFavorite,
        isFavorite,
        addCustomRadio,
        removeCustomRadio,
        addToRecent,
        getTopStations
    };
}
