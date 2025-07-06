import { RecommendationsClient } from './RecommendationsClient';
import { Sparkles } from 'lucide-react';

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto">
        <div className="mb-8 text-center">
            <div className="inline-block rounded-full bg-primary/10 p-3">
                <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
                AI Game Recommendations
            </h1>
            <p className="mx-auto mt-2 max-w-[700px] text-muted-foreground md:text-xl">
                Get personalized game suggestions! Enter a comma-separated list of your friends' names, and our AI will recommend games you might enjoy based on what's popular with them.
            </p>
        </div>
      <RecommendationsClient />
    </div>
  );
}
