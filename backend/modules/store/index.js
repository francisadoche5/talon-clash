const supabase = require('../../supabase');
const { CHEST_REWARDS, ITEM_TYPES, ITEM_NAMES } = require('../../config/store');

function generateItem(rarity) {
  const type = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
  const rarityIndex = ['common','uncommon','rare','epic','legendary'].indexOf(rarity);
  const names = ITEM_NAMES[type];
  const name = names[Math.min(rarityIndex, names.length - 1)];

  const multiplier = rarityIndex + 1;
  return {
    name,
    type,
    rarity,
    level: 1,
    attack_bonus: Math.floor(Math.random() * 10 * multiplier),
    hp_bonus: Math.floor(Math.random() * 30 * multiplier),
    defense_bonus: Math.floor(Math.random() * 5 * multiplier),
    is_equipped: false,
    slot: type
  };
}

function rollChestItem(chestType) {
  const config = CHEST_REWARDS[chestType];
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const item of config.items) {
    cumulative += item.chance;
    if (roll <= cumulative) return generateItem(item.rarity);
  }
  return generateItem('common');
}

async function openChest(telegramId, chestType) {
  const config = CHEST_REWARDS[chestType];
  if (!config) return { error: 'Invalid chest type' };

  const { data: player } = await supabase
    .from('players')
    .select('feathers')
    .eq('telegram_id', telegramId)
    .single();

  if (player.feathers < config.price) {
    return { error: 'Not enough feathers' };
  }

  const item = rollChestItem(chestType);

  await supabase.from('players').update({
    feathers: player.feathers - config.price
  }).eq('telegram_id', telegramId);

  const { data: newItem } = await supabase.from('items').insert({
    player_id: telegramId,
    ...item
  }).select().single();

  return { success: true, item: newItem, cost: config.price };
}

// Chests bought with Stars/Star Credits are queued in `pending_chests` at
// purchase time (see modules/payments) instead of being opened immediately.
// These two functions let the player actually see and open them afterwards —
// previously nothing ever read from this table, so purchased chests just
// vanished as far as the player could tell.
async function getPendingChests(telegramId) {
  const { data: chests } = await supabase
    .from('pending_chests')
    .select('*')
    .eq('telegram_id', telegramId)
    .order('created_at', { ascending: false });
  return chests || [];
}

async function openPendingChest(telegramId, pendingChestId) {
  const { data: pending } = await supabase
    .from('pending_chests')
    .select('*')
    .eq('id', pendingChestId)
    .eq('telegram_id', telegramId)
    .single();

  if (!pending) return { error: 'Chest not found' };

  const config = CHEST_REWARDS[pending.chest_type];
  if (!config) return { error: 'Invalid chest type' };

  // Already paid for with Stars/Star Credits at purchase time — no extra
  // currency cost here, just roll the reward and remove it from the queue.
  const item = rollChestItem(pending.chest_type);

  const { data: newItem } = await supabase.from('items').insert({
    player_id: telegramId,
    ...item
  }).select().single();

  await supabase.from('pending_chests').delete().eq('id', pendingChestId);

  return { success: true, item: newItem, chest_type: pending.chest_type };
}

async function buyStoreItem(telegramId, itemId) {
  const { data: storeItem } = await supabase
    .from('store_items')
    .select('*')
    .eq('id', itemId)
    .eq('is_active', true)
    .single();

  if (!storeItem) return { error: 'Item not found or unavailable' };

  const { data: player } = await supabase
    .from('players')
    .select('feathers, hammers, energy, max_energy')
    .eq('telegram_id', telegramId)
    .single();

  const currency = storeItem.currency;
  const price = storeItem.discount_percent > 0
    ? Math.floor(storeItem.price * (1 - storeItem.discount_percent / 100))
    : storeItem.price;

  if (player[currency] < price) {
    return { error: `Not enough ${currency}` };
  }

  const updates = { [currency]: player[currency] - price };

  if (storeItem.category === 'boosters') {
    const boostAmount = storeItem.name.includes('x1') ? 50 :
                        storeItem.name.includes('x3') ? 250 : 750;
    // Paid refill — allowed to overflow past max_energy, same as every other
    // energy purchase path. Bump energy_updated_at so passive regen doesn't
    // clamp the overflow back down to max_energy on the next tick.
    updates.energy = (player.energy || 0) + boostAmount;
    updates.energy_updated_at = new Date().toISOString();
  } else if (storeItem.category === 'hammers') {
    const qty = storeItem.name.includes('x5') ? 5 :
                storeItem.name.includes('x10') ? 10 : 15;
    updates.hammers = (player.hammers || 0) + qty;
  }

  await supabase.from('players').update(updates).eq('telegram_id', telegramId);

  return { success: true, item: storeItem, paid: price };
}

module.exports = { openChest, buyStoreItem, getPendingChests, openPendingChest };
