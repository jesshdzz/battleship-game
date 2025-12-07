import { useCallback } from 'react';

// Import assets directly
// Note: This relies on Vite/Webpack handling the import to return a string URL
import hitUrl from '../assets/hit.mp3';
import missUrl from '../assets/miss.mp3';
import winUrl from '../assets/win.mp3';
import loseUrl from '../assets/lose.mp3';
import selectUrl from '../assets/select.mp3';
import startUrl from '../assets/start.mp3';
import soundtrackUrl from '../assets/soundtrack.mp3';
import sunkUrl from '../assets/sunk.mp3';


const soundUrls = {
    hit: hitUrl,
    miss: missUrl,
    win: winUrl,
    lose: loseUrl,
    select: selectUrl,
    start: startUrl,
    soundtrack: soundtrackUrl,
    sunk: sunkUrl,
};

// Singleton to keep audio instances (optional, but good for avoiding re-loading)
// However, in React strict mode, singletons can be tricky.
// Let's use a simple approach: instantiate Audio on demand or ref.
// To allow overlapping sounds (e.g. rapid fire), we usually need new Audio() each time for effects.
// For soundtrack, we need a singleton or ref to control the loop.

const soundtrackAudio = new Audio(soundtrackUrl);
soundtrackAudio.loop = true;
soundtrackAudio.volume = 0.3;

export const useSound = () => {

    const play = useCallback((name: keyof typeof soundUrls) => {
        if (name === 'soundtrack') {
            soundtrackAudio.play().catch(e => console.warn("Soundtrack autoplay blocked:", e));
            return;
        }

        // For SFX, creating a new instance allows overlapping sounds (e.g. rapid hits)
        const audio = new Audio(soundUrls[name]);
        audio.volume = 0.6;
        audio.play().catch(e => console.warn(`Sound ${name} playback failed:`, e));
    }, []);

    const stop = useCallback((name: keyof typeof soundUrls) => {
        if (name === 'soundtrack') {
            soundtrackAudio.pause();
            soundtrackAudio.currentTime = 0;
        }
    }, []);

    const toggleSoundtrack = useCallback((playIt: boolean) => {
        if (playIt) {
            soundtrackAudio.play().catch(console.warn);
        } else {
            soundtrackAudio.pause();
        }
    }, []);

    // Effect to clean up soundtrack helper if we wanted, but it's global.
    // We'll leave it simple.

    return { play, stop, toggleSoundtrack };
};
