require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const { getOrCreatePlayer } = require('./modules/players');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check - keeps Render alive
app.get('/', (req, res) => res.json({ status: 'Talon Clash Backend Running 🦅' }));
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

// Routes
app.use('/api/players', require('./api/routes/players'));
app.use('/api/battles', require('./api/routes/battles'));
app.use('/api/store', require('./api/routes/store'));
app.use('/api/inventory', require('./api/routes/inventory'));
app.use('/api/quests', require('./api/routes/quests'));
app.use('/api/clans', require('./api/routes/clans'));
app.use('/api/skills', require('./api/routes/skills'));
app.use('/api/admin', require('./api/routes/admin'));
const paymentsModule = require('./api/routes/payments');
app.use('/api/payments', paymentsModule.router);

// Telegram Bot Setup
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

// ── Telegram Stars payment handlers ──

// Step 1: Always approve pre-checkout
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

// Step 2: Grant reward after successful payment
bot.on('message', async (ctx) => {
  const payment = ctx.message?.successful_payment;
  if (!payment) return;

  const payload = payment.invoice_payload;
  const supabase = require('./supabase');

  try {
    if (payload.startsWith('auto_battle_3d_')) {
      const telegramId = payload.replace('auto_battle_3d_', '');
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('players')
        .update({ auto_battle_active: true, auto_battle_expires_at: expiresAt })
        .eq('telegram_id', telegramId);
      await ctx.reply('✅ Auto Battle activated for 3 days! Your bird is now fighting automatically. 🦅');
    }

    else if (payload.startsWith('auto_battle_14d_')) {
      const telegramId = payload.replace('auto_battle_14d_', '');
      const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('players')
        .update({ auto_battle_active: true, auto_battle_expires_at: expiresAt })
        .eq('telegram_id', telegramId);
      await ctx.reply('✅ Auto Battle activated for 14 days! Your bird is fighting non-stop! 🦅🔥');
    }

    else if (payload.startsWith('clan_create_')) {
      const telegramId = payload.replace('clan_create_', '');
      await supabase.from('players')
        .update({ can_create_clan_stars: true })
        .eq('telegram_id', telegramId);
      await ctx.reply('✅ Clan creation unlocked! Go to Clans to found your clan. 👥');
    }

  } catch (err) {
    console.error('Payment fulfillment error:', err);
  }
});

bot.launch();
console.log('🤖 Talon Clash Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.listen(PORT, () => {
  console.log(`🦅 Talon Clash Backend running on port ${PORT}`);
});
