import React, { useRef, useEffect } from 'react';

interface TypewriterProps {
    getAudioData: () => Uint8Array;
    isPlaying: boolean;
    audioRef: React.RefObject<HTMLAudioElement>;
}

const PHRASES = [
    { start: 0, end: 180, text: "aves de rapina" }, // 0:00 - 3:00
    { start: 180, end: 330, text: "francesca" },      // 3:00 - 5:30
    { start: 330, end: 510, text: "suor" },           // 5:30 - 8:30
    { start: 510, end: 624, text: "senta" },          // 8:30 - 10:24
    { start: 624, end: 840, text: "capa sete" },      // 10:24 - 14:00
    { start: 840, end: 960, text: "trop eca" },       // 14:00 - 16:00
];

const Typewriter: React.FC<TypewriterProps> = ({ getAudioData, isPlaying, audioRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<string>("> ");
    const cursorRef = useRef<boolean>(true);
    const lastBeatTimeRef = useRef<number>(0);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            cursorRef.current = !cursorRef.current;
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const resizeValues = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeValues);
        resizeValues();

        if (!textRef.current) textRef.current = "> ";

        const draw = (time: number) => {
            const data = getAudioData();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Audio analysis
            let sum = 0;
            for (let i = 0; i < 20; i++) { sum += data[i] || 0; }
            const energy = sum / 20;

            // Layout params
            const marginTop = 80;
            const marginLeft = 20;
            const marginRight = 20;
            const lineHeight = 24;
            const charWidth = 12; // Approx for 20px Courier
            const maxCharsPerLine = Math.floor((canvas.width - marginLeft - marginRight) / charWidth);

            // Logic to add text
            if (isPlaying && energy > 180 && time - lastBeatTimeRef.current > 120) {
                lastBeatTimeRef.current = time;

                // Determine current phase phrase
                let currentPhaseText = "";
                const currentTime = audioRef.current?.currentTime || 0;

                for (const p of PHRASES) {
                    if (currentTime >= p.start && currentTime < p.end) {
                        currentPhaseText = p.text;
                        break;
                    }
                }

                let textToAdd = "";
                // Probability check: 15% chance to type the special word if available
                if (currentPhaseText && Math.random() < 0.15) {
                    textToAdd = " " + currentPhaseText + " ";
                } else {
                    // Random char
                    const chars = "abcdefghijklmnopqrstuvwxyz....,,,;;;   ";
                    textToAdd = chars.charAt(Math.floor(Math.random() * chars.length));
                }

                // Check if current last line needs wrapping
                const currentLines = textRef.current.split('\n');
                const lastLine = currentLines[currentLines.length - 1];

                if (lastLine.length + textToAdd.length > maxCharsPerLine) {
                    textRef.current += "\n" + textToAdd.trimStart(); // Wrap
                } else {
                    textRef.current += textToAdd;
                }

                // Random newline
                if (Math.random() > 0.98) textRef.current += "\n";
            }

            // Scroll simulation
            const lines = textRef.current.split('\n');
            const maxLines = Math.floor((canvas.height - marginTop) / lineHeight) - 1;
            if (lines.length > maxLines) {
                textRef.current = lines.slice(lines.length - maxLines).join('\n');
            }

            // Draw
            ctx.font = '20px "Courier New", Courier, monospace';
            ctx.fillStyle = 'black';
            ctx.textBaseline = 'top';

            textRef.current.split('\n').forEach((line, i) => {
                ctx.fillText(line, marginLeft, marginTop + (i * lineHeight));
            });

            // Cursor
            if (cursorRef.current) {
                const currentLines = textRef.current.split('\n');
                const lastLine = currentLines[currentLines.length - 1];
                const cursorX = marginLeft + ctx.measureText(lastLine).width;
                const cursorY = marginTop + ((currentLines.length - 1) * lineHeight);
                ctx.fillRect(cursorX, cursorY, 12, 20);
            }

            animationId = requestAnimationFrame((t) => draw(t));
        };

        animationId = requestAnimationFrame((t) => draw(t));

        return () => {
            window.removeEventListener('resize', resizeValues);
            cancelAnimationFrame(animationId);
        };
    }, [getAudioData, isPlaying, audioRef]); // Added audioRef dependency

    return <canvas ref={canvasRef} className="whiteboard-canvas" />;
};

export default Typewriter;
