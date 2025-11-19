import { GameState, ResourceType } from '@/core/types';
import { ROOM_DEFINITIONS } from '@/game/data/rooms';

export const processResources = (state: GameState): void => {
  // Process each room's production and consumption
  state.rooms.forEach((room) => {
    if (room.constructionProgress < 100) return;
    if (!room.isEnabled || !room.powered) return;

    const def = ROOM_DEFINITIONS[room.type];
    if (!def) return;

    // Resource production
    if (def.resourceProduction) {
      def.resourceProduction.forEach((prod) => {
        // Simplified - produce per tick instead of interval
        const amount = prod.amount * 0.01;
        state.resources[prod.resource] = (state.resources[prod.resource] || 0) + amount;
      });
    }

    // Resource consumption
    if (def.resourceConsumption) {
      def.resourceConsumption.forEach((cons) => {
        const amount = cons.amount * 0.01;
        const current = state.resources[cons.resource] || 0;
        state.resources[cons.resource] = Math.max(0, current - amount);
      });
    }
  });

  // Cap resources
  const caps: { [key: string]: number } = {
    [ResourceType.Oxygen]: 10000,
    [ResourceType.Water]: 5000,
    [ResourceType.Food]: 5000,
    [ResourceType.Power]: 10000,
    [ResourceType.Metal]: 10000,
    [ResourceType.Plastic]: 5000,
    [ResourceType.Glass]: 3000,
    [ResourceType.Electronics]: 2000,
  };

  Object.entries(caps).forEach(([resource, cap]) => {
    if (state.resources[resource] > cap) {
      state.resources[resource] = cap;
    }
  });
};
