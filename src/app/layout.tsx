import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { SettingsProvider } from '@/context/SettingsContext';
import { GameProvider } from '@/context/GameContext';
import { BackgroundMusic } from '@/components/BackgroundMusic';
import { ThemeHandler } from '@/components/ThemeHandler';

export const metadata: Metadata = {
  title: 'DecaVerse',
  description: 'An small games platform with local multiplayer and AI recommendations.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0A101D" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DecaVerse" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Rajdhani:wght@600;700&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="relative z-10">
          <SettingsProvider>
            <GameProvider>
              <ThemeHandler />
              <div className="flex min-h-screen w-full flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                  {children}
                </main>
                <footer className="w-full p-4 text-center text-sm text-muted-foreground mb-16 md:mb-4">
                  <p>Developed by <a href="https://techyyfilip.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Filip</a> & <a href="https://thuyakyaw.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Thuyakyaw</a>.</p>
                </footer>
              </div>
              <Toaster />
              <BackgroundMusic />
            </GameProvider>
          </SettingsProvider>
        </div>
        <Script id="ad-script" type='text/javascript' src='//sportsariseencyclopaedia.com/53/34/cb/5334cb5f9a25d3343db8d9a1d0c3b555.js' />
      </body>
    </html>
  );
}
