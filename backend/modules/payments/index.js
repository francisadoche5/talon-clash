const supabase = require('../../supabase');
const { STATIC_PRODUCTS } = require('../../config/payments');
const { rollChestItem } = require('../store');
const { updateQuestProgress } = require('../quests');

// Grants whatever a product gives (energy, feathers, boosters, hammers, chests,
// auto battle, clan unlock, star credits, special bundles...). Used by:
//   - the virtual Star Credits purchase path (api/routes/payments.js -> /purchase)
//   - the manual fulfillment helper (api/routes/payments.js -> /fulfill)
async function fulfillProduct(telegramId, productKey) {
  const p = STATIC_PRODUCTS[productKey];
  if (!p) return { error: 'Unknown product: ' + productKey };

  switch (p.type) {
    case 'auto_battle': {
      const expiresAt = new Date(Date.now() + p.duration_days * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('players')
        .update({ auto_battle_active: true, auto_battle_expires_at: expiresAt })
        .eq('telegram_id', telegramId);
      return { type: 'auto_battle', duration_days: p.duration_days };
    }

    case 'clan_create': {
      await supabase.from('players')
        .update({ can_create_clan_stars: true })
        .eq('telegram_id', telegramId);
      return { type: 'clan_create' };
    }

    case 'energy': {
      const { data: pl } = await supabase.from('players')
        .select('energy').eq('telegram_id', telegramId).single();
      // Always adds on top of current energy — allowed to overflow past max_energy,
      // since this is a paid refill, not a passive regen tick. We also bump
      // energy_updated_at so the next passive regen tick doesn't compute a huge
      // elapsed-time delta and clamp this overflow back down to max_energy.
      await supabase.from('players')
        .update({
          energy: (pl?.energy || 0) + p.amount,
          energy_updated_at: new Date().toISOString(),
        }).eq('telegram_id', telegramId);
      return { type: 'energy', amount: p.amount };
    }

    case 'feathers': {
      const { data: pl } = await supabase.from('players')
        .select('feathers').eq('telegram_id', telegramId).single();
      await supabase.from('players')
        .update({ feathers: (pl?.feathers || 0) + p.amount }).eq('telegram_id', telegramId);
      return { type: 'feathers', amount: p.amount };
    }

    case 'booster': {
      const { data: pl } = await supabase.from('players')
        .select('boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players')
        .update({ boosters: (pl?.boosters || 0) + p.amount }).eq('telegram_id', telegramId);
      return { type: 'booster', amount: p.amount };
    }

    case 'epic_booster': {
      const { data: pl } = await supabase.from('players')
        .select('epic_boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players')
        .update({ epic_boosters: (pl?.epic_boosters || 0) + p.amount }).eq('telegram_id', telegramId);
      return { type: 'epic_booster', amount: p.amount };
    }

    case 'hammer': {
      const { data: pl } = await supabase.from('players')
        .select('hammers').eq('telegram_id', telegramId).single();
      await supabase.from('players')
        .update({ hammers: (pl?.hammers || 0) + p.amount }).eq('telegram_id', telegramId);
      return { type: 'hammer', amount: p.amount };
    }

    case 'star_credits': {
      const { data: pl } = await supabase.from('players')
        .select('stars').eq('telegram_id', telegramId).single();
      await supabase.from('players')
        .update({ stars: (pl?.stars || 0) + p.amount }).eq('telegram_id', telegramId);
      return { type: 'star_credits', amount: p.amount };
    }

    case 'chest': {
      // Used to queue into `pending_chests` and require a separate "open" tap
      // in Inventory. That extra step was where purchased chests were
      // silently getting lost, and since nothing was ever actually opened,
      // the "Open N Chests" quest never advanced either. Now the item is
      // rolled and handed over the moment the chest is bought — one action,
      // matching rarity guaranteed, no separate step to forget or fail on.
      const item = rollChestItem(p.chest_type);
      const { data: newItem } = await supabase.from('items').insert({
        player_id: telegramId,
        ...item,
      }).select().single();

      await updateQuestProgress(telegramId, 'chests_opened', 1);

      return { type: 'chest', chest_type: p.chest_type, item: newItem };
    }

    case 'special': {
      const { data: pl } = await supabase.from('players')
        .select('feathers, boosters, epic_boosters').eq('telegram_id', telegramId).single();
      const updates = {};
      for (const item of p.items) {
        if (item.type === 'feathers')     updates.feathers      = (pl?.feathers      || 0) + item.amount;
        if (item.type === 'booster')      updates.boosters      = (pl?.boosters      || 0) + item.amount;
        if (item.type === 'epic_booster') updates.epic_boosters = (pl?.epic_boosters || 0) + item.amount;
      }
      if (Object.keys(updates).length) {
        await supabase.from('players').update(updates).eq('telegram_id', telegramId);
      }
      return { type: 'special', items: p.items };
    }

    default:
      return { error: 'Unhandled product type: ' + p.type };
  }
}

module.exports = { fulfillProduct };
