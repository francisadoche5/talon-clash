const router = require('express').Router();
const supabase = require('../../supabase');

// Injected from index.js
let bot;
function setBot(b) { bot = b; }

// POST /api/payments/invoice
// Creates a Telegram Stars invoice link for a product
router.post('/invoice', async (req, res) => {
  try {
    const { telegram_id, product } = req.body;
    if (!telegram_id || !product) {
      return res.status(400).json({ error: 'Missing telegram_id or product' });
    }

    // Fetch prices from game_config
    const { data: configs } = await supabase
      .from('game_config')
      .select('key, value')
      .in('key', [
        'auto_battle_3days_stars',
        'auto_battle_14days_stars',
        'clan_creation_stars'
      ]);

    const get = (key, fallback) => {
      const found = configs?.find(c => c.key === key);
      return found ? parseInt(found.value) || fallback : fallback;
    };

    const PRODUCTS = {
      auto_battle_3d: {
        title: '⚙️ Auto Battle — 3 Days',
        description: 'Your bird fights automatically for 3 days. Earn rewards without tapping!',
        stars: get('auto_battle_3days_stars', 199),
        payload: `auto_battle_3d_${telegram_id}`,
      },
      auto_battle_14d: {
        title: '⚙️ Auto Battle — 14 Days',
        description: 'Best value! Your bird fights automatically for 14 days.',
        stars: get('auto_battle_14days_stars', 499),
        payload: `auto_battle_14d_${telegram_id}`,
      },
      clan_create: {
        title: '👥 Create a Clan',
        description: 'Found your own clan and lead your flock to glory!',
        stars: get('clan_creation_stars', 50),
        payload: `clan_create_${telegram_id}`,
      },
    };

    const p = PRODUCTS[product];
    if (!p) return res.status(400).json({ error: 'Unknown product' });

    const link = await bot.telegram.createInvoiceLink({
      title: p.title,
      description: p.description,
      payload: p.payload,
      currency: 'XTR',            // XTR = Telegram Stars
      prices: [{ label: p.title, amount: p.stars }],
    });

    res.json({ success: true, link });
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setBot };
