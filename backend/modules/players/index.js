const supabase = require('../../supabase');
const { getEvolutionByPower } = require('../../config/evolutions');

// Feathers awarded to the referrer the moment someone they invited opens the
// game for the first time. Matches the "Earn feathers for every friend you
// invite" copy shown on the Earn tab.
const REFERRAL_REWARD_FEATHERS = 500;

async function getOrCreatePlayer(telegramUser, referrerId) {
  const { id, username, first_name, last_name } = telegramUser;
  const displayName = first_name + (last_name ? ' ' + last_name : '');

  let { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('telegram_id', id)
    .single();

  if (!player) {
    // Only trust a referrer that (a) isn't the new player themselves and
    // (b) actually exists as a player already.
    let validReferrerId = null;
    if (referrerId && String(referrerId) !== String(id)) {
      const { data: referrer } = await supabase
        .from('players')
        .select('telegram_id')
        .eq('telegram_id', referrerId)
        .single();
      if (referrer) validReferrerId = referrer.telegram_id;
    }

    const { data: newPlayer } = await supabase
      .from('players')
      .insert({
        telegram_id: id,
        username: username || '',
        display_name: displayName,
        energy: 400,
        max_energy: 400,
        feathers: 500,
        glory: 0,
        hammers: 2,
        stars: 0,
        skill_points: 0,
        power: 0,
        xp: 0,
        xp_needed: 1000,
        level: 1,
        evolution_tier: 1,
        evolution_name: 'Hatchling',
        referred_by: validReferrerId,
      })
      .select()
      .single();

    await supabase.from('player_skills').insert({ player_id: id });

    if (validReferrerId) {
      const { data: referrerRow } = await supabase
        .from('players')
        .select('feathers')
        .eq('telegram_id', validReferrerId)
        .single();
      await supabase.from('players')
        .update({ feathers: (referrerRow?.feathers || 0) + REFERRAL_REWARD_FEATHERS })
        .eq('telegram_id', validReferrerId);
    }

    return newPlayer;
  }

  return player;
}

// Everyone whose `referred_by` points at this player — used by the
// Invite Friends dashboard so invited friends actually show up there.
async function getReferredPlayers(telegramId) {
  const { data: referred } = await supabase
    .from('players')
    .select('telegram_id, display_name, username, level, power, evolution_name, created_at')
    .eq('referred_by', telegramId)
    .order('created_at', { ascending: false });
  return referred || [];
}

async function updateEvolution(telegramId, power) {
  const evolution = getEvolutionByPower(power);
  await supabase
    .from('players')
    .update({
      evolution_tier: evolution.tier,
      evolution_name: evolution.name,
      updated_at: new Date().toISOString()
    })
    .eq('telegram_id', telegramId);
  return evolution;
}

// Computes a player's real, current combat stats — base (from level) plus
// every bonus from their currently-equipped items. This is the single
// source of truth for ATK/HP/DEF so the numbers shown in the UI (Inventory,
// Characteristics modal) always match what actually went into Power,
// instead of the UI re-deriving a level-only number that ignores gear.
async function getCombatStats(telegramId, playerRow) {
  const player = playerRow || (
    await supabase.from('players').select('*').eq('telegram_id', telegramId).single()
  ).data;

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('player_id', telegramId)
    .eq('is_equipped', true);

  let attack = 10 + (player.level * 5);
  let hp = 100 + (player.level * 50);
  let defense = 5 + (player.level * 2);

  if (items) {
    items.forEach(item => {
      attack += item.attack_bonus || 0;
      hp += item.hp_bonus || 0;
      defense += item.defense_bonus || 0;
    });
  }

  const power = (attack * 10) + (hp * 2) + (defense * 5);

  return { attack, hp, defense, power };
}

async function calculatePower(telegramId) {
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  const { power } = await getCombatStats(telegramId, player);

  await supabase
    .from('players')
    .update({ power, updated_at: new Date().toISOString() })
    .eq('telegram_id', telegramId);

  await updateEvolution(telegramId, power);

  return power;
}

async function regenEnergy(telegramId) {
  const [{ data: player }, { data: configRow }] = await Promise.all([
    supabase
      .from('players')
      .select('energy, max_energy, energy_updated_at, updated_at')
      .eq('telegram_id', telegramId)
      .single(),
    supabase
      .from('game_config')
      .select('value')
      .eq('key', 'energy_regen_rate')
      .single(),
  ]);

  if (!player) return;

  // energy_regen_rate = energy gained per 10 seconds (set in admin dashboard)
  const regenPer10s = parseFloat(configRow?.value ?? '1');

  const now = new Date();
  // Use energy_updated_at if available, fall back to updated_at
  const lastEnergyUpdate = new Date(player.energy_updated_at || player.updated_at);
  const secondsElapsed = Math.max(0, (now - lastEnergyUpdate) / 1000);
  const intervals = Math.floor(secondsElapsed / 10);
  const regenAmount = intervals * regenPer10s;

  if (regenAmount <= 0) return player.energy;

  // IMPORTANT: never regen past max, but also never DECREASE energy that is
  // already above max (e.g. from a paid refill that's allowed to overflow).
  // Previously this always did Math.min(max, energy + regen), which would
  // silently claw back overflowed energy back down to max the next time the
  // player's data was fetched (e.g. right after buying a +750 refill).
  let newEnergy = player.energy;
  if (player.energy < player.max_energy) {
    newEnergy = Math.min(player.max_energy, player.energy + regenAmount);
  }

  await supabase
    .from('players')
    .update({
      energy: newEnergy,
      energy_updated_at: now.toISOString(),
    })
    .eq('telegram_id', telegramId);

  return newEnergy;
}

// Glory-ranked leaderboard for the Lobby's Leaderboard screen. Rank is
// purely glory-based — whoever has more Glory sits higher, ties broken by
// whoever reached that Glory total first (created_at) so the order is
// stable. Also resolves the requesting player's own rank/glory (by
// counting how many players currently have strictly more Glory than them)
// so their position can be shown even when they're outside the top 100.
async function getLeaderboard(telegramId) {
  const { data: top } = await supabase
    .from('players')
    .select('telegram_id, display_name, username, power, evolution_name, evolution_tier, glory')
    .order('glory', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100);

  let myRank = null;
  if (telegramId) {
    const { data: me } = await supabase
      .from('players')
      .select('telegram_id, display_name, username, power, evolution_name, evolution_tier, glory')
      .eq('telegram_id', telegramId)
      .single();

    if (me) {
      const { count } = await supabase
        .from('players')
        .select('telegram_id', { count: 'exact', head: true })
        .gt('glory', me.glory || 0);

      myRank = { ...me, glory: me.glory || 0, rank: (count || 0) + 1 };
    }
  }

  return { leaderboard: top || [], myRank };
}

module.exports = { getOrCreatePlayer, updateEvolution, calculatePower, getCombatStats, regenEnergy, getReferredPlayers, getLeaderboard };
