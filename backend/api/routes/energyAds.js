// backend/api/routes/energyAds.js
// Handles free energy via watched ads (max 10 per day, +50 energy each)

const router = require('express').Router();
const supabase = require('../../supabase');

const ADS_PER_DAY   = 10;
const ENERGY_PER_AD = 50;

router.post('/ad-claim', async (req, res) => {
  try {
    const { telegram_id } = req.body;
    if (!telegram_id) return res.status(400).json({ error: 'Missing telegram_id' });

    // Fetch player
    const { data: player, error: fetchErr } = await supabase
      .from('players')
      .select('energy, max_energy, ads_watched_today, ads_reset_date')
      .eq('telegram_id', telegram_id)
      .single();

    if (fetchErr || !player) return res.status(404).json({ error: 'Player not found' });

    // Reset counter if it's a new day
    const today        = new Date().toISOString().split('T')[0];
    const lastReset    = player.ads_reset_date || '';
    const adsToday     = lastReset === today ? (player.ads_watched_today || 0) : 0;

    if (adsToday >= ADS_PER_DAY) {
      return res.status(429).json({ error: `Daily ad limit reached (${ADS_PER_DAY}/day)` });
    }

    const newEnergy   = Math.min(player.max_energy || 400, (player.energy || 0) + ENERGY_PER_AD);
    const newAdsCount = adsToday + 1;

    await supabase
      .from('players')
      .update({
        energy:            newEnergy,
        energy_updated_at: new Date().toISOString(),
        ads_watched_today: newAdsCount,
        ads_reset_date:    today,
      })
      .eq('telegram_id', telegram_id);

    res.json({
      success:          true,
      energy:           newEnergy,
      ads_watched_today: newAdsCount,
      ads_remaining:    ADS_PER_DAY - newAdsCount,
    });
  } catch (err) {
    console.error('Ad claim error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
