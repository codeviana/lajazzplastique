import { useRef, useEffect, useState } from 'react';

export const useAudioVisualizer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!audioRef.current) return;

        // Initialize ONLY if not already initialized
        // This check helps in React Strict Mode dev where effects run twice
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const analyser = audioContext.createAnalyser();

            // Connect audio element source
            // This fails if called twice on the same element, so we must assume 
            // if we are here, we are doing it for the first time for this context.
            const source = audioContext.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(audioContext.destination);

            analyser.fftSize = 256;
            analyserRef.current = analyser;
            const bufferLength = analyser.frequencyBinCount;
            dataArrayRef.current = new Uint8Array(bufferLength);
            audioContextRef.current = audioContext;
        }

        const audioContext = audioContextRef.current;
        if (!audioContext) return;

        const handlePlay = () => {
            // Resume context if suspended (browser policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            setIsPlaying(true);
        };
        const handlePause = () => setIsPlaying(false);

        const audioEl = audioRef.current;
        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);

        return () => {
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
            // We do NOT close the context here. 
            // Closing it prevents reuse if the component is just "conceptually" unmounted 
            // but the DOM element persists (Strict Mode).
        };
    }, []);

    const getFrequencyData = () => {
        if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            return dataArrayRef.current;
        }
        return new Uint8Array(0);
    };

    return { audioRef, getFrequencyData, isPlaying };
};
