const router = require('express').Router();
const { getInventory, equipItem, burnItem, forgeItem } = require('../../modules/inventory');
const { getPendingChests, openPendingChest } = require('../../modules/store');
const { calculatePower } = require('../../modules/players');
const { updateQuestProgress } = require('../../modules/quests');

router.get('/:telegram_id', async (req, res) => {
  try {
    const items = await getInventory(req.params.telegram_id);
    const pendingChests = await getPendingChests(req.params.telegram_id);
    res.json({ success: true, items, pendingChests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Open a chest that was bought with Stars/Star Credits and is sitting in the
// player's "Chests" queue, waiting to be opened.
router.post('/chest/open', async (req, res) => {
  try {
    const { telegram_id, chest_id } = req.body;
    if (!telegram_id || !chest_id) {
      return res.status(400).json({ error: 'Missing telegram_id or chest_id' });
    }

    const result = await openPendingChest(telegram_id, chest_id);
    if (result.error) return res.status(400).json(result);

    await updateQuestProgress(telegram_id, 'chests_opened', 1);

    res.json(result);
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
