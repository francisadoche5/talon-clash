const supabase = require('../../supabase');

async function createClan(telegramId, name, emblem, joinType) {
  const { data: player } = await supabase
    .from('players')
    .select('feathers, clan_id')
    .eq('telegram_id', telegramId)
    .single();

  if (player.clan_id) return { error: 'Already in a clan' };
  if (player.feathers < 500) return { error: 'Need 500 feathers to create a clan' };

  const { data: existing } = await supabase
    .from('clans')
    .select('id')
    .eq('name', name)
    .single();

  if (existing) return { error: 'Clan name already taken' };

  const { data: clan } = await supabase
    .from('clans')
    .insert({
      name,
      emblem,
      join_type: joinType || 'open',
      created_by: telegramId,
      member_count: 1
    })
    .select()
    .single();

  await supabase.from('clan_members').insert({
    clan_id: clan.id,
    player_id: telegramId,
    role: 'leader'
  });

  await supabase.from('players').update({
    feathers: player.feathers - 500,
    clan_id: clan.id
  }).eq('telegram_id', telegramId);

  return { success: true, clan };
}

async function joinClan(telegramId, clanId) {
  const { data: player } = await supabase
    .from('players')
    .select('clan_id')
    .eq('telegram_id', telegramId)
    .single();

  if (player.clan_id) return { error: 'Already in a clan' };

  const { data: clan } = await supabase
    .from('clans')
    .select('*')
    .eq('id', clanId)
    .single();

  if (!clan) return { error: 'Clan not found' };
  if (clan.member_count >= clan.max_members) return { error: 'Clan is full' };

  await supabase.from('clan_members').insert({
    clan_id: clanId,
    player_id: telegramId
  });

  await supabase.from('clans').update({
    member_count: clan.member_count + 1
  }).eq('id', clanId);

  await supabase.from('players').update({
    clan_id: clanId
  }).eq('telegram_id', telegramId);

  return { success: true };
}

async function leaveClan(telegramId) {
  const { data: player } = await supabase
    .from('players')
    .select('clan_id')
    .eq('telegram_id', telegramId)
    .single();

  if (!player.clan_id) return { error: 'Not in a clan' };

  const { data: clan } = await supabase
    .from('clans')
    .select('member_count')
    .eq('id', player.clan_id)
    .single();

  await supabase.from('clan_members').delete().eq('player_id', telegramId);

  await supabase.from('clans').update({
    member_count: Math.max(0, clan.member_count - 1)
  }).eq('id', player.clan_id);

  await supabase.from('players').update({
    clan_id: null
  }).eq('telegram_id', telegramId);

  return { success: true };
}

async function getClans(sortBy = 'power') {
  const column = sortBy === 'level' ? 'level' : 'total_power';
  const { data: clans } = await supabase
    .from('clans')
    .select('*')
    .order(column, { ascending: false })
    .limit(50);
  return clans;
}

module.exports = { createClan, joinClan, leaveClan, getClans };
