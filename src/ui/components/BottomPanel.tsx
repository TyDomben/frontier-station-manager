import React from 'react';
import { useGameStore } from '@/core/store';

export const BottomPanel: React.FC = () => {
  const { game } = useGameStore();

  return (
    <div className="bottom-panel">
      {/* Event Log */}
      <div className="bottom-panel-section">
        <div className="bottom-panel-title">Event Log</div>
        <div className="event-log">
          {game.eventHistory.slice(-5).reverse().map((event) => (
            <div
              key={event.id}
              className={`event-item ${event.severity}`}
            >
              {event.title}
            </div>
          ))}
          {game.eventHistory.length === 0 && (
            <div style={{ color: '#666', fontSize: '11px' }}>No events yet</div>
          )}
        </div>
      </div>

      {/* Station Stats */}
      <div className="bottom-panel-section">
        <div className="bottom-panel-title">Station Status</div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Population</span>
            <span className="stat-value">{game.stats.population}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Morale</span>
            <span className="stat-value" style={{
              color: game.stats.averageMorale > 60 ? '#4ade80' :
                     game.stats.averageMorale > 30 ? '#facc15' : '#f87171'
            }}>
              {game.stats.averageMorale.toFixed(0)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Health</span>
            <span className="stat-value" style={{
              color: game.stats.averageHealth > 70 ? '#4ade80' :
                     game.stats.averageHealth > 40 ? '#facc15' : '#f87171'
            }}>
              {game.stats.averageHealth.toFixed(0)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Power</span>
            <span className="stat-value" style={{
              color: game.stats.powerBalance >= 0 ? '#4ade80' : '#f87171'
            }}>
              {game.stats.powerBalance >= 0 ? '+' : ''}{game.stats.powerBalance.toFixed(0)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">O2</span>
            <span className="stat-value" style={{
              color: game.stats.oxygenBalance >= 0 ? '#4ade80' : '#f87171'
            }}>
              {game.stats.oxygenBalance >= 0 ? '+' : ''}{game.stats.oxygenBalance.toFixed(1)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Threat</span>
            <span className="stat-value" style={{
              color: game.stats.threatLevel < 30 ? '#4ade80' :
                     game.stats.threatLevel < 60 ? '#facc15' : '#f87171'
            }}>
              {game.stats.threatLevel.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions / Selected Info */}
      <div className="bottom-panel-section">
        <div className="bottom-panel-title">Victory Progress</div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Population</span>
            <span className="stat-value">
              {game.victoryConditions.population.current}/{game.victoryConditions.population.target}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Wealth</span>
            <span className="stat-value">
              {(game.stats.totalWealth / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Research</span>
            <span className="stat-value">
              {game.stats.researchProgress}/{game.victoryConditions.research.target}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
