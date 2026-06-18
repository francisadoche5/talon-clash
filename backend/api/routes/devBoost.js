const router  = require('express').Router();
const supabase = require('../../supabase');

// ── Dev Boost Route ──────────────────────────────────────────────────────────
// POST /api/dev/boost/:id
// Body: { secret: "your DEV_SECRET from .env" }
// Sets all resources to generous test values.
// ONLY works when DEV_SECRET is set in your environment variables.

router.post('/boost/:id', async (req, res) => {
  try {
    const { secret } = req.body;
    const devSecret  = process.env.DEV_SECRET;

    if (!devSecret) {
      return res.status(403).json({ error: 'Dev mode not enabled. Set DEV_SECRET in your .env' });
    }
    if (secret !== devSecret) {
      return res.status(401).json({ error: 'Invalid secret' });
    }

    const telegramId = req.params.id;

    const { data: player } = await supabase
      .from('players')
      .select('max_energy')
      .eq('telegram_id', telegramId)
      .single();

    if (!player) return res.status(404).json({ error: 'Player not found' });

    await supabase.from('players').update({
      energy:        player.max_energy,   // full energy
      feathers:      999999,
      food:          999999,
      seeds:         999999,
      hammers:       999,
      boosters:      999,
      epic_boosters: 999,
      glory:         999999,
      updated_at:    new Date().toISOString(),
    }).eq('telegram_id', telegramId);

    res.json({ success: true, message: '🛠️ Dev boost applied! All resources maxed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
