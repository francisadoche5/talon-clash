// ============================================
// PAYMENTS CONFIG
// All purchasable products with their Telegram Stars price.
// Add/remove/change products here only.
// ============================================

const STATIC_PRODUCTS = {
  // Auto Battle
  auto_battle_3d: {
    title: '⚙️ Auto Battle — 3 Days',
    description: 'Your bird fights automatically for 3 days.',
    stars: 199,
    type: 'auto_battle',
    duration_days: 3,
  },
  auto_battle_14d: {
    title: '⚙️ Auto Battle — 14 Days',
    description: 'Best value! Your bird fights automatically for 14 days.',
    stars: 499,
    type: 'auto_battle',
    duration_days: 14,
  },
  // Clan
  clan_create: {
    title: '👥 Create a Clan',
    description: 'Found your own clan and lead your flock to glory!',
    stars: 50,
    type: 'clan_create',
  },
  // Energy refills
  energy_50: {
    title: '⚡ Energy Refill +50',
    description: 'Instantly restore 50 energy to keep fighting!',
    stars: 50,
    type: 'energy',
    amount: 50,
  },
  energy_250: {
    title: '⚡ Energy Refill +250',
    description: 'Restore 250 energy and dominate the arena.',
    stars: 250,
    type: 'energy',
    amount: 250,
  },
  energy_750: {
    title: '⚡ Energy Refill +750',
    description: 'Full restore plus overflow — 750 energy unleashed!',
    stars: 750,
    type: 'energy',
    amount: 750,
  },
  // Chests
  chest_common: {
    title: '📦 Common Chest',
    description: 'Contains common gear and items.',
    stars: 49,
    type: 'chest',
    chest_type: 'common',
  },
  chest_uncommon: {
    title: '🗃️ Uncommon Chest',
    description: 'Better loot from uncommon adventures.',
    stars: 149,
    type: 'chest',
    chest_type: 'uncommon',
  },
  chest_rare: {
    title: '🔒 Rare Chest',
    description: 'Rare items with powerful bonuses.',
    stars: 1449,
    type: 'chest',
    chest_type: 'rare',
  },
  chest_epic: {
    title: '👑 Epic Chest',
    description: 'The rarest gear in the land awaits.',
    stars: 7499,
    type: 'chest',
    chest_type: 'epic',
  },
  // Feathers packs
  feathers_1000: {
    title: '🪶 Feathers x1,000',
    description: 'A bundle of 1,000 feathers.',
    stars: 149,
    type: 'feathers',
    amount: 1000,
  },
  feathers_2500: {
    title: '🪶 Feathers x2,500',
    description: 'A bundle of 2,500 feathers.',
    stars: 749,
    type: 'feathers',
    amount: 2500,
  },
  feathers_8500: {
    title: '🪶 Feathers x8,500',
    description: 'A large bundle of 8,500 feathers.',
    stars: 1999,
    type: 'feathers',
    amount: 8500,
  },
  feathers_17000: {
    title: '🪶 Feathers x17,000',
    description: 'Massive bundle of 17,000 feathers!',
    stars: 4999,
    type: 'feathers',
    amount: 17000,
  },
  feathers_50500: {
    title: '🪶 Feathers x50,500',
    description: 'The ultimate feathers bundle — 50,500!',
    stars: 6999,
    type: 'feathers',
    amount: 50500,
  },
  // Boosters
  booster_x1: {
    title: '⚗️ Booster x1',
    description: 'One battle booster for extra rewards.',
    stars: 100,
    type: 'booster',
    amount: 1,
  },
  booster_x3: {
    title: '⚗️ Booster x3',
    description: 'Three battle boosters.',
    stars: 250,
    type: 'booster',
    amount: 3,
  },
  booster_x5: {
    title: '⚗️ Booster x5',
    description: 'Five battle boosters.',
    stars: 400,
    type: 'booster',
    amount: 5,
  },
  // Epic Boosters
  epic_booster_x1: {
    title: '💥 Epic Booster x1',
    description: 'One epic battle booster.',
    stars: 250,
    type: 'epic_booster',
    amount: 1,
  },
  epic_booster_x3: {
    title: '💥 Epic Booster x3',
    description: 'Three epic battle boosters.',
    stars: 675,
    type: 'epic_booster',
    amount: 3,
  },
  epic_booster_x5: {
    title: '💥 Epic Booster x5',
    description: 'Five epic battle boosters.',
    stars: 1125,
    type: 'epic_booster',
    amount: 5,
  },
  // Hammers
  hammers_x5: {
    title: '🔨 Hammers x5',
    description: 'Five forge hammers.',
    stars: 2700,
    type: 'hammer',
    amount: 5,
  },
  hammers_x10: {
    title: '🔨 Hammers x10',
    description: 'Ten forge hammers.',
    stars: 4600,
    type: 'hammer',
    amount: 10,
  },
  hammers_x15: {
    title: '🔨 Hammers x15',
    description: 'Fifteen forge hammers.',
    stars: 5500,
    type: 'hammer',
    amount: 15,
  },
  // Special Offers
  special_overcharge: {
    title: '💥 Overcharge Pack',
    description: 'Epic Booster x40 — dominate every battle!',
    stars: 5900,
    type: 'special',
    items: [{ type: 'epic_booster', amount: 40 }],
  },
  special_electra: {
    title: '⚡ Electra Pack',
    description: 'Booster x60 — endless battles ahead!',
    stars: 3500,
    type: 'special',
    items: [{ type: 'booster', amount: 60 }],
  },
  special_tesla: {
    title: '⚡ Energy Tesla',
    description: 'Feathers x5,000 + Booster x30',
    stars: 2000,
    type: 'special',
    items: [{ type: 'feathers', amount: 5000 }, { type: 'booster', amount: 30 }],
  },
  // Star Credits — virtual in-game currency wallet, topped up with real Telegram Stars.
  // Always paid for with real Stars (never with Star Credits themselves).
  star_credits_100: {
    title: '⭐ 100 Star Credits',
    description: 'Top up your wallet with 100 Star Credits to spend in the store.',
    stars: 100,
    type: 'star_credits',
    amount: 100,
  },
  star_credits_500: {
    title: '⭐ 500 Star Credits',
    description: 'Top up your wallet with 500 Star Credits.',
    stars: 500,
    type: 'star_credits',
    amount: 500,
  },
  star_credits_1500: {
    title: '⭐ 1,500 Star Credits',
    description: 'Top up your wallet with 1,500 Star Credits.',
    stars: 1500,
    type: 'star_credits',
    amount: 1500,
  },
  star_credits_5000: {
    title: '⭐ 5,000 Star Credits',
    description: 'Best value! Top up your wallet with 5,000 Star Credits.',
    stars: 5000,
    type: 'star_credits',
    amount: 5000,
  },
};

module.exports = { STATIC_PRODUCTS };
