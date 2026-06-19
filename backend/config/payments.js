const router = require('express').Router();
const supabase = require('../../supabase');
const { STATIC_PRODUCTS } = require('../../config/payments');
const { fulfillProduct } = require('../../modules/payments');

let bot;
function setBot(b) { bot = b; }

// POST /api/payments/invoice
// Always creates a real Telegram Stars invoice, regardless of virtual Star Credit balance.
router.post('/invoice', async (req, res) => {
  try {
    const { telegram_id, product } = req.body;
    if (!telegram_id || !product) {
      return res.status(400).json({ error: 'Missing telegram_id or product' });
    }

    // Allow config-overrideable prices for a few products
    let p = { ...STATIC_PRODUCTS[product] };
    if (!p || !p.title) {
      return res.status(400).json({ error: 'Unknown product: ' + product });
    }

    // Override prices from game_config if present
    const overridableKeys = {
      auto_battle_3d:  'auto_battle_3days_stars',
      auto_battle_14d: 'auto_battle_14days_stars',
      clan_create:     'clan_creation_stars',
    };
    if (overridableKeys[product]) {
      const { data: configs } = await supabase
        .from('game_config')
        .select('key, value')
        .eq('key', overridableKeys[product]);
      if (configs?.length) {
        const val = parseInt(configs[0].value);
        if (val) p.stars = val;
      }
    }

    const link = await bot.telegram.createInvoiceLink({
      title: p.title,
      description: p.description,
      payload: `${product}_${telegram_id}`,
      currency: 'XTR',
      prices: [{ label: p.title, amount: p.stars }],
    });

    res.json({ success: true, link, product_meta: { type: p.type, stars: p.stars } });
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/purchase
// The single endpoint the frontend should call for anything priced in Stars.
// 1. If the product is a Star Credits top-up pack, it's always paid with real
//    Telegram Stars (you can't buy Star Credits using Star Credits).
// 2. Otherwise, if the player has enough virtual Star Credits, pay with those
//    instantly — no payment popup, no real money involved.
// 3. If the player doesn't have enough Star Credits, fall back to a real
//    Telegram Stars invoice for that item (same as /invoice).
router.post('/purchase', async (req, res) => {
  try {
    const { telegram_id, product } = req.body;
    if (!telegram_id || !product) {
      return res.status(400).json({ error: 'Missing telegram_id or product' });
    }

    const p = STATIC_PRODUCTS[product];
    if (!p) return res.status(400).json({ error: 'Unknown product: ' + product });

    if (p.type !== 'star_credits') {
      const { data: player } = await supabase
        .from('players').select('stars').eq('telegram_id', telegram_id).single();
      const balance = player?.stars || 0;

      if (balance >= p.stars) {
        await supabase.from('players')
          .update({ stars: balance - p.stars })
          .eq('telegram_id', telegram_id);

        await fulfillProduct(telegram_id, product);

        return res.json({
          success: true,
          method: 'virtual_stars',
          paid: p.stars,
          remaining_stars: balance - p.stars,
          product_meta: { type: p.type, stars: p.stars },
        });
      }
    }

    // Not enough Star Credits (or this product is a top-up pack) — real payment.
    const link = await bot.telegram.createInvoiceLink({
      title: p.title,
      description: p.description,
      payload: `${product}_${telegram_id}`,
      currency: 'XTR',
      prices: [{ label: p.title, amount: p.stars }],
    });

    res.json({
      success: true,
      method: 'real_stars_invoice',
      link,
      product_meta: { type: p.type, stars: p.stars },
    });
  } catch (err) {
    console.error('Purchase error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/fulfill
// Manual fulfillment helper (kept for backward compatibility / admin tooling).
router.post('/fulfill', async (req, res) => {
  try {
    const { telegram_id, product } = req.body;
    const result = await fulfillProduct(telegram_id, product);
    if (result?.error) return res.status(400).json(result);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Fulfill error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setBot, STATIC_PRODUCTS };
