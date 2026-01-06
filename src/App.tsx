import { useState, ChangeEvent, useEffect } from 'react';
import Typewriter from './components/Typewriter';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';

function App() {
    const { audioRef, getFrequencyData, isPlaying } = useAudioVisualizer();
    const [audioSrc, setAudioSrc] = useState<string>('/default_album.mp3');

    // Attempt autoplay
    useEffect(() => {
        const playAudio = async () => {
            if (audioRef.current) {
                try {
                    await audioRef.current.play();
                } catch (e) {
                    console.log("Autoplay blocked, waiting for interaction", e);
                }
            }
        };

        // Try immediately after mount
        setTimeout(playAudio, 1000);

        // Fallback: Play on first interaction (click or key)
        const handleInteraction = () => {
            playAudio();
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [audioSrc]);

    // Handle file upload
    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setAudioSrc(url);
        }
    };

    return (
        <div className="app-container">
            {/* Top Right Title */}
            <div className="top-right-group">
                <div className="top-right-title">
                    la jazz plastique
                </div>
                <div className="top-right-subtitle">
                    afonso viana
                </div>
            </div>

            <main className="whiteboard-area">
                {/* We pass audioRef so Typewriter can read currentTime */}
                <Typewriter
                    getAudioData={getFrequencyData}
                    isPlaying={isPlaying}
                    audioRef={audioRef}
                />
            </main>

            {/* Bottom Left Controls */}
            <div className="bottom-left-controls">
                <label className="retro-button">
                    Load Music
                    <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
            </div>

            {/* Bottom Right Player */}
            <div className="bottom-right-player">
                <audio ref={audioRef} src={audioSrc} controls loop crossOrigin="anonymous" />
            </div>
        </div>
    );
}

export default App;
