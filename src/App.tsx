import { useState, useEffect } from 'react';
import Typewriter from './components/Typewriter';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';

function App() {
    const { audioRef, getFrequencyData, isPlaying } = useAudioVisualizer();
    const [audioSrc] = useState<string>('default_album.mp3');

    const [hasStarted, setHasStarted] = useState(false);
    const [showTracklist, setShowTracklist] = useState(false);

    // Attempt autoplay
    useEffect(() => {
        const playAudio = async () => {
            if (audioRef.current) {
                try {
                    await audioRef.current.play();
                    setHasStarted(true);
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
            // Remove listeners once played (handled by hasStarted check mainly, but cleanup is good)
        };

        window.addEventListener('click', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [audioSrc]); // Re-run if source changes

    // Update hasStarted when isPlaying changes (in case visualizer catches it)
    useEffect(() => {
        if (isPlaying) setHasStarted(true);
    }, [isPlaying]);



    return (
        <div className="app-container">
            {/* Top Right Title */}
            <div className="top-right-group">
                <div className="top-right-title" onClick={() => setShowTracklist(!showTracklist)} style={{ cursor: 'pointer' }}>
                    la jazz plastique
                </div>
                {showTracklist && (
                    <div className="tracklist-dropdown">
                        <ol>
                            <li>aves de rapina</li>
                            <li>francesca</li>
                            <li>suor</li>
                            <li>se senta</li>
                            <li>capa sete</li>
                            <li>trop eca</li>
                        </ol>
                    </div>
                )}
                <div className="top-right-subtitle">
                    afonso viana
                </div>
            </div>

            {!hasStarted && (
                <div className="start-overlay">
                    PRESS ANY KEY TO START
                </div>
            )}

            <main className="whiteboard-area">
                {/* We pass audioRef so Typewriter can read currentTime */}
                <Typewriter
                    getAudioData={getFrequencyData}
                    isPlaying={isPlaying}
                    audioRef={audioRef}
                />
            </main>



            {/* Bottom Right Player */}
            <div className="bottom-right-player">
                <audio ref={audioRef} src={audioSrc} controls loop crossOrigin="anonymous" />
            </div>
        </div>
    );
}

export default App;
