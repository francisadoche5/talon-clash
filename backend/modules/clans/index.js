const supabase = require('../../supabase');

// Recalculate a clan's total_power as the SUM of all members' power
async function recalculateClanPower(clanId) {
  const { data: members } = await supabase
    .from('clan_members')
    .select('player_id, players(power)')
    .eq('clan_id', clanId);

  const total = (members || []).reduce((sum, m) => sum + (m.players?.power || 0), 0);

  await supabase
    .from('clans')
    .update({ total_power: total })
    .eq('id', clanId);

  return total;
}

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

  // Set initial power
  await recalculateClanPower(clan.id);

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
  if (clan.join_type === 'approval') return { error: 'This clan requires approval to join' };

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

  // Recalculate power with new member
  await recalculateClanPower(clanId);

  return { success: true };
}

async function applyToClan(telegramId, clanId) {
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

  // Check for existing pending application
  const { data: existing } = await supabase
    .from('clan_applications')
    .select('id')
    .eq('clan_id', clanId)
    .eq('player_id', telegramId)
    .eq('status', 'pending')
    .single();

  if (existing) return { error: 'Already applied to this clan' };

  await supabase.from('clan_applications').insert({
    clan_id: clanId,
    player_id: telegramId,
    status: 'pending'
  });

  return { success: true };
}

async function respondToApplication(clanId, leaderId, applicantId, action) {
  // Verify requester is leader
  const { data: leaderMember } = await supabase
    .from('clan_members')
    .select('role')
    .eq('clan_id', clanId)
    .eq('player_id', leaderId)
    .single();

  if (!leaderMember || leaderMember.role !== 'leader') {
    return { error: 'Only the clan leader can respond to applications' };
  }

  if (action === 'accept') {
    const { data: clan } = await supabase
      .from('clans')
      .select('member_count, max_members')
      .eq('id', clanId)
      .single();

    if (clan.member_count >= clan.max_members) {
      return { error: 'Clan is full' };
    }

    // Add member
    await supabase.from('clan_members').insert({
      clan_id: clanId,
      player_id: applicantId,
      role: 'member'
    });

    await supabase.from('clans').update({
      member_count: clan.member_count + 1
    }).eq('id', clanId);

    await supabase.from('players').update({
      clan_id: clanId
    }).eq('telegram_id', applicantId);

    // Recalculate power
    await recalculateClanPower(clanId);
  }

  // Update application status
  await supabase.from('clan_applications')
    .update({ status: action === 'accept' ? 'accepted' : 'declined' })
    .eq('clan_id', clanId)
    .eq('player_id', applicantId);

  return { success: true };
}

async function getPendingApplications(clanId) {
  const { data: apps } = await supabase
    .from('clan_applications')
    .select('*, players(telegram_id, display_name, level, power, evolution_name)')
    .eq('clan_id', clanId)
    .eq('status', 'pending');

  return apps || [];
}

async function updateClanSettings(clanId, leaderId, joinType) {
  const { data: leaderMember } = await supabase
    .from('clan_members')
    .select('role')
    .eq('clan_id', clanId)
    .eq('player_id', leaderId)
    .single();

  if (!leaderMember || leaderMember.role !== 'leader') {
    return { error: 'Only the clan leader can change clan settings' };
  }

  await supabase.from('clans').update({ join_type: joinType }).eq('id', clanId);
  return { success: true };
}

async function leaveClan(telegramId) {
  const { data: player } = await supabase
    .from('players')
    .select('clan_id')
    .eq('telegram_id', telegramId)
    .single();

  if (!player.clan_id) return { error: 'Not in a clan' };

  const clanId = player.clan_id;
  const { data: clan } = await supabase
    .from('clans')
    .select('member_count')
    .eq('id', clanId)
    .single();

  await supabase.from('clan_members').delete().eq('player_id', telegramId);

  await supabase.from('clans').update({
    member_count: Math.max(0, clan.member_count - 1)
  }).eq('id', clanId);

  await supabase.from('players').update({
    clan_id: null
  }).eq('telegram_id', telegramId);

  // Recalculate power after member leaves
  await recalculateClanPower(clanId);

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

module.exports = {
  createClan,
  joinClan,
  applyToClan,
  respondToApplication,
  getPendingApplications,
  updateClanSettings,
  leaveClan,
  getClans,
  recalculateClanPower
};
