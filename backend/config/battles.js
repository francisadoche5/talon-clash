// ============================================
// BATTLE CONFIG
// Change any value here without touching battle logic
// ============================================

const BATTLE_CONFIG = {
  normal: {
    energyCost: 25,
    color: "yellow",
    rewards: {
      win: {
        xpMultiplier: 1,
        gloryMultiplier: 1,
        baseFood: 100,
        baseFeathers: 50
      },
      lose: {
        xpMultiplier: 1,
        gloryMultiplier: 1,
        baseFood: 50,
        baseFeathers: 25
      }
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
      win: {
        xpMultiplier: 2,
        gloryMultiplier: 2,
        baseFood: 250,
        baseFeathers: 200
      },
      lose: {
        xpMultiplier: 2,
        gloryMultiplier: 2,
        baseFood: 100,
        baseFeathers: 150
      }
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
