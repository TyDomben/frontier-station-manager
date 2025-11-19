import React, { useEffect, useCallback } from 'react';
import { useGameStore } from '@/core/store';
import { GameCanvas } from '@/ui/components/GameCanvas';
import { TopBar } from '@/ui/components/TopBar';
import { SidePanel } from '@/ui/components/SidePanel';
import { BottomPanel } from '@/ui/components/BottomPanel';
import { EventModal } from '@/ui/components/EventModal';
import { MainMenu } from '@/ui/components/MainMenu';
import './styles.css';

const App: React.FC = () => {
  const { game, tick, togglePause } = useGameStore();
  const [showMainMenu, setShowMainMenu] = React.useState(true);

  // Game loop
  useEffect(() => {
    if (showMainMenu) return;

    const interval = setInterval(() => {
      tick();
    }, 1000 / game.gameSpeed);

    return () => clearInterval(interval);
  }, [tick, game.gameSpeed, showMainMenu]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
      if (e.key === 'Escape') {
        setShowMainMenu(true);
      }
    },
    [togglePause]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (showMainMenu) {
    return <MainMenu onStartGame={() => setShowMainMenu(false)} />;
  }

  return (
    <div className="app">
      <TopBar />
      <div className="main-content">
        <SidePanel />
        <GameCanvas />
      </div>
      <BottomPanel />
      <EventModal />
    </div>
  );
};

export default App;
