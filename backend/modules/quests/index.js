const supabase = require('../../supabase');

async function getPlayerQuests(telegramId) {
  const now = new Date();

  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true);

  const { data: playerQuests } = await supabase
    .from('player_quests')
    .select('*')
    .eq('player_id', telegramId);

  const result = quests.map(quest => {
    const progress = playerQuests?.find(pq => pq.quest_id === quest.id);
    const shouldReset = progress?.reset_at && now > new Date(progress.reset_at);

    return {
      ...quest,
      progress: shouldReset ? 0 : (progress?.progress || 0),
      is_completed: shouldReset ? false : (progress?.is_completed || false),
      is_claimed: shouldReset ? false : (progress?.is_claimed || false)
    };
  });

  return result;
}

async function updateQuestProgress(telegramId, eventType, amount = 1) {
  const { data: quests } = await supabase
    .from('quests')
    .select('*')
    .eq('requirement_type', eventType)
    .eq('is_active', true);

  if (!quests) return;

  for (const quest of quests) {
    const { data: pq } = await supabase
      .from('player_quests')
      .select('*')
      .eq('player_id', telegramId)
      .eq('quest_id', quest.id)
      .single();

    const newProgress = (pq?.progress || 0) + amount;
    const isCompleted = newProgress >= quest.requirement_amount;

    const now = new Date();
    const resetAt = quest.reset_type === 'daily'
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay()));

    if (pq) {
      await supabase.from('player_quests').update({
        progress: newProgress,
        is_completed: isCompleted,
        reset_at: resetAt.toISOString()
      }).eq('id', pq.id);
    } else {
      await supabase.from('player_quests').insert({
        player_id: telegramId,
        quest_id: quest.id,
        progress: newProgress,
        is_completed: isCompleted,
        reset_at: resetAt.toISOString()
      });
    }
  }
}

async function claimQuestReward(telegramId, questId) {
  const { data: pq } = await supabase
    .from('player_quests')
    .select('*')
    .eq('player_id', telegramId)
    .eq('quest_id', questId)
    .single();

  if (!pq?.is_completed || pq?.is_claimed) {
    return { error: 'Quest not completed or already claimed' };
  }

  const { data: quest } = await supabase
    .from('quests')
    .select('*')
    .eq('id', questId)
    .single();

  const { data: player } = await supabase
    .from('players')
    .select('feathers, seeds, food')
    .eq('telegram_id', telegramId)
    .single();

  await supabase.from('players').update({
    [quest.reward_type]: (player[quest.reward_type] || 0) + quest.reward_amount
  }).eq('telegram_id', telegramId);

  await supabase.from('player_quests').update({
    is_claimed: true
  }).eq('id', pq.id);

  return {
    success: true,
    reward: { type: quest.reward_type, amount: quest.reward_amount }
  };
}

module.exports = { getPlayerQuests, updateQuestProgress, claimQuestReward };
