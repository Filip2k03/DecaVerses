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

export const ConnectFourIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
  </svg>
);
ConnectFourIcon.displayName = 'ConnectFourIcon';

export const PongIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8v8" />
    <path d="M21 8v8" />
    <rect x="11" y="11" width="2" height="2" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
  </svg>
);
PongIcon.displayName = 'PongIcon';

export const AsteroidsIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.5 10.5-5.5-5.5-5.5 5.5-5.5-5.5-2.5 2.5 5.5 5.5-5.5 5.5 2.5 2.5 5.5-5.5 5.5 5.5 5.5-5.5-5.5-5.5z"/>
  </svg>
);
AsteroidsIcon.displayName = 'AsteroidsIcon';

export const MemoryMatchIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <path d="M9 9h6v6H9z" />
    <path d="M12 12l4 4" />
    <path d="M12 12l-4 4" />
  </svg>
);
MemoryMatchIcon.displayName = 'MemoryMatchIcon';

export const SimonSaysIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
    <path d="M2 12h10"/>
    <path d="M12 2v10"/>
  </svg>
);
SimonSaysIcon.displayName = 'SimonSaysIcon';

export const WhacAMoleIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 1 18 0" />
    <path d="M12 12v-2" />
    <path d="M12 22a4 4 0 0 0-4-4h8a4 4 0 0 0-4 4z" />
    <path d="M10 12a2 2 0 1 1 4 0" />
  </svg>
);
WhacAMoleIcon.displayName = 'WhacAMoleIcon';

export const SolitaireIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <path d="M7 7h4v4H7z" />
    <path d="M13 7h4v4h-4z" />
    <path d="M7 13h4v4H7z" />
    <path d="M13 13h4v4h-4z" />
  </svg>
);
SolitaireIcon.displayName = 'SolitaireIcon';

export const HangmanIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0" />
    <path d="M9 12h6" />
    <path d="M12 9v6" />
  </svg>
);
HangmanIcon.displayName = 'HangmanIcon';

export const SpaceInvadersIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8M9 8h6M10 12h4M11 16h2"/>
    <path d="M5 20h14" />
    <path d="M12 16v4" />
  </svg>
);
SpaceInvadersIcon.displayName = 'SpaceInvadersIcon';

export const DoodleJumpIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16h16" />
    <path d="M6 12h12" />
    <path d="M8 8h8" />
    <path d="M12 4v16" />
  </svg>
);
DoodleJumpIcon.displayName = 'DoodleJumpIcon';

export const QuantumBreakoutIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="20" width="20" height="2" rx="1" />
    <circle cx="12" cy="12" r="1.5" />
    <rect x="4" y="2" width="4" height="3" />
    <rect x="10" y="2" width="4" height="3" />
    <rect x="16" y="2" width="4" height="3" />
    <rect x="7" y="6" width="4" height="3" />
    <rect x="13" y="6" width="4" height="3" />
  </svg>
);
QuantumBreakoutIcon.displayName = 'QuantumBreakoutIcon';

export const TowerDefenseIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 4H6v4l6 6 6-6V4z" />
    <path d="M12 14v8" />
    <path d="M8 22h8" />
  </svg>
);
TowerDefenseIcon.displayName = 'TowerDefenseIcon';

export const LogicGatesIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9h4" />
    <path d="M2 15h4" />
    <path d="M18 12h4" />
    <path d="M6 9c4 0 8 6 8 6s-4 6-8 6V9z" />
  </svg>
);
LogicGatesIcon.displayName = 'LogicGatesIcon';

export const CyberJumperIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 4h8v4H8z" />
    <path d="M4 8h16v12H4z" />
    <path d="M10 14h4" />
  </svg>
);
CyberJumperIcon.displayName = 'CyberJumperIcon';

export const DroidAnnihilatorIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V2" />
    <path d="M12 12l-4-4" />
    <path d="M12 12l4-4" />
    <path d="M12 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>
);
DroidAnnihilatorIcon.displayName = 'DroidAnnihilatorIcon';

export const OrbitalDecayIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 0 0-4.44 18.14" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
  </svg>
);
OrbitalDecayIcon.displayName = 'OrbitalDecayIcon';

export const TypingIcon: FC<LucideProps> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10v4" />
    <path d="M10 10v4" />
    <path d="M20 6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
    <path d="m6 10 2 4 2-4" />
    <path d="M14 10v4" />
  </svg>
);
TypingIcon.displayName = 'TypingIcon';
