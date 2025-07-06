'use server';

/**
 * @fileOverview Game recommendation AI agent.
 *
 * - recommendGames - A function that handles the game recommendation process.
 * - RecommendGamesInput - The input type for the recommendGames function.
 * - RecommendGamesOutput - The return type for the recommendGames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGamesInputSchema = z.object({
  contactList: z
    .array(z.string())
    .describe('A list of contacts to base recommendations on.'),
});
export type RecommendGamesInput = z.infer<typeof RecommendGamesInputSchema>;

const RecommendGamesOutputSchema = z.object({
  recommendedGames: z
    .array(z.string())
    .describe('A list of games recommended for the user.'),
});
export type RecommendGamesOutput = z.infer<typeof RecommendGamesOutputSchema>;

export async function recommendGames(input: RecommendGamesInput): Promise<RecommendGamesOutput> {
  return recommendGamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGamesPrompt',
  input: {schema: RecommendGamesInputSchema},
  output: {schema: RecommendGamesOutputSchema},
  prompt: `You are a game recommendation expert. Based on the popularity of games among the user's contact list, recommend games that the user might enjoy. Take into account that the games should also be appropriate.

Contact List: {{{contactList}}}

Recommended Games:`,
});

const recommendGamesFlow = ai.defineFlow(
  {
    name: 'recommendGamesFlow',
    inputSchema: RecommendGamesInputSchema,
    outputSchema: RecommendGamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
