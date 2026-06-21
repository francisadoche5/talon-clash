import { useState, useEffect } from 'react';
import { getInventory, equipItem, burnItem, forgeItem, openPendingChest } from '../api';
import { getBirdUrl } from '../birdImages';
import ASSETS from '../config/assets';
import { useLanguage } from '../i18n/LanguageContext';

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-900',
  uncommon: 'border-green-500 bg-green-950',
  rare: 'border-blue-500 bg-blue-950',
  epic: 'border-purple-500 bg-purple-950',
  legendary: 'border-yellow-500 bg-yellow-950'
};

const SLOT_ICONS = {
  weapon: '⚔️',
  armor: '🛡️',
  helmet: '⛑️',
  boots: '👟',
  ring: '💍',
  mount: '🦅'
};

const CHEST_IMAGES = {
  common:   ASSETS.ui.chestCommon,
  uncommon: ASSETS.ui.chestUncommon,
  rare:     ASSETS.ui.chestRare,
  epic:     ASSETS.ui.chestEpic,
};

// Mirrors backend/modules/inventory's burnItem rarityReward table, just for
// showing the player what they'll get before they tap Sell.
const SELL_VALUE = { common: 50, uncommon: 150, rare: 500, epic: 1500, legendary: 5000 };

export default function Inventory({ player, onRefresh }) {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [pendingChests, setPendingChests] = useState([]);
  const [opening, setOpening] = useState(null);
  const [wonItem, setWonItem] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadInventory(); }, []);

  async function loadInventory() {
    try {
      const res = await getInventory(player.telegram_id);
      setItems(res.data.items || []);
      setPendingChests(res.data.pendingChests || []);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleEquip(item) {
    try {
      await equipItem(player.telegram_id, item.id);
      await loadInventory();
      onRefresh();
      setMessage({ type: 'success', text: `${item.name} equipped!` });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
  }

  async function handleBurn(item) {
    try {
      const res = await burnItem(player.telegram_id, item.id);
      await loadInventory();
      onRefresh();
      setSelected(null);
      setMessage({ type: 'success', text: `Burned for ${res.data.feathersEarned} 🪶` });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
  }

  async function handleForge(item) {
    try {
      await forgeItem(player.telegram_id, item.id);
      await loadInventory();
      onRefresh();
      setMessage({ type: 'success', text: `${item.name} upgraded to Lvl ${item.level + 1}!` });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
  }

  async function handleOpenChest(chest) {
    setOpening(chest.id);
    try {
      const res = await openPendingChest(player.telegram_id, chest.id);
      setPendingChests(prev => prev.filter(c => c.id !== chest.id));
      setWonItem(res.data.item);
      await loadInventory();
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to open chest' });
      setTimeout(() => setMessage(null), 2500);
    } finally {
      setOpening(null);
    }
  }

  const equipped = items.filter(i => i.is_equipped);
  const unequipped = items.filter(i => !i.is_equipped);

  return (
    <div className="p-4">
      {/* Bird portrait */}
      <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
        <img
          src={getBirdUrl(player?.evolution_tier || 1)}
          alt={player?.evolution_name || 'Bird'}
          style={{
            width: 110, height: 110, objectFit:'contain',
            filter:'drop-shadow(0 0 18px rgba(251,191,36,0.6))',
          }}
        />
      </div>

      {/* Stats Bar */}
      <div className="bg-amber-900 rounded-xl p-3 flex justify-around mb-4 text-center">
        <div>
          <div className="text-xs text-orange-400">ATK</div>
          <div className="font-bold">{10 + (player?.level || 1) * 5}</div>
        </div>
        <div>
          <div className="text-xs text-amber-400">Power</div>
          <div className="font-bold">{player?.power?.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-red-400">HP</div>
          <div className="font-bold">{100 + (player?.level || 1) * 50}</div>
        </div>
      </div>

      {message && (
        <div className={`mb-3 p-2 rounded-xl text-center text-sm ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Chests — purchased with Stars/Star Credits, waiting to be opened */}
      {pendingChests.length > 0 && (
        <>
          <div className="text-amber-400 text-sm font-bold mb-2">
            {t('inventory.chests')} ({pendingChests.length})
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {pendingChests.map(chest => (
              <div key={chest.id} className="bg-amber-900 border-2 border-amber-600 rounded-xl p-3 flex flex-col items-center gap-1">
                <img src={CHEST_IMAGES[chest.chest_type]} alt={chest.chest_type}
                  className="w-16 h-16 object-contain drop-shadow-lg" />
                <span className="text-white text-xs font-bold capitalize">{chest.chest_type} Chest</span>
                <button onClick={() => handleOpenChest(chest)} disabled={opening === chest.id}
                  className="w-full mt-1 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: '#d97706' }}>
                  {opening === chest.id ? t('inventory.opening') : t('inventory.open')}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Equipped */}
      {equipped.length > 0 && (
        <>
          <div className="text-amber-400 text-sm font-bold mb-2">{t('inventory.equipped')}</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {equipped.map(item => (
              <div key={item.id} onClick={() => setSelected(item)}
                className={`border-2 rounded-xl p-2 cursor-pointer ${RARITY_COLORS[item.rarity]} ring-2 ring-yellow-400`}>
                <div className="text-2xl text-center">{SLOT_ICONS[item.slot]}</div>
                <div className="text-white text-xs text-center mt-1 truncate">{item.name}</div>
                <div className="text-yellow-400 text-xs text-center">Lvl {item.level}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Inventory */}
      <div className="text-amber-400 text-sm font-bold mb-2">
        {t('inventory.inventory')} ({unequipped.length})
      </div>
      {loading ? (
        <div className="text-center text-amber-400">{t('common.loading')}</div>
      ) : unequipped.length === 0 ? (
        <div className="text-center text-amber-500 text-sm mt-4">
          No items yet. Buy a chest in Market to get your first one!
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {unequipped.map(item => (
            <div key={item.id} onClick={() => setSelected(item)}
              className={`border-2 rounded-xl p-2 cursor-pointer ${RARITY_COLORS[item.rarity]}`}>
              <div className="text-2xl text-center">{SLOT_ICONS[item.slot]}</div>
              <div className="text-white text-xs text-center mt-1 truncate">{item.name}</div>
              <div className="text-gray-400 text-xs text-center">Lvl {item.level}</div>
            </div>
          ))}
        </div>
      )}

      {/* Item Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-end z-50">
          <div className="w-full bg-amber-900 rounded-t-3xl p-6">
            <div className={`border-2 rounded-xl p-4 mb-4 ${RARITY_COLORS[selected.rarity]}`}>
              <div className="text-4xl text-center mb-2">{SLOT_ICONS[selected.slot]}</div>
              <div className="text-white font-bold text-center">{selected.name}</div>
              <div className="text-amber-400 text-sm text-center capitalize">
                {selected.rarity} • Lvl {selected.level}
              </div>
              <div className="flex justify-around mt-3 text-sm">
                <span>⚔️ +{selected.attack_bonus}</span>
                <span>❤️ +{selected.hp_bonus}</span>
                <span>🛡️ +{selected.defense_bonus}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!selected.is_equipped && (
                <button onClick={() => handleEquip(selected)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">
                  {t('inventory.equip')}
                </button>
              )}
              <button onClick={() => handleForge(selected)}
                className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold">
                {t('inventory.forge')} 🔨{selected.level}
              </button>
              {!selected.is_equipped && (
                <button onClick={() => handleBurn(selected)}
                  className="flex-1 bg-red-800 text-white py-3 rounded-xl font-bold">
                  {t('inventory.burn')} +{SELL_VALUE[selected.rarity] || 50} 🪶
                </button>
              )}
            </div>
            <button onClick={() => setSelected(null)}
              className="w-full mt-2 text-amber-400 py-2">
              {t('inventory.close')}
            </button>
          </div>
        </div>
      )}

      {/* Chest Reward Reveal */}
      {wonItem && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-6">
          <div className="w-full max-w-sm bg-amber-900 rounded-3xl p-6 text-center">
            <div className="text-amber-300 font-black text-lg mb-3">🎉 {t('inventory.youGotItem')}</div>
            <div className={`border-2 rounded-xl p-4 mb-4 ${RARITY_COLORS[wonItem.rarity]}`}>
              <div className="text-5xl text-center mb-2">{SLOT_ICONS[wonItem.slot]}</div>
              <div className="text-white font-bold text-center">{wonItem.name}</div>
              <div className="text-amber-400 text-sm text-center capitalize">
                {wonItem.rarity} • Lvl {wonItem.level}
              </div>
              <div className="flex justify-around mt-3 text-sm">
                <span>⚔️ +{wonItem.attack_bonus}</span>
                <span>❤️ +{wonItem.hp_bonus}</span>
                <span>🛡️ +{wonItem.defense_bonus}</span>
              </div>
            </div>
            <button onClick={() => setWonItem(null)}
              className="w-full bg-amber-500 text-amber-900 py-3 rounded-xl font-bold">
              {t('inventory.awesome')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
