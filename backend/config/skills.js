// ============================================
// SKILL TREE CONFIG
// Change skill values here only
// ============================================

const SKILL_TREE = {
  attack: {
    name: "Attack",
    icon: "⚔️",
    levels: [
      { level: 1, bonus: 5,  cost: 1 },
      { level: 2, bonus: 5,  cost: 1 },
      { level: 3, bonus: 8,  cost: 2 },
      { level: 4, bonus: 8,  cost: 2 },
      { level: 5, bonus: 10, cost: 2 },
      { level: 6, bonus: 10, cost: 3 },
      { level: 7, bonus: 22, cost: 3 },
      { level: 8, bonus: 9,  cost: 3 },
      { level: 9, bonus: 10, cost: 4 },
      { level: 10, bonus: 12, cost: 5 }
    ]
  },
  hp: {
    name: "HP",
    icon: "❤️",
    levels: [
      { level: 1, bonus: 14, cost: 1 },
      { level: 2, bonus: 15, cost: 1 },
      { level: 3, bonus: 17, cost: 2 },
      { level: 4, bonus: 36, cost: 2 },
      { level: 5, bonus: 31, cost: 2 },
      { level: 6, bonus: 47, cost: 3 },
      { level: 7, bonus: 24, cost: 3 },
      { level: 8, bonus: 27, cost: 3 },
      { level: 9, bonus: 28, cost: 4 },
      { level: 10, bonus: 72, cost: 5 }
    ]
  },
  defense: {
    name: "Defense",
    icon: "🛡️",
    levels: [
      { level: 1, bonus: 2,  cost: 1 },
      { level: 2, bonus: 2,  cost: 1 },
      { level: 3, bonus: 2,  cost: 2 },
      { level: 4, bonus: 3,  cost: 2 },
      { level: 5, bonus: 3,  cost: 2 },
      { level: 6, bonus: 4,  cost: 3 },
      { level: 7, bonus: 4,  cost: 3 },
      { level: 8, bonus: 5,  cost: 3 },
      { level: 9, bonus: 5,  cost: 4 },
      { level: 10, bonus: 6, cost: 5 }
    ]
  },
  crit: {
    name: "Crit",
    icon: "💥",
    levels: [
      { level: 1, bonus: 2.0, cost: 1 },
      { level: 2, bonus: 2.0, cost: 2 },
      { level: 3, bonus: 3.0, cost: 2 },
      { level: 4, bonus: 1.0, cost: 3 },
      { level: 5, bonus: 9.0, cost: 3 },
      { level: 6, bonus: 9.0, cost: 4 },
      { level: 7, bonus: 3.0, cost: 4 },
      { level: 8, bonus: 4.0, cost: 5 },
      { level: 9, bonus: 6.0, cost: 5 },
      { level: 10, bonus: 7.0, cost: 6 }
    ]
  }
};

function getSkillBonus(skill, currentLevel) {
  const levels = SKILL_TREE[skill]?.levels || [];
  return levels.slice(0, currentLevel).reduce((sum, l) => sum + l.bonus, 0);
}

function getSkillCost(skill, nextLevel) {
  const levels = SKILL_TREE[skill]?.levels || [];
  return levels[nextLevel - 1]?.cost || 1;
}

module.exports = { SKILL_TREE, getSkillBonus, getSkillCost };
