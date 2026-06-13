const supabase = require('../../supabase');
const { getSkillCost } = require('../../config/skills');
const { calculatePower } = require('../players');

async function upgradeSkill(telegramId, skillType) {
  const { data: player } = await supabase
    .from('players')
    .select('skill_points')
    .eq('telegram_id', telegramId)
    .single();

  const { data: skills } = await supabase
    .from('player_skills')
    .select('*')
    .eq('player_id', telegramId)
    .single();

  const currentLevel = skills[`${skillType}_level`] || 0;
  const cost = getSkillCost(skillType, currentLevel + 1);

  if (player.skill_points < cost) {
    return { error: `Need ${cost} skill points` };
  }

  if (currentLevel >= 10) {
    return { error: 'Skill already at max level' };
  }

  await supabase
    .from('player_skills')
    .update({ [`${skillType}_level`]: currentLevel + 1 })
    .eq('player_id', telegramId);

  await supabase
    .from('players')
    .update({ skill_points: player.skill_points - cost })
    .eq('telegram_id', telegramId);

  await calculatePower(telegramId);

  return { success: true, newLevel: currentLevel + 1, cost };
}

async function getSkills(telegramId) {
  const { data: skills } = await supabase
    .from('player_skills')
    .select('*')
    .eq('player_id', telegramId)
    .single();
  return skills;
}

module.exports = { upgradeSkill, getSkills };
