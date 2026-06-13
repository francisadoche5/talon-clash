const router = require('express').Router();
const { openChest, buyStoreItem } = require('../../modules/store');
const { updateQuestProgress } = require('../../modules/quests');
const supabase = require('../../supabase');

router.get('/items', async (req, res) => {
  try {
    const { data: items } = await supabase
      .from('store_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/buy', async (req, res) => {
  try {
    const { telegram_id, item_id } = req.body;
    if (!telegram_id || !item_id) {
      return res.status(400).json({ error: 'Missing telegram_id or item_id' });
    }

    const result = await buyStoreItem(telegram_id, item_id);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/chest', async (req, res) => {
  try {
    const { telegram_id, chest_type } = req.body;
    if (!telegram_id || !chest_type) {
      return res.status(400).json({ error: 'Missing telegram_id or chest_type' });
    }

    const result = await openChest(telegram_id, chest_type);
    if (result.error) return res.status(400).json(result);

    await updateQuestProgress(telegram_id, 'chests_opened', 1);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
