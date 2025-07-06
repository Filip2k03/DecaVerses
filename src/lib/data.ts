export type Game = {
  id: number;
  title: string;
  description: string;
  category: string;
  icon: string;
};

export const games: Game[] = [
  { id: 1, title: 'Tic-Tac-Toe', description: 'The classic game of noughts and crosses.', category: 'Strategy', icon: 'TicTacToeIcon' },
  { id: 2, title: 'Snake', description: 'Guide the snake to eat food and grow longer.', category: 'Arcade', icon: 'SnakeIcon' },
  { id: 3, title: 'Sudoku', description: 'A logic-based number puzzle. Fill the 9x9 grid.', category: 'Puzzle', icon: 'Sudoku' },
  { id: 4, title: '2048', description: 'Slide tiles to combine them and reach 2048.', category: 'Puzzle', icon: '2048' },
  { id: 5, title: 'Chess', description: 'The ultimate game of strategy. Checkmate the king.', category: 'Strategy', icon: 'Chess' },
  { id: 6, title: 'Battleship', description: 'Place your ships and sink the opponent\'s fleet.', category: 'Strategy', icon: 'Battleship' },
  { id: 7, title: 'Minesweeper', description: 'Avoid the bombs! A classic logic puzzle.', category: 'Puzzle', icon: 'Minesweeper'},
  { id: 8, title: 'Block Stacker', description: 'Stack falling blocks to clear lines.', category: 'Puzzle', icon: 'BlockStacker' },
];
