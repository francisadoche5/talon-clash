const router = require('express').Router();
const { upgradeSkill, getSkills } = require('../../modules/skills');
const { SKILL_TREE } = require('../../config/skills');

router.get('/:telegram_id', async (req, res) => {
  try {
    const skills = await getSkills(req.params.telegram_id);
    res.json({ success: true, skills, tree: SKILL_TREE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upgrade', async (req, res) => {
  try {
    const { telegram_id, skill_type } = req.body;
    if (!telegram_id || !skill_type) {
      return res.status(400).json({ error: 'Missing telegram_id or skill_type' });
    }

    const result = await upgradeSkill(telegram_id, skill_type);
    if (result.error) return res.status(400).json(result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
