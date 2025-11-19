import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  GameState,
  UIState,
  UIMode,
  OverlayType,
  Room,
  RoomType,
  CrewMember,
  ResourceType,
  Task,
  GameEvent,
  Ship,
  EntityId,
  ResourceStorage,
  StationStats,
} from './types';
import { ROOM_DEFINITIONS } from '@/game/data/rooms';
import { generateCrewMember } from '@/game/entities/crew';

// Initialize default resources
const createDefaultResources = (): ResourceStorage => ({
  [ResourceType.Oxygen]: 1000,
  [ResourceType.Water]: 500,
  [ResourceType.Food]: 300,
  [ResourceType.Power]: 0,
  [ResourceType.Metal]: 200,
  [ResourceType.Plastic]: 100,
  [ResourceType.Glass]: 50,
  [ResourceType.Electronics]: 30,
  [ResourceType.Fuel]: 100,
  [ResourceType.MedicalSupplies]: 50,
  [ResourceType.ResearchData]: 0,
  [ResourceType.Waste]: 0,
  [ResourceType.CO2]: 0,
});

// Calculate station stats
const calculateStats = (state: GameState): StationStats => {
  const livingCrew = state.crew.filter((c) => c.isAlive);
  const population = livingCrew.length;

  return {
    population,
    maxPopulation: state.rooms.filter((r) => r.type === RoomType.LivingQuarters).length * 2 +
      state.rooms.filter((r) => r.type === RoomType.Dormitory).length * 4,
    averageMorale: population > 0 ? livingCrew.reduce((sum, c) => sum + c.mood, 0) / population : 0,
    averageHealth: population > 0 ? livingCrew.reduce((sum, c) => sum + c.health, 0) / population : 0,
    powerBalance: calculatePowerBalance(state),
    oxygenBalance: calculateOxygenBalance(state),
    totalWealth: calculateWealth(state.resources),
    researchProgress: Object.values(state.technologies).filter(Boolean).length,
    reputation: state.factions.reduce((sum, f) => sum + f.reputation, 0) / Math.max(1, state.factions.length),
    threatLevel: calculateThreatLevel(state),
  };
};

const calculatePowerBalance = (state: GameState): number => {
  let production = 0;
  let consumption = 0;

  state.rooms.forEach((room) => {
    if (room.constructionProgress >= 100 && room.isEnabled) {
      const def = ROOM_DEFINITIONS[room.type];
      if (def) {
        production += def.basePowerProduction;
        consumption += def.basePowerConsumption;
      }
    }
  });

  return production - consumption;
};

const calculateOxygenBalance = (state: GameState): number => {
  let production = 0;
  let consumption = 0;

  state.rooms.forEach((room) => {
    if (room.constructionProgress >= 100 && room.isEnabled && room.powered) {
      const def = ROOM_DEFINITIONS[room.type];
      if (def) {
        production += def.baseOxygenProduction;
        consumption += def.baseOxygenConsumption;
      }
    }
  });

  // Crew consume oxygen
  consumption += state.crew.filter((c) => c.isAlive).length * 0.5;

  return production - consumption;
};

const calculateWealth = (resources: ResourceStorage): number => {
  const values: { [key: string]: number } = {
    [ResourceType.Metal]: 1,
    [ResourceType.Plastic]: 2,
    [ResourceType.Glass]: 3,
    [ResourceType.Electronics]: 10,
    [ResourceType.AdvancedMaterials]: 25,
    [ResourceType.RareMinerals]: 50,
    [ResourceType.AlienArtifacts]: 100,
    [ResourceType.LuxuryGoods]: 30,
  };

  return Object.entries(resources).reduce((sum, [type, amount]) => {
    return sum + (values[type] || 0) * amount;
  }, 0);
};

const calculateThreatLevel = (state: GameState): number => {
  let threat = 0;

  // Hostile factions increase threat
  state.factions.forEach((f) => {
    if (f.reputation < -50) threat += 20;
    else if (f.reputation < 0) threat += 10;
  });

  // Low resources increase threat
  if (state.resources[ResourceType.Oxygen] < 100) threat += 30;
  if (state.resources[ResourceType.Food] < 50) threat += 20;

  // Active dangerous events
  state.events.forEach((e) => {
    if (e.severity === 'critical') threat += 30;
    else if (e.severity === 'major') threat += 15;
  });

  return Math.min(100, threat);
};

// Create initial game state
const createInitialGameState = (scenario: string = 'fresh_start'): GameState => {
  const state: GameState = {
    id: uuidv4(),
    name: 'New Station',
    seed: Math.floor(Math.random() * 1000000),
    tick: 0,
    gameTime: 0,
    isPaused: true,
    gameSpeed: 1,
    settings: {
      difficulty: 'normal',
      scenario,
      eventFrequency: 1,
      resourceMultiplier: 1,
      autoSave: true,
      gameSpeed: 1,
    },
    rooms: [],
    gridSize: { width: 100, height: 100 },
    crew: [],
    resources: createDefaultResources(),
    resourceHistory: [],
    tasks: [],
    events: [],
    eventHistory: [],
    technologies: {},
    currentResearch: null,
    ships: [],
    missions: [],
    factions: [],
    tradeOffers: [],
    contracts: [],
    stats: {
      population: 0,
      maxPopulation: 0,
      averageMorale: 0,
      averageHealth: 0,
      powerBalance: 0,
      oxygenBalance: 0,
      totalWealth: 0,
      researchProgress: 0,
      reputation: 0,
      threatLevel: 0,
    },
    victoryConditions: {
      population: { current: 0, target: 100 },
      wealth: { current: 0, target: 100000 },
      research: { current: 0, target: 60 },
      reputation: { current: 0, target: 100 },
    },
  };

  // Add starting rooms based on scenario
  if (scenario === 'fresh_start') {
    // Command center
    state.rooms.push(createRoom(RoomType.CommandCenter, { x: 48, y: 48 }));
    // Living quarters
    state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 45, y: 48 }));
    state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 51, y: 48 }));
    // Power
    state.rooms.push(createRoom(RoomType.SolarPanel, { x: 48, y: 45 }));
    // Life support
    state.rooms.push(createRoom(RoomType.OxygenGenerator, { x: 48, y: 51 }));
    // Storage
    state.rooms.push(createRoom(RoomType.CargoHold, { x: 45, y: 51 }));

    // Starting crew (5 colonists)
    for (let i = 0; i < 5; i++) {
      state.crew.push(generateCrewMember());
    }
  }

  state.stats = calculateStats(state);

  return state;
};

// Helper to create a room
const createRoom = (type: RoomType, position: { x: number; y: number }): Room => ({
  id: uuidv4(),
  type,
  position,
  rotation: 0,
  condition: 100,
  powered: true,
  oxygenated: true,
  temperature: 21,
  pressure: 101,
  assignedCrew: [],
  constructionProgress: 100,
  isEnabled: true,
});

// Game store interface
interface GameStore {
  // Game state
  game: GameState;

  // UI state
  ui: UIState;

  // Game actions
  startNewGame: (scenario?: string) => void;
  loadGame: (state: GameState) => void;
  saveGame: () => GameState;

  // Time control
  togglePause: () => void;
  setGameSpeed: (speed: number) => void;
  tick: () => void;

  // Building
  placeRoom: (type: RoomType, position: { x: number; y: number }) => void;
  removeRoom: (roomId: EntityId) => void;
  toggleRoom: (roomId: EntityId) => void;

  // Crew
  assignCrew: (crewId: EntityId, roomId: EntityId) => void;
  unassignCrew: (crewId: EntityId) => void;
  hireCrew: () => void;

  // Resources
  addResource: (type: ResourceType, amount: number) => void;
  removeResource: (type: ResourceType, amount: number) => boolean;
  transferResources: (from: ResourceStorage, to: ResourceStorage, type: ResourceType, amount: number) => boolean;

  // Tasks
  createTask: (task: Omit<Task, 'id'>) => void;
  completeTask: (taskId: EntityId) => void;
  cancelTask: (taskId: EntityId) => void;

  // Events
  triggerEvent: (event: Omit<GameEvent, 'id' | 'timestamp'>) => void;
  resolveEvent: (eventId: EntityId, choiceId?: string) => void;

  // Research
  startResearch: (techId: string) => void;
  assignResearcher: (crewId: EntityId) => void;
  removeResearcher: (crewId: EntityId) => void;

  // Ships
  launchShip: (shipId: EntityId, missionType: string, destination: { x: number; y: number }) => void;
  recallShip: (shipId: EntityId) => void;

  // UI actions
  setUIMode: (mode: UIMode) => void;
  selectRoom: (roomId: EntityId | null) => void;
  selectCrew: (crewId: EntityId | null) => void;
  setSelectedBuildRoom: (type: RoomType | null) => void;
  setOverlay: (overlay: OverlayType) => void;
  setCameraPosition: (position: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  game: createInitialGameState(),

  ui: {
    mode: UIMode.Normal,
    selectedRoom: null,
    selectedCrew: null,
    selectedBuildRoom: null,
    overlay: OverlayType.None,
    cameraPosition: { x: 50, y: 50 },
    zoom: 1,
    showGrid: true,
  },

  // Game actions
  startNewGame: (scenario = 'fresh_start') => {
    set({ game: createInitialGameState(scenario) });
  },

  loadGame: (state) => {
    set({ game: state });
  },

  saveGame: () => {
    return get().game;
  },

  // Time control
  togglePause: () => {
    set((state) => ({
      game: { ...state.game, isPaused: !state.game.isPaused },
    }));
  },

  setGameSpeed: (speed) => {
    set((state) => ({
      game: { ...state.game, gameSpeed: speed },
    }));
  },

  tick: () => {
    set((state) => {
      if (state.game.isPaused) return state;

      const newTick = state.game.tick + 1;
      const newGameTime = state.game.gameTime + state.game.gameSpeed;

      // Update stats
      const newStats = calculateStats(state.game);

      // Process resources (simplified)
      const newResources = { ...state.game.resources };

      // Power balance
      if (newStats.powerBalance >= 0) {
        // Power rooms
        state.game.rooms.forEach((room) => {
          if (room.constructionProgress >= 100) {
            room.powered = true;
          }
        });
      }

      // Oxygen balance
      if (newStats.oxygenBalance > 0) {
        newResources[ResourceType.Oxygen] = Math.min(
          (newResources[ResourceType.Oxygen] || 0) + newStats.oxygenBalance * 0.1,
          10000
        );
      } else {
        newResources[ResourceType.Oxygen] = Math.max(
          0,
          (newResources[ResourceType.Oxygen] || 0) + newStats.oxygenBalance * 0.1
        );
      }

      // Crew needs decay
      const updatedCrew = state.game.crew.map((crew) => {
        if (!crew.isAlive) return crew;

        const updatedNeeds = crew.needs.map((need) => ({
          ...need,
          value: Math.max(0, need.value - need.decayRate * 0.01),
        }));

        // Calculate mood based on needs
        const avgNeed = updatedNeeds.reduce((sum, n) => sum + n.value, 0) / updatedNeeds.length;
        const newMood = Math.max(0, Math.min(100, avgNeed));

        return {
          ...crew,
          needs: updatedNeeds,
          mood: newMood,
        };
      });

      return {
        game: {
          ...state.game,
          tick: newTick,
          gameTime: newGameTime,
          resources: newResources,
          crew: updatedCrew,
          stats: newStats,
        },
      };
    });
  },

  // Building
  placeRoom: (type, position) => {
    const def = ROOM_DEFINITIONS[type];
    if (!def) return;

    // Check resources
    const resources = get().game.resources;
    const canAfford = def.baseCost.every(
      (cost) => (resources[cost.type] || 0) >= cost.amount
    );

    if (!canAfford) return;

    set((state) => {
      // Deduct resources
      const newResources = { ...state.game.resources };
      def.baseCost.forEach((cost) => {
        newResources[cost.type] = (newResources[cost.type] || 0) - cost.amount;
      });

      const newRoom: Room = {
        id: uuidv4(),
        type,
        position,
        rotation: 0,
        condition: 100,
        powered: false,
        oxygenated: false,
        temperature: 21,
        pressure: 101,
        assignedCrew: [],
        constructionProgress: 0,
        isEnabled: true,
      };

      return {
        game: {
          ...state.game,
          rooms: [...state.game.rooms, newRoom],
          resources: newResources,
        },
      };
    });
  },

  removeRoom: (roomId) => {
    set((state) => ({
      game: {
        ...state.game,
        rooms: state.game.rooms.filter((r) => r.id !== roomId),
      },
    }));
  },

  toggleRoom: (roomId) => {
    set((state) => ({
      game: {
        ...state.game,
        rooms: state.game.rooms.map((r) =>
          r.id === roomId ? { ...r, isEnabled: !r.isEnabled } : r
        ),
      },
    }));
  },

  // Crew
  assignCrew: (crewId, roomId) => {
    set((state) => ({
      game: {
        ...state.game,
        crew: state.game.crew.map((c) =>
          c.id === crewId ? { ...c, assignedRoom: roomId } : c
        ),
        rooms: state.game.rooms.map((r) =>
          r.id === roomId
            ? { ...r, assignedCrew: [...r.assignedCrew, crewId] }
            : r
        ),
      },
    }));
  },

  unassignCrew: (crewId) => {
    set((state) => {
      const crew = state.game.crew.find((c) => c.id === crewId);
      if (!crew?.assignedRoom) return state;

      return {
        game: {
          ...state.game,
          crew: state.game.crew.map((c) =>
            c.id === crewId ? { ...c, assignedRoom: null } : c
          ),
          rooms: state.game.rooms.map((r) =>
            r.id === crew.assignedRoom
              ? { ...r, assignedCrew: r.assignedCrew.filter((id) => id !== crewId) }
              : r
          ),
        },
      };
    });
  },

  hireCrew: () => {
    set((state) => ({
      game: {
        ...state.game,
        crew: [...state.game.crew, generateCrewMember()],
      },
    }));
  },

  // Resources
  addResource: (type, amount) => {
    set((state) => ({
      game: {
        ...state.game,
        resources: {
          ...state.game.resources,
          [type]: (state.game.resources[type] || 0) + amount,
        },
      },
    }));
  },

  removeResource: (type, amount) => {
    const current = get().game.resources[type] || 0;
    if (current < amount) return false;

    set((state) => ({
      game: {
        ...state.game,
        resources: {
          ...state.game.resources,
          [type]: current - amount,
        },
      },
    }));
    return true;
  },

  transferResources: (from, to, type, amount) => {
    if ((from[type] || 0) < amount) return false;
    from[type] = (from[type] || 0) - amount;
    to[type] = (to[type] || 0) + amount;
    return true;
  },

  // Tasks
  createTask: (task) => {
    set((state) => ({
      game: {
        ...state.game,
        tasks: [...state.game.tasks, { ...task, id: uuidv4() }],
      },
    }));
  },

  completeTask: (taskId) => {
    set((state) => ({
      game: {
        ...state.game,
        tasks: state.game.tasks.filter((t) => t.id !== taskId),
      },
    }));
  },

  cancelTask: (taskId) => {
    set((state) => ({
      game: {
        ...state.game,
        tasks: state.game.tasks.filter((t) => t.id !== taskId),
      },
    }));
  },

  // Events
  triggerEvent: (event) => {
    const fullEvent: GameEvent = {
      ...event,
      id: uuidv4(),
      timestamp: get().game.gameTime,
    };

    set((state) => ({
      game: {
        ...state.game,
        events: [...state.game.events, fullEvent],
      },
    }));
  },

  resolveEvent: (eventId, choiceId) => {
    set((state) => {
      const event = state.game.events.find((e) => e.id === eventId);
      if (!event) return state;

      // Apply effects
      // TODO: Implement effect application

      return {
        game: {
          ...state.game,
          events: state.game.events.filter((e) => e.id !== eventId),
          eventHistory: [...state.game.eventHistory, event],
        },
      };
    });
  },

  // Research
  startResearch: (techId) => {
    set((state) => ({
      game: {
        ...state.game,
        currentResearch: {
          techId,
          progress: 0,
          assignedResearchers: [],
        },
      },
    }));
  },

  assignResearcher: (crewId) => {
    set((state) => {
      if (!state.game.currentResearch) return state;

      return {
        game: {
          ...state.game,
          currentResearch: {
            ...state.game.currentResearch,
            assignedResearchers: [
              ...state.game.currentResearch.assignedResearchers,
              crewId,
            ],
          },
        },
      };
    });
  },

  removeResearcher: (crewId) => {
    set((state) => {
      if (!state.game.currentResearch) return state;

      return {
        game: {
          ...state.game,
          currentResearch: {
            ...state.game.currentResearch,
            assignedResearchers: state.game.currentResearch.assignedResearchers.filter(
              (id) => id !== crewId
            ),
          },
        },
      };
    });
  },

  // Ships
  launchShip: (shipId, missionType, destination) => {
    // TODO: Implement ship missions
  },

  recallShip: (shipId) => {
    // TODO: Implement ship recall
  },

  // UI actions
  setUIMode: (mode) => {
    set((state) => ({
      ui: { ...state.ui, mode },
    }));
  },

  selectRoom: (roomId) => {
    set((state) => ({
      ui: { ...state.ui, selectedRoom: roomId },
    }));
  },

  selectCrew: (crewId) => {
    set((state) => ({
      ui: { ...state.ui, selectedCrew: crewId },
    }));
  },

  setSelectedBuildRoom: (type) => {
    set((state) => ({
      ui: { ...state.ui, selectedBuildRoom: type },
    }));
  },

  setOverlay: (overlay) => {
    set((state) => ({
      ui: { ...state.ui, overlay },
    }));
  },

  setCameraPosition: (position) => {
    set((state) => ({
      ui: { ...state.ui, cameraPosition: position },
    }));
  },

  setZoom: (zoom) => {
    set((state) => ({
      ui: { ...state.ui, zoom: Math.max(0.5, Math.min(3, zoom)) },
    }));
  },

  toggleGrid: () => {
    set((state) => ({
      ui: { ...state.ui, showGrid: !state.ui.showGrid },
    }));
  },
}));
