const router = require('express').Router();
const { getOrCreatePlayer, calculatePower, regenEnergy, getReferredPlayers } = require('../../modules/players');
const supabase = require('../../supabase');

// Deep-link start params look like "ref_123456789" — pulls out the referrer's
// telegram_id, if any.
function parseReferrerId(startParam) {
  if (!startParam || typeof startParam !== 'string') return null;
  const match = startParam.match(/^ref_(\d+)$/);
  return match ? match[1] : null;
}

router.post('/login', async (req, res) => {
  try {
    const { telegram_user, start_param } = req.body;
    if (!telegram_user) return res.status(400).json({ error: 'No telegram user provided' });

    const referrerId = parseReferrerId(start_param);

    await regenEnergy(telegram_user.id);
    const player = await getOrCreatePlayer(telegram_user, referrerId);
    await calculatePower(player.telegram_id);

    const { data: updatedPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', player.telegram_id)
      .single();

    res.json({ success: true, player: updatedPlayer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/referrals', async (req, res) => {
  try {
    const referred = await getReferredPlayers(req.params.id);
    res.json({ success: true, referred_players: referred });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await regenEnergy(req.params.id);

    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('telegram_id', req.params.id)
      .single();

    if (!player) return res.status(404).json({ error: 'Player not found' });

    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/leaderboard', async (req, res) => {
  try {
    const { data: top } = await supabase
      .from('players')
      .select('telegram_id, display_name, power, evolution_name, evolution_tier, glory')
      .order('power', { ascending: false })
      .limit(100);

    res.json({ success: true, leaderboard: top });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Consume 1 Booster or Epic Booster from the player's stockpile to refill energy.
// Boosters: +250 energy. Epic Boosters: +750 energy. Allowed to overflow past max_energy.
const BOOSTER_ENERGY = { booster: 250, epic_booster: 750 };
router.post('/:id/use-booster', async (req, res) => {
  try {
    const { type } = req.body;
    if (!BOOSTER_ENERGY[type]) {
      return res.status(400).json({ error: 'Invalid booster type. Use "booster" or "epic_booster".' });
    }

    const telegramId = req.params.id;
    const column = type === 'epic_booster' ? 'epic_boosters' : 'boosters';

    const { data: player } = await supabase
      .from('players').select(`${column}, energy`).eq('telegram_id', telegramId).single();

    if (!player) return res.status(404).json({ error: 'Player not found' });
    if ((player[column] || 0) < 1) {
      return res.status(400).json({ error: `No ${type === 'epic_booster' ? 'Epic Boosters' : 'Boosters'} left.` });
    }

    const newCount  = player[column] - 1;
    const newEnergy = (player.energy || 0) + BOOSTER_ENERGY[type];

    await supabase.from('players')
      .update({ [column]: newCount, energy: newEnergy, energy_updated_at: new Date().toISOString() })
      .eq('telegram_id', telegramId);

    res.json({ success: true, [column]: newCount, energy: newEnergy, energy_gained: BOOSTER_ENERGY[type] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lets a player turn off an active Auto Battle plan early. The Stars/Star
// Credits already spent on it are not refunded — this just stops the
// automatic fighting loop on the frontend from continuing to trigger fights.
router.post('/:id/auto-battle/stop', async (req, res) => {
  try {
    const telegramId = req.params.id;
    const { data: player } = await supabase
      .from('players').select('auto_battle_active').eq('telegram_id', telegramId).single();

    if (!player) return res.status(404).json({ error: 'Player not found' });

    await supabase.from('players')
      .update({ auto_battle_active: false })
      .eq('telegram_id', telegramId);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
