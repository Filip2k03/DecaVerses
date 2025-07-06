'use server';

import { recommendGames } from '@/ai/flows/game-recommendations';
import { z } from 'zod';

const FormSchema = z.object({
  contacts: z.string().min(1, 'Please enter at least one contact.'),
});

export type State = {
  errors?: {
    contacts?: string[];
  };
  message?: string | null;
  recommendations?: string[] | null;
};

export async function getGameRecommendations(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = FormSchema.safeParse({
    contacts: formData.get('contacts'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid input. Please check your contacts list.',
    };
  }
  
  const contactList = validatedFields.data.contacts.split(',').map(c => c.trim()).filter(c => c.length > 0);

  if (contactList.length === 0) {
      return {
          errors: { contacts: ["Please enter at least one contact."] },
          message: 'Invalid input. Please provide a comma-separated list of contacts.',
      }
  }

  try {
    const result = await recommendGames({ contactList });
    return {
      message: 'Recommendations generated successfully!',
      recommendations: result.recommendedGames,
    };
  } catch (e) {
    return {
      message: 'Failed to get recommendations. Please try again later.',
    };
  }
}
