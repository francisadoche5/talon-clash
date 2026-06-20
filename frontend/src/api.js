import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://talon-clash.onrender.com',
  timeout: 35000   // 35s — Render free tier needs ~20-30s to cold-start
});

export const login           = (telegramUser, startParam)  => API.post('/api/players/login',      { telegram_user: telegramUser, start_param: startParam });
export const getPlayer       = (id)                        => API.get(`/api/players/${id}`);
export const getLeaderboard  = ()                          => API.get('/api/players/0/leaderboard');
export const getReferrals    = (id)                        => API.get(`/api/players/${id}/referrals`);
export const fight           = (telegramId, mode)          => API.post('/api/battles/fight',      { telegram_id: telegramId, mode });
export const getBattleHistory= (id)                        => API.get(`/api/battles/history/${id}`);
export const getStoreItems   = ()                          => API.get('/api/store/items');
export const buyItem         = (telegramId, itemId)        => API.post('/api/store/buy',           { telegram_id: telegramId, item_id: itemId });
export const openChest       = (telegramId, chestType)     => API.post('/api/store/chest',         { telegram_id: telegramId, chest_type: chestType });
export const getInventory    = (id)                        => API.get(`/api/inventory/${id}`);
export const openPendingChest= (telegramId, chestId)       => API.post('/api/inventory/chest/open', { telegram_id: telegramId, chest_id: chestId });
export const equipItem       = (telegramId, itemId)        => API.post('/api/inventory/equip',     { telegram_id: telegramId, item_id: itemId });
export const burnItem        = (telegramId, itemId)        => API.post('/api/inventory/burn',      { telegram_id: telegramId, item_id: itemId });
export const forgeItem       = (telegramId, itemId)        => API.post('/api/inventory/forge',     { telegram_id: telegramId, item_id: itemId });
export const getQuests       = (id)                        => API.get(`/api/quests/${id}`);
export const claimQuest      = (telegramId, questId)       => API.post('/api/quests/claim',        { telegram_id: telegramId, quest_id: questId });
export const getClans        = (sort)                      => API.get(`/api/clans?sort=${sort||'power'}`);
export const getMyClan       = (id)                        => API.get(`/api/clans/my/${id}`);
export const createClan      = (telegramId, name, emblem, joinType) => API.post('/api/clans/create', { telegram_id: telegramId, name, emblem, join_type: joinType });
export const joinClan        = (telegramId, clanId)        => API.post('/api/clans/join',          { telegram_id: telegramId, clan_id: clanId });
export const leaveClan       = (telegramId)                => API.post('/api/clans/leave',         { telegram_id: telegramId });
export const getSkills       = (id)                        => API.get(`/api/skills/${id}`);
export const upgradeSkill    = (telegramId, skillType)     => API.post('/api/skills/upgrade',      { telegram_id: telegramId, skill_type: skillType });
export const getPublicConfig = ()                          => API.get('/api/config');
export const createInvoice   = (telegram_id, product)      => API.post('/api/payments/invoice',    { telegram_id, product });
export const purchaseProduct = (telegram_id, product)      => API.post('/api/payments/purchase',   { telegram_id, product });
export const useBooster      = (telegramId, type)          => API.post(`/api/players/${telegramId}/use-booster`, { type });
export const stopAutoBattle  = (telegramId)                => API.post(`/api/players/${telegramId}/auto-battle/stop`, {});
export const devBoost        = (telegramId, secret)         => API.post(`/api/dev/boost/${telegramId}`, { secret });
