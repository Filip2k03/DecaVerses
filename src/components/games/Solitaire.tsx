'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

// This is a visual-only component for now.
export const Solitaire = () => {
  return (
    <Card className="w-full max-w-2xl bg-green-800/80 p-4">
      <CardContent className="p-0">
        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <div className="w-20 h-28 border-2 border-white/20 rounded-lg"></div>
            <div className="w-20 h-28 border-2 border-white/20 rounded-lg bg-white/10 flex items-center justify-center text-white/50 text-xs">Waste</div>
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-28 border-2 border-white/20 rounded-lg flex items-center justify-center text-white/50 text-4xl">♠</div>
            <div className="w-20 h-28 border-2 border-white/20 rounded-lg flex items-center justify-center text-white/50 text-4xl">♥</div>
            <div className="w-20 h-28 border-2 border-white/20 rounded-lg flex items-center justify-center text-white/50 text-4xl">♦</div>
            <div className="w-20 h-28 border-2 border-white/20 rounded-lg flex items-center justify-center text-white/50 text-4xl">♣</div>
          </div>
        </div>
        <div className="flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-20">
              {Array.from({ length: i + 1 }).map((_, j) => (
                <div key={j} className="w-20 h-28 bg-primary/50 border-2 border-primary-foreground/50 rounded-lg -mt-20 first:mt-0" style={{ zIndex: j }}>
                  <div className="p-2 text-primary-foreground font-bold text-lg">{j === i ? 'A♦' : ''}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center mt-4 text-sm text-white/50">Note: This is a visual-only board. Full game logic is not yet implemented.</p>
      </CardContent>
    </Card>
  );
};
