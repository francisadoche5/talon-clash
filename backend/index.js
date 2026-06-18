require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const { getOrCreatePlayer } = require('./modules/players');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check — keeps Render alive
app.get('/',       (req, res) => res.json({ status: 'Talon Clash Backend Running 🦅' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Public config endpoint
const supabase = require('./supabase');
app.get('/api/config', async (req, res) => {
  try {
    const { data } = await supabase.from('game_config').select('key, value');
    res.json({ success: true, config: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/players',   require('./api/routes/players'));
app.use('/api/battles',   require('./api/routes/battles'));
app.use('/api/store',     require('./api/routes/store'));
app.use('/api/inventory', require('./api/routes/inventory'));
app.use('/api/quests',    require('./api/routes/quests'));
app.use('/api/clans',     require('./api/routes/clans'));
app.use('/api/skills',    require('./api/routes/skills'));
app.use('/api/admin',     require('./api/routes/admin'));
app.use('/api/energy',    require('./api/routes/energyAds'));   // ← free ad energy
app.use('/api/dev',       require('./api/routes/devBoost'));    // ← dev testing only

const paymentsModule = require('./api/routes/payments');
app.use('/api/payments', paymentsModule.router);

// ── Telegram Bot ─────────────────────────────────────────────────────────────
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  const user = ctx.from;
  await getOrCreatePlayer(user);

  await ctx.reply(
    `🦅 Welcome to *Talon Clash!*\n\nYou start as a tiny Hatchling and battle your way to become the legendary Shadow Eagle!\n\n⚔️ Battle players\n🎒 Upgrade equipment\n🌳 Build your skill tree\n👥 Join a clan\n\nTap below to start your journey!`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🦅 Play Talon Clash', web_app: { url: process.env.FRONTEND_URL } }
        ]]
      }
    }
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
    `🦅 *Talon Clash Help*\n\n` +
    `⚡ Energy refills over time\n` +
    `⚔️ Battle mode costs 25 energy\n` +
    `💜 Epic mode costs 200 energy\n` +
    `🪶 Earn Feathers by battling\n` +
    `🔨 Use Hammers to forge gear\n` +
    `🌳 Spend skill points to upgrade\n\n` +
    `Your bird evolves as your power grows!`,
    { parse_mode: 'Markdown' }
  );
});

// Inject bot into payments module
paymentsModule.setBot(bot);

// ── Telegram Stars payment handlers ──────────────────────────────────────────

// Step 1: Always approve pre-checkout
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

// Step 2: Fulfill after successful payment
bot.on('message', async (ctx) => {
  const payment = ctx.message?.successful_payment;
  if (!payment) return;

  const payload    = payment.invoice_payload;      // format: "productId_telegramId"
  const parts      = payload.split('_');
  const telegramId = parts[parts.length - 1];      // last segment is always telegram_id
  const productKey = parts.slice(0, -1).join('_'); // everything before last _ is the product

  try {
    // Auto Battle 3 days
    if (productKey === 'auto_battle_3d') {
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('players')
        .update({ auto_battle_active: true, auto_battle_expires_at: expiresAt })
        .eq('telegram_id', telegramId);
      await ctx.reply('✅ Auto Battle activated for 3 days! Your bird is now fighting automatically. 🦅');
    }

    // Auto Battle 14 days
    else if (productKey === 'auto_battle_14d') {
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('players')
        .update({ auto_battle_active: true, auto_battle_expires_at: expiresAt })
        .eq('telegram_id', telegramId);
      await ctx.reply('✅ Auto Battle activated for 14 days! Your bird is fighting non-stop! 🦅🔥');
    }

    // Clan create unlock
    else if (productKey === 'clan_create') {
      await supabase.from('players')
        .update({ can_create_clan_stars: true })
        .eq('telegram_id', telegramId);
      await ctx.reply('✅ Clan creation unlocked! Go to Clans to found your clan. 👥');
    }

    // Energy refills
    else if (productKey === 'energy_50' || productKey === 'energy_250' || productKey === 'energy_750') {
      const amounts = { energy_50: 50, energy_250: 250, energy_750: 750 };
      const add     = amounts[productKey];
      const { data: p } = await supabase.from('players').select('energy, max_energy').eq('telegram_id', telegramId).single();
      const newEnergy   = Math.min(p?.max_energy || 400, (p?.energy || 0) + add);
      await supabase.from('players').update({ energy: newEnergy }).eq('telegram_id', telegramId);
      await ctx.reply(`✅ +${add} ⚡ Energy added! Keep fighting! 🦅`);
    }

    // Feathers packs
    else if (productKey.startsWith('feathers_')) {
      const amt = parseInt(productKey.replace('feathers_', ''));
      const { data: p } = await supabase.from('players').select('feathers').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({ feathers: (p?.feathers || 0) + amt }).eq('telegram_id', telegramId);
      await ctx.reply(`✅ +${amt.toLocaleString()} 🪶 Feathers added!`);
    }

    // Booster packs
    else if (productKey.startsWith('booster_x')) {
      const amt = parseInt(productKey.replace('booster_x', ''));
      const { data: p } = await supabase.from('players').select('boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({ boosters: (p?.boosters || 0) + amt }).eq('telegram_id', telegramId);
      await ctx.reply(`✅ +${amt} ⚗️ Boosters added!`);
    }

    // Epic Booster packs
    else if (productKey.startsWith('epic_booster_x')) {
      const amt = parseInt(productKey.replace('epic_booster_x', ''));
      const { data: p } = await supabase.from('players').select('epic_boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({ epic_boosters: (p?.epic_boosters || 0) + amt }).eq('telegram_id', telegramId);
      await ctx.reply(`✅ +${amt} 💥 Epic Boosters added!`);
    }

    // Hammer packs
    else if (productKey.startsWith('hammers_x')) {
      const amt = parseInt(productKey.replace('hammers_x', ''));
      const { data: p } = await supabase.from('players').select('hammers').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({ hammers: (p?.hammers || 0) + amt }).eq('telegram_id', telegramId);
      await ctx.reply(`✅ +${amt} 🔨 Hammers added!`);
    }

    // Chest purchases
    else if (productKey.startsWith('chest_')) {
      const chestType = productKey.replace('chest_', '');
      // Chest opening is handled by the existing store route
      // Just record the purchase and let frontend open it
      await supabase.from('pending_chests').insert({
        telegram_id: telegramId,
        chest_type:  chestType,
        created_at:  new Date().toISOString(),
      });
      await ctx.reply(`✅ ${chestType.charAt(0).toUpperCase() + chestType.slice(1)} Chest purchased! Open it in your inventory. 📦`);
    }

    // Special packs
    else if (productKey === 'special_overcharge') {
      const { data: p } = await supabase.from('players').select('epic_boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({ epic_boosters: (p?.epic_boosters || 0) + 40 }).eq('telegram_id', telegramId);
      await ctx.reply('✅ Overcharge Pack! +40 💥 Epic Boosters added!');
    }
    else if (productKey === 'special_electra') {
      const { data: p } = await supabase.from('players').select('boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({ boosters: (p?.boosters || 0) + 60 }).eq('telegram_id', telegramId);
      await ctx.reply('✅ Electra Pack! +60 ⚗️ Boosters added!');
    }
    else if (productKey === 'special_tesla') {
      const { data: p } = await supabase.from('players').select('feathers, boosters').eq('telegram_id', telegramId).single();
      await supabase.from('players').update({
        feathers: (p?.feathers || 0) + 5000,
        boosters: (p?.boosters || 0) + 30,
      }).eq('telegram_id', telegramId);
      await ctx.reply('✅ Energy Tesla Pack! +5,000 🪶 Feathers & +30 ⚗️ Boosters added!');
    }

  } catch (err) {
    console.error('Payment fulfillment error:', err);
  }
});

bot.launch();
console.log('🤖 Talon Clash Bot is running...');

process.once('SIGINT',  () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.listen(PORT, () => {
  console.log(`🦅 Talon Clash Backend running on port ${PORT}`);
});
