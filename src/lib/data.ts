export type Game = {
  id: number;
  title: string;
  description: string;
  category: string;
  highscore: number;
  icon: string;
};

export const games: Game[] = [
  { id: 1, title: 'Tic-Tac-Toe', description: 'The classic game of noughts and crosses.', category: 'Strategy', highscore: 50, icon: 'TicTacToeIcon' },
  { id: 2, title: 'Snake', description: 'Guide the snake to eat food and grow longer.', category: 'Arcade', highscore: 520, icon: 'SnakeIcon' },
  { id: 3, title: 'Sudoku', description: 'A logic-based number puzzle. Fill the 9x9 grid.', category: 'Puzzle', highscore: 1200, icon: 'Sudoku' },
  { id: 4, title: '2048', description: 'Slide tiles to combine them and reach 2048.', category: 'Puzzle', highscore: 2048, icon: '2048' },
  { id: 5, title: 'Chess', description: 'The ultimate game of strategy. Checkmate the king.', category: 'Strategy', highscore: 800, icon: 'Chess' },
  { id: 6, title: 'Battleship', description: 'Place your ships and sink the opponent\'s fleet.', category: 'Strategy', highscore: 1700, icon: 'Battleship' },
  { id: 8, title: 'Block Stacker', description: 'Stack falling blocks to clear lines.', category: 'Puzzle', highscore: 1550, icon: 'BlockStacker' },
];

export const userProfile = {
  name: 'Gamer123',
  avatar: 'https://placehold.co/100x100.png',
  aiHint: 'gamer avatar'
};
