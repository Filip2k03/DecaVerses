'use client';

import { useEffect, useState } from 'react';
import { Rss } from 'lucide-react';
import { generateHeadlines } from '@/ai/flows/news-ticker-flow';

export function NewsTicker() {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    async function fetchHeadlines() {
      try {
        const result = await generateHeadlines();
        setHeadlines(result.headlines);
      } catch (error) {
        console.error("Failed to fetch news headlines:", error);
        setHeadlines(["++ All news feeds currently offline. Check back later. ++"]);
      }
    }
    fetchHeadlines();
  }, []);

  if (headlines.length === 0) {
    return (
        <div className="relative flex overflow-hidden bg-black/50 border-y border-primary/20 h-8 items-center text-sm">
             <div className="absolute inset-y-0 left-0 z-10 flex items-center bg-primary text-primary-foreground px-2 font-bold font-code text-xs">
                <Rss className="h-4 w-4 mr-2 animate-pulse" />
                <span>N-FEED</span>
             </div>
             <div className="pl-24 text-primary/80 font-code animate-pulse">Fetching transmission...</div>
        </div>
    );
  }

  const tickerContent = headlines.map((h, i) => <span key={i} className="mx-8 text-primary/80 font-code">{h}</span>)

  return (
    <div className="relative flex overflow-hidden bg-black/50 border-y border-primary/20 h-8 items-center text-sm">
      <div className="absolute inset-y-0 left-0 z-10 flex items-center bg-primary text-primary-foreground px-2 font-bold font-code text-xs">
        <Rss className="h-4 w-4 mr-2" />
        <span>N-FEED</span>
      </div>
      <div className="animate-ticker whitespace-nowrap">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
}
