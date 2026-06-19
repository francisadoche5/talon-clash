const router  = require('express').Router();
const supabase = require('../../supabase');

router.post('/boost/:id', async (req, res) => {
  try {
    const { secret } = req.body;
    const devSecret  = process.env.DEV_SECRET;

    if (!devSecret) {
      return res.status(403).json({ error: 'Dev mode not enabled. Set DEV_SECRET in your environment.' });
    }
    if (secret !== devSecret) {
      return res.status(401).json({ error: 'Invalid secret' });
    }

    // Cast to number to avoid type mismatch with Supabase bigint columns
    const telegramId = parseInt(req.params.id, 10);
    if (isNaN(telegramId)) return res.status(400).json({ error: 'Invalid player ID' });

    // Verify player exists
    const { data: player, error: fetchErr } = await supabase
      .from('players')
      .select('telegram_id, max_energy')
      .eq('telegram_id', telegramId)
      .single();

    if (fetchErr || !player) {
      return res.status(404).json({ error: 'Player not found', detail: fetchErr?.message });
    }

    // Apply the boost
    const { error: updateErr } = await supabase
      .from('players')
      .update({
        energy:        player.max_energy,
        feathers:      999999,
        hammers:       999,
        boosters:      999,
        epic_boosters: 999,
        glory:         999999,
        stars:         999999,
        updated_at:    new Date().toISOString(),
      })
      .eq('telegram_id', telegramId);

    if (updateErr) {
      return res.status(500).json({ error: 'Update failed', detail: updateErr.message });
    }

    res.json({ success: true, message: '🛠️ Dev boost applied! All resources maxed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
