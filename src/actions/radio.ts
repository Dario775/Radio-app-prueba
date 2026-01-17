'use server';

import { getStations } from '@/lib/radio-api';
import type { RadioStation } from '@/types/radio';

export async function searchStations(query: string = '', tag: string = '', limit: number = 30): Promise<RadioStation[]> {
    try {
        let options: any = {
            limit: limit,
            order: 'clickcount',
            reverse: true,
        };

        if (query) {
            options.name = query;
        } else if (tag && tag !== 'all') {
            options.tag = tag;
        }

        const result = await getStations(options);

        // Filter out broken stations and playlist files that browser can't play directly
        const validStations = result.filter(
            (s: RadioStation) =>
                s.url_resolved &&
                s.lastcheckok === 1 &&
                !s.url_resolved.toLowerCase().endsWith('.pls') &&
                !s.url_resolved.toLowerCase().endsWith('.m3u') &&
                !s.url_resolved.toLowerCase().includes('.pls') &&
                !s.url_resolved.toLowerCase().includes('.m3u')
        );

        return validStations;
    } catch (error) {
        console.error('Error fetching stations:', error);
        throw new Error('Failed to fetch stations');
    }
}

export async function getStationDetails(uuid: string): Promise<{ station: RadioStation | null, relatedStations: RadioStation[] }> {
    try {
        // 1. Get the specific station
        const stations = await getStations({ uuid });
        const station = stations[0] || null;

        if (!station) {
            return { station: null, relatedStations: [] };
        }

        // 2. Get related stations (same name + same country for better accuracy)
        const siblings = await getStations({
            name: station.name,
            limit: 20,
            order: 'bitrate',
            reverse: true
        });

        // Filter: same name (flexible), same country code if available, different UUID
        const related = siblings.filter(s => {
            const sameName = s.name.trim().toLowerCase().includes(station.name.trim().toLowerCase()) ||
                station.name.trim().toLowerCase().includes(s.name.trim().toLowerCase());
            const sameCountry = !station.countrycode || s.countrycode === station.countrycode;
            const isDifferent = s.stationuuid !== station.stationuuid;
            const isNotPls = !s.url_resolved.endsWith('.pls') && !s.url_resolved.endsWith('.m3u');

            return sameName && sameCountry && isDifferent && s.url_resolved && isNotPls;
        });

        return { station, relatedStations: related };
    } catch (error) {
        console.error('Error fetching station details:', error);
        return { station: null, relatedStations: [] };
    }
}

export async function getRandomStation(): Promise<RadioStation | null> {
    try {
        // Fetch top rated stations and pick one randomly from top 100
        const stations = await getStations({
            limit: 100,
            order: 'votes',
            reverse: true
        });

        if (stations.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * stations.length);
        return stations[randomIndex];
    } catch (error) {
        console.error('Error fetching random station:', error);
        return null;
    }
}

export async function getStationsByLocation(countryCode?: string, state?: string, country?: string): Promise<RadioStation[]> {
    try {
        let options: any = {
            limit: 50,
            order: 'clickcount',
            reverse: true
        };

        if (countryCode) options.countrycode = countryCode;
        if (state) options.state = state;
        // If we have full country name, prefer using the bycountry endpoint or search if combined with state
        if (country && !state) {
            const { getStationsByCountry } = await import('@/lib/radio-api');
            return await getStationsByCountry(country, 50);
        }

        const results = await getStations(options);
        return results.filter(s => s.url_resolved && s.lastcheckok === 1);
    } catch (error) {
        console.error('Error fetching stations by location:', error);
        return [];
    }
}

export async function getAllCountries() {
    try {
        const { getCountries } = await import('@/lib/radio-api');
        const countries = await getCountries();
        // Return only countries with significant station count to reduce noise
        return countries.filter(c => c.stationcount > 10).sort((a, b) => b.stationcount - a.stationcount);
    } catch (error) {
        return [];
    }
}

export async function getStatesForCountry(country: string) {
    try {
        const { getStates } = await import('@/lib/radio-api');
        const states = await getStates(country);
        return states.filter(s => s.stationcount > 0).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        return [];
    }
}

export async function getArgentineStations(limit: number = 50): Promise<RadioStation[]> {
    try {
        // We import the new function we just added to lib/radio-api
        const { getStationsByCountry } = await import('@/lib/radio-api');
        const results = await getStationsByCountry('Argentina', limit);
        return results.filter(s => s.url_resolved && s.lastcheckok === 1);
    } catch (error) {
        console.error('Error fetching Argentine stations:', error);
        return [];
    }
}
