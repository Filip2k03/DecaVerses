'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getGameRecommendations, type State } from '@/lib/actions';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, Gamepad2 } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        'Get Recommendations'
      )}
    </Button>
  );
}

export function RecommendationsClient() {
  const initialState: State = { message: null, errors: {}, recommendations: null };
  const [state, dispatch] = useFormState(getGameRecommendations, initialState);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Find Your Next Favorite Game</CardTitle>
          <CardDescription>
            Enter your friends' names below, separated by commas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contacts">Contact List</Label>
              <Textarea
                id="contacts"
                name="contacts"
                placeholder="e.g. Alex, Jordan, Taylor"
                rows={4}
                aria-describedby="contacts-error"
              />
              <div id="contacts-error" aria-live="polite" aria-atomic="true">
                {state.errors?.contacts &&
                  state.errors.contacts.map((error: string) => (
                    <p className="mt-2 text-sm text-destructive" key={error}>
                      {error}
                    </p>
                  ))}
              </div>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {state.message && !state.errors && (
             <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    {state.message}
                </AlertDescription>
            </Alert>
        )}
        {state.recommendations && state.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended For You</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {state.recommendations.map((game, index) => (
                  <li key={index} className="flex items-center rounded-md border p-3">
                    <Gamepad2 className="mr-3 h-5 w-5 text-primary" />
                    <span className="font-medium">{game}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
         {state.message && state.recommendations?.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Recommendations Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We couldn't generate any recommendations based on the contacts provided. Try with a different list!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
