'use client';

import { useEffect, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';

export function BackgroundMusic() {
  const { isMusicEnabled } = useSettings();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (isMusicEnabled) {
      audioElement.play().catch(error => {
        // Autoplay was prevented.
        console.warn("Background music couldn't start automatically:", error);
      });
    } else {
      audioElement.pause();
    }
  }, [isMusicEnabled]);

  return (
    <audio ref={audioRef} src="https://audio-previews.elements.envatousercontent.com/files/485965201/preview.mp3" loop preload="auto" />
  );
}
