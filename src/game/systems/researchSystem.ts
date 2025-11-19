import { GameState, SkillType } from '@/core/types';
import { getTechById } from '@/game/data/technologies';

export const processResearch = (state: GameState): void => {
  if (!state.currentResearch) return;

  const tech = getTechById(state.currentResearch.techId);
  if (!tech) return;

  // Calculate research speed based on assigned researchers
  let researchSpeed = 0;

  state.currentResearch.assignedResearchers.forEach((crewId) => {
    const crew = state.crew.find((c) => c.id === crewId);
    if (!crew || !crew.isAlive) return;

    // Base research speed from Science skill
    const scienceSkill = crew.skills.find((s) => s.type === SkillType.Science);
    const skillLevel = scienceSkill?.level || 1;
    researchSpeed += skillLevel * 0.5;
  });

  // If no researchers, minimal progress
  if (researchSpeed === 0) {
    researchSpeed = 0.1;
  }

  // Apply room bonuses (research labs)
  const researchRooms = state.rooms.filter(
    (r) =>
      r.constructionProgress >= 100 &&
      r.isEnabled &&
      r.powered &&
      (r.type === 'research_lab' || r.type === 'advanced_lab' || r.type === 'computer_core')
  );

  if (researchRooms.length > 0) {
    researchSpeed *= 1 + researchRooms.length * 0.2;
  }

  // Update progress
  state.currentResearch.progress += (researchSpeed / tech.researchCost) * 100 * 0.01;

  // Check if complete
  if (state.currentResearch.progress >= 100) {
    state.technologies[tech.id] = true;
    state.currentResearch = null;

    // Update victory condition
    state.victoryConditions.research.current = Object.values(state.technologies).filter(Boolean).length;
  }
};
