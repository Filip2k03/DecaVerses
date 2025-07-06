import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/context/SettingsContext';
import { GameProvider } from '@/context/GameContext';
import { BackgroundMusic } from '@/components/BackgroundMusic';

export const metadata: Metadata = {
  title: 'DecaVerse',
  description: 'An offline games platform with local multiplayer and AI recommendations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Rajdhani:wght@600;700&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative z-10">
          <SettingsProvider>
            <GameProvider>
              <div className="flex min-h-screen w-full flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 mb-16 md:mb-0">
                  {children}
                </main>
              </div>
              <Toaster />
              <BackgroundMusic />
            </GameProvider>
          </SettingsProvider>
        </div>
      </body>
    </html>
  );
}
