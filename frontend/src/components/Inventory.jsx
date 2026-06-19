import { useState, useEffect } from 'react';
import { getInventory, equipItem, burnItem, forgeItem, useBooster } from '../api';
import { getBirdUrl } from '../birdImages';

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

export default function Inventory({ player, onRefresh }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadInventory(); }, []);

  async function loadInventory() {
    try {
      const res = await getInventory(player.telegram_id);
      setItems(res.data.items || []);
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

  async function handleUseBooster(type) {
    try {
      const res = await useBooster(player.telegram_id, type);
      onRefresh();
      const label = type === 'epic_booster' ? 'Epic Booster' : 'Booster';
      setMessage({ type: 'success', text: `Used ${label}! +${res.data.energy_gained} ⚡ energy` });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
      setTimeout(() => setMessage(null), 2000);
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

      {/* Boosters — stockpile bought from the Market, used here for an instant energy refill */}
      <div className="text-amber-400 text-sm font-bold mb-2">Boosters</div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-blue-950 border-2 border-blue-700 rounded-xl p-3 flex flex-col items-center gap-1">
          <span className="text-2xl">⚗️</span>
          <span className="text-white text-sm font-bold">x{player?.boosters || 0}</span>
          <span className="text-blue-300 text-[10px]">+250 ⚡ energy</span>
          <button onClick={() => handleUseBooster('booster')} disabled={!(player?.boosters > 0)}
            className="w-full mt-1 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40"
            style={{ background: '#2563eb' }}>
            Use
          </button>
        </div>
        <div className="bg-purple-950 border-2 border-purple-700 rounded-xl p-3 flex flex-col items-center gap-1">
          <span className="text-2xl">💥</span>
          <span className="text-white text-sm font-bold">x{player?.epic_boosters || 0}</span>
          <span className="text-purple-300 text-[10px]">+750 ⚡ energy</span>
          <button onClick={() => handleUseBooster('epic_booster')} disabled={!(player?.epic_boosters > 0)}
            className="w-full mt-1 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40"
            style={{ background: '#7c3aed' }}>
            Use
          </button>
        </div>
      </div>

      {/* Equipped */}
      {equipped.length > 0 && (
        <>
          <div className="text-amber-400 text-sm font-bold mb-2">Equipped</div>
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
        Inventory ({unequipped.length})
      </div>
      {loading ? (
        <div className="text-center text-amber-400">Loading...</div>
      ) : unequipped.length === 0 ? (
        <div className="text-center text-amber-500 text-sm mt-4">
          No items. Open chests in Market!
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
                  Equip
                </button>
              )}
              <button onClick={() => handleForge(selected)}
                className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold">
                Forge 🔨{selected.level}
              </button>
              {!selected.is_equipped && (
                <button onClick={() => handleBurn(selected)}
                  className="flex-1 bg-red-800 text-white py-3 rounded-xl font-bold">
                  Burn
                </button>
              )}
            </div>
            <button onClick={() => setSelected(null)}
              className="w-full mt-2 text-amber-400 py-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
