import { games } from '@/lib/data';
import { notFound } from 'next/navigation';
import { BlockStacker } from '@/components/games/BlockStacker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicTacToe } from '@/components/games/TicTacToe';
import { Snake } from '@/components/games/Snake';
import { Sudoku } from '@/components/games/Sudoku';
import { Game2048 } from '@/components/games/Game2048';
import { Chess } from '@/components/games/Chess';
import { Battleship } from '@/components/games/Battleship';
import { DynamicGameIcon } from '@/components/DynamicGameIcon';

export default function GamePage({ params }: { params: { id: string } }) {
  const game = games.find((g) => g.id === parseInt(params.id, 10));

  if (!game) {
    notFound();
  }
  
  const renderGame = () => {
    switch (game.id) {
      case 1:
        return <TicTacToe />;
      case 2:
        return <Snake />;
      case 3:
        return <Sudoku />;
      case 4:
        return <Game2048 />;
      case 5:
        return <Chess />;
      case 6:
        return <Battleship />;
      case 8: // Block Stacker
        return <BlockStacker />;
      default:
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{game.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This game is not yet available. Check back soon!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4">
            <DynamicGameIcon iconName={game.icon} className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
              {game.title}
            </h1>
        </div>
        <p className="mx-auto mt-2 max-w-[700px] text-muted-foreground md:text-xl">
          {game.description}
        </p>
      </div>
      {renderGame()}
    </div>
  );
}
