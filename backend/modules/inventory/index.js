const supabase = require('../../supabase');

// Feathers earned for burning an unequipped item, by rarity. Each burn rolls
// a random amount inside the range (inclusive) rather than a single fixed
// number — gives burning a bit of variance instead of always paying the same.
// NOTE: "legendary" wasn't specified in the requested rebalance — its range
// here is just scaled to sit above "epic" the same way the other tiers scale
// up from one another. Adjust freely in this one place if that's not right.
const RARITY_REWARD_RANGE = {
  common:    [30, 36],
  uncommon:  [66, 70],
  rare:      [100, 200],
  epic:      [300, 500],
  legendary: [600, 1000],
};

function rollFeathers(rarity) {
  const [min, max] = RARITY_REWARD_RANGE[rarity] || RARITY_REWARD_RANGE.common;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getInventory(telegramId) {
  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('player_id', telegramId)
    .order('created_at', { ascending: false });
  return items || [];
}

async function equipItem(telegramId, itemId) {
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .eq('player_id', telegramId)
    .single();

  if (!item) return { error: 'Item not found' };

  await supabase
    .from('items')
    .update({ is_equipped: false })
    .eq('player_id', telegramId)
    .eq('slot', item.slot)
    .eq('is_equipped', true);

  await supabase
    .from('items')
    .update({ is_equipped: true })
    .eq('id', itemId);

  return { success: true, item };
}

async function burnItem(telegramId, itemId) {
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .eq('player_id', telegramId)
    .single();

  if (!item) return { error: 'Item not found' };
  if (item.is_equipped) return { error: 'Cannot burn equipped item' };

  const feathersEarned = rollFeathers(item.rarity);

  await supabase.from('items').delete().eq('id', itemId);

  const { data: player } = await supabase
    .from('players')
    .select('feathers')
    .eq('telegram_id', telegramId)
    .single();

  await supabase.from('players').update({
    feathers: player.feathers + feathersEarned
  }).eq('telegram_id', telegramId);

  return { success: true, feathersEarned };
}

// Burns several unequipped items in one go ("Burn several artifacts").
// Refuses the whole batch if any selected item is missing, not owned by
// this player, or currently equipped — so a player can never accidentally
// lose an equipped item through the bulk flow.
async function burnItems(telegramId, itemIds) {
  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    return { error: 'No items selected' };
  }

  const uniqueIds = [...new Set(itemIds)];

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('player_id', telegramId)
    .in('id', uniqueIds);

  if (!items || items.length !== uniqueIds.length) {
    return { error: 'One or more items not found' };
  }
  if (items.some(i => i.is_equipped)) {
    return { error: 'Cannot burn an equipped item' };
  }

  const burned = items.map(item => ({
    id: item.id,
    name: item.name,
    rarity: item.rarity,
    feathersEarned: rollFeathers(item.rarity),
  }));
  const feathersEarned = burned.reduce((sum, b) => sum + b.feathersEarned, 0);

  await supabase.from('items').delete().in('id', uniqueIds);

  const { data: player } = await supabase
    .from('players')
    .select('feathers')
    .eq('telegram_id', telegramId)
    .single();

  await supabase.from('players').update({
    feathers: (player.feathers || 0) + feathersEarned
  }).eq('telegram_id', telegramId);

  return { success: true, feathersEarned, burnedCount: burned.length, burned };
}

async function forgeItem(telegramId, itemId) {
  const { data: item } = await supabase
    .from('items')
    .select('*')
    .eq('id', itemId)
    .eq('player_id', telegramId)
    .single();

  if (!item) return { error: 'Item not found' };

  const { data: player } = await supabase
    .from('players')
    .select('hammers')
    .eq('telegram_id', telegramId)
    .single();

  const hammersNeeded = item.level;
  if (player.hammers < hammersNeeded) {
    return { error: `Need ${hammersNeeded} hammers` };
  }

  const newLevel = item.level + 1;
  const bonusMultiplier = 1.2;

  await supabase.from('items').update({
    level: newLevel,
    attack_bonus: Math.floor(item.attack_bonus * bonusMultiplier),
    hp_bonus: Math.floor(item.hp_bonus * bonusMultiplier),
    defense_bonus: Math.floor(item.defense_bonus * bonusMultiplier)
  }).eq('id', itemId);

  await supabase.from('players').update({
    hammers: player.hammers - hammersNeeded
  }).eq('telegram_id', telegramId);

  return { success: true, newLevel };
}

module.exports = { getInventory, equipItem, burnItem, burnItems, forgeItem, RARITY_REWARD_RANGE };
