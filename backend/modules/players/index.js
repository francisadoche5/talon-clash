const supabase = require('../../supabase');
const { getEvolutionByPower } = require('../../config/evolutions');

async function getOrCreatePlayer(telegramUser) {
  const { id, username, first_name, last_name } = telegramUser;
  const displayName = first_name + (last_name ? ' ' + last_name : '');

  let { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('telegram_id', id)
    .single();

  if (!player) {
    const { data: newPlayer } = await supabase
      .from('players')
      .insert({
        telegram_id: id,
        username: username || '',
        display_name: displayName,
        energy: 400,
        max_energy: 400,
        feathers: 500,
        seeds: 0,
        food: 0,
        glory: 0,
        hammers: 2,
        skill_points: 0,
        power: 0,
        xp: 0,
        xp_needed: 1000,
        level: 1,
        evolution_tier: 1,
        evolution_name: 'Hatchling'
      })
      .select()
      .single();

    await supabase.from('player_skills').insert({ player_id: id });

    return newPlayer;
  }

  return player;
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

async function calculatePower(telegramId) {
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  const { data: skills } = await supabase
    .from('player_skills')
    .select('*')
    .eq('player_id', telegramId)
    .single();

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

  const newEnergy = Math.min(player.max_energy, player.energy + regenAmount);

  await supabase
    .from('players')
    .update({
      energy: newEnergy,
      energy_updated_at: now.toISOString(),
    })
    .eq('telegram_id', telegramId);

  return newEnergy;
}

module.exports = { getOrCreatePlayer, updateEvolution, calculatePower, regenEnergy };
