const router = require('express').Router();
const { getPlayerQuests, claimQuestReward } = require('../../modules/quests');

router.get('/:telegram_id', async (req, res) => {
  try {
    const quests = await getPlayerQuests(req.params.telegram_id);
    res.json({ success: true, quests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/claim', async (req, res) => {
  try {
    const { telegram_id, quest_id } = req.body;
    if (!telegram_id || !quest_id) {
      return res.status(400).json({ error: 'Missing telegram_id or quest_id' });
    }

    const result = await claimQuestReward(telegram_id, quest_id);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
