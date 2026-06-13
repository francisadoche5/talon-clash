// ============================================
// STORE CONFIG
// Add/remove/change items here only
// ============================================

const STORE_CONFIG = {
  categories: ["special_offers", "boosters", "epic_boosters", "hammers", "chests", "feathers"],

  autoBattle: {
    options: [
      { days: 3, stars: 177, ton: 0.5, label: "3 DAYS" },
      { days: 14, stars: 700, ton: 2, label: "14 DAYS" }
    ]
  },

  adQuests: {
    dailyLimit: 30,
    rewardPerAd: 400,
    cooldownMinutes: 12
  }
};

const CHEST_REWARDS = {
  common: {
    price: 49,
    currency: "feathers",
    items: [
      { rarity: "common", chance: 80 },
      { rarity: "uncommon", chance: 20 }
    ]
  },
  uncommon: {
    price: 149,
    currency: "feathers",
    items: [
      { rarity: "common", chance: 40 },
      { rarity: "uncommon", chance: 50 },
      { rarity: "rare", chance: 10 }
    ]
  },
  rare: {
    price: 1449,
    currency: "feathers",
    items: [
      { rarity: "uncommon", chance: 30 },
      { rarity: "rare", chance: 60 },
      { rarity: "epic", chance: 10 }
    ]
  },
  epic: {
    price: 7499,
    currency: "feathers",
    items: [
      { rarity: "rare", chance: 30 },
      { rarity: "epic", chance: 60 },
      { rarity: "legendary", chance: 10 }
    ]
  }
};

const ITEM_TYPES = ["weapon", "armor", "helmet", "boots", "ring", "mount"];

const ITEM_NAMES = {
  weapon: ["Iron Talon", "Steel Claw", "Golden Blade", "Shadow Fang", "Diamond Edge"],
  armor: ["Feather Vest", "Iron Plating", "Golden Armor", "Shadow Mail", "Diamond Shield"],
  helmet: ["Leather Cap", "Iron Helm", "Golden Crown", "Shadow Mask", "Diamond Crest"],
  boots: ["Leather Boots", "Iron Greaves", "Golden Treads", "Shadow Steps", "Diamond Stride"],
  ring: ["Bronze Ring", "Silver Band", "Golden Loop", "Shadow Seal", "Diamond Circle"],
  mount: ["Common Hawk", "Swift Eagle", "War Griffin", "Shadow Roc", "Legendary Phoenix"]
};

module.exports = { STORE_CONFIG, CHEST_REWARDS, ITEM_TYPES, ITEM_NAMES };
