import React from 'react';
import { useGameStore } from '@/core/store';
import { ResourceType } from '@/core/types';

export const TopBar: React.FC = () => {
  const { game, togglePause, setGameSpeed } = useGameStore();

  const formatTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `Day ${days + 1} ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toFixed(0);
  };

  const resources = [
    { type: ResourceType.Oxygen, label: 'O2', icon: '💨', color: '#4a9eff' },
    { type: ResourceType.Power, label: 'PWR', icon: '⚡', color: '#facc15' },
    { type: ResourceType.Food, label: 'Food', icon: '🍎', color: '#4ade80' },
    { type: ResourceType.Water, label: 'H2O', icon: '💧', color: '#60a5fa' },
    { type: ResourceType.Metal, label: 'Metal', icon: '🔩', color: '#9ca3af' },
  ];

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <span className="station-name">{game.name}</span>
        <span style={{ color: '#666', fontSize: '12px' }}>
          Pop: {game.crew.filter(c => c.isAlive).length}
        </span>
      </div>

      <div className="top-bar-center">
        {resources.map((res) => (
          <div key={res.type} className="resource-item">
            <span>{res.icon}</span>
            <span className="resource-value" style={{ color: res.color }}>
              {formatNumber(game.resources[res.type] || 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="top-bar-right">
        <div className="time-controls">
          <button
            className={`time-btn ${game.isPaused ? 'active' : ''}`}
            onClick={togglePause}
          >
            {game.isPaused ? '▶' : '⏸'}
          </button>
          <button
            className={`time-btn ${!game.isPaused && game.gameSpeed === 1 ? 'active' : ''}`}
            onClick={() => { setGameSpeed(1); if (game.isPaused) togglePause(); }}
          >
            1x
          </button>
          <button
            className={`time-btn ${!game.isPaused && game.gameSpeed === 2 ? 'active' : ''}`}
            onClick={() => { setGameSpeed(2); if (game.isPaused) togglePause(); }}
          >
            2x
          </button>
          <button
            className={`time-btn ${!game.isPaused && game.gameSpeed === 4 ? 'active' : ''}`}
            onClick={() => { setGameSpeed(4); if (game.isPaused) togglePause(); }}
          >
            4x
          </button>
        </div>
        <span className="game-time">{formatTime(game.gameTime)}</span>
      </div>
    </div>
  );
};
