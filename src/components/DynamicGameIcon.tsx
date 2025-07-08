import type { FC } from 'react';
import type { LucideProps } from 'lucide-react';
import { Blocks, Ship, Crown, Calculator, Grid3x3, Bomb } from 'lucide-react';
import { TicTacToeIcon, SnakeIcon, ClawMachineIcon, BearIcon, ConnectFourIcon, PongIcon, AsteroidsIcon, MemoryMatchIcon, SimonSaysIcon, WhacAMoleIcon, SolitaireIcon, HangmanIcon, SpaceInvadersIcon, DoodleJumpIcon, QuantumBreakoutIcon, TowerDefenseIcon, LogicGatesIcon } from '@/components/GameIcons';

const iconMap: Record<string, FC<LucideProps>> = {
  TicTacToeIcon,
  SnakeIcon,
  Sudoku: Grid3x3,
  '2048': Calculator,
  Chess: Crown,
  Battleship: Ship,
  Minesweeper: Bomb,
  BlockStacker: Blocks,
  ClawMachineIcon,
  BearIcon,
  ConnectFourIcon,
  PongIcon,
  AsteroidsIcon,
  MemoryMatchIcon,
  SimonSaysIcon,
  WhacAMoleIcon,
  SolitaireIcon,
  HangmanIcon,
  SpaceInvadersIcon,
  DoodleJumpIcon,
  QuantumBreakoutIcon,
  TowerDefenseIcon,
  LogicGatesIcon,
};

interface DynamicGameIconProps extends LucideProps {
  iconName: string;
}

export function DynamicGameIcon({ iconName, ...props }: DynamicGameIconProps) {
  const Icon = iconMap[iconName];
  if (!Icon) {
    return null;
  }
  return <Icon {...props} />;
}
