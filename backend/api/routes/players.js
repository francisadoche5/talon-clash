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

module.exports = router;
