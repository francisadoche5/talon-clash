const router = require('express').Router();
const { getOrCreatePlayer, calculatePower, regenEnergy } = require('../../modules/players');
const supabase = require('../../supabase');

router.post('/login', async (req, res) => {
  try {
    const { telegram_user } = req.body;
    if (!telegram_user) return res.status(400).json({ error: 'No telegram user provided' });

    await regenEnergy(telegram_user.id);
    const player = await getOrCreatePlayer(telegram_user);
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
      .update({ [column]: newCount, energy: newEnergy })
      .eq('telegram_id', telegramId);

    res.json({ success: true, [column]: newCount, energy: newEnergy, energy_gained: BOOSTER_ENERGY[type] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
