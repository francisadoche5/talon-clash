// backend/modules/quests/index.js
const supabase = require('../../supabase');

// Returns midnight UTC of the next day
function nextMidnightUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

// Returns midnight UTC of next Monday
function nextWeekResetUTC() {
  const now  = new Date();
  const daysUntilMonday = (8 - now.getUTCDay()) % 7 || 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
}

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

  const result = [];

  for (const quest of quests) {
    const progress    = playerQuests?.find(pq => pq.quest_id === quest.id);
    const shouldReset = progress?.reset_at && now > new Date(progress.reset_at);

    if (shouldReset && progress) {
      // ── Actually write the reset to the DB so it sticks ──
      const newResetAt = quest.reset_type === 'weekly'
        ? nextWeekResetUTC()
        : nextMidnightUTC();

      await supabase
        .from('player_quests')
        .update({
          progress:     0,
          is_completed: false,
          is_claimed:   false,
          reset_at:     newResetAt.toISOString(),
        })
        .eq('id', progress.id);

      result.push({
        ...quest,
        progress:     0,
        is_completed: false,
        is_claimed:   false,
      });
    } else {
      result.push({
        ...quest,
        progress:     progress?.progress     || 0,
        is_completed: progress?.is_completed || false,
        is_claimed:   progress?.is_claimed   || false,
      });
    }
  }

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

    const now      = new Date();
    const resetAt  = quest.reset_type === 'weekly' ? nextWeekResetUTC() : nextMidnightUTC();

    // If the existing record is past its reset time, start fresh
    const isExpired    = pq?.reset_at && now > new Date(pq.reset_at);
    const baseProgress = isExpired ? 0 : (pq?.progress || 0);

    const newProgress  = baseProgress + amount;
    const isCompleted  = newProgress >= quest.requirement_amount;

    if (pq) {
      await supabase.from('player_quests').update({
        progress:     newProgress,
        is_completed: isCompleted,
        is_claimed:   isExpired ? false : (pq?.is_claimed || false),
        reset_at:     isExpired ? resetAt.toISOString() : pq.reset_at,
      }).eq('id', pq.id);
    } else {
      await supabase.from('player_quests').insert({
        player_id:    telegramId,
        quest_id:     quest.id,
        progress:     newProgress,
        is_completed: isCompleted,
        is_claimed:   false,
        reset_at:     resetAt.toISOString(),
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
    [quest.reward_type]: (player[quest.reward_type] || 0) + quest.reward_amount,
  }).eq('telegram_id', telegramId);

  await supabase.from('player_quests').update({
    is_claimed: true,
  }).eq('id', pq.id);

  return {
    success: true,
    reward:  { type: quest.reward_type, amount: quest.reward_amount },
  };
}

module.exports = { getPlayerQuests, updateQuestProgress, claimQuestReward };
