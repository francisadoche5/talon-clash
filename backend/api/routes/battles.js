const router = require('express').Router();
const { runBattle } = require('../../modules/battles');
const { updateQuestProgress } = require('../../modules/quests');
const supabase = require('../../supabase');

router.post('/fight', async (req, res) => {
  try {
    const { telegram_id, mode } = req.body;
    if (!telegram_id) return res.status(400).json({ error: 'No telegram_id provided' });

    const result = await runBattle(telegram_id, mode || 'normal');
    if (result.error) return res.status(400).json(result);

    await updateQuestProgress(telegram_id, 'battles_played', 1);
    if (result.playerWon) {
      await updateQuestProgress(telegram_id, 'battles_won', 1);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:telegram_id', async (req, res) => {
  try {
    const { data: battles } = await supabase
      .from('battles')
      .select('*')
      .eq('player_id', req.params.telegram_id)
      .order('created_at', { ascending: false })
      .limit(20);

    res.json({ success: true, battles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
