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
  { id: 9, title: 'Claw Machine', description: 'Test your skill and luck to grab prizes!', category: 'Arcade', icon: 'ClawMachineIcon' },
  { id: 10, title: 'Connect Four', description: 'Get four of your colored discs in a row to win.', category: 'Strategy', icon: 'ConnectFourIcon' },
  { id: 11, title: 'Pong', description: 'The original arcade classic. Don\'t let the ball pass.', category: 'Arcade', icon: 'PongIcon' },
  { id: 12, title: 'Asteroids', description: 'Blast asteroids and survive the debris field.', category: 'Arcade', icon: 'AsteroidsIcon' },
  { id: 13, title: 'Memory Match', description: 'Flip cards and find all the matching pairs.', category: 'Puzzle', icon: 'MemoryMatchIcon' },
  { id: 14, title: 'Simon Says', description: 'Follow the pattern of lights and sounds.', category: 'Puzzle', icon: 'SimonSaysIcon' },
  { id: 15, title: 'Whac-A-Mole', description: 'Test your reflexes and whack the moles!', category: 'Arcade', icon: 'WhacAMoleIcon' },
  { id: 16, title: 'Solitaire', description: 'The timeless single-player card game.', category: 'Strategy', icon: 'SolitaireIcon' },
  { id: 17, title: 'Hangman', description: 'Guess the word before the time runs out!', category: 'Puzzle', icon: 'HangmanIcon' },
  { id: 18, title: 'Space Invaders', description: 'Defend the earth from waves of alien invaders.', category: 'Arcade', icon: 'SpaceInvadersIcon' },
  { id: 19, title: 'Doodle Jump', description: 'An endless platformer. How high can you get?', category: 'Arcade', icon: 'DoodleJumpIcon' },
  { id: 20, title: 'Quantum Breakout', description: 'Bounce a quantum particle to destroy data blocks.', category: 'Arcade', icon: 'QuantumBreakoutIcon'},
  { id: 21, title: 'Tower Defense 2077', description: 'Defend your server from waves of malicious data packets.', category: 'Strategy', icon: 'TowerDefenseIcon'},
  { id: 22, title: 'Logic Gates', description: 'Solve puzzles by wiring up digital logic gates.', category: 'Puzzle', icon: 'LogicGatesIcon'},
];
