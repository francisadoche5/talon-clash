const router = require('express').Router();
const {
  createClan, joinClan, applyToClan,
  respondToApplication, getPendingApplications,
  updateClanSettings, leaveClan, getClans
} = require('../../modules/clans');
const supabase = require('../../supabase');

// GET all clans (browse)
router.get('/', async (req, res) => {
  try {
    const clans = await getClans(req.query.sort);
    res.json({ success: true, clans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET my clan
router.get('/my/:telegram_id', async (req, res) => {
  try {
    const { data: player } = await supabase
      .from('players')
      .select('clan_id')
      .eq('telegram_id', req.params.telegram_id)
      .single();

    if (!player?.clan_id) return res.json({ success: true, clan: null, members: [] });

    const { data: clan } = await supabase
      .from('clans')
      .select('*')
      .eq('id', player.clan_id)
      .single();

    const { data: members } = await supabase
      .from('clan_members')
      .select('*, players(display_name, power, evolution_name, level, telegram_id)')
      .eq('clan_id', player.clan_id);

    // Recalculate total_power as sum of member powers
    const total_power = (members || []).reduce((sum, m) => sum + (m.players?.power || 0), 0);
    if (clan && clan.total_power !== total_power) {
      await supabase.from('clans').update({ total_power }).eq('id', clan.id);
      clan.total_power = total_power;
    }

    res.json({ success: true, clan, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create clan
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

// POST join clan (open clans only)
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

// POST apply to a locked clan
router.post('/apply', async (req, res) => {
  try {
    const { telegram_id, clan_id } = req.body;
    if (!telegram_id || !clan_id) {
      return res.status(400).json({ error: 'Missing telegram_id or clan_id' });
    }
    const result = await applyToClan(telegram_id, clan_id);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pending applications for a clan (leader only)
router.get('/:clan_id/applications', async (req, res) => {
  try {
    const apps = await getPendingApplications(req.params.clan_id);
    res.json({ success: true, applications: apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST accept/decline an application
router.post('/:clan_id/applications/:applicant_id', async (req, res) => {
  try {
    const { leader_id, action } = req.body;
    if (!leader_id || !action) {
      return res.status(400).json({ error: 'Missing leader_id or action' });
    }
    const result = await respondToApplication(
      req.params.clan_id,
      leader_id,
      req.params.applicant_id,
      action
    );
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST update clan settings (join_type)
router.post('/:clan_id/settings', async (req, res) => {
  try {
    const { leader_id, join_type } = req.body;
    if (!leader_id || !join_type) {
      return res.status(400).json({ error: 'Missing leader_id or join_type' });
    }
    const result = await updateClanSettings(req.params.clan_id, leader_id, join_type);
    if (result.error) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST leave clan
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
