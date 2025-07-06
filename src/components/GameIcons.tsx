import type { FC } from 'react';
import type { LucideProps } from 'lucide-react';

export const TicTacToeIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    <path d="M12 2a10 10 0 1 0 10 10" strokeWidth="1.5" />
  </svg>
);
TicTacToeIcon.displayName = 'TicTacToeIcon';

export const SnakeIcon: FC<LucideProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>
        <path d="m21 9-3.5-3.5"/>
        <path d="M3 15l3.5 3.5"/>
        <path d="M17.5 17.5 15 21"/>
        <path d="M9 3l-3.5 3.5"/>
        <path d="M5.5 17.5 9 21"/>
        <path d="M3 9l3.5-3.5"/>
  </svg>
);
SnakeIcon.displayName = 'SnakeIcon';
