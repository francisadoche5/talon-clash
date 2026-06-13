const supabase = require('../../supabase');
const { BATTLE_CONFIG, STAT_CONFIG, CRIT_CONFIG, BLOCK_CONFIG, rollBonusReward } = require('../../config/battles');
const { calculatePower } = require('../players');

async function getPlayerStats(telegramId) {
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

  let attack = STAT_CONFIG.baseAttack + (player.level * STAT_CONFIG.attackPerLevel);
  let hp = STAT_CONFIG.baseHP + (player.level * STAT_CONFIG.hpPerLevel);
  let defense = STAT_CONFIG.baseDefense + (player.level * STAT_CONFIG.defensePerLevel);
  let critChance = CRIT_CONFIG.baseCritChance;
  let blockChance = BLOCK_CONFIG.baseBlockChance;

  if (items) {
    items.forEach(item => {
      attack += item.attack_bonus || 0;
      hp += item.hp_bonus || 0;
      defense += item.defense_bonus || 0;
    });
  }

  if (skills) {
    attack += skills.attack_level * 5;
    hp += skills.hp_level * 30;
    defense += skills.defense_level * 3;
    critChance += skills.crit_level * 2;
  }

  return { player, attack, hp, defense, critChance, blockChance };
}

async function findOpponent(telegramId, mode) {
  const { data: player } = await supabase
    .from('players')
    .select('power')
    .eq('telegram_id', telegramId)
    .single();

  const powerRange = mode === 'epic' ? 5000 : 3000;

  const { data: opponents } = await supabase
    .from('players')
    .select('*')
    .neq('telegram_id', telegramId)
    .eq('is_banned', false)
    .gte('power', Math.max(0, player.power - powerRange))
    .lte('power', player.power + powerRange)
    .limit(10);

  if (!opponents || opponents.length === 0) {
    const { data: anyOpponent } = await supabase
      .from('players')
      .select('*')
      .neq('telegram_id', telegramId)
      .eq('is_banned', false)
      .limit(5);
    return anyOpponent?.[Math.floor(Math.random() * (anyOpponent?.length || 1))];
  }

  return opponents[Math.floor(Math.random() * opponents.length)];
}

function simulateBattle(attackerStats, defenderStats) {
  let attackerHP = attackerStats.hp;
  let defenderHP = defenderStats.hp;
  const log = [];

  let round = 0;
  while (attackerHP > 0 && defenderHP > 0 && round < 50) {
    round++;

    let damage = Math.max(1, attackerStats.attack - defenderStats.defense);
    const isCrit = Math.random() * 100 < attackerStats.critChance;
    const isBlocked = Math.random() * 100 < defenderStats.blockChance;

    if (isCrit) damage = Math.floor(damage * CRIT_CONFIG.critMultiplier);
    if (isBlocked) damage = Math.floor(damage * (1 - BLOCK_CONFIG.blockReduction));

    damage = Math.max(1, damage + Math.floor(Math.random() * 10) - 5);
    defenderHP -= damage;

    log.push({ round, attacker: 'player', damage, isCrit, isBlocked });

    if (defenderHP <= 0) break;

    let damage2 = Math.max(1, defenderStats.attack - attackerStats.defense);
    const isCrit2 = Math.random() * 100 < defenderStats.critChance;
    const isBlocked2 = Math.random() * 100 < attackerStats.blockChance;

    if (isCrit2) damage2 = Math.floor(damage2 * CRIT_CONFIG.critMultiplier);
    if (isBlocked2) damage2 = Math.floor(damage2 * (1 - BLOCK_CONFIG.blockReduction));

    damage2 = Math.max(1, damage2 + Math.floor(Math.random() * 10) - 5);
    attackerHP -= damage2;

    log.push({ round, attacker: 'opponent', damage: damage2, isCrit: isCrit2, isBlocked: isBlocked2 });
  }

  return {
    playerWon: attackerHP > 0,
    playerHPEnd: Math.max(0, attackerHP),
    opponentHPEnd: Math.max(0, defenderHP),
    log
  };
}

async function runBattle(telegramId, mode = 'normal') {
  const config = BATTLE_CONFIG[mode];

  const { data: player } = await supabase
    .from('players')
    .select('energy, battles_played, battles_won, battles_lost, xp, level, xp_needed, glory, feathers, food')
    .eq('telegram_id', telegramId)
    .single();

  if (player.energy < config.energyCost) {
    return { error: 'Not enough energy', energy: player.energy };
  }

  const opponent = await findOpponent(telegramId, mode);
  if (!opponent) return { error: 'No opponent found' };

  const playerStats = await getPlayerStats(telegramId);
  const opponentStats = await getPlayerStats(opponent.telegram_id);

  const result = simulateBattle(playerStats, opponentStats);

  const rewards = result.playerWon ? config.rewards.win : config.rewards.lose;
  const xpEarned = Math.floor((20 + Math.random() * 30) * rewards.xpMultiplier);
  const gloryEarned = Math.floor((10 + Math.random() * 20) * rewards.gloryMultiplier);
  const foodEarned = rewards.baseFood;
  const feathersEarned = rewards.baseFeathers;

  let bonusReward = null;
  if (result.playerWon) {
    bonusReward = rollBonusReward(config.bonusRewards);
  }

  let newXP = player.xp + xpEarned;
  let newLevel = player.level;
  let newXPNeeded = player.xp_needed;

  if (newXP >= newXPNeeded) {
    newXP -= newXPNeeded;
    newLevel += 1;
    newXPNeeded = Math.floor(newXPNeeded * 1.3);
  }

  await supabase.from('players').update({
    energy: player.energy - config.energyCost,
    xp: newXP,
    level: newLevel,
    xp_needed: newXPNeeded,
    glory: player.glory + gloryEarned,
    feathers: player.feathers + feathersEarned,
    food: player.food + foodEarned,
    battles_played: player.battles_played + 1,
    battles_won: result.playerWon ? player.battles_won + 1 : player.battles_won,
    battles_lost: result.playerWon ? player.battles_lost : player.battles_lost + 1,
    updated_at: new Date().toISOString()
  }).eq('telegram_id', telegramId);

  await supabase.from('battles').insert({
    player_id: telegramId,
    opponent_id: opponent.telegram_id,
    mode,
    winner_id: result.playerWon ? telegramId : opponent.telegram_id,
    player_hp_start: playerStats.hp,
    opponent_hp_start: opponentStats.hp,
    player_hp_end: result.playerHPEnd,
    opponent_hp_end: result.opponentHPEnd,
    xp_earned: xpEarned,
    glory_earned: gloryEarned,
    feathers_earned: feathersEarned,
    food_earned: foodEarned,
    bonus_reward: bonusReward?.type,
    bonus_amount: bonusReward?.amount
  });

  await calculatePower(telegramId);

  return {
    success: true,
    playerWon: result.playerWon,
    opponent: {
      telegram_id: opponent.telegram_id,
      display_name: opponent.display_name,
      power: opponent.power
    },
    playerStats: { hp: playerStats.hp, attack: playerStats.attack },
    opponentStats: { hp: opponentStats.hp, attack: opponentStats.attack },
    playerHPEnd: result.playerHPEnd,
    opponentHPEnd: result.opponentHPEnd,
    rewards: {
      xp: xpEarned,
      glory: gloryEarned,
      feathers: feathersEarned,
      food: foodEarned,
      bonus: bonusReward
    },
    levelUp: newLevel > player.level,
    newLevel,
    log: result.log
  };
}

module.exports = { runBattle };
