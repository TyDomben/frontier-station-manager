// Core game types for Frontier Station

export type EntityId = string;

// ============================================================================
// RESOURCES
// ============================================================================

export enum ResourceType {
  // Basic Resources
  Oxygen = 'oxygen',
  Water = 'water',
  Food = 'food',
  Power = 'power',

  // Building Materials
  Metal = 'metal',
  Plastic = 'plastic',
  Glass = 'glass',
  Electronics = 'electronics',
  AdvancedMaterials = 'advanced_materials',

  // Fuel & Energy
  Fuel = 'fuel',
  Uranium = 'uranium',
  Hydrogen = 'hydrogen',

  // Medical & Science
  MedicalSupplies = 'medical_supplies',
  ResearchData = 'research_data',
  AlienArtifacts = 'alien_artifacts',

  // Trade Goods
  RareMinerals = 'rare_minerals',
  LuxuryGoods = 'luxury_goods',
  Contraband = 'contraband',

  // Waste
  Waste = 'waste',
  CO2 = 'co2',
}

export interface ResourceAmount {
  type: ResourceType;
  amount: number;
}

export interface ResourceStorage {
  [key: string]: number;
}

// ============================================================================
// ROOM SYSTEM
// ============================================================================

export enum RoomCategory {
  Living = 'living',
  Production = 'production',
  Power = 'power',
  LifeSupport = 'life_support',
  Medical = 'medical',
  Research = 'research',
  Recreation = 'recreation',
  Storage = 'storage',
  Command = 'command',
  Security = 'security',
  Docking = 'docking',
  Engineering = 'engineering',
}

export enum RoomType {
  // Living (10)
  LivingQuarters = 'living_quarters',
  LuxuryQuarters = 'luxury_quarters',
  Dormitory = 'dormitory',
  CaptainQuarters = 'captain_quarters',
  Bathroom = 'bathroom',
  Shower = 'shower',
  Laundry = 'laundry',
  MessHall = 'mess_hall',
  Kitchen = 'kitchen',
  Cafeteria = 'cafeteria',

  // Production (10)
  Hydroponics = 'hydroponics',
  AdvancedHydroponics = 'advanced_hydroponics',
  FishFarm = 'fish_farm',
  Refinery = 'refinery',
  Smelter = 'smelter',
  Manufacturing = 'manufacturing',
  Electronics_Factory = 'electronics_factory',
  ChemicalPlant = 'chemical_plant',
  FoodProcessor = 'food_processor',
  WaterRecycler = 'water_recycler',

  // Power (6)
  SolarPanel = 'solar_panel',
  FusionReactor = 'fusion_reactor',
  NuclearReactor = 'nuclear_reactor',
  Battery = 'battery',
  PowerDistributor = 'power_distributor',
  EmergencyGenerator = 'emergency_generator',

  // Life Support (8)
  OxygenGenerator = 'oxygen_generator',
  CO2Scrubber = 'co2_scrubber',
  AirFilter = 'air_filter',
  TemperatureRegulator = 'temperature_regulator',
  PressureRegulator = 'pressure_regulator',
  WasteProcessor = 'waste_processor',
  LifeSupportHub = 'life_support_hub',
  GravityGenerator = 'gravity_generator',

  // Medical (6)
  Infirmary = 'infirmary',
  Surgery = 'surgery',
  Pharmacy = 'pharmacy',
  QuarantineRoom = 'quarantine',
  CryoChamber = 'cryo_chamber',
  PsychOffice = 'psych_office',

  // Research (6)
  ResearchLab = 'research_lab',
  AdvancedLab = 'advanced_lab',
  XenoBiology = 'xeno_biology',
  ComputerCore = 'computer_core',
  Observatory = 'observatory',
  TestChamber = 'test_chamber',

  // Recreation (8)
  Lounge = 'lounge',
  Gym = 'gym',
  VRRoom = 'vr_room',
  Garden = 'garden',
  Chapel = 'chapel',
  Bar = 'bar',
  Theater = 'theater',
  Library = 'library',

  // Storage (5)
  CargoHold = 'cargo_hold',
  ColdStorage = 'cold_storage',
  HazmatStorage = 'hazmat_storage',
  ArmoryStorage = 'armory_storage',
  FuelTank = 'fuel_tank',

  // Command (5)
  CommandCenter = 'command_center',
  Communications = 'communications',
  SensorArray = 'sensor_array',
  StrategyRoom = 'strategy_room',
  AdminOffice = 'admin_office',

  // Security (6)
  SecurityPost = 'security_post',
  Armory = 'armory',
  Brig = 'brig',
  Surveillance = 'surveillance',
  Turret = 'turret',
  ShieldGenerator = 'shield_generator',

  // Docking (5)
  Airlock = 'airlock',
  DockingBay = 'docking_bay',
  HangarBay = 'hangar_bay',
  ShipRepair = 'ship_repair',
  FuelDepot = 'fuel_depot',

  // Engineering (6)
  Workshop = 'workshop',
  ConstructionBay = 'construction_bay',
  DroneControl = 'drone_control',
  MaintenanceBay = 'maintenance_bay',
  EVASuit_Storage = 'eva_suit_storage',
  HullRepair = 'hull_repair',

  // Corridors & Infrastructure (4)
  Corridor = 'corridor',
  Junction = 'junction',
  Elevator = 'elevator',
  MaintenanceTunnel = 'maintenance_tunnel',
}

export interface RoomDefinition {
  type: RoomType;
  name: string;
  category: RoomCategory;
  description: string;
  size: { width: number; height: number };
  baseCost: ResourceAmount[];
  basePowerConsumption: number;
  basePowerProduction: number;
  baseOxygenConsumption: number;
  baseOxygenProduction: number;
  maxWorkers: number;
  resourceProduction?: { resource: ResourceType; amount: number; interval: number }[];
  resourceConsumption?: { resource: ResourceType; amount: number; interval: number }[];
  storageCapacity?: { resource: ResourceType; capacity: number }[];
  requirements?: { tech?: string[]; rooms?: RoomType[] };
  effects?: RoomEffect[];
}

export interface RoomEffect {
  type: 'morale' | 'health' | 'efficiency' | 'safety' | 'research';
  value: number;
  radius?: number;
}

export interface Room {
  id: EntityId;
  type: RoomType;
  position: { x: number; y: number };
  rotation: 0 | 90 | 180 | 270;
  condition: number; // 0-100
  powered: boolean;
  oxygenated: boolean;
  temperature: number;
  pressure: number;
  assignedCrew: EntityId[];
  constructionProgress: number; // 0-100, 100 = complete
  isEnabled: boolean;
}

// ============================================================================
// CREW SYSTEM
// ============================================================================

export enum SkillType {
  Engineering = 'engineering',
  Science = 'science',
  Medical = 'medical',
  Combat = 'combat',
  Social = 'social',
  Cooking = 'cooking',
  Farming = 'farming',
  Piloting = 'piloting',
  Hacking = 'hacking',
  Leadership = 'leadership',
}

export enum NeedType {
  Hunger = 'hunger',
  Sleep = 'sleep',
  Hygiene = 'hygiene',
  Entertainment = 'entertainment',
  Safety = 'safety',
  Comfort = 'comfort',
  Purpose = 'purpose',
  Social = 'social',
}

export enum TraitType {
  // Positive
  Optimist = 'optimist',
  HardWorker = 'hard_worker',
  FastLearner = 'fast_learner',
  NaturalLeader = 'natural_leader',
  Brave = 'brave',
  Careful = 'careful',
  Friendly = 'friendly',
  Tough = 'tough',
  Creative = 'creative',
  Focused = 'focused',

  // Negative
  Pessimist = 'pessimist',
  Lazy = 'lazy',
  SlowLearner = 'slow_learner',
  Coward = 'coward',
  Reckless = 'reckless',
  Antisocial = 'antisocial',
  Frail = 'frail',
  Claustrophobic = 'claustrophobic',
  Insomniac = 'insomniac',
  Pyromaniac = 'pyromaniac',

  // Neutral
  NightOwl = 'night_owl',
  EarlyBird = 'early_bird',
  Introvert = 'introvert',
  Extrovert = 'extrovert',
  Perfectionist = 'perfectionist',
}

export interface Skill {
  type: SkillType;
  level: number; // 0-20
  experience: number;
}

export interface Need {
  type: NeedType;
  value: number; // 0-100
  decayRate: number;
}

export interface Relationship {
  targetId: EntityId;
  type: 'friend' | 'rival' | 'romantic' | 'neutral';
  value: number; // -100 to 100
}

export interface CrewMember {
  id: EntityId;
  name: string;
  age: number;
  portrait: string;

  // Stats
  health: number; // 0-100
  mood: number; // 0-100
  stress: number; // 0-100

  // Skills
  skills: Skill[];

  // Needs
  needs: Need[];

  // Personality
  traits: TraitType[];
  background: string;

  // Relationships
  relationships: Relationship[];

  // Work
  currentTask: Task | null;
  assignedRoom: EntityId | null;
  schedule: CrewSchedule;

  // Position
  position: { x: number; y: number };
  isAlive: boolean;

  // Status
  status: CrewStatus;
}

export enum CrewStatus {
  Idle = 'idle',
  Working = 'working',
  Eating = 'eating',
  Sleeping = 'sleeping',
  Resting = 'resting',
  Socializing = 'socializing',
  InMedical = 'in_medical',
  Panicking = 'panicking',
  Unconscious = 'unconscious',
  Dead = 'dead',
}

export interface CrewSchedule {
  workStart: number; // hour 0-23
  workEnd: number;
  priority: TaskCategory[];
}

// ============================================================================
// TASK SYSTEM
// ============================================================================

export enum TaskCategory {
  Construction = 'construction',
  Repair = 'repair',
  Research = 'research',
  Medical = 'medical',
  Production = 'production',
  Hauling = 'hauling',
  Cleaning = 'cleaning',
  Security = 'security',
  Social = 'social',
}

export enum TaskPriority {
  Critical = 1,
  High = 2,
  Normal = 3,
  Low = 4,
}

export interface Task {
  id: EntityId;
  category: TaskCategory;
  priority: TaskPriority;
  targetId: EntityId | null;
  targetPosition: { x: number; y: number };
  requiredSkill?: SkillType;
  progress: number;
  duration: number;
  assignedCrew: EntityId | null;
}

// ============================================================================
// EVENT SYSTEM
// ============================================================================

export enum EventCategory {
  Disaster = 'disaster',
  Medical = 'medical',
  Social = 'social',
  Combat = 'combat',
  Trade = 'trade',
  Discovery = 'discovery',
  Technical = 'technical',
  Diplomatic = 'diplomatic',
}

export enum EventSeverity {
  Minor = 'minor',
  Moderate = 'moderate',
  Major = 'major',
  Critical = 'critical',
}

export interface GameEvent {
  id: EntityId;
  type: string;
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  description: string;
  choices?: EventChoice[];
  effects: EventEffect[];
  duration?: number;
  timestamp: number;
}

export interface EventChoice {
  id: string;
  text: string;
  effects: EventEffect[];
  requirements?: { resource?: ResourceAmount; skill?: { type: SkillType; level: number } };
}

export interface EventEffect {
  type: 'resource' | 'crew' | 'room' | 'reputation' | 'research' | 'spawn';
  target?: EntityId;
  value?: number;
  resourceType?: ResourceType;
  data?: Record<string, unknown>;
}

// ============================================================================
// TECHNOLOGY SYSTEM
// ============================================================================

export enum TechCategory {
  LifeSupport = 'life_support',
  Power = 'power',
  Agriculture = 'agriculture',
  Medicine = 'medicine',
  Engineering = 'engineering',
  Weapons = 'weapons',
  Propulsion = 'propulsion',
  Robotics = 'robotics',
  Materials = 'materials',
  Alien = 'alien',
}

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  description: string;
  researchCost: number;
  prerequisites: string[];
  effects: TechEffect[];
  unlocks: { rooms?: RoomType[]; items?: string[]; abilities?: string[] };
}

export interface TechEffect {
  type: string;
  target: string;
  modifier: number;
}

export interface ResearchProject {
  techId: string;
  progress: number;
  assignedResearchers: EntityId[];
}

// ============================================================================
// SHIP SYSTEM
// ============================================================================

export enum ShipType {
  MiningShip = 'mining_ship',
  CargoHauler = 'cargo_hauler',
  Scout = 'scout',
  Fighter = 'fighter',
  Rescue = 'rescue',
  Research = 'research_vessel',
}

export enum MissionType {
  Mining = 'mining',
  Trade = 'trade',
  Exploration = 'exploration',
  Combat = 'combat',
  Rescue = 'rescue',
  Research = 'research',
}

export interface Ship {
  id: EntityId;
  name: string;
  type: ShipType;
  hull: number;
  maxHull: number;
  fuel: number;
  maxFuel: number;
  cargo: ResourceStorage;
  maxCargo: number;
  crew: EntityId[];
  mission: Mission | null;
  position: { x: number; y: number };
  status: ShipStatus;
}

export enum ShipStatus {
  Docked = 'docked',
  InTransit = 'in_transit',
  OnMission = 'on_mission',
  Returning = 'returning',
  Damaged = 'damaged',
  Destroyed = 'destroyed',
}

export interface Mission {
  id: EntityId;
  type: MissionType;
  destination: { x: number; y: number };
  duration: number;
  progress: number;
  rewards?: ResourceAmount[];
  risks: number;
}

// ============================================================================
// DIPLOMACY & TRADE
// ============================================================================

export interface Faction {
  id: EntityId;
  name: string;
  reputation: number; // -100 to 100
  tradeMultiplier: number;
  hostility: number;
  specialGoods: ResourceType[];
}

export interface TradeOffer {
  id: EntityId;
  factionId: EntityId;
  offering: ResourceAmount[];
  requesting: ResourceAmount[];
  expiresAt: number;
}

export interface Contract {
  id: EntityId;
  factionId: EntityId;
  type: string;
  description: string;
  requirements: ResourceAmount[];
  rewards: ResourceAmount[];
  deadline: number;
  penalty: number;
}

// ============================================================================
// GAME STATE
// ============================================================================

export interface StationStats {
  population: number;
  maxPopulation: number;
  averageMorale: number;
  averageHealth: number;
  powerBalance: number;
  oxygenBalance: number;
  totalWealth: number;
  researchProgress: number;
  reputation: number;
  threatLevel: number;
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'brutal';
  scenario: string;
  eventFrequency: number;
  resourceMultiplier: number;
  autoSave: boolean;
  gameSpeed: number;
}

export interface GameState {
  // Meta
  id: string;
  name: string;
  seed: number;
  tick: number;
  gameTime: number; // in-game seconds
  isPaused: boolean;
  gameSpeed: number;
  settings: GameSettings;

  // Station
  rooms: Room[];
  gridSize: { width: number; height: number };

  // Crew
  crew: CrewMember[];

  // Resources
  resources: ResourceStorage;
  resourceHistory: { tick: number; resources: ResourceStorage }[];

  // Tasks
  tasks: Task[];

  // Events
  events: GameEvent[];
  eventHistory: GameEvent[];

  // Research
  technologies: { [techId: string]: boolean };
  currentResearch: ResearchProject | null;

  // Ships
  ships: Ship[];
  missions: Mission[];

  // Diplomacy
  factions: Faction[];
  tradeOffers: TradeOffer[];
  contracts: Contract[];

  // Stats
  stats: StationStats;

  // Victory
  victoryConditions: { [condition: string]: { current: number; target: number } };
}

// ============================================================================
// UI TYPES
// ============================================================================

export enum UIMode {
  Normal = 'normal',
  Build = 'build',
  Demolish = 'demolish',
  Assign = 'assign',
  Inspect = 'inspect',
}

export enum OverlayType {
  None = 'none',
  Power = 'power',
  Oxygen = 'oxygen',
  Temperature = 'temperature',
  Pressure = 'pressure',
  Traffic = 'traffic',
}

export interface UIState {
  mode: UIMode;
  selectedRoom: EntityId | null;
  selectedCrew: EntityId | null;
  selectedBuildRoom: RoomType | null;
  overlay: OverlayType;
  cameraPosition: { x: number; y: number };
  zoom: number;
  showGrid: boolean;
}
