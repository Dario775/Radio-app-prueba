import { RadioStation } from '@/types/radio';

const SERVERS = [
    'https://de1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://at1.api.radio-browser.info',
    'https://us1.api.radio-browser.info'
];

async function fetchWithFallback<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const searchParams = new URLSearchParams(params);
    let lastError;

    // Shuffle servers to load balance
    const shuffledServers = [...SERVERS].sort(() => Math.random() - 0.5);

    for (const server of shuffledServers) {
        try {
            const url = `${server}${endpoint}?${searchParams.toString()}`;
            // Add a timeout to avoid hanging on slow servers
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'RadioApp/1.0',
                },
                signal: controller.signal,
                next: { revalidate: 3600 } // Cache for 1 hour
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`Status ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Failed to fetch from ${server}:`, error);
            lastError = error;
            continue;
        }
    }
    throw lastError || new Error('All servers failed');
}

export type FetchStationsOptions = {
    limit?: number;
    order?: string;
    reverse?: boolean;
    name?: string;
    tag?: string;
    uuid?: string;
};

export async function getStations(options: FetchStationsOptions): Promise<RadioStation[]> {
    // If uuid is provided, use the specific byuuid endpoint
    if (options.uuid) {
        return fetchWithFallback<RadioStation[]>(`/json/stations/byuuid/${options.uuid}`);
    }

    const params: Record<string, string> = {
        limit: (options.limit || 30).toString(),
        order: options.order || 'votes',
        reverse: options.reverse ? 'true' : 'false',
        hidebroken: 'true'
    };

    if (options.name) params.name = options.name;
    if (options.tag) params.tag = options.tag;

    return fetchWithFallback<RadioStation[]>('/json/stations/search', params);
}

export async function getStationsByCountry(country: string): Promise<RadioStation[]> {
    const params: Record<string, string> = {
        order: 'clickcount',
        reverse: 'true',
        hidebroken: 'true'
    };
    return fetchWithFallback<RadioStation[]>(`/json/stations/bycountry/${encodeURIComponent(country)}`, params);
}

export async function getStationsByState(country: string, state: string): Promise<RadioStation[]> {
    const params: Record<string, string> = {
        order: 'clickcount',
        reverse: 'true',
        hidebroken: 'true',
        country: country
    };
    // The endpoint is strictly by state, but filtering by country in params helps accuracy if supported, 
    // or we just trust the state name is unique enough or the API handles it. 
    // RadioBrowser API typically uses /json/stations/bystate/{searchterm}
    return fetchWithFallback<RadioStation[]>(`/json/stations/bystate/${encodeURIComponent(state)}`, params);
}

export async function getCountries(): Promise<{ name: string; stationcount: number }[]> {
    return fetchWithFallback<{ name: string; stationcount: number }[]>('/json/countries');
}

export async function getStates(country: string): Promise<{ name: string; stationcount: number }[]> {
    return fetchWithFallback<{ name: string; stationcount: number }[]>(`/json/states/${encodeURIComponent(country)}`);
}
