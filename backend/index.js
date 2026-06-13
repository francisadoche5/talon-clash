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

// Routes
app.use('/api/players', require('./api/routes/players'));
app.use('/api/battles', require('./api/routes/battles'));
app.use('/api/store', require('./api/routes/store'));
app.use('/api/inventory', require('./api/routes/inventory'));
app.use('/api/quests', require('./api/routes/quests'));
app.use('/api/clans', require('./api/routes/clans'));
app.use('/api/skills', require('./api/routes/skills'));
app.use('/api/admin', require('./api/routes/admin'));

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

bot.launch();
console.log('🤖 Talon Clash Bot is running...');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

app.listen(PORT, () => {
  console.log(`🦅 Talon Clash Backend running on port ${PORT}`);
});
