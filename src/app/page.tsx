
import { Button } from '@/components/ui/button';
import { Gamepad } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center text-center h-full flex-grow -mt-16">
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur-xl opacity-75 animate-pulse"></div>
        <div className="relative inline-block rounded-full bg-background p-6 border-2 border-primary/20">
            <Gamepad className="h-16 w-16 text-primary" style={{ filter: 'drop-shadow(0 0 10px hsl(var(--primary)))' }} />
        </div>
      </div>
      
      <h1 className="mt-8 text-5xl font-bold tracking-tighter sm:text-7xl font-headline animate-text-flicker">
        Welcome to DecaVerse
      </h1>

      <p className="mt-4 text-lg text-muted-foreground md:text-xl font-code">
        Bring back to memo with play old game with modern style
      </p>

      <p className="mt-12 text-sm text-muted-foreground">
        Developed by <a href="https://techyyfilip.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Stephanfilip</a>
      </p>

      <Link href="/games" className="mt-8">
        <Button size="lg" className="text-lg animate-pulse">
          Enter the DecaVerse
        </Button>
      </Link>
    </div>
  );
}
