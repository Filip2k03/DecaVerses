'use client';

import Link from 'next/link';
import { Gamepad2, User, Sparkles, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Games', icon: Gamepad2 },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/recommendations', label: 'For You', icon: Sparkles },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">DecaVerse</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-foreground/80',
                pathname === item.href ? 'text-foreground' : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
            <ThemeToggle />
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background/95 p-2 z-50">
        <nav className="flex justify-around">
           {navItems.map((item) => (
            <Link key={`mobile-${item.href}`} href={item.href} legacyBehavior>
                <Button variant="ghost" size="sm" className={cn("flex flex-col h-16 w-16", pathname === item.href ? 'text-primary' : 'text-muted-foreground')}>
                    <item.icon className="h-6 w-6 mb-1"/>
                    <span className="text-xs">{item.label}</span>
                </Button>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
