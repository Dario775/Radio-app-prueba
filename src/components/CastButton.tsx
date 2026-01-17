'use client';

import { useEffect, useState } from 'react';
import { useAudio } from '@/context/AudioContext';

declare global {
    interface Window {
        chrome: any;
        cast: any;
        __onGCastApiAvailable: (isAvailable: boolean) => void;
    }
}

export default function CastButton() {
    const { currentStation, isPlaying } = useAudio();
    const [isCastAvailable, setIsCastAvailable] = useState(false);
    const [isCasting, setIsCasting] = useState(false);

    useEffect(() => {
        window.__onGCastApiAvailable = (isAvailable: boolean) => {
            if (isAvailable) {
                initializeCastApi();
                setIsCastAvailable(true);
            }
        };

        // If API is already loaded
        if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
            initializeCastApi();
            setIsCastAvailable(true);
        }
    }, []);

    const initializeCastApi = () => {
        const castContext = window.cast.framework.CastContext.getInstance();
        castContext.setOptions({
            receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
            autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
        });

        castContext.addEventListener(
            window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
            (event: any) => {
                switch (event.sessionState) {
                    case window.cast.framework.SessionState.SESSION_STARTED:
                    case window.cast.framework.SessionState.SESSION_RESUMED:
                        setIsCasting(true);
                        if (currentStation) {
                            loadMediaOnReceiver();
                        }
                        break;
                    case window.cast.framework.SessionState.SESSION_ENDED:
                        setIsCasting(false);
                        break;
                }
            }
        );
    };

    const loadMediaOnReceiver = () => {
        if (!currentStation) return;

        const castSession = window.cast.framework.CastContext.getInstance().getCurrentSession();
        if (!castSession) return;

        const mediaInfo = new window.chrome.cast.media.MediaInfo(currentStation.url_resolved, 'audio/mp3');
        mediaInfo.metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
        mediaInfo.metadata.title = currentStation.name;
        mediaInfo.metadata.artist = currentStation.state || currentStation.country || 'RadioWave';
        mediaInfo.metadata.images = [
            new window.chrome.cast.Image(currentStation.favicon || 'https://radio-wave-app.vercel.app/icon-512.png')
        ];

        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        castSession.loadMedia(request).then(
            () => console.log('Chromecast: Media loaded successfully'),
            (errorCode: any) => console.error('Chromecast error:', errorCode)
        );
    };

    // Update media if station changes while casting
    useEffect(() => {
        if (isCasting && currentStation) {
            loadMediaOnReceiver();
        }
    }, [currentStation?.stationuuid, isCasting]);

    const handleCastClick = () => {
        if (!isCastAvailable) return;
        window.cast.framework.CastContext.getInstance().requestSession();
    };

    if (!isCastAvailable) return null;

    return (
        <button
            onClick={handleCastClick}
            className={`p-2 rounded-full transition-all ${isCasting ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-white/70 hover:bg-white/10'}`}
            title="Transmitir a Chromecast"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.5 14h.01M19 14h.01M3 21v-2a2 2 0 012-2h10a2 2 0 012 2v2M3 10V6a2 2 0 012-2h10a2 2 0 012 2v4M13 10l-3 3m0 0l-3-3m3 3V3" />
            </svg>
            {/* Standard cast icon path is more like this: */}
            <svg className="hidden" />
            <CastIcon isCasting={isCasting} />
        </button>
    );
}

function CastIcon({ isCasting }: { isCasting: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={`w-6 h-6 fill-current transition-colors ${isCasting ? 'text-[var(--primary)]' : 'text-white/60'}`}
        >
            <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            {isCasting && (
                <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.92-11-11-11z" className="animate-pulse" />
            )}
        </svg>
    );
}
