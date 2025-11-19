import React from 'react';
import { useGameStore } from '@/core/store';

export const EventModal: React.FC = () => {
  const { game, resolveEvent } = useGameStore();

  // Get the first active event with choices
  const activeEvent = game.events.find((e) => e.choices && e.choices.length > 0);

  if (!activeEvent) return null;

  const handleChoice = (choiceId: string) => {
    resolveEvent(activeEvent.id, choiceId);
  };

  const handleDismiss = () => {
    resolveEvent(activeEvent.id);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#f87171';
      case 'major':
        return '#fb923c';
      case 'moderate':
        return '#facc15';
      default:
        return '#4ade80';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleDismiss}>
      <div
        className="modal fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${getSeverityColor(activeEvent.severity)}` }}
      >
        <div className="modal-title">{activeEvent.title}</div>
        <div className="modal-description">{activeEvent.description}</div>

        {activeEvent.choices && activeEvent.choices.length > 0 ? (
          <div className="modal-choices">
            {activeEvent.choices.map((choice) => (
              <button
                key={choice.id}
                className="modal-choice"
                onClick={() => handleChoice(choice.id)}
              >
                <div className="modal-choice-text">{choice.text}</div>
                {choice.requirements && (
                  <div className="modal-choice-effect">
                    {choice.requirements.skill && (
                      <span>
                        Requires: {choice.requirements.skill.type} Lvl {choice.requirements.skill.level}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <button
            className="modal-choice"
            onClick={handleDismiss}
            style={{ textAlign: 'center' }}
          >
            <div className="modal-choice-text">Acknowledge</div>
          </button>
        )}
      </div>
    </div>
  );
};
