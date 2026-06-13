const router = require('express').Router();
const { createClan, joinClan, leaveClan, getClans } = require('../../modules/clans');
const supabase = require('../../supabase');

router.get('/', async (req, res) => {
  try {
    const clans = await getClans(req.query.sort);
    res.json({ success: true, clans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my/:telegram_id', async (req, res) => {
  try {
    const { data: player } = await supabase
      .from('players')
      .select('clan_id')
      .eq('telegram_id', req.params.telegram_id)
      .single();

    if (!player?.clan_id) return res.json({ success: true, clan: null });

    const { data: clan } = await supabase
      .from('clans')
      .select('*')
      .eq('id', player.clan_id)
      .single();

    const { data: members } = await supabase
      .from('clan_members')
      .select('*, players(display_name, power, evolution_name)')
      .eq('clan_id', player.clan_id);

    res.json({ success: true, clan, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  try {
    const { telegram_id, name, emblem, join_type } = req.body;
    if (!telegram_id || !name) {
      return res.status(400).json({ error: 'Missing telegram_id or name' });
    }

    const result = await createClan(telegram_id, name, emblem, join_type);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/join', async (req, res) => {
  try {
    const { telegram_id, clan_id } = req.body;
    if (!telegram_id || !clan_id) {
      return res.status(400).json({ error: 'Missing telegram_id or clan_id' });
    }

    const result = await joinClan(telegram_id, clan_id);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/leave', async (req, res) => {
  try {
    const { telegram_id } = req.body;
    if (!telegram_id) {
      return res.status(400).json({ error: 'Missing telegram_id' });
    }

    const result = await leaveClan(telegram_id);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
