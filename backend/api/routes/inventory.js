const router = require('express').Router();
const { getInventory, equipItem, burnItem, forgeItem } = require('../../modules/inventory');
const { calculatePower } = require('../../modules/players');

router.get('/:telegram_id', async (req, res) => {
  try {
    const items = await getInventory(req.params.telegram_id);
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/equip', async (req, res) => {
  try {
    const { telegram_id, item_id } = req.body;
    if (!telegram_id || !item_id) {
      return res.status(400).json({ error: 'Missing telegram_id or item_id' });
    }

    const result = await equipItem(telegram_id, item_id);
    if (result.error) return res.status(400).json(result);

    await calculatePower(telegram_id);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/burn', async (req, res) => {
  try {
    const { telegram_id, item_id } = req.body;
    if (!telegram_id || !item_id) {
      return res.status(400).json({ error: 'Missing telegram_id or item_id' });
    }

    const result = await burnItem(telegram_id, item_id);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/forge', async (req, res) => {
  try {
    const { telegram_id, item_id } = req.body;
    if (!telegram_id || !item_id) {
      return res.status(400).json({ error: 'Missing telegram_id or item_id' });
    }

    const result = await forgeItem(telegram_id, item_id);
    if (result.error) return res.status(400).json(result);

    await calculatePower(telegram_id);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
