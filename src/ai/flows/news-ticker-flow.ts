'use server';

/**
 * @fileOverview AI flow for generating futuristic news headlines.
 *
 * - generateHeadlines - A function that returns a list of cyberpunk-themed headlines.
 * - NewsTickerOutput - The return type for the generateHeadlines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsTickerOutputSchema = z.object({
  headlines: z
    .array(z.string())
    .describe('A list of 5 short, cyberpunk-themed news headlines for a scrolling ticker.'),
});
export type NewsTickerOutput = z.infer<typeof NewsTickerOutputSchema>;


export async function generateHeadlines(): Promise<NewsTickerOutput> {
  return newsTickerFlow();
}

const prompt = ai.definePrompt({
  name: 'newsTickerPrompt',
  output: {schema: NewsTickerOutputSchema},
  prompt: `You are a news writer in the grim, futuristic world of 2077. 
  
  Generate exactly 5 short, punchy, cyberpunk-themed news headlines. They should be suitable for a scrolling news ticker.
  
  Examples: 
  - 'Arasaka stock hits all-time high'
  - 'Cyber-plague contained in Night City sector 4'
  - 'Orbital station reports solar flare interference'
  - 'New Ripperdoc clinic opens in the lower district'
  - 'Militech unveils new combat drone series'
  `,
});

const newsTickerFlow = ai.defineFlow(
  {
    name: 'newsTickerFlow',
    outputSchema: NewsTickerOutputSchema,
  },
  async () => {
    const {output} = await prompt();
    return output!;
  }
);
