import { GameState, CrewStatus, NeedType } from '@/core/types';

export const processCrew = (state: GameState): void => {
  state.crew.forEach((crew) => {
    if (!crew.isAlive) return;

    // Decay needs
    crew.needs.forEach((need) => {
      need.value = Math.max(0, need.value - need.decayRate * 0.05);
    });

    // Calculate mood from needs
    const avgNeed = crew.needs.reduce((sum, n) => sum + n.value, 0) / crew.needs.length;
    crew.mood = Math.max(0, Math.min(100, avgNeed));

    // Update stress based on needs
    const lowNeeds = crew.needs.filter((n) => n.value < 30).length;
    crew.stress = Math.min(100, crew.stress + lowNeeds * 0.1);

    // Reduce stress if needs are good
    if (avgNeed > 70) {
      crew.stress = Math.max(0, crew.stress - 0.5);
    }

    // Check for critical need thresholds
    const hunger = crew.needs.find((n) => n.type === NeedType.Hunger);
    if (hunger && hunger.value < 10) {
      crew.health = Math.max(0, crew.health - 0.5);
    }

    // Check for death
    if (crew.health <= 0) {
      crew.isAlive = false;
      crew.status = CrewStatus.Dead;
    }

    // Slowly recover health if well-fed and rested
    const sleep = crew.needs.find((n) => n.type === NeedType.Sleep);
    if (hunger && sleep && hunger.value > 60 && sleep.value > 60) {
      crew.health = Math.min(100, crew.health + 0.1);
    }
  });

  // Update population in victory conditions
  state.victoryConditions.population.current = state.crew.filter((c) => c.isAlive).length;
};
