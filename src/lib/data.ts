export type Game = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  highscore: number;
  aiHint: string;
};

export const games: Game[] = [
  { id: 1, title: 'Tic-Tac-Toe', description: 'The classic game of noughts and crosses. Can you get three in a row?', image: 'https://placehold.co/600x400.png', category: 'Strategy', highscore: 0, aiHint: 'tic tac toe' },
  { id: 2, title: 'Snake', description: 'Guide the snake to eat the food and grow longer, but don\'t hit the walls!', image: 'https://placehold.co/600x400.png', category: 'Arcade', highscore: 0, aiHint: 'retro snake' },
  { id: 3, title: 'Sudoku', description: 'A logic-based number puzzle. Fill the 9x9 grid with digits.', image: 'https://placehold.co/600x400.png', category: 'Puzzle', highscore: 0, aiHint: 'sudoku grid' },
  { id: 4, title: '2048', description: 'Slide numbered tiles to combine them and create a tile with the number 2048.', image: 'https://placehold.co/600x400.png', category: 'Puzzle', highscore: 0, aiHint: 'number puzzle' },
  { id: 5, title: 'Chess', description: 'The ultimate game of strategy. Checkmate your opponent\'s king.', image: 'https://placehold.co/600x400.png', category: 'Strategy', highscore: 0, aiHint: 'chess board' },
  { id: 6, title: 'Battleship', description: 'Strategically place your ships and sink your opponent\'s fleet.', image: 'https://placehold.co/600x400.png', category: 'Strategy', highscore: 0, aiHint: 'battleship game' },
  { id: 8, title: 'Block Stacker', description: 'Test your reflexes and planning in this addictive block-stacking puzzle.', image: 'https://placehold.co/600x400.png', category: 'Puzzle', highscore: 150, aiHint: 'colorful blocks' },
];

export const userProfile = {
  name: 'Gamer123',
  avatar: 'https://placehold.co/100x100.png',
  aiHint: 'gamer avatar'
};
