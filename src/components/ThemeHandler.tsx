'use client';

import { useSettings } from '@/context/SettingsContext';
import { useEffect } from 'react';

export function ThemeHandler() {
    const { theme } = useSettings();

    useEffect(() => {
        // Clear all possible theme classes
        document.documentElement.classList.remove('dark', 'light', 'theme-neo', 'theme-winter', 'theme-summer', 'theme-inferno', 'theme-guardian');
        // Add the current theme class
        document.documentElement.classList.add(theme);
    }, [theme]);

    return null;
}
