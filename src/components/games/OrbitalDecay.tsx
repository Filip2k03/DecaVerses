'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RefreshCw, Zap } from 'lucide-react';

const ORBS = [
    { color: 'bg-red-500' },
    { color: 'bg-red-500' },
    { color: 'bg-blue-500' },
    { color: 'bg-blue-500' },
    { color: 'bg-green-500' },
    { color: 'bg-yellow-400' },
    { color: 'bg-yellow-400' },
    { color: 'bg-red-500' },
    { color: 'bg-blue-500' },
];

export const OrbitalDecay = () => {

    const path = "M 50 250 A 200 200 0 0 1 450 250";
    
    return (
        <Card className="w-full max-w-lg bg-gray-900 border-2 border-primary/50 text-white p-4">
            <CardContent className="p-0 relative flex flex-col items-center justify-center">
                 <svg width="500" height="300" viewBox="0 0 500 300">
                    <path id="curve" d={path} stroke="hsl(var(--primary)/0.3)" strokeWidth="4" fill="none" strokeDasharray="10 5" />
                    {ORBS.map((orb, i) => (
                        <circle key={i} className={orb.color} r="10" stroke="white" strokeWidth="1">
                            <animateMotion dur="20s" repeatCount="indefinite" rotate="auto">
                                <mpath href="#curve" />
                            </animateMotion>
                        </circle>
                    ))}
                </svg>
                <div className="absolute bottom-0">
                    <Zap className="w-16 h-16 text-yellow-400 rotate-[-45deg]" />
                </div>
                 <p className="text-center mt-4 text-sm text-white/50">Note: This is a visual-only board. Full game logic is not yet implemented.</p>
            </CardContent>
        </Card>
    );
};
