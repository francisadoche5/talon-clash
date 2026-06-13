// ============================================
// EVOLUTION CONFIG
// To add a new tier: add a new object below
// To change thresholds: just change the numbers
// Nothing else in the game needs to change
// ============================================

const EVOLUTIONS = [
  {
    tier: 1,
    name: "Hatchling",
    emoji: "🐣",
    minPower: 0,
    maxPower: 500,
    description: "A tiny bird just learning to exist"
  },
  {
    tier: 2,
    name: "Fledgling",
    emoji: "🐦",
    minPower: 501,
    maxPower: 2000,
    description: "Learning to fly and fight"
  },
  {
    tier: 3,
    name: "Sparrow Warrior",
    emoji: "🦅",
    minPower: 2001,
    maxPower: 5000,
    description: "First taste of real battle"
  },
  {
    tier: 4,
    name: "Falcon Knight",
    emoji: "⚔️",
    minPower: 5001,
    maxPower: 15000,
    description: "A fierce and armored fighter"
  },
  {
    tier: 5,
    name: "War Hawk",
    emoji: "🔥",
    minPower: 15001,
    maxPower: 40000,
    description: "Fire burns in its wings"
  },
  {
    tier: 6,
    name: "Eagle Champion",
    emoji: "👑",
    minPower: 40001,
    maxPower: 100000,
    description: "Crowned ruler of the sky"
  },
  {
    tier: 7,
    name: "Shadow Eagle",
    emoji: "💀",
    minPower: 100001,
    maxPower: 999999999,
    description: "A mythical dark force"
  }
];

function getEvolutionByPower(power) {
  return EVOLUTIONS.find(e => power >= e.minPower && power <= e.maxPower) || EVOLUTIONS[0];
}

module.exports = { EVOLUTIONS, getEvolutionByPower };
