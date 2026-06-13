const supabase = require('../../supabase');

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

  const rarityReward = {
    common: 50,
    uncommon: 150,
    rare: 500,
    epic: 1500,
    legendary: 5000
  };

  const feathersEarned = rarityReward[item.rarity] || 50;

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

module.exports = { getInventory, equipItem, burnItem, forgeItem };
