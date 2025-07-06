'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'center';

interface JoystickProps {
  onMove: (direction: Direction) => void;
  className?: string;
}

export function Joystick({ onMove, className }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastDirection = useRef<Direction>('center');

  const handleMove = useCallback((x: number, y: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relativeX = x - rect.left - centerX;
    const relativeY = y - rect.top - centerY;

    const distance = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
    const maxDistance = centerX * 0.75; // Stick can move 75% of the radius

    let stickX = relativeX;
    let stickY = relativeY;

    if (distance > maxDistance) {
      stickX = (relativeX / distance) * maxDistance;
      stickY = (relativeY / distance) * maxDistance;
    }

    setPosition({ x: stickX, y: stickY });

    // Determine direction
    const angle = Math.atan2(relativeY, relativeX) * (180 / Math.PI);
    let currentDirection: Direction = 'center';

    if (distance > maxDistance / 4) { // Only trigger if moved beyond a threshold
        if (angle > -45 && angle <= 45) {
            currentDirection = 'right';
        } else if (angle > 45 && angle <= 135) {
            currentDirection = 'down';
        } else if (angle > 135 || angle <= -135) {
            currentDirection = 'left';
        } else if (angle > -135 && angle <= -45) {
            currentDirection = 'up';
        }
    }
    
    if (currentDirection !== lastDirection.current) {
        onMove(currentDirection);
        lastDirection.current = currentDirection;
    }

  }, [onMove]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    if (lastDirection.current !== 'center') {
      onMove('center');
      lastDirection.current = 'center';
    }
  };
  
  return (
    <div
      className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50 select-none md:hidden", className)}
    >
      <div
        ref={containerRef}
        className="relative h-40 w-40 rounded-full bg-primary/10 backdrop-blur-sm border-2 border-primary/20 flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ArrowUp className="absolute top-2 h-6 w-6 text-primary/50" />
        <ArrowDown className="absolute bottom-2 h-6 w-6 text-primary/50" />
        <ArrowLeft className="absolute left-2 h-6 w-6 text-primary/50" />
        <ArrowRight className="absolute right-2 h-6 w-6 text-primary/50" />
        <div
          className="absolute h-16 w-16 rounded-full bg-primary/80 border-2 border-primary-foreground/50 shadow-lg transition-transform duration-75 ease-linear"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>
    </div>
  );
}
