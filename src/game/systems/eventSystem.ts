import { v4 as uuidv4 } from 'uuid';
import { GameState, EventSeverity } from '@/core/types';
import { rollForEvent } from '@/game/data/events';

export const processEvents = (state: GameState): void => {
  // Roll for random events periodically (every ~minute of game time)
  if (state.gameTime % 60 === 0) {
    const event = rollForEvent(state.settings.eventFrequency);

    if (event) {
      // Check conditions
      let meetsConditions = true;

      if (event.conditions) {
        for (const condition of event.conditions) {
          switch (condition.type) {
            case 'min_crew':
              if (state.crew.filter((c) => c.isAlive).length < (condition.value as number)) {
                meetsConditions = false;
              }
              break;
            case 'max_crew':
              if (state.crew.filter((c) => c.isAlive).length > (condition.value as number)) {
                meetsConditions = false;
              }
              break;
            case 'has_room':
              if (!state.rooms.some((r) => r.type === condition.value)) {
                meetsConditions = false;
              }
              break;
            case 'has_tech':
              if (!state.technologies[condition.value as string]) {
                meetsConditions = false;
              }
              break;
          }
        }
      }

      if (meetsConditions) {
        state.events.push({
          id: uuidv4(),
          type: event.type,
          category: event.category,
          severity: event.severity as EventSeverity,
          title: event.title,
          description: event.description,
          choices: event.choices,
          effects: event.effects as any[],
          timestamp: state.gameTime,
        });
      }
    }
  }

  // Auto-resolve events without choices after some time
  state.events = state.events.filter((event) => {
    if (!event.choices || event.choices.length === 0) {
      // Move to history
      state.eventHistory.push(event);
      return false;
    }
    return true;
  });
};
