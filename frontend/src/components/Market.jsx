import { useState, useEffect } from 'react';
import { getStoreItems, buyItem, openChest } from '../api';

const CATEGORIES = ['special_offers','boosters','epic_boosters','hammers','chests'];
const CATEGORY_LABELS = {
  special_offers: 'Special Offers',
  boosters: 'Boosters',
  epic_boosters: 'Epic Boosters',
  hammers: 'Hammers',
  chests: 'Chests'
};

export default function Market({ player, onRefresh }) {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('special_offers');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    try {
      const res = await getStoreItems();
      setItems(res.data.items || []);
    } catch {}
    finally { setLoading(false); }
  }

  async function handleBuy(item) {
    try {
      let res;
      if (item.category === 'chests') {
        const chestMap = {
          'Common Chest': 'common',
          'Uncommon Chest': 'uncommon',
          'Rare Chest': 'rare',
          'Epic Chest': 'epic'
        };
        res = await openChest(player.telegram_id, chestMap[item.name] || 'common');
        setMessage({ type: 'success', text: `Got: ${res.data.item?.name} (${res.data.item?.rarity})!` });
      } else {
        res = await buyItem(player.telegram_id, item.id);
        setMessage({ type: 'success', text: `Bought ${item.name}!` });
      }
      onRefresh();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Purchase failed' });
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const filteredItems = items.filter(i => i.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Currency Bar */}
      <div className="bg-amber-800 px-4 py-2 flex justify-center gap-4 text-sm">
        <span>🪶 {player?.feathers?.toLocaleString()}</span>
        <span>⭐ {player?.seeds || 0}</span>
        <span>🔨 {player?.hammers || 0}</span>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto bg-amber-900 px-2 py-1 gap-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat ? 'bg-amber-500 text-amber-900' : 'text-amber-400'
            }`}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-4 mt-2 p-2 rounded-xl text-center text-sm ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-amber-400 mt-8">Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-amber-400 mt-8">No items available</div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-amber-900 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-800 rounded-xl flex items-center justify-center text-3xl">
                {item.category === 'boosters' || item.category === 'epic_boosters' ? '⚗️' :
                 item.category === 'hammers' ? '🔨' :
                 item.category === 'chests' ? '📦' : '🎁'}
              </div>
              <div className="flex-1">
                {item.label && (
                  <div className="text-xs text-red-400 font-bold mb-1">{item.label}</div>
                )}
                <div className="text-white font-bold text-sm">{item.name}</div>
                <div className="text-amber-400 text-xs">{item.description}</div>
              </div>
              <div className="text-right">
                <div className="text-amber-300 text-sm font-bold mb-1">
                  {item.discount_percent > 0
                    ? Math.floor(item.price * (1 - item.discount_percent / 100))
                    : item.price} 🪶
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-xl font-bold hover:bg-blue-400 active:scale-95 transition-all">
                  BUY
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
