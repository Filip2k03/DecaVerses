'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && systemIsDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };
  
  if (!mounted) {
    return (
        <Button variant="ghost" size="icon" disabled>
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
        </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
    </Button>
  );
}
