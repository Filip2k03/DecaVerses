'use client';

import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Music4 } from 'lucide-react';

export default function SettingsPage() {
  const { isMusicEnabled, toggleMusic } = useSettings();

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

      <div className="mx-auto max-w-md">
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
      </div>
    </div>
  );
}
