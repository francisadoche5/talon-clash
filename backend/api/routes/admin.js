const router = require('express').Router();
const supabase = require('../../supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function adminAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { data: admin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const { count: totalPlayers } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    const { count: totalBattles } = await supabase
      .from('battles')
      .select('*', { count: 'exact', head: true });

    const { count: totalClans } = await supabase
      .from('clans')
      .select('*', { count: 'exact', head: true });

    const { data: topPlayers } = await supabase
      .from('players')
      .select('display_name, power, evolution_name')
      .order('power', { ascending: false })
      .limit(10);

    res.json({ success: true, stats: { totalPlayers, totalBattles, totalClans, topPlayers } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/players', adminAuth, async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    let query = supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * 20, page * 20 - 1);

    if (search) query = query.ilike('display_name', `%${search}%`);

    const { data: players } = await query;
    res.json({ success: true, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/players/ban', adminAuth, async (req, res) => {
  try {
    const { telegram_id, reason, banned } = req.body;
    await supabase
      .from('players')
      .update({ is_banned: banned, ban_reason: reason || '' })
      .eq('telegram_id', telegram_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/store', adminAuth, async (req, res) => {
  try {
    const { data: items } = await supabase
      .from('store_items')
      .select('*')
      .order('sort_order');
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/store/item', adminAuth, async (req, res) => {
  try {
    const { id, ...itemData } = req.body;
    if (id) {
      await supabase.from('store_items').update(itemData).eq('id', id);
    } else {
      await supabase.from('store_items').insert(itemData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/store/item/:id', adminAuth, async (req, res) => {
  try {
    await supabase.from('store_items').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/quests', adminAuth, async (req, res) => {
  try {
    const { data: quests } = await supabase.from('quests').select('*');
    res.json({ success: true, quests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/quests/quest', adminAuth, async (req, res) => {
  try {
    const { id, ...questData } = req.body;
    if (id) {
      await supabase.from('quests').update(questData).eq('id', id);
    } else {
      await supabase.from('quests').insert(questData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/announcements', adminAuth, async (req, res) => {
  try {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    res.json({ success: true, announcements: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/announcements', adminAuth, async (req, res) => {
  try {
    await supabase.from('announcements').insert(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/config', adminAuth, async (req, res) => {
  try {
    const { data } = await supabase.from('game_config').select('*');
    res.json({ success: true, config: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/config', adminAuth, async (req, res) => {
  try {
    const { key, value } = req.body;
    await supabase
      .from('game_config')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/evolutions', adminAuth, async (req, res) => {
  try {
    const { data } = await supabase
      .from('evolution_tiers')
      .select('*')
      .order('tier');
    res.json({ success: true, evolutions: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/evolutions', adminAuth, async (req, res) => {
  try {
    await supabase.from('evolution_tiers').upsert(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
