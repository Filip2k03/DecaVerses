'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  isMusicEnabled: boolean;
  toggleMusic: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
        const storedValue = localStorage.getItem('decaverse-music-enabled');
        if (storedValue) {
            setIsMusicEnabled(JSON.parse(storedValue));
        }
    } catch (error) {
        console.warn("Could not read music settings from localStorage", error)
    }
    setIsInitialized(true);
  }, []);

  const toggleMusic = () => {
    if (!isInitialized) return;
    const newValue = !isMusicEnabled;
    setIsMusicEnabled(newValue);
    try {
        localStorage.setItem('decaverse-music-enabled', JSON.stringify(newValue));
    } catch (error) {
        console.warn("Could not save music settings to localStorage", error);
    }
  };

  const value = {
      isMusicEnabled,
      toggleMusic,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
