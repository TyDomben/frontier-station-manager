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
  ShipType,
  ShipStatus,
  Mission,
  MissionType,
  Faction,
  EntityId,
  ResourceStorage,
  StationStats,
  TaskCategory,
  TaskPriority,
  CrewStatus,
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
  [ResourceType.AdvancedMaterials]: 0,
  [ResourceType.RareMinerals]: 0,
  [ResourceType.Hydrogen]: 50,
  [ResourceType.Uranium]: 0,
  [ResourceType.LuxuryGoods]: 0,
  [ResourceType.Contraband]: 0,
  [ResourceType.AlienArtifacts]: 0,
});

// Create default factions
const createDefaultFactions = (): Faction[] => [
  {
    id: uuidv4(),
    name: 'United Earth Government',
    reputation: 50,
    tradeMultiplier: 1.0,
    hostility: 0,
    specialGoods: [ResourceType.Electronics, ResourceType.MedicalSupplies],
  },
  {
    id: uuidv4(),
    name: 'Free Traders Guild',
    reputation: 30,
    tradeMultiplier: 0.9,
    hostility: 0,
    specialGoods: [ResourceType.LuxuryGoods, ResourceType.Food],
  },
  {
    id: uuidv4(),
    name: 'Martian Consortium',
    reputation: 20,
    tradeMultiplier: 1.1,
    hostility: 10,
    specialGoods: [ResourceType.Metal, ResourceType.Fuel],
  },
  {
    id: uuidv4(),
    name: 'Outer Rim Alliance',
    reputation: 0,
    tradeMultiplier: 0.8,
    hostility: 20,
    specialGoods: [ResourceType.RareMinerals, ResourceType.Hydrogen],
  },
  {
    id: uuidv4(),
    name: 'Science Collective',
    reputation: 40,
    tradeMultiplier: 1.2,
    hostility: 0,
    specialGoods: [ResourceType.ResearchData, ResourceType.AlienArtifacts],
  },
  {
    id: uuidv4(),
    name: 'Pirate Clans',
    reputation: -30,
    tradeMultiplier: 0.6,
    hostility: 60,
    specialGoods: [ResourceType.Contraband, ResourceType.Fuel],
  },
];

// Create a ship
const createShip = (type: ShipType, name: string): Ship => {
  const shipStats: { [key in ShipType]: { hull: number; fuel: number; cargo: number } } = {
    [ShipType.MiningShip]: { hull: 100, fuel: 200, cargo: 500 },
    [ShipType.CargoHauler]: { hull: 80, fuel: 300, cargo: 1000 },
    [ShipType.Scout]: { hull: 50, fuel: 400, cargo: 100 },
    [ShipType.Fighter]: { hull: 150, fuel: 150, cargo: 50 },
    [ShipType.Rescue]: { hull: 100, fuel: 250, cargo: 200 },
    [ShipType.Research]: { hull: 80, fuel: 200, cargo: 300 },
  };

  const stats = shipStats[type];

  return {
    id: uuidv4(),
    name,
    type,
    hull: stats.hull,
    maxHull: stats.hull,
    fuel: stats.fuel,
    maxFuel: stats.fuel,
    cargo: {},
    maxCargo: stats.cargo,
    crew: [],
    mission: null,
    position: { x: 0, y: 0 },
    status: ShipStatus.Docked,
  };
};

// Calculate station stats
const calculateStats = (state: GameState): StationStats => {
  const livingCrew = state.crew.filter((c) => c.isAlive);
  const population = livingCrew.length;

  return {
    population,
    maxPopulation: state.rooms.filter((r) => r.type === RoomType.LivingQuarters).length * 2 +
      state.rooms.filter((r) => r.type === RoomType.Dormitory).length * 4 +
      state.rooms.filter((r) => r.type === RoomType.LuxuryQuarters).length * 1,
    averageMorale: population > 0 ? livingCrew.reduce((sum, c) => sum + c.mood, 0) / population : 0,
    averageHealth: population > 0 ? livingCrew.reduce((sum, c) => sum + c.health, 0) / population : 0,
    powerBalance: calculatePowerBalance(state),
    oxygenBalance: calculateOxygenBalance(state),
    totalWealth: calculateWealth(state.resources),
    researchProgress: Object.values(state.technologies).filter(Boolean).length,
    reputation: state.factions.length > 0
      ? state.factions.reduce((sum, f) => sum + f.reputation, 0) / state.factions.length
      : 0,
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
  if ((state.resources[ResourceType.Oxygen] || 0) < 100) threat += 30;
  if ((state.resources[ResourceType.Food] || 0) < 50) threat += 20;

  // Active dangerous events
  state.events.forEach((e) => {
    if (e.severity === 'critical') threat += 30;
    else if (e.severity === 'major') threat += 15;
  });

  return Math.min(100, threat);
};

// Helper to create a room
const createRoom = (
  type: RoomType,
  position: { x: number; y: number },
  constructionProgress: number = 100
): Room => ({
  id: uuidv4(),
  type,
  position,
  rotation: 0,
  condition: 100,
  powered: constructionProgress >= 100,
  oxygenated: constructionProgress >= 100,
  temperature: 21,
  pressure: 101,
  assignedCrew: [],
  constructionProgress,
  isEnabled: true,
});

// Create initial game state based on scenario
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
    factions: createDefaultFactions(),
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
      research: { current: 0, target: 64 },
      reputation: { current: 0, target: 100 },
    },
  };

  // Configure based on scenario
  switch (scenario) {
    case 'fresh_start':
      state.name = 'Pioneer Station';
      // Basic starting rooms
      state.rooms.push(createRoom(RoomType.CommandCenter, { x: 48, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 44, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 52, y: 48 }));
      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 48, y: 44 }));
      state.rooms.push(createRoom(RoomType.OxygenGenerator, { x: 48, y: 52 }));
      state.rooms.push(createRoom(RoomType.CargoHold, { x: 44, y: 52 }));
      state.rooms.push(createRoom(RoomType.Hydroponics, { x: 52, y: 52 }));

      // Starting crew (5 colonists)
      for (let i = 0; i < 5; i++) {
        state.crew.push(generateCrewMember());
      }

      // One basic ship
      state.ships.push(createShip(ShipType.Scout, 'Explorer I'));
      break;

    case 'emergency_colony':
      state.name = 'Salvation Station';
      state.settings.difficulty = 'hard';

      // Damaged starting rooms (lower condition)
      const cmdRoom = createRoom(RoomType.CommandCenter, { x: 48, y: 48 });
      cmdRoom.condition = 60;
      state.rooms.push(cmdRoom);

      const quarters1 = createRoom(RoomType.LivingQuarters, { x: 44, y: 48 });
      quarters1.condition = 40;
      state.rooms.push(quarters1);

      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 48, y: 44 }));

      const oxyGen = createRoom(RoomType.OxygenGenerator, { x: 48, y: 52 });
      oxyGen.condition = 50;
      state.rooms.push(oxyGen);

      // Limited resources
      state.resources = {
        ...createDefaultResources(),
        [ResourceType.Oxygen]: 400,
        [ResourceType.Water]: 200,
        [ResourceType.Food]: 100,
        [ResourceType.Metal]: 100,
        [ResourceType.Fuel]: 50,
      };

      // Starting crew (8 colonists - survivors)
      for (let i = 0; i < 8; i++) {
        const crew = generateCrewMember();
        crew.health = 50 + Math.random() * 30;
        crew.mood = 30 + Math.random() * 30;
        state.crew.push(crew);
      }
      break;

    case 'rich_expedition':
      state.name = 'Prosperity Station';

      // More starting rooms
      state.rooms.push(createRoom(RoomType.CommandCenter, { x: 48, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 44, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 52, y: 48 }));
      state.rooms.push(createRoom(RoomType.LuxuryQuarters, { x: 44, y: 44 }));
      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 48, y: 44 }));
      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 52, y: 44 }));
      state.rooms.push(createRoom(RoomType.OxygenGenerator, { x: 48, y: 52 }));
      state.rooms.push(createRoom(RoomType.CargoHold, { x: 44, y: 52 }));
      state.rooms.push(createRoom(RoomType.Hydroponics, { x: 52, y: 52 }));
      state.rooms.push(createRoom(RoomType.Infirmary, { x: 56, y: 48 }));
      state.rooms.push(createRoom(RoomType.ResearchLab, { x: 40, y: 48 }));

      // Abundant resources
      state.resources = {
        ...createDefaultResources(),
        [ResourceType.Oxygen]: 2000,
        [ResourceType.Water]: 1000,
        [ResourceType.Food]: 800,
        [ResourceType.Metal]: 500,
        [ResourceType.Plastic]: 300,
        [ResourceType.Glass]: 200,
        [ResourceType.Electronics]: 100,
        [ResourceType.Fuel]: 300,
        [ResourceType.MedicalSupplies]: 100,
      };

      // Starting crew (7 colonists)
      for (let i = 0; i < 7; i++) {
        state.crew.push(generateCrewMember());
      }

      // Two ships
      state.ships.push(createShip(ShipType.Scout, 'Pathfinder'));
      state.ships.push(createShip(ShipType.CargoHauler, 'Merchant I'));
      break;

    case 'isolated_outpost':
      state.name = 'Frontier Outpost';
      state.settings.difficulty = 'hard';

      // Self-sufficient setup
      state.rooms.push(createRoom(RoomType.CommandCenter, { x: 48, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 44, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 52, y: 48 }));
      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 48, y: 44 }));
      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 44, y: 44 }));
      state.rooms.push(createRoom(RoomType.OxygenGenerator, { x: 48, y: 52 }));
      state.rooms.push(createRoom(RoomType.Hydroponics, { x: 52, y: 52 }));
      state.rooms.push(createRoom(RoomType.Hydroponics, { x: 44, y: 52 }));
      state.rooms.push(createRoom(RoomType.WaterRecycler, { x: 56, y: 52 }));
      state.rooms.push(createRoom(RoomType.Workshop, { x: 40, y: 52 }));

      // Moderate resources but must be self-sufficient
      state.resources = {
        ...createDefaultResources(),
        [ResourceType.Metal]: 300,
        [ResourceType.Plastic]: 200,
        [ResourceType.Electronics]: 50,
      };

      // No factions (isolated)
      state.factions = [];

      // Starting crew (6 colonists)
      for (let i = 0; i < 6; i++) {
        state.crew.push(generateCrewMember());
      }

      state.ships.push(createShip(ShipType.MiningShip, 'Extractor I'));
      break;

    case 'scientific_expedition':
      state.name = 'Discovery Station';

      // Research-focused setup
      state.rooms.push(createRoom(RoomType.CommandCenter, { x: 48, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 44, y: 48 }));
      state.rooms.push(createRoom(RoomType.LivingQuarters, { x: 52, y: 48 }));
      state.rooms.push(createRoom(RoomType.SolarPanel, { x: 48, y: 44 }));
      state.rooms.push(createRoom(RoomType.OxygenGenerator, { x: 48, y: 52 }));
      state.rooms.push(createRoom(RoomType.ResearchLab, { x: 44, y: 52 }));
      state.rooms.push(createRoom(RoomType.ResearchLab, { x: 52, y: 52 }));
      state.rooms.push(createRoom(RoomType.ComputerCore, { x: 44, y: 44 }));
      state.rooms.push(createRoom(RoomType.Observatory, { x: 52, y: 44 }));

      // Research-focused resources
      state.resources = {
        ...createDefaultResources(),
        [ResourceType.ResearchData]: 100,
        [ResourceType.Electronics]: 80,
      };

      // Starting crew (6 colonists with higher science skills)
      for (let i = 0; i < 6; i++) {
        const crew = generateCrewMember();
        // Boost science skill
        const scienceSkill = crew.skills.find(s => s.type === 'science');
        if (scienceSkill) {
          scienceSkill.level = Math.min(20, scienceSkill.level + 5);
        }
        state.crew.push(crew);
      }

      state.ships.push(createShip(ShipType.Research, 'Discovery I'));
      state.ships.push(createShip(ShipType.Scout, 'Probe I'));
      break;

    default:
      // Fall back to fresh_start
      return createInitialGameState('fresh_start');
  }

  state.stats = calculateStats(state);
  state.victoryConditions.population.current = state.crew.filter(c => c.isAlive).length;

  return state;
};

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
  launchShip: (shipId: EntityId, missionType: MissionType, destination: { x: number; y: number }) => void;
  recallShip: (shipId: EntityId) => void;

  // Trade
  acceptTradeOffer: (offerId: EntityId) => void;
  rejectTradeOffer: (offerId: EntityId) => void;

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

      // Clone game state for mutations
      const newResources = { ...state.game.resources };
      const newRooms = state.game.rooms.map(r => ({ ...r }));
      const newCrew = state.game.crew.map(c => ({ ...c, needs: c.needs.map(n => ({ ...n })) }));
      const newShips = state.game.ships.map(s => ({ ...s }));
      const newMissions = [...state.game.missions];

      // Process construction
      newRooms.forEach((room) => {
        if (room.constructionProgress < 100) {
          // Find assigned workers
          const workers = newCrew.filter(c => c.assignedRoom === room.id && c.isAlive);
          const constructionSpeed = Math.max(0.5, workers.length * 2);
          room.constructionProgress = Math.min(100, room.constructionProgress + constructionSpeed * 0.1);

          if (room.constructionProgress >= 100) {
            room.powered = true;
            room.oxygenated = true;
          }
        }
      });

      // Process room resource production/consumption
      newRooms.forEach((room) => {
        if (room.constructionProgress < 100) return;
        if (!room.isEnabled) return;

        const def = ROOM_DEFINITIONS[room.type];
        if (!def) return;

        // Check power
        room.powered = calculatePowerBalance({ ...state.game, rooms: newRooms }) >= 0;
        if (!room.powered && def.basePowerConsumption > 0) return;

        // Resource production
        if (def.resourceProduction) {
          def.resourceProduction.forEach((prod) => {
            const amount = prod.amount * 0.01 * state.game.gameSpeed;
            newResources[prod.resource] = (newResources[prod.resource] || 0) + amount;
          });
        }

        // Resource consumption
        if (def.resourceConsumption) {
          def.resourceConsumption.forEach((cons) => {
            const amount = cons.amount * 0.01 * state.game.gameSpeed;
            const current = newResources[cons.resource] || 0;
            newResources[cons.resource] = Math.max(0, current - amount);
          });
        }
      });

      // Process crew needs
      newCrew.forEach((crew) => {
        if (!crew.isAlive) return;

        // Decay needs
        crew.needs.forEach((need) => {
          need.value = Math.max(0, need.value - need.decayRate * 0.05 * state.game.gameSpeed);
        });

        // Calculate mood from needs
        const avgNeed = crew.needs.reduce((sum, n) => sum + n.value, 0) / crew.needs.length;
        crew.mood = Math.max(0, Math.min(100, avgNeed));

        // Update stress
        const lowNeeds = crew.needs.filter((n) => n.value < 30).length;
        crew.stress = Math.min(100, crew.stress + lowNeeds * 0.1);
        if (avgNeed > 70) {
          crew.stress = Math.max(0, crew.stress - 0.5);
        }

        // Health effects from critical needs
        const hunger = crew.needs.find((n) => n.type === 'hunger');
        if (hunger && hunger.value < 10) {
          crew.health = Math.max(0, crew.health - 0.5);
        }

        // Check for death
        if (crew.health <= 0) {
          crew.isAlive = false;
          crew.status = CrewStatus.Dead;
        }

        // Recover health if well-fed and rested
        const sleep = crew.needs.find((n) => n.type === 'sleep');
        if (hunger && sleep && hunger.value > 60 && sleep.value > 60 && crew.health < 100) {
          crew.health = Math.min(100, crew.health + 0.1);
        }
      });

      // Process ship missions
      newShips.forEach((ship) => {
        if (ship.status === ShipStatus.OnMission && ship.mission) {
          ship.mission.progress += (1 / ship.mission.duration) * 100 * state.game.gameSpeed * 0.1;

          if (ship.mission.progress >= 100) {
            // Mission complete - return with rewards
            ship.status = ShipStatus.Returning;

            if (ship.mission.rewards) {
              ship.mission.rewards.forEach((reward) => {
                ship.cargo[reward.type] = (ship.cargo[reward.type] || 0) + reward.amount;
              });
            }
          }
        } else if (ship.status === ShipStatus.Returning) {
          // Simplified return - instant for now
          ship.status = ShipStatus.Docked;

          // Unload cargo
          Object.entries(ship.cargo).forEach(([type, amount]) => {
            newResources[type as ResourceType] = (newResources[type as ResourceType] || 0) + amount;
          });
          ship.cargo = {};
          ship.mission = null;
        }
      });

      // Process research
      let newResearch = state.game.currentResearch;
      if (newResearch) {
        // Calculate research speed
        let researchSpeed = 0.1;
        newResearch.assignedResearchers.forEach((crewId) => {
          const crew = newCrew.find((c) => c.id === crewId);
          if (crew && crew.isAlive) {
            const scienceSkill = crew.skills.find((s) => s.type === 'science');
            researchSpeed += (scienceSkill?.level || 1) * 0.5;
          }
        });

        newResearch = {
          ...newResearch,
          progress: newResearch.progress + researchSpeed * 0.1 * state.game.gameSpeed,
        };

        // Check if complete
        if (newResearch.progress >= 100) {
          const newTechs = { ...state.game.technologies, [newResearch.techId]: true };
          return {
            game: {
              ...state.game,
              tick: newTick,
              gameTime: newGameTime,
              resources: newResources,
              rooms: newRooms,
              crew: newCrew,
              ships: newShips,
              technologies: newTechs,
              currentResearch: null,
              stats: calculateStats({
                ...state.game,
                rooms: newRooms,
                crew: newCrew,
                resources: newResources,
                technologies: newTechs,
              }),
            },
          };
        }
      }

      // Cap resources
      const caps: { [key: string]: number } = {
        [ResourceType.Oxygen]: 10000,
        [ResourceType.Water]: 5000,
        [ResourceType.Food]: 5000,
        [ResourceType.Metal]: 10000,
        [ResourceType.Plastic]: 5000,
        [ResourceType.Glass]: 3000,
        [ResourceType.Electronics]: 2000,
      };

      Object.entries(caps).forEach(([resource, cap]) => {
        if ((newResources[resource as ResourceType] || 0) > cap) {
          newResources[resource as ResourceType] = cap;
        }
      });

      // Update stats
      const newStats = calculateStats({
        ...state.game,
        rooms: newRooms,
        crew: newCrew,
        resources: newResources,
      });

      return {
        game: {
          ...state.game,
          tick: newTick,
          gameTime: newGameTime,
          resources: newResources,
          rooms: newRooms,
          crew: newCrew,
          ships: newShips,
          currentResearch: newResearch,
          stats: newStats,
          victoryConditions: {
            ...state.game.victoryConditions,
            population: { ...state.game.victoryConditions.population, current: newCrew.filter(c => c.isAlive).length },
            wealth: { ...state.game.victoryConditions.wealth, current: newStats.totalWealth },
            research: { ...state.game.victoryConditions.research, current: newStats.researchProgress },
          },
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

    // Check for overlap with existing rooms
    const existingRooms = get().game.rooms;
    const wouldOverlap = existingRooms.some((room) => {
      const roomDef = ROOM_DEFINITIONS[room.type];
      if (!roomDef) return false;

      return (
        position.x < room.position.x + roomDef.size.width &&
        position.x + def.size.width > room.position.x &&
        position.y < room.position.y + roomDef.size.height &&
        position.y + def.size.height > room.position.y
      );
    });

    if (wouldOverlap) return;

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
        constructionProgress: 0, // Start at 0, needs to be built
        isEnabled: true,
      };

      // Create construction task
      const constructionTask: Task = {
        id: uuidv4(),
        category: TaskCategory.Construction,
        priority: TaskPriority.Normal,
        targetId: newRoom.id,
        targetPosition: position,
        requiredSkill: 'engineering' as any,
        progress: 0,
        duration: 100,
        assignedCrew: null,
      };

      return {
        game: {
          ...state.game,
          rooms: [...state.game.rooms, newRoom],
          resources: newResources,
          tasks: [...state.game.tasks, constructionTask],
        },
      };
    });
  },

  removeRoom: (roomId) => {
    set((state) => {
      const room = state.game.rooms.find((r) => r.id === roomId);
      if (!room) return state;

      // Refund some resources
      const def = ROOM_DEFINITIONS[room.type];
      const newResources = { ...state.game.resources };
      if (def) {
        def.baseCost.forEach((cost) => {
          newResources[cost.type] = (newResources[cost.type] || 0) + Math.floor(cost.amount * 0.5);
        });
      }

      return {
        game: {
          ...state.game,
          rooms: state.game.rooms.filter((r) => r.id !== roomId),
          resources: newResources,
        },
      };
    });
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
          c.id === crewId ? { ...c, assignedRoom: roomId, status: CrewStatus.Working } : c
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
            c.id === crewId ? { ...c, assignedRoom: null, status: CrewStatus.Idle } : c
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
    const cost = 50; // Metal cost to hire
    const currentMetal = get().game.resources[ResourceType.Metal] || 0;
    if (currentMetal < cost) return;

    set((state) => ({
      game: {
        ...state.game,
        crew: [...state.game.crew, generateCrewMember()],
        resources: {
          ...state.game.resources,
          [ResourceType.Metal]: currentMetal - cost,
        },
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
        isPaused: true, // Pause on event
      },
    }));
  },

  resolveEvent: (eventId, choiceId) => {
    set((state) => {
      const event = state.game.events.find((e) => e.id === eventId);
      if (!event) return state;

      let newResources = { ...state.game.resources };
      let newCrew = state.game.crew.map(c => ({ ...c }));

      // Apply effects based on choice
      if (choiceId && event.choices) {
        const choice = event.choices.find((c) => c.id === choiceId);
        if (choice) {
          choice.effects.forEach((effect) => {
            if (effect.type === 'resource' && effect.resourceType && effect.value) {
              newResources[effect.resourceType] = Math.max(0,
                (newResources[effect.resourceType] || 0) + effect.value
              );
            }
            if (effect.type === 'morale' && effect.value) {
              newCrew = newCrew.map(c => ({
                ...c,
                mood: Math.max(0, Math.min(100, c.mood + effect.value))
              }));
            }
            if (effect.type === 'health' && effect.value) {
              // Apply to random crew or all
              if (effect.target === 'all_crew') {
                newCrew = newCrew.map(c => ({
                  ...c,
                  health: Math.max(0, Math.min(100, c.health + effect.value))
                }));
              } else {
                // Random crew member
                const aliveCrew = newCrew.filter(c => c.isAlive);
                if (aliveCrew.length > 0) {
                  const target = aliveCrew[Math.floor(Math.random() * aliveCrew.length)];
                  target.health = Math.max(0, Math.min(100, target.health + effect.value));
                }
              }
            }
          });
        }
      }

      // Apply base event effects
      event.effects.forEach((effect) => {
        if (effect.type === 'resource' && effect.resourceType && effect.value) {
          newResources[effect.resourceType] = Math.max(0,
            (newResources[effect.resourceType] || 0) + effect.value
          );
        }
      });

      return {
        game: {
          ...state.game,
          events: state.game.events.filter((e) => e.id !== eventId),
          eventHistory: [...state.game.eventHistory, event],
          resources: newResources,
          crew: newCrew,
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

  // Ships - FULLY IMPLEMENTED
  launchShip: (shipId, missionType, destination) => {
    set((state) => {
      const ship = state.game.ships.find((s) => s.id === shipId);
      if (!ship || ship.status !== ShipStatus.Docked) return state;

      // Check fuel
      const fuelCost = 20;
      if (ship.fuel < fuelCost) return state;

      // Calculate mission duration and rewards based on type
      let duration = 100;
      let rewards: { type: ResourceType; amount: number }[] = [];
      let risks = 0.1;

      switch (missionType) {
        case MissionType.Mining:
          duration = 150;
          rewards = [
            { type: ResourceType.Metal, amount: 50 + Math.floor(Math.random() * 50) },
            { type: ResourceType.RareMinerals, amount: Math.floor(Math.random() * 10) },
          ];
          risks = 0.15;
          break;
        case MissionType.Trade:
          duration = 100;
          rewards = [
            { type: ResourceType.Food, amount: 30 + Math.floor(Math.random() * 30) },
            { type: ResourceType.Electronics, amount: 10 + Math.floor(Math.random() * 20) },
          ];
          risks = 0.05;
          break;
        case MissionType.Exploration:
          duration = 200;
          rewards = [
            { type: ResourceType.ResearchData, amount: 20 + Math.floor(Math.random() * 30) },
            { type: ResourceType.AlienArtifacts, amount: Math.random() > 0.7 ? 1 : 0 },
          ];
          risks = 0.2;
          break;
        case MissionType.Combat:
          duration = 80;
          rewards = [
            { type: ResourceType.Metal, amount: 30 + Math.floor(Math.random() * 40) },
            { type: ResourceType.Fuel, amount: 20 + Math.floor(Math.random() * 20) },
          ];
          risks = 0.4;
          break;
        case MissionType.Rescue:
          duration = 120;
          rewards = [
            { type: ResourceType.MedicalSupplies, amount: 20 },
          ];
          risks = 0.25;
          break;
        case MissionType.Research:
          duration = 180;
          rewards = [
            { type: ResourceType.ResearchData, amount: 40 + Math.floor(Math.random() * 40) },
          ];
          risks = 0.1;
          break;
      }

      const mission: Mission = {
        id: uuidv4(),
        type: missionType,
        destination,
        duration,
        progress: 0,
        rewards,
        risks,
      };

      return {
        game: {
          ...state.game,
          ships: state.game.ships.map((s) =>
            s.id === shipId
              ? {
                  ...s,
                  status: ShipStatus.OnMission,
                  mission,
                  fuel: s.fuel - fuelCost,
                  position: destination,
                }
              : s
          ),
        },
      };
    });
  },

  recallShip: (shipId) => {
    set((state) => {
      const ship = state.game.ships.find((s) => s.id === shipId);
      if (!ship || ship.status === ShipStatus.Docked) return state;

      return {
        game: {
          ...state.game,
          ships: state.game.ships.map((s) =>
            s.id === shipId
              ? {
                  ...s,
                  status: ShipStatus.Returning,
                  mission: null,
                }
              : s
          ),
        },
      };
    });
  },

  // Trade
  acceptTradeOffer: (offerId) => {
    set((state) => {
      const offer = state.game.tradeOffers.find((o) => o.id === offerId);
      if (!offer) return state;

      // Check if we have the requested resources
      const canAfford = offer.requesting.every(
        (req) => (state.game.resources[req.type] || 0) >= req.amount
      );
      if (!canAfford) return state;

      // Execute trade
      const newResources = { ...state.game.resources };

      // Remove requested resources
      offer.requesting.forEach((req) => {
        newResources[req.type] = (newResources[req.type] || 0) - req.amount;
      });

      // Add offered resources
      offer.offering.forEach((off) => {
        newResources[off.type] = (newResources[off.type] || 0) + off.amount;
      });

      // Improve faction reputation
      const newFactions = state.game.factions.map((f) =>
        f.id === offer.factionId
          ? { ...f, reputation: Math.min(100, f.reputation + 5) }
          : f
      );

      return {
        game: {
          ...state.game,
          resources: newResources,
          factions: newFactions,
          tradeOffers: state.game.tradeOffers.filter((o) => o.id !== offerId),
        },
      };
    });
  },

  rejectTradeOffer: (offerId) => {
    set((state) => ({
      game: {
        ...state.game,
        tradeOffers: state.game.tradeOffers.filter((o) => o.id !== offerId),
      },
    }));
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
