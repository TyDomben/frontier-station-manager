# Frontier Station

A deep space colony management simulation game. Build and manage a space station on the edge of known space, balance resources, crew needs, threats, and expansion.

## Features

### Station Management
- **81 Room Types** across 12 categories (Living, Production, Power, Life Support, Medical, Research, Recreation, Storage, Command, Security, Docking, Engineering)
- Modular construction system with drag-and-place building
- Power grid management with multiple generator types
- Life support systems (Oxygen, Temperature, Pressure)
- Construction progress and room condition tracking

### Crew System
- **Procedurally generated crew** with unique names, backgrounds, and traits
- **10 Skills**: Engineering, Science, Medical, Combat, Social, Cooking, Farming, Piloting, Hacking, Leadership
- **8 Needs**: Hunger, Sleep, Hygiene, Entertainment, Safety, Comfort, Purpose, Social
- **25+ Personality Traits** affecting behavior and efficiency
- Mood and stress systems with mental break mechanics
- Relationships between crew members (friends, rivals, romance)

### Resources
- **18 Resource Types** including Oxygen, Water, Food, Power, Metals, Electronics, Fuel, Medical Supplies, and more
- Production chains and refinement systems
- Storage management with capacity limits

### Events
- **100 Random Events** across 6 categories:
  - Disasters (25 events): Meteor showers, hull breaches, fires, system failures
  - Medical (20 events): Disease outbreaks, injuries, psychological episodes
  - Social (15 events): Crew conflicts, celebrations, romances
  - Combat (15 events): Pirate raids, alien encounters, boarding actions
  - Trade (10 events): Trader arrivals, supply shortages, black market
  - Discovery (15 events): Derelicts, artifacts, research breakthroughs

### Technology
- **64 Technologies** across 10 categories:
  - Life Support, Power, Agriculture, Medicine, Engineering
  - Weapons, Propulsion, Robotics, Materials, Alien Tech
- Prerequisite chains and research progression
- Technology unlocks new rooms and abilities

### Ships & Exploration
- 6 Ship types: Mining, Cargo, Scout, Fighter, Rescue, Research
- Mission system for exploration, trade, and combat

### Diplomacy & Trade
- Faction reputation system
- Trade offers and contracts
- Multiple victory conditions

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Controls

- **SPACE** - Pause/Resume game
- **ESC** - Return to main menu
- **Mouse wheel** - Zoom in/out
- **Middle mouse / Shift+Click** - Pan camera
- **Click** - Select rooms or place buildings

## Game Scenarios

1. **Fresh Start** - Small crew, basic resources, balanced start
2. **Emergency Colony** - Damaged station, limited resources, time pressure
3. **Rich Expedition** - Ample resources, high expectations
4. **Isolated Outpost** - Far from help, must be self-reliant
5. **Scientific Expedition** - Research focus, more scientists

## Victory Conditions

- **Population**: Reach 100 happy colonists
- **Wealth**: Accumulate massive resources
- **Research**: Unlock all 64 technologies
- **Expansion**: Build the largest station
- **Reputation**: Become renowned across space
- **Sandbox**: No win condition, just build

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Vite** - Build tool

## Project Structure

```
src/
├── core/           # Core types and game store
├── game/
│   ├── data/       # Room definitions, events, tech tree
│   ├── entities/   # Crew generation
│   └── systems/    # Game systems (resources, crew, events)
├── ui/
│   └── components/ # React components
└── utils/          # Helper functions
```

## Contributing

Feel free to submit issues and pull requests!

## License

MIT
