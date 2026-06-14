import { useState, useEffect } from 'react';
import { getStoreItems, buyItem, openChest } from '../api';

const CATEGORIES = ['special_offers', 'chests', 'feathers', 'boosters', 'epic_boosters', 'hammers'];
const CATEGORY_LABELS = {
  special_offers: '🔥 Special',
  chests: '📦 Chests',
  feathers: '🪶 Feathers',
  boosters: '⚗️ Boosters',
  epic_boosters: '💥 Epic',
  hammers: '🔨 Hammers',
};

// Chest visuals
const CHEST_DATA = [
  { key: 'common',   img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgOr53orCwzG2h-OTJyBc6CvdnXzzhxRYw2GpWcwnt65ceF7GZKyMCr6V8d54LcINHOG-fVplj4ZGoSHrtgsNOb7XecWjt8IcxIVO4ZnzdweQ-BJ26hz9ka_BLdGtF2rhacpEUryoRZ8YOTIpZY52ge9RNHf44fTB5D0Y3ukB7bpFWjCX7WiQyf7JevXAw/s1024/file_000000001e0872439bc3f96641a60877.png', bg: 'bg-stone-600', label: 'Common',   price: 49,   qty: 1, stock: '5/5' },
  { key: 'uncommon', img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjJcxcRRA9vAfJd2gObgZUpjOWoFk0zZYuEdfbm8YVAIGDcCwlcwUKNgeXReAEHTsKr09Vodg8JoO7l0Fzi1aVj-pOHbVt51x75HKFnMWXMXKuLk_S7sbjswVRuVoRq_Nmfvhu_uln8YzqOaU2rcndf348ZUJNBB4-fMybXqZR8Y6RbMJkp4zSy6NYyHhE/s1024/file_00000000ae3c71f48faa59584a3695d6.png', bg: 'bg-green-600', label: 'Uncommon', price: 149,  qty: 1, stock: '3/3' },
  { key: 'rare',     img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg1GK-48TDSYsHV4XKU6DPlFQbF-QBBJgE0dduQhzoqdojvqVCz6la7YgIwHgc0ZACZV2VKFoN58y_WkqcwcGFEsW8ADRnGN7slnhMkXctAXp5oVkhrLcgzYcb5FqMAB4M2oHv-2wf2cVi2pjZZgx4FoM5zK0O_LSrrbZv-waQBhMAe69mlmKSOFLgAwXU/s1024/file_000000003d847243a48435ed1ae325ee.png', bg: 'bg-blue-600',  label: 'Rare',     price: 1449, qty: 1, stock: '2/2' },
  { key: 'epic',     img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjlsV6quJy9rAt-qOAO9kZDw7v84cN9mncMHPrC2oCitgW08UVzlQvVugLs57PHtnEQl58nro6PhWg46KnZJmz4FQo7k4c4-0ZanhdxtpX1HxnKvfENtzVIILOA6Bx4PtEiligPKSQIvut-9nu7x-GnWRUMwyCfIrwlxSHUCujFQJJ2JGVDf7dX3tPyXek/s1024/file_00000000bd8c71f4a416c8ee128deed5.png', bg: 'bg-purple-700', label: 'Epic',     price: 7499, qty: 1, stock: '1/1', badge: '50% OFF' },
];

const CHEST_EMOJIS = { common: '📦', uncommon: '🗃️', rare: '🔒', epic: '👑' };
const CHEST_COLORS = {
  common:   { card: 'bg-stone-100',  icon: 'bg-stone-300',   btn: 'from-blue-400 to-blue-600' },
  uncommon: { card: 'bg-green-50',   icon: 'bg-green-200',   btn: 'from-blue-400 to-blue-600' },
  rare:     { card: 'bg-blue-50',    icon: 'bg-blue-200',    btn: 'from-blue-400 to-blue-600' },
  epic:     { card: 'bg-purple-50',  icon: 'bg-purple-300',  btn: 'from-blue-400 to-blue-600' },
};

// Feathers packs
const DUST_PACKS = [
  { id: 'd1', qty: 500,    price: 0,    watchAd: true,  cooldown: '17h 33m', stock: '0/8' },
  { id: 'd2', qty: 1000,   price: 149,  badge: '50% OFF', stock: '3/3' },
  { id: 'd3', qty: 2500,   price: 749,  stock: '1/1' },
  { id: 'd4', qty: 8500,   price: 1999, stock: '1/1' },
  { id: 'd5', qty: 17000,  price: 4999, badge: 'HOT DEAL', stock: '1/1' },
  { id: 'd6', qty: 50500,  price: 6999, badge: '50% OFF', stock: '1/1' },
];

// Booster packs
const BOOSTER_PACKS = [
  { id: 'b1', qty: 1,  price: 100,  label: 'GET X1' },
  { id: 'b2', qty: 3,  price: 250,  label: 'GET X3' },
  { id: 'b3', qty: 5,  price: 400,  label: 'GET X5' },
];

const EPIC_BOOSTER_PACKS = [
  { id: 'eb1', qty: 1,  price: 250,  label: 'GET X1' },
  { id: 'eb2', qty: 3,  price: 675,  label: 'GET X3' },
  { id: 'eb3', qty: 5,  price: 1125, label: 'GET X5' },
];

// Hammer packs
const HAMMER_PACKS = [
  { id: 'h1', qty: 5,  price: 2700, label: 'GET X5' },
  { id: 'h2', qty: 10, price: 4600, label: 'GET X10' },
  { id: 'h3', qty: 15, price: 5500, label: 'GET X15' },
];

// Special offers
const SPECIAL_OFFERS = [
  { id: 'so1', name: 'Overcharge Pack', stock: '100/100', qty: 40, emoji: '💥', price: 5900, badge: 'HOT DEAL', desc: 'Epic Booster x40' },
  { id: 'so2', name: 'Electra Pack',    stock: '100/100', qty: 60, emoji: '⚡', price: 3500, badge: 'HOT DEAL', desc: 'Booster x60' },
  { id: 'so3', name: 'Energy Tesla',    stock: '100/100', multi: true, price: 2000, badge: 'HOT DEAL', desc: 'Feathers x5,000 + Booster x30' },
];

function Badge({ text }) {
  if (!text) return null;
  return (
    <div className="absolute -top-1 -right-1 z-10">
      <div className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-sm shadow-md"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 8px 100%)' }}>
        {text}
      </div>
    </div>
  );
}

function StarPrice({ amount, brown }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full font-black text-sm shadow ${
      brown ? 'bg-amber-800 text-white' : 'bg-gradient-to-b from-blue-400 to-blue-600 text-white'
    }`}>
      <span>{amount.toLocaleString()}</span>
      <span className="text-yellow-300">⭐</span>
    </div>
  );
}

export default function Market({ player, onRefresh }) {
  const [activeCategory, setActiveCategory] = useState('special_offers');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleChest(chestKey) {
    try {
      const res = await openChest(player.telegram_id, chestKey);
      showMsg('success', `🎉 Got: ${res.data.item?.name} (${res.data.item?.rarity})!`);
      onRefresh();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Purchase failed');
    }
  }

  async function handleBuy(itemId) {
    try {
      await buyItem(player.telegram_id, itemId);
      showMsg('success', 'Purchase successful!');
      onRefresh();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Purchase failed');
    }
  }

  return (
    <div className="flex flex-col h-full bg-amber-950">

      {/* Wood-grain header bar */}
      <div className="relative"
        style={{ background: 'linear-gradient(180deg, #8B5E3C 0%, #6B4423 50%, #5C3A1E 100%)', borderBottom: '3px solid #3D2510' }}>

        {/* Awning stripes at very top */}
        <div className="h-3 flex overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-red-600' : 'bg-white'}`} />
          ))}
        </div>

        <div className="px-4 pt-2 pb-1 text-center">
          <div className="text-yellow-300 font-black text-2xl tracking-widest drop-shadow"
            style={{ textShadow: '2px 2px 0 #7c4a00' }}>
            STORE
          </div>
        </div>

        {/* Currency row */}
        <div className="flex justify-center gap-3 pb-2 px-4">
          <div className="bg-amber-900 bg-opacity-70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="text-sm">🪶</span>
            <span className="text-amber-200 text-xs font-bold">{(player?.feathers || 0).toLocaleString()}</span>
          </div>
          <div className="bg-amber-900 bg-opacity-70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-amber-200 text-xs font-bold">{(player?.seeds || 0).toLocaleString()}</span>
          </div>
          <div className="bg-amber-900 bg-opacity-70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="text-sm">🔨</span>
            <span className="text-amber-200 text-xs font-bold">{player?.hammers || 0}</span>
          </div>
        </div>
      </div>

      {/* Category tabs — scrollable */}
      <div className="flex overflow-x-auto bg-amber-900 px-3 py-2 gap-2 no-scrollbar"
        style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
              activeCategory === cat
                ? 'bg-amber-500 text-amber-950 shadow-inner'
                : 'bg-amber-800 text-amber-300'
            }`}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Message toast */}
      {message && (
        <div className={`mx-4 mt-2 p-2 rounded-xl text-center text-sm font-bold ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#2d1a0e' }}>

        {/* ── SPECIAL OFFERS ── */}
        {activeCategory === 'special_offers' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide">Special offers</div>
            {SPECIAL_OFFERS.map(offer => (
              <div key={offer.id} className="relative rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #f5deb3 0%, #e8c99a 100%)', border: '2px solid #c8a96e' }}>
                {offer.badge && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-sm px-4 py-1 z-10"
                    style={{ clipPath: 'polygon(10px 0, 100% 0, 100% 100%, 0 100%)' }}>
                    {offer.badge}
                  </div>
                )}
                <div className="p-4">
                  <div className="text-amber-900 font-black text-base mb-3">
                    {offer.name} <span className="font-normal text-amber-700 text-sm">({offer.stock})</span>
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="w-20 h-20 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner relative">
                      {offer.emoji}
                      <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">
                        x{offer.qty}
                      </div>
                    </div>
                    {offer.multi && (
                      <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-inner relative">
                        ⚗️
                        <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">
                          x30
                        </div>
                      </div>
                    )}
                    {/* Bird mascot */}
                    <div className="flex-1 flex justify-end text-5xl select-none">🦅</div>
                  </div>
                  <button onClick={() => handleBuy(offer.id)}
                    className="w-full py-3 rounded-2xl font-black text-xl text-white shadow-lg active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2a7fd4 100%)', boxShadow: '0 4px 0 #1a5fa0' }}>
                    {offer.price.toLocaleString()} ⭐
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CHESTS ── */}
        {activeCategory === 'chests' && (
          <div className="p-4">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-4">Chests</div>
            <div className="grid grid-cols-2 gap-3">
              {CHEST_DATA.map(chest => (
                <div key={chest.key} className="relative rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #f0d9b5 0%, #e0c49a 100%)', border: '2px solid #c8a96e' }}>
                  {chest.badge && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-3 py-1 z-10"
                      style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%)' }}>
                      {chest.badge}
                    </div>
                  )}
                  <div className="p-3 flex flex-col items-center">
                    <div className="text-amber-900 font-black text-sm mb-2">
                      {chest.label} <span className="text-amber-600 font-normal">({chest.stock})</span>
                    </div>
                    {/* Chest icon box */}
                    <div className="w-24 h-24 relative mb-2">
                      <img src={chest.img} alt={chest.label}
                        className="w-full h-full object-contain drop-shadow-lg" />
                      <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">
                        x{chest.qty}
                      </div>
                    </div>
                    <button onClick={() => handleChest(chest.key)}
                      className="w-full mt-3 py-2.5 rounded-xl font-black text-lg text-white shadow active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2a7fd4 100%)', boxShadow: '0 3px 0 #1a5fa0' }}>
                      {chest.price} ⭐
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DUST ── */}
        {activeCategory === 'feathers' && (
          <div className="p-4">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-4">Feathers</div>
            <div className="grid grid-cols-2 gap-3">
              {DUST_PACKS.map(pack => (
                <div key={pack.id} className="relative rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #f0d9b5 0%, #e0c49a 100%)', border: '2px solid #c8a96e' }}>
                  {pack.badge && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-3 py-1 z-10"
                      style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%)' }}>
                      {pack.badge}
                    </div>
                  )}
                  <div className="p-3 flex flex-col items-center">
                    <div className="text-amber-900 font-black text-xs mb-2">
                      Feathers <span className="text-amber-600">({pack.stock})</span>
                    </div>
                    <div className="w-18 h-18 rounded-xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner mb-1 relative p-2">
                      🪶
                      <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">
                        x{pack.qty.toLocaleString()}
                      </div>
                    </div>
                    {pack.watchAd ? (
                      <div className="w-full mt-3">
                        <div className="bg-amber-700 text-amber-200 text-xs text-center py-1 rounded-t-lg font-bold flex items-center justify-center gap-1">
                          ⏱ {pack.cooldown}
                        </div>
                        <button className="w-full py-2 rounded-b-xl font-black text-sm text-white bg-amber-800 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                          ▶ Watch Ad
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleBuy(pack.id)}
                        className="w-full mt-3 py-2.5 rounded-xl font-black text-lg text-white shadow active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2a7fd4 100%)', boxShadow: '0 3px 0 #1a5fa0' }}>
                        {pack.price} ⭐
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BOOSTERS ── */}
        {activeCategory === 'boosters' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-2">Boosters</div>
            {BOOSTER_PACKS.map(pack => (
              <div key={pack.id} className="rounded-2xl overflow-hidden flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg, #f5e6a3 0%, #e8d070 50%, #f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                {/* Glow icon */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-yellow-300 opacity-30 blur-md" />
                  <div className="relative z-10 w-16 h-16 flex items-center justify-center text-4xl">⚗️</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="bg-amber-800 text-white text-sm font-black px-4 py-1 rounded-full flex items-center gap-1">
                      {pack.price} <span className="text-yellow-300">⭐</span>
                    </div>
                  </div>
                  <button onClick={() => handleBuy(pack.id)}
                    className="w-full py-2.5 rounded-xl font-black text-base text-white shadow active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2a7fd4 100%)', boxShadow: '0 3px 0 #1a5fa0' }}>
                    {pack.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EPIC BOOSTERS ── */}
        {activeCategory === 'epic_boosters' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-2">Epic Boosters</div>
            {EPIC_BOOSTER_PACKS.map(pack => (
              <div key={pack.id} className="rounded-2xl overflow-hidden flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg, #f5e6a3 0%, #e8d070 50%, #f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-purple-400 opacity-30 blur-md" />
                  <div className="relative z-10 w-16 h-16 flex items-center justify-center text-4xl">💥</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="bg-amber-800 text-white text-sm font-black px-4 py-1 rounded-full flex items-center gap-1">
                      {pack.price} <span className="text-yellow-300">⭐</span>
                    </div>
                  </div>
                  <button onClick={() => handleBuy(pack.id)}
                    className="w-full py-2.5 rounded-xl font-black text-base text-white shadow active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2a7fd4 100%)', boxShadow: '0 3px 0 #1a5fa0' }}>
                    {pack.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HAMMERS ── */}
        {activeCategory === 'hammers' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-2">Hammers</div>
            {HAMMER_PACKS.map(pack => (
              <div key={pack.id} className="rounded-2xl overflow-hidden flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg, #f5e6a3 0%, #e8d070 50%, #f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 blur-md" />
                  <div className="relative z-10 w-16 h-16 flex items-center justify-center text-4xl">🔨</div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="bg-amber-800 text-white text-sm font-black px-4 py-1 rounded-full flex items-center gap-1">
                      {pack.price.toLocaleString()} <span className="text-yellow-300">⭐</span>
                    </div>
                  </div>
                  <button onClick={() => handleBuy(pack.id)}
                    className="w-full py-2.5 rounded-xl font-black text-base text-white shadow active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2a7fd4 100%)', boxShadow: '0 3px 0 #1a5fa0' }}>
                    {pack.label}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
