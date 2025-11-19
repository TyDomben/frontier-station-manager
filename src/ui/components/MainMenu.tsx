import React, { useState } from 'react';
import { useGameStore } from '@/core/store';

interface MainMenuProps {
  onStartGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame }) => {
  const { startNewGame, loadGame, saveGame, game } = useGameStore();
  const [showScenarios, setShowScenarios] = useState(false);
  const [showLoad, setShowLoad] = useState(false);

  const scenarios = [
    {
      id: 'fresh_start',
      name: 'Fresh Start',
      description: 'Begin with a small crew and basic resources. A balanced starting point.',
    },
    {
      id: 'emergency_colony',
      name: 'Emergency Colony',
      description: 'Your station was damaged in transit. Resources are limited, time is critical.',
    },
    {
      id: 'rich_expedition',
      name: 'Rich Expedition',
      description: 'Well-funded mission with ample resources, but high expectations.',
    },
    {
      id: 'isolated_outpost',
      name: 'Isolated Outpost',
      description: 'Far from help, you must be completely self-reliant.',
    },
    {
      id: 'scientific_expedition',
      name: 'Scientific Expedition',
      description: 'Focus on research. More scientists, less security.',
    },
  ];

  const handleNewGame = (scenario: string) => {
    startNewGame(scenario);
    onStartGame();
  };

  const handleSave = () => {
    const saveData = saveGame();
    const blob = new Blob([JSON.stringify(saveData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frontier-station-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const saveData = JSON.parse(event.target?.result as string);
        loadGame(saveData);
        onStartGame();
      } catch (err) {
        alert('Failed to load save file');
      }
    };
    reader.readAsText(file);
  };

  if (showScenarios) {
    return (
      <div className="main-menu">
        <h1 className="main-menu-title">Select Scenario</h1>
        <p className="main-menu-subtitle">Choose your starting conditions</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', width: '90%' }}>
          {scenarios.map((scenario) => (
            <div
              key={scenario.id}
              onClick={() => handleNewGame(scenario.id)}
              style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-blue)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                {scenario.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {scenario.description}
              </div>
            </div>
          ))}

          <button
            className="main-menu-btn"
            onClick={() => setShowScenarios(false)}
            style={{ marginTop: '12px' }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-menu">
      <h1 className="main-menu-title">Frontier Station</h1>
      <p className="main-menu-subtitle">Deep Space Colony Management</p>

      <div className="main-menu-buttons">
        {game.tick > 0 && (
          <button className="main-menu-btn primary" onClick={onStartGame}>
            Continue Game
          </button>
        )}

        <button
          className="main-menu-btn"
          onClick={() => setShowScenarios(true)}
        >
          New Game
        </button>

        <button className="main-menu-btn" onClick={() => document.getElementById('load-input')?.click()}>
          Load Game
        </button>
        <input
          id="load-input"
          type="file"
          accept=".json"
          onChange={handleLoad}
          style={{ display: 'none' }}
        />

        {game.tick > 0 && (
          <button className="main-menu-btn" onClick={handleSave}>
            Save Game
          </button>
        )}

        <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
          <div>81 Room Types | 100 Events | 64 Technologies</div>
          <div style={{ marginTop: '4px' }}>Press SPACE to pause | ESC for menu</div>
        </div>
      </div>
    </div>
  );
};
