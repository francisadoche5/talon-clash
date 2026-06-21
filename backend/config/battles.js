// ============================================
// BATTLE CONFIG
// Change any value here without touching battle logic
// ============================================

// Reward amounts are flat, fixed numbers per the agreed reward table —
// no RNG/multiplier involved for the base xp/glory/feathers/stars payout.
// (The bonusRewards table below is a separate, additional chance-based
// bonus roll that only fires on a win — untouched by that rebalance.)
const BATTLE_CONFIG = {
  normal: {
    energyCost: 25,
    color: "yellow",
    rewards: {
      win:  { xp: 20, glory: 50, feathers: 20, stars: 1 },
      lose: { xp: 6,  glory: 20, feathers: 8,  stars: 0 }
    },
    bonusRewards: [
      { type: "feathers", amount: 200,  chance: 40 },
      { type: "feathers", amount: 500,  chance: 25 },
      { type: "feathers", amount: 1000, chance: 15 },
      { type: "small_booster", amount: 1, chance: 12 },
      { type: "medium_booster", amount: 1, chance: 4 },
      { type: "hammer", amount: 1, chance: 3 },
      { type: "rare_chest", amount: 1, chance: 1 }
    ]
  },
  epic: {
    energyCost: 200,
    color: "purple",
    rewards: {
      win:  { xp: 170, glory: 500, feathers: 1000, stars: 5 },
      lose: { xp: 60,  glory: 150, feathers: 250,  stars: 0 }
    },
    bonusRewards: [
      { type: "feathers", amount: 500,  chance: 45 },
      { type: "feathers", amount: 1000, chance: 25 },
      { type: "feathers", amount: 2000, chance: 15 },
      { type: "small_booster", amount: 1, chance: 10 },
      { type: "medium_booster", amount: 1, chance: 2 },
      { type: "golden_talon", amount: 1, chance: 2 },
      { type: "diamond_talon", amount: 1, chance: 0.5 },
      { type: "legendary_chest", amount: 1, chance: 0.3 },
      { type: "shadow_eagle_fragment", amount: 1, chance: 0.2 }
    ]
  }
};

const STAT_CONFIG = {
  baseAttack: 10,
  baseHP: 100,
  baseDefense: 5,
  attackPerLevel: 5,
  hpPerLevel: 50,
  defensePerLevel: 2
};

const CRIT_CONFIG = {
  baseCritChance: 5,
  critMultiplier: 2
};

const BLOCK_CONFIG = {
  baseBlockChance: 5,
  blockReduction: 0.5
};

function rollBonusReward(rewards) {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const reward of rewards) {
    cumulative += reward.chance;
    if (roll <= cumulative) return reward;
  }
  return null;
}

module.exports = { BATTLE_CONFIG, STAT_CONFIG, CRIT_CONFIG, BLOCK_CONFIG, rollBonusReward };
