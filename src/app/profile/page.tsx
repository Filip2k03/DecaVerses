import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { games, userProfile } from '@/lib/data';
import { Crown } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="container mx-auto space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={userProfile.avatar} alt={userProfile.name} data-ai-hint={userProfile.aiHint} />
          <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold font-headline">{userProfile.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-2 h-6 w-6 text-yellow-500" />
            My High Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">High Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.sort((a,b) => b.highscore - a.highscore).map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.title}</TableCell>
                  <TableCell className="text-muted-foreground">{game.category}</TableCell>
                  <TableCell className="text-right font-mono">{game.highscore.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
