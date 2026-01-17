export interface RadioStation {
    stationuuid: string;
    name: string;
    url: string;
    url_resolved: string;
    homepage: string;
    favicon: string;
    tags: string;
    country: string;
    countrycode: string;
    state: string;
    language: string;
    languagecodes: string;
    votes: number;
    lastchangetime: string;
    codec: string;
    bitrate: number;
    hls: number;
    lastcheckok: number;
    clickcount: number;
    clicktrend: number;
    geo_lat: number | null;
    geo_long: number | null;
}

export interface SearchFilters {
    name?: string;
    country?: string;
    language?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    order?: 'name' | 'votes' | 'clickcount' | 'bitrate';
    reverse?: boolean;
}

export interface AudioPreferences {
    quality: 'low' | 'medium' | 'high' | 'auto';
    bufferSize: 'small' | 'medium' | 'large';
    sleepTimer: number | null;
    autoPlay: boolean;
}

export interface RadioAlarm {
    id: string;
    time: string; // HH:mm
    days: number[]; // 0-6
    enabled: boolean;
    station: RadioStation;
}
