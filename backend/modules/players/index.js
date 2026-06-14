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
  const { data: player } = await supabase
    .from('players')
    .select('energy, max_energy, updated_at')
    .eq('telegram_id', telegramId)
    .single();

  if (!player) return;

  const now = new Date();
  const lastUpdate = new Date(player.updated_at);
  const secondsElapsed = (now - lastUpdate) / 1000;
  const regenAmount = Math.floor(secondsElapsed / 10) * 0.17;
  const newEnergy = Math.min(player.max_energy, player.energy + regenAmount);

  if (newEnergy > player.energy) {
    await supabase
      .from('players')
      .update({ energy: newEnergy, updated_at: now.toISOString() })
      .eq('telegram_id', telegramId);
  }

  return newEnergy;
}

module.exports = { getOrCreatePlayer, updateEvolution, calculatePower, regenEnergy };
