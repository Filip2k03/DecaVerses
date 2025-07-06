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

export const ClawMachineIcon: FC<LucideProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v12"/>
        <path d="M16 17c0-2.21-1.79-4-4-4s-4 1.79-4 4"/>
        <path d="M4 17c0-2.21 1.79-4 4-4"/>
        <path d="M20 17c0-2.21-1.79-4-4-4"/>
        <path d="m12 5-2-2a2.5 2.5 0 0 1 4 0l-2 2Z"/>
    </svg>
);
ClawMachineIcon.displayName = 'ClawMachineIcon';

export const AlienIcon: FC<LucideProps> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c0-3 2-5 2-5s2 2 2 5c0 3-2 5-2 5s-2-2-2-5Z" />
        <path d="M12 12c0-3-2-5-2-5s-2 2-2 5c0 3 2 5 2 5s2-2 2-5Z" />
        <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
        <path d="M12 3a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9Z" />
    </svg>
);
AlienIcon.displayName = 'AlienIcon';

export const BearIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"/>
    <path d="M12 18.5c-3.3 0-6-2.5-6-5.5V10h12v3c0 3-2.7 5.5-6 5.5Z"/>
    <path d="M6 9h.01"/>
    <path d="M18 9h.01"/>
    <path d="M12 14v.01"/>
  </svg>
);
BearIcon.displayName = 'BearIcon';
