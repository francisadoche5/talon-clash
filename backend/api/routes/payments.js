const router = require('express').Router();
const supabase = require('../../supabase');

let bot;
function setBot(b) { bot = b; }

// All purchasable products with their Telegram Stars price
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
};

// POST /api/payments/invoice
router.post('/invoice', async (req, res) => {
  try {
    const { telegram_id, product } = req.body;
    if (!telegram_id || !product) {
      return res.status(400).json({ error: 'Missing telegram_id or product' });
    }

    // Allow config-overrideable prices for a few products
    let p = { ...STATIC_PRODUCTS[product] };
    if (!p || !p.title) {
      return res.status(400).json({ error: 'Unknown product: ' + product });
    }

    // Override prices from game_config if present
    const overridableKeys = {
      auto_battle_3d:  'auto_battle_3days_stars',
      auto_battle_14d: 'auto_battle_14days_stars',
      clan_create:     'clan_creation_stars',
    };
    if (overridableKeys[product]) {
      const { data: configs } = await supabase
        .from('game_config')
        .select('key, value')
        .eq('key', overridableKeys[product]);
      if (configs?.length) {
        const val = parseInt(configs[0].value);
        if (val) p.stars = val;
      }
    }

    const link = await bot.telegram.createInvoiceLink({
      title: p.title,
      description: p.description,
      payload: `${product}_${telegram_id}`,
      currency: 'XTR',
      prices: [{ label: p.title, amount: p.stars }],
    });

    res.json({ success: true, link, product_meta: { type: p.type, stars: p.stars } });
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/webhook  (called by Telegram on successful payment)
// The bot's pre_checkout_query + successful_payment should be handled in index.js
// This route is a helper for manual fulfillment if needed
router.post('/fulfill', async (req, res) => {
  try {
    const { telegram_id, product, payload } = req.body;
    const p = STATIC_PRODUCTS[product];
    if (!p) return res.status(400).json({ error: 'Unknown product' });

    const updates = {};

    if (p.type === 'energy') {
      const { data: player } = await supabase
        .from('players').select('energy, max_energy').eq('telegram_id', telegram_id).single();
      const newEnergy = Math.min((player?.max_energy || 400), (player?.energy || 0) + p.amount);
      updates.energy = newEnergy;
    } else if (p.type === 'feathers') {
      const { data: player } = await supabase
        .from('players').select('feathers').eq('telegram_id', telegram_id).single();
      updates.feathers = (player?.feathers || 0) + p.amount;
    } else if (p.type === 'booster') {
      const { data: player } = await supabase
        .from('players').select('boosters').eq('telegram_id', telegram_id).single();
      updates.boosters = (player?.boosters || 0) + p.amount;
    } else if (p.type === 'epic_booster') {
      const { data: player } = await supabase
        .from('players').select('epic_boosters').eq('telegram_id', telegram_id).single();
      updates.epic_boosters = (player?.epic_boosters || 0) + p.amount;
    } else if (p.type === 'hammer') {
      const { data: player } = await supabase
        .from('players').select('hammers').eq('telegram_id', telegram_id).single();
      updates.hammers = (player?.hammers || 0) + p.amount;
    } else if (p.type === 'auto_battle') {
      const expires = new Date();
      expires.setDate(expires.getDate() + p.duration_days);
      updates.auto_battle_active = true;
      updates.auto_battle_expires = expires.toISOString();
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('players').update(updates).eq('telegram_id', telegram_id);
    }

    // Handle special multi-item packs
    if (p.type === 'special' && p.items) {
      for (const item of p.items) {
        const { data: player } = await supabase
          .from('players').select('feathers, boosters, epic_boosters').eq('telegram_id', telegram_id).single();
        const itemUpdate = {};
        if (item.type === 'feathers')     itemUpdate.feathers      = (player?.feathers      || 0) + item.amount;
        if (item.type === 'booster')      itemUpdate.boosters      = (player?.boosters      || 0) + item.amount;
        if (item.type === 'epic_booster') itemUpdate.epic_boosters = (player?.epic_boosters || 0) + item.amount;
        if (Object.keys(itemUpdate).length) {
          await supabase.from('players').update(itemUpdate).eq('telegram_id', telegram_id);
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Fulfill error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setBot, STATIC_PRODUCTS };
