'use client';

import { useEffect, useRef } from 'react';

interface VisualizerProps {
    isPlaying: boolean;
    audioRef?: React.RefObject<HTMLAudioElement | null>;
    color?: string;
}

export default function Visualizer({ isPlaying, audioRef, color = 'var(--primary)' }: VisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        if (!isPlaying || !audioRef?.current || !canvasRef.current) {
            cancelAnimationFrame(animationRef.current);
            return;
        }

        const audio = audioRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Initialize Audio Context and Analyzer only once
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            analyzerRef.current = audioContextRef.current.createAnalyser();

            try {
                sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
                sourceRef.current.connect(analyzerRef.current);
                analyzerRef.current.connect(audioContextRef.current.destination);
            } catch (err) {
                console.error('Visualizer: Source already connected or restricted.', err);
            }
        }

        const analyzer = analyzerRef.current!;
        analyzer.fftSize = 64;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                // Gradient color
                ctx.fillStyle = color;

                // Draw rounded bars
                const radius = 2;
                const bx = x;
                const by = canvas.height - barHeight;
                const bw = barWidth - 4;
                const bh = barHeight;

                if (bh > 4) {
                    ctx.beginPath();
                    ctx.roundRect(bx, by, bw, bh, [radius, radius, 0, 0]);
                    ctx.fill();
                } else {
                    ctx.fillRect(bx, canvas.height - 2, bw, 2);
                }

                x += barWidth;
            }
        };

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, audioRef, color]);

    return (
        <canvas
            ref={canvasRef}
            width={160}
            height={48}
            className="w-40 h-12 opacity-80"
        />
    );
}
