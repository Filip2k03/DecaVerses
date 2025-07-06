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
  { id: 1, title: 'Galaxy Raiders', description: 'Embark on an epic journey across the galaxy to defeat the alien horde.', image: 'https://placehold.co/600x400.png', category: 'Sci-Fi Shooter', highscore: 12500, aiHint: 'space battle' },
  { id: 2, title: 'Mystic Forest', description: 'Solve ancient puzzles hidden deep within a magical forest.', image: 'https://placehold.co/600x400.png', category: 'Puzzle Adventure', highscore: 8900, aiHint: 'mystic forest' },
  { id: 3, title: 'Speed Rush', description: 'Race against the clock in high-speed, adrenaline-pumping challenges.', image: 'https://placehold.co/600x400.png', category: 'Racing', highscore: 45, aiHint: 'race car' },
  { id: 4, title: 'Dungeon Crawler', description: 'Explore dark dungeons, fight monsters, and find legendary treasures.', image: 'https://placehold.co/600x400.png', category: 'RPG', highscore: 23450, aiHint: 'dungeon warrior' },
  { id: 5, title: 'Pixel Blaster', description: 'A retro-style arcade shooter with a modern twist and explosive action.', image: 'https://placehold.co/600x400.png', category: 'Arcade', highscore: 55400, aiHint: 'pixel art' },
  { id: 6, title: 'Kingdoms Collide', description: 'Build your empire and lead your armies to victory in this strategy epic.', image: 'https://placehold.co/600x400.png', category: 'Strategy', highscore: 9980, aiHint: 'fantasy battle' },
  { id: 7, title: 'Aqua Quest', description: 'Dive into the deep blue sea to uncover lost artifacts and marine life.', image: 'https://placehold.co/600x400.png', category: 'Exploration', highscore: 7600, aiHint: 'underwater world' },
  { id: 8, title: 'Block Stacker', description: 'Test your reflexes and planning in this addictive block-stacking puzzle.', image: 'https://placehold.co/600x400.png', category: 'Puzzle', highscore: 150, aiHint: 'colorful blocks' },
  { id: 9, title: 'Zombie Siege', description: 'Survive waves of zombies with your friends in this co-op shooter.', image: 'https://placehold.co/600x400.png', category: 'Survival', highscore: 32, aiHint: 'zombie apocalypse' },
  { id: 10, title: 'Cosmic Drift', description: 'Drift through asteroid fields and nebulae in a relaxing space flight sim.', image: 'https://placehold.co/600x400.png', category: 'Simulation', highscore: 1890, aiHint: 'cosmic nebula' },
];

export const userProfile = {
  name: 'Gamer123',
  avatar: 'https://placehold.co/100x100.png',
  aiHint: 'gamer avatar'
};
