import { v4 as uuidv4 } from 'uuid';
import {
  CrewMember,
  SkillType,
  NeedType,
  TraitType,
  CrewStatus,
  Skill,
  Need,
} from '@/core/types';

// Name generation data
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery',
  'Cameron', 'Dakota', 'Emerson', 'Finley', 'Harper', 'Kai', 'Logan', 'Parker',
  'Reese', 'Sage', 'Skyler', 'Blake', 'Charlie', 'Drew', 'Ellis', 'Frankie',
  'Gray', 'Hayden', 'Indigo', 'Jamie', 'Kerry', 'Lane', 'Micah', 'Nico',
  'Oakley', 'Peyton', 'River', 'Sawyer', 'Tatum', 'Val', 'Winter', 'Zion',
  'Elena', 'Marcus', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'William',
  'Sophia', 'Benjamin', 'Mia', 'Lucas', 'Charlotte', 'Henry', 'Amelia', 'Sebastian',
  'Evelyn', 'Jack', 'Harper', 'Aiden', 'Luna', 'Owen', 'Ella', 'Samuel',
  'Yuki', 'Chen', 'Priya', 'Omar', 'Fatima', 'Raj', 'Mei', 'Kofi',
  'Aisha', 'Pavel', 'Ingrid', 'Diego', 'Nadia', 'Viktor', 'Zara', 'Ivan',
];

const LAST_NAMES = [
  'Chen', 'Garcia', 'Kim', 'Singh', 'Patel', 'Nguyen', 'Rodriguez', 'Smith',
  'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore',
  'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
  'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen',
  'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
  'Volkov', 'Ivanova', 'Kowalski', 'Müller', 'Schmidt', 'Fischer', 'Tanaka', 'Sato',
  'Yamamoto', 'Watanabe', 'Santos', 'Ferreira', 'Johansson', 'Eriksson', 'Dubois', 'Bernard',
  'Moreau', 'Costa', 'Rossi', 'Ferrari', 'Esposito', 'Romano', 'Colombo', 'Ricci',
  'Okonkwo', 'Mensah', 'Achebe', 'Hassan', 'Abbas', 'Karim', 'Malik', 'Sharma',
];

// Background story components
const BACKGROUND_ORIGINS = [
  'Born on a colony ship traveling between systems',
  'Grew up in the domed cities of Mars',
  'Raised on an asteroid mining station',
  'From the orbital habitats around Earth',
  'Spent childhood on the frontier worlds',
  'Descended from early space pioneers',
  'Escaped a failing colony in the outer rim',
  'Left behind a privileged life on Earth',
  'Refugee from a corporate war zone',
  'Former military stationed in deep space',
  'Trained at the Luna Academy',
  'Raised by researchers on a science station',
  'Survivor of the Proxima Incident',
  'Born during the Great Migration',
  'Grew up in the free trader communities',
];

const BACKGROUND_MOTIVATIONS = [
  'seeking adventure in the unknown',
  'hoping to build a better future',
  'running from a troubled past',
  'driven by scientific curiosity',
  'searching for a place to call home',
  'determined to prove themselves',
  'chasing dreams of prosperity',
  'committed to helping others survive',
  'eager to test their skills',
  'looking for meaning in the void',
  'motivated by family obligations',
  'pursuing personal redemption',
  'drawn by the promise of freedom',
  'following a calling to explore',
  'seeking to make a difference',
];

const BACKGROUND_SKILLS = [
  'with extensive medical training',
  'having worked as an engineer for years',
  'possessing natural leadership abilities',
  'bringing years of combat experience',
  'skilled in computer systems and hacking',
  'experienced in hydroponics and farming',
  'trained in piloting various spacecraft',
  'knowledgeable in scientific research',
  'gifted in diplomacy and negotiation',
  'expert in survival techniques',
  'specialized in construction and repair',
  'talented in culinary arts',
  'versed in alien technologies',
  'experienced in trading and commerce',
  'trained in psychological counseling',
];

// Generate a random name
const generateName = (): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
};

// Generate a background story
const generateBackground = (): string => {
  const origin = BACKGROUND_ORIGINS[Math.floor(Math.random() * BACKGROUND_ORIGINS.length)];
  const motivation = BACKGROUND_MOTIVATIONS[Math.floor(Math.random() * BACKGROUND_MOTIVATIONS.length)];
  const skill = BACKGROUND_SKILLS[Math.floor(Math.random() * BACKGROUND_SKILLS.length)];
  return `${origin}, ${motivation}, ${skill}.`;
};

// Generate skills with some variance
const generateSkills = (): Skill[] => {
  const allSkills = Object.values(SkillType);

  // Determine if this colonist has a specialty (70% chance)
  const hasSpecialty = Math.random() < 0.7;
  const specialtyIndex = Math.floor(Math.random() * allSkills.length);

  return allSkills.map((type, index) => {
    let baseLevel = Math.floor(Math.random() * 5) + 1; // 1-5 base

    // Specialty skill gets a bonus
    if (hasSpecialty && index === specialtyIndex) {
      baseLevel += Math.floor(Math.random() * 8) + 5; // +5-12 bonus
    }

    // Some random variation
    baseLevel += Math.floor(Math.random() * 3);

    return {
      type,
      level: Math.min(20, Math.max(1, baseLevel)),
      experience: 0,
    };
  });
};

// Generate needs starting values
const generateNeeds = (): Need[] => {
  return [
    { type: NeedType.Hunger, value: 70 + Math.random() * 30, decayRate: 1.5 },
    { type: NeedType.Sleep, value: 60 + Math.random() * 40, decayRate: 1.2 },
    { type: NeedType.Hygiene, value: 70 + Math.random() * 30, decayRate: 0.8 },
    { type: NeedType.Entertainment, value: 50 + Math.random() * 50, decayRate: 1.0 },
    { type: NeedType.Safety, value: 80 + Math.random() * 20, decayRate: 0.5 },
    { type: NeedType.Comfort, value: 60 + Math.random() * 40, decayRate: 0.7 },
    { type: NeedType.Purpose, value: 50 + Math.random() * 50, decayRate: 0.6 },
    { type: NeedType.Social, value: 60 + Math.random() * 40, decayRate: 0.9 },
  ];
};

// Generate 2-4 random traits (avoiding conflicts)
const generateTraits = (): TraitType[] => {
  const allTraits = Object.values(TraitType);
  const traitCount = Math.floor(Math.random() * 3) + 2; // 2-4 traits
  const traits: TraitType[] = [];

  // Trait conflicts
  const conflicts: { [key: string]: TraitType[] } = {
    [TraitType.Optimist]: [TraitType.Pessimist],
    [TraitType.Pessimist]: [TraitType.Optimist],
    [TraitType.HardWorker]: [TraitType.Lazy],
    [TraitType.Lazy]: [TraitType.HardWorker],
    [TraitType.FastLearner]: [TraitType.SlowLearner],
    [TraitType.SlowLearner]: [TraitType.FastLearner],
    [TraitType.Brave]: [TraitType.Coward],
    [TraitType.Coward]: [TraitType.Brave],
    [TraitType.Careful]: [TraitType.Reckless],
    [TraitType.Reckless]: [TraitType.Careful],
    [TraitType.Friendly]: [TraitType.Antisocial],
    [TraitType.Antisocial]: [TraitType.Friendly],
    [TraitType.Introvert]: [TraitType.Extrovert],
    [TraitType.Extrovert]: [TraitType.Introvert],
    [TraitType.NightOwl]: [TraitType.EarlyBird],
    [TraitType.EarlyBird]: [TraitType.NightOwl],
  };

  while (traits.length < traitCount) {
    const trait = allTraits[Math.floor(Math.random() * allTraits.length)];

    // Check for duplicates
    if (traits.includes(trait)) continue;

    // Check for conflicts
    const hasConflict = traits.some((existingTrait) =>
      conflicts[trait]?.includes(existingTrait)
    );
    if (hasConflict) continue;

    traits.push(trait);
  }

  return traits;
};

// Generate a random portrait ID
const generatePortrait = (): string => {
  return `portrait_${Math.floor(Math.random() * 100)}`;
};

// Main crew member generator
export const generateCrewMember = (): CrewMember => {
  const age = Math.floor(Math.random() * 40) + 20; // 20-60
  const traits = generateTraits();

  // Adjust base stats based on traits
  let baseMood = 50 + Math.random() * 30;
  let baseHealth = 80 + Math.random() * 20;
  let baseStress = Math.random() * 30;

  if (traits.includes(TraitType.Optimist)) baseMood += 15;
  if (traits.includes(TraitType.Pessimist)) baseMood -= 15;
  if (traits.includes(TraitType.Tough)) baseHealth += 10;
  if (traits.includes(TraitType.Frail)) baseHealth -= 10;

  return {
    id: uuidv4(),
    name: generateName(),
    age,
    portrait: generatePortrait(),
    health: Math.min(100, Math.max(0, baseHealth)),
    mood: Math.min(100, Math.max(0, baseMood)),
    stress: Math.min(100, Math.max(0, baseStress)),
    skills: generateSkills(),
    needs: generateNeeds(),
    traits,
    background: generateBackground(),
    relationships: [],
    currentTask: null,
    assignedRoom: null,
    schedule: {
      workStart: 8,
      workEnd: 18,
      priority: [],
    },
    position: { x: 50, y: 50 },
    isAlive: true,
    status: CrewStatus.Idle,
  };
};

// Get skill level for a crew member
export const getSkillLevel = (crew: CrewMember, skillType: SkillType): number => {
  const skill = crew.skills.find((s) => s.type === skillType);
  return skill?.level || 0;
};

// Get the crew member's best skill
export const getBestSkill = (crew: CrewMember): Skill => {
  return crew.skills.reduce((best, current) =>
    current.level > best.level ? current : best
  );
};

// Get trait effect on work
export const getTraitWorkModifier = (traits: TraitType[]): number => {
  let modifier = 1.0;

  if (traits.includes(TraitType.HardWorker)) modifier += 0.2;
  if (traits.includes(TraitType.Lazy)) modifier -= 0.2;
  if (traits.includes(TraitType.Focused)) modifier += 0.15;
  if (traits.includes(TraitType.Perfectionist)) modifier += 0.1;

  return modifier;
};

// Get trait effect on learning
export const getTraitLearningModifier = (traits: TraitType[]): number => {
  let modifier = 1.0;

  if (traits.includes(TraitType.FastLearner)) modifier += 0.3;
  if (traits.includes(TraitType.SlowLearner)) modifier -= 0.3;
  if (traits.includes(TraitType.Focused)) modifier += 0.1;

  return modifier;
};

// Get trait effect on social interactions
export const getTraitSocialModifier = (traits: TraitType[]): number => {
  let modifier = 1.0;

  if (traits.includes(TraitType.Friendly)) modifier += 0.3;
  if (traits.includes(TraitType.Antisocial)) modifier -= 0.3;
  if (traits.includes(TraitType.NaturalLeader)) modifier += 0.2;
  if (traits.includes(TraitType.Extrovert)) modifier += 0.15;
  if (traits.includes(TraitType.Introvert)) modifier -= 0.1;

  return modifier;
};

// Check if crew member is having a mental break
export const checkMentalBreak = (crew: CrewMember): boolean => {
  const avgNeed = crew.needs.reduce((sum, n) => sum + n.value, 0) / crew.needs.length;

  // Base chance increases as needs drop
  let breakChance = 0;
  if (avgNeed < 20) breakChance = 0.1;
  else if (avgNeed < 30) breakChance = 0.05;
  else if (avgNeed < 40) breakChance = 0.02;

  // Stress increases chance
  breakChance += crew.stress / 1000;

  // Traits affect chance
  if (crew.traits.includes(TraitType.Optimist)) breakChance *= 0.7;
  if (crew.traits.includes(TraitType.Pessimist)) breakChance *= 1.3;
  if (crew.traits.includes(TraitType.Tough)) breakChance *= 0.8;

  return Math.random() < breakChance;
};

// Format crew member summary
export const getCrewSummary = (crew: CrewMember): string => {
  const bestSkill = getBestSkill(crew);
  const traitStr = crew.traits.slice(0, 2).join(', ');
  return `${crew.name}, ${crew.age}y - ${bestSkill.type} (${bestSkill.level}) - ${traitStr}`;
};
