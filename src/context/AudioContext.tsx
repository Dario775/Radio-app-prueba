'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import type { RadioStation } from '@/types/radio';

interface AudioContextType {
    currentStation: RadioStation | null;
    isPlaying: boolean;
    isLoading: boolean;
    volume: number;
    dominantColor: string;
    eqGains: number[];
    setEqGain: (bandIndex: number, gain: number) => void;
    setMultipleEqGains: (gains: number[]) => void;
    playStation: (station: RadioStation) => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isRecording: boolean;
    recordingDuration: number;
    startRecording: () => void;
    stopRecording: () => void;
    sleepTimer: number | null;
    setSleepTimer: (minutes: number | null) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [dominantColor, setDominantColor] = useState('#00bdc7');
    const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [sleepTimer, setSleepTimer] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const filtersRef = useRef<BiquadFilterNode[]>([]);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const togglePlay = useCallback(() => {
        if (!audioRef.current || !currentStation) return;

        // Initialize Audio Context on user interaction
        if (!audioCtxRef.current) {
            initAudioEngine();
        }

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            if (audioCtxRef.current?.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            setIsLoading(true);
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error('Toggle play error:', err))
                .finally(() => setIsLoading(false));
        }
    }, [isPlaying, currentStation]);

    const playStation = useCallback((station: RadioStation) => {
        if (currentStation?.stationuuid === station.stationuuid) {
            togglePlay();
            return;
        }

        // Initialize Audio Context on user interaction
        if (!audioCtxRef.current) {
            initAudioEngine();
        }

        setCurrentStation(station);
        setIsLoading(true);
        setIsPlaying(false);

        // Wait for state update and audio element to be ready
        setTimeout(() => {
            if (audioRef.current) {
                if (audioCtxRef.current?.state === 'suspended') {
                    audioCtxRef.current.resume();
                }
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => {
                        console.error('Playback error:', e);
                        setIsPlaying(false);
                    })
                    .finally(() => setIsLoading(false));
            }
        }, 100);
    }, [currentStation, togglePlay]);

    // Handle Media Session API
    useEffect(() => {
        if (!currentStation || !('mediaSession' in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentStation.name,
            artist: currentStation.state || currentStation.country || 'RadioWave',
            album: 'Live Radio',
            artwork: [
                { src: currentStation.favicon || '/favicon.ico', sizes: '512x512', type: 'image/png' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', togglePlay);
        navigator.mediaSession.setActionHandler('pause', togglePlay);
    }, [currentStation, togglePlay]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Extract dominant color from station favicon
    useEffect(() => {
        if (!currentStation?.favicon) {
            setDominantColor('#00bdc7');
            document.documentElement.style.setProperty('--primary-dynamic', '#00bdc7');
            document.documentElement.style.setProperty('--primary-dynamic-rgb', '0, 189, 199');
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        // Use a CORS proxy for extraction
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(currentStation.favicon)}&w=100&h=100&fit=cover`;
        img.src = proxyUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                ctx.drawImage(img, 0, 0, 1, 1);
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

                // Avoid too dark or too light colors, and boost saturation
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                // Boost saturation if color is too "gray"
                let finalR = r;
                let finalG = g;
                let finalB = b;

                const avg = (r + g + b) / 3;
                const saturation = Math.max(Math.abs(r - avg), Math.abs(g - avg), Math.abs(b - avg));

                if (saturation < 30) {
                    // It's a very gray color, let's boost it towards the primary or make it more distinct
                    finalR = Math.min(255, r + 40);
                    finalG = Math.min(255, g + 20);
                    finalB = Math.max(0, b - 20);
                }

                if (brightness < 60) { // Too dark
                    finalR = Math.min(255, finalR + 80);
                    finalG = Math.min(255, finalG + 80);
                    finalB = Math.min(255, finalB + 80);
                } else if (brightness > 200) { // Too light
                    finalR = Math.max(0, finalR - 50);
                    finalG = Math.max(0, finalG - 50);
                    finalB = Math.max(0, finalB - 50);
                }

                const color = `rgb(${finalR}, ${finalG}, ${finalB})`;
                console.log(`Extracted color for ${currentStation.name}: ${color}`);

                setDominantColor(color);
                document.documentElement.style.setProperty('--primary-dynamic', color);
                document.documentElement.style.setProperty('--primary-dynamic-rgb', `${finalR}, ${finalG}, ${finalB}`);
            } catch (err) {
                console.warn('Could not extract color due to CORS or other issue');
                setDominantColor('#00bdc7');
                document.documentElement.style.setProperty('--primary-dynamic', '#00bdc7');
                document.documentElement.style.setProperty('--primary-dynamic-rgb', '0, 189, 199');
            }
        };

        img.onerror = () => {
            setDominantColor('#00bdc7');
            document.documentElement.style.setProperty('--primary-dynamic', '#00bdc7');
            document.documentElement.style.setProperty('--primary-dynamic-rgb', '0, 189, 199');
        };
    }, [currentStation]);

    const initAudioEngine = () => {
        if (!audioRef.current || audioCtxRef.current) return;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;

        // Frequencies for a 5-band EQ
        const frequencies = [60, 230, 910, 3600, 14000];
        const filters = frequencies.map(freq => {
            const filter = ctx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        filtersRef.current = filters;

        try {
            const source = ctx.createMediaElementSource(audioRef.current);
            sourceRef.current = source;

            // Connect filters in chain
            source.connect(filters[0]);
            for (let i = 0; i < filters.length - 1; i++) {
                filters[i].connect(filters[i + 1]);
            }
            filters[filters.length - 1].connect(ctx.destination);

            // Apply current gains
            eqGains.forEach((gain, i) => {
                if (filtersRef.current[i]) {
                    filtersRef.current[i].gain.value = gain;
                }
            });
        } catch (err) {
            console.error('EQ Initialization error:', err);
        }
    };

    const setEqGain = (bandIndex: number, gain: number) => {
        const newGains = [...eqGains];
        newGains[bandIndex] = gain;
        setEqGains(newGains);

        if (filtersRef.current[bandIndex]) {
            filtersRef.current[bandIndex].gain.value = gain;
        }

        // Save to localStorage
        localStorage.setItem('radio_eq_gains', JSON.stringify(newGains));
    };

    const setMultipleEqGains = (newGains: number[]) => {
        setEqGains(newGains);
        newGains.forEach((gain, i) => {
            if (filtersRef.current[i]) {
                filtersRef.current[i].gain.value = gain;
            }
        });
        localStorage.setItem('radio_eq_gains', JSON.stringify(newGains));
    };

    const startRecording = () => {
        if (!audioRef.current || isRecording) return;

        try {
            const stream = (audioRef.current as any).captureStream ?
                (audioRef.current as any).captureStream() :
                (audioRef.current as any).mozCaptureStream();

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentStation?.name || 'Radio'}_${new Date().getTime()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                setIsRecording(false);
                setRecordingDuration(0);
            };

            recorder.start();
            setIsRecording(true);
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Failed to start recording:', err);
            alert('La grabación no es compatible con este stream o navegador.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    // Load EQ gains from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('radio_eq_gains');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setEqGains(parsed);
                // If filters are already active, apply immediately
                parsed.forEach((gain: number, i: number) => {
                    if (filtersRef.current[i]) {
                        filtersRef.current[i].gain.value = gain;
                    }
                });
            } catch (e) {
                console.error('Failed to parse EQ gains', e);
            }
        }
    }, []);

    // Sleep Timer Logic - Global
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (sleepTimer !== null && isPlaying) {
            interval = setInterval(() => {
                setSleepTimer(prev => {
                    if (prev === null) return null;
                    if (prev <= 1) { // less than 1 minute (we simplify to minutes for state, but execution could be finer)
                        // Actually, let's switch to seconds internally or just check minutes 
                        // For simplicity, if we store minutes, we decrement every minute.
                        // Better: allow tracking seconds if needed, but for "Sleep in 15m", minute check is fine.
                        // BUT user wants precise feedback? PlayerView had seconds.
                        // Let's stick to simple minute decrement for now, or change state to seconds?
                        // Let's use seconds for smoother countdown if displayed
                        return prev - (1 / 60);
                    }
                    return prev - (1 / 60);
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sleepTimer, isPlaying]);

    // Check specific 0 trigger
    useEffect(() => {
        if (sleepTimer !== null && sleepTimer <= 0) {
            if (isPlaying) togglePlay();
            setSleepTimer(null);
        }
    }, [sleepTimer, isPlaying, togglePlay]);

    // Smart Alarm Logic: Fetch Weather and Speak
    const runSmartAlarm = async (station: RadioStation) => {
        try {
            // 1. Get location and weather (Free API, open-meteo)
            const weatherRes = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current_weather=true');
            const weatherData = await weatherRes.json();
            const temp = Math.round(weatherData.current_weather.temperature);

            // 2. Get News Headlines (BBC Mundo via rss2json for CORS)
            let newsText = "";
            try {
                const newsRes = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.bbci.co.uk%2Fmundo%2Frss.xml');
                const newsData = await newsRes.json();
                if (newsData.status === 'ok' && newsData.items) {
                    const headlines = newsData.items.slice(0, 3).map((item: any) => item.title).join('. ');
                    newsText = `Aquí tienes las noticias destacadas: ${headlines}.`;
                }
            } catch (e) {
                console.warn('News fetch failed', e);
            }

            // 3. Construct Speech
            const msgs = [
                `Buenos días. Son las ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
                `La temperatura actual es de ${temp} grados.`,
                newsText,
                `Iniciando tu emisora: ${station.name}.`,
                `Que tengas un excelente día.`
            ];

            const fullText = msgs.filter(Boolean).join(' ');

            const utterance = new SpeechSynthesisUtterance(fullText);
            utterance.lang = 'es-ES';
            utterance.rate = 0.95; // Slightly faster natural pace

            // Ensure audio context is unlocked/ready before speaking if possible (browser quirk)
            window.speechSynthesis.cancel(); // Clear queue
            window.speechSynthesis.speak(utterance);

            utterance.onend = () => {
                playStation(station);
            };

            // Fallback safety if speech fails or hangs
            setTimeout(() => {
                if (!isPlaying && window.speechSynthesis.speaking) {
                    // let it finish
                } else if (!isPlaying) {
                    playStation(station);
                }
            }, 15000); // 15s max waiting time

        } catch (err) {
            console.error('Smart alarm failed:', err);
            playStation(station); // Fallback to just radio
        }
    };

    // Alarm checking logic
    useEffect(() => {
        const checkAlarms = () => {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const currentDay = now.getDay();

            const stored = localStorage.getItem('radio_alarms');
            if (!stored) return;

            const alarms: Array<{ id: string; enabled: boolean; time: string; days: number[]; station: RadioStation; smart?: boolean }> = JSON.parse(stored);
            const activeAlarm = alarms.find(a =>
                a.enabled &&
                a.time === currentTime &&
                a.days.includes(currentDay)
            );

            if (activeAlarm) {
                // To avoid multiple triggers in the same minute
                const lastTriggered = sessionStorage.getItem(`alarm_last_${activeAlarm.id}`);
                const todayStr = now.toDateString() + currentTime;

                if (lastTriggered !== todayStr) {
                    sessionStorage.setItem(`alarm_last_${activeAlarm.id}`, todayStr);

                    // Show notification
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('Radio Alarm', {
                            body: `Starting ${activeAlarm.station.name}`,
                            icon: activeAlarm.station.favicon || '/favicon.ico'
                        });
                    }

                    // Trigger Smart or Standard
                    if (activeAlarm.smart) {
                        runSmartAlarm(activeAlarm.station);
                    } else {
                        playStation(activeAlarm.station);
                    }
                }
            }
        };

        const interval = setInterval(checkAlarms, 10000); // Check every 10s
        return () => clearInterval(interval);
    }, [playStation]);

    return (
        <AudioContext.Provider value={{
            currentStation,
            isPlaying,
            isLoading,
            volume,
            dominantColor,
            eqGains,
            setEqGain,
            setMultipleEqGains,
            playStation,
            togglePlay,
            setVolume,
            audioRef,
            isRecording,
            recordingDuration,
            startRecording,
            stopRecording,
            sleepTimer,
            setSleepTimer
        }}>
            {children}
            {/* The actual hidden audio element */}
            <audio
                ref={audioRef}
                src={currentStation?.url_resolved}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                crossOrigin="anonymous"
            />
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
