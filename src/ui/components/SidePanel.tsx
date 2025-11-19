import React, { useState } from 'react';
import { useGameStore } from '@/core/store';
import { RoomCategory, RoomType, UIMode } from '@/core/types';
import { ROOM_DEFINITIONS, getRoomsByCategory } from '@/game/data/rooms';

type TabType = 'build' | 'crew' | 'research';

const CATEGORY_LABELS: { [key in RoomCategory]: string } = {
  [RoomCategory.Living]: 'Living',
  [RoomCategory.Production]: 'Production',
  [RoomCategory.Power]: 'Power',
  [RoomCategory.LifeSupport]: 'Life Support',
  [RoomCategory.Medical]: 'Medical',
  [RoomCategory.Research]: 'Research',
  [RoomCategory.Recreation]: 'Recreation',
  [RoomCategory.Storage]: 'Storage',
  [RoomCategory.Command]: 'Command',
  [RoomCategory.Security]: 'Security',
  [RoomCategory.Docking]: 'Docking',
  [RoomCategory.Engineering]: 'Engineering',
};

export const SidePanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('build');
  const { game, ui, setUIMode, setSelectedBuildRoom, selectCrew } = useGameStore();

  return (
    <div className="side-panel">
      <div className="side-panel-tabs">
        <button
          className={`side-panel-tab ${activeTab === 'build' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('build');
            setUIMode(UIMode.Build);
          }}
        >
          Build
        </button>
        <button
          className={`side-panel-tab ${activeTab === 'crew' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('crew');
            setUIMode(UIMode.Normal);
          }}
        >
          Crew
        </button>
        <button
          className={`side-panel-tab ${activeTab === 'research' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('research');
            setUIMode(UIMode.Normal);
          }}
        >
          Research
        </button>
      </div>

      <div className="side-panel-content">
        {activeTab === 'build' && <BuildMenu />}
        {activeTab === 'crew' && <CrewList />}
        {activeTab === 'research' && <ResearchPanel />}
      </div>
    </div>
  );
};

const BuildMenu: React.FC = () => {
  const { ui, setSelectedBuildRoom, game } = useGameStore();
  const [expandedCategory, setExpandedCategory] = useState<RoomCategory | null>(
    RoomCategory.Living
  );

  const categories = Object.values(RoomCategory);

  const canAfford = (type: RoomType): boolean => {
    const def = ROOM_DEFINITIONS[type];
    if (!def) return false;
    return def.baseCost.every(
      (cost) => (game.resources[cost.type] || 0) >= cost.amount
    );
  };

  return (
    <div>
      {categories.map((category) => (
        <div key={category} className="build-category">
          <div
            className="build-category-title"
            onClick={() =>
              setExpandedCategory(
                expandedCategory === category ? null : category
              )
            }
            style={{ cursor: 'pointer' }}
          >
            {expandedCategory === category ? '▼' : '▶'} {CATEGORY_LABELS[category]}
          </div>
          {expandedCategory === category && (
            <div className="build-items">
              {getRoomsByCategory(category).map((room) => (
                <div
                  key={room.type}
                  className={`build-item ${
                    ui.selectedBuildRoom === room.type ? 'selected' : ''
                  } ${!canAfford(room.type) ? 'disabled' : ''}`}
                  onClick={() => {
                    if (canAfford(room.type)) {
                      setSelectedBuildRoom(
                        ui.selectedBuildRoom === room.type ? null : room.type
                      );
                    }
                  }}
                  style={{ opacity: canAfford(room.type) ? 1 : 0.5 }}
                >
                  <div className="build-item-icon">
                    {room.basePowerProduction > 0 ? '⚡' :
                     room.baseOxygenProduction > 0 ? '💨' :
                     room.category === RoomCategory.Medical ? '🏥' :
                     room.category === RoomCategory.Security ? '🛡️' :
                     '🏠'}
                  </div>
                  <div className="build-item-name">{room.name}</div>
                  <div className="build-item-cost">
                    {room.baseCost[0]?.amount || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CrewList: React.FC = () => {
  const { game, ui, selectCrew } = useGameStore();

  return (
    <div className="crew-list">
      {game.crew.filter(c => c.isAlive).map((crew) => (
        <div
          key={crew.id}
          className={`crew-card ${ui.selectedCrew === crew.id ? 'selected' : ''}`}
          onClick={() => selectCrew(crew.id)}
        >
          <div className="crew-name">{crew.name}</div>
          <div className="crew-status">{crew.status} • Age {crew.age}</div>
          <div className="crew-bars">
            <div className="crew-bar">
              <span className="crew-bar-label">Health</span>
              <div className="crew-bar-track">
                <div
                  className="crew-bar-fill health"
                  style={{ width: `${crew.health}%` }}
                />
              </div>
            </div>
            <div className="crew-bar">
              <span className="crew-bar-label">Mood</span>
              <div className="crew-bar-track">
                <div
                  className="crew-bar-fill mood"
                  style={{ width: `${crew.mood}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
      {game.crew.length === 0 && (
        <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
          No crew members
        </div>
      )}
    </div>
  );
};

const ResearchPanel: React.FC = () => {
  const { game } = useGameStore();

  return (
    <div>
      <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>
        Research Progress: {Object.values(game.technologies).filter(Boolean).length} / 64
      </div>
      {game.currentResearch ? (
        <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px' }}>
          <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
            Researching: {game.currentResearch.techId}
          </div>
          <div className="crew-bar-track">
            <div
              className="crew-bar-fill"
              style={{
                width: `${game.currentResearch.progress}%`,
                background: 'var(--accent-purple)',
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
          No active research
        </div>
      )}
    </div>
  );
};
