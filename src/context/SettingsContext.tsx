'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  isMusicEnabled: boolean;
  toggleMusic: () => void;
  theme: string;
  setTheme: (theme: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedMusic = localStorage.getItem('decaverse-music-enabled');
      if (storedMusic) {
        setIsMusicEnabled(JSON.parse(storedMusic));
      }
      const storedTheme = localStorage.getItem('decaverse-theme');
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn("Could not read settings from localStorage", error);
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
  
  const handleSetTheme = (newTheme: string) => {
    if (!isInitialized) return;
    setTheme(newTheme);
    try {
        localStorage.setItem('decaverse-theme', newTheme);
    } catch (error) {
        console.warn("Could not save theme to localStorage", error);
    }
  }

  const value = {
    isMusicEnabled,
    toggleMusic,
    theme,
    setTheme: handleSetTheme,
  };

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
