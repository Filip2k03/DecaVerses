'use client';

import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Music4, Paintbrush } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { isMusicEnabled, toggleMusic, theme, setTheme } = useSettings();

  const themes = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'theme-neo', label: 'Neo' },
    { value: 'theme-winter', label: 'Winter' },
    { value: 'theme-summer', label: 'Summer' },
    { value: 'theme-inferno', label: 'Inferno Warrior' },
    { value: 'theme-guardian', label: 'Forest Guardian' },
  ];

  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
          Settings
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Customize your DecaVerse experience.
        </p>
      </div>

      <div className="mx-auto grid max-w-md gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audio Settings</CardTitle>
            <CardDescription>Manage in-game sounds and music.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="music-switch" className="text-base">
                  Background Music
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enjoy some tunes while you browse and play.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Music4 className="h-5 w-5 text-muted-foreground" />
                <Switch
                  id="music-switch"
                  checked={isMusicEnabled}
                  onCheckedChange={toggleMusic}
                  aria-label="Toggle background music"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose a visual theme for the DecaVerse.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="theme-select" className="text-base">
                    Theme
                    </Label>
                    <p className="text-sm text-muted-foreground">
                        Select a color scheme that fits your style.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5 text-muted-foreground" />
                     <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger className="w-[180px]" id="theme-select" aria-label="Select theme">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            {themes.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
