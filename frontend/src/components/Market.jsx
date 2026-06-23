import { useState } from 'react';
import { payWithStars } from '../starsPayment';
import ASSETS from '../config/assets';
import { useLanguage } from '../i18n/LanguageContext';
import RewardRevealOverlay from './RewardRevealOverlay';

const FeatherIcon = ({ size = 16 }) => (
  <img src={ASSETS.icons.feathers} alt="feathers"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);
const EnergyIcon = ({ size = 20 }) => (
  <img src={ASSETS.icons.energy} alt="energy"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);
const HammerIcon = ({ size = 52 }) => (
  <img src={ASSETS.icons.hammer} alt="hammer"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);
const BoosterIcon = ({ size = 52 }) => (
  <img src={ASSETS.icons.booster} alt="booster"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);
const EpicBoosterIcon = ({ size = 52 }) => (
  <img src={ASSETS.icons.epicBooster} alt="epic booster"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);

const CATEGORIES = ['special_offers', 'star_credits', 'chests', 'feathers', 'boosters', 'epic_boosters', 'hammers'];

const CHEST_DATA = [
  { key: 'chest_common',   product: 'chest_common',   img: ASSETS.ui.chestCommon,   label: 'Common',   price: 49,   stock: '5/5' },
  { key: 'chest_uncommon', product: 'chest_uncommon', img: ASSETS.ui.chestUncommon, label: 'Uncommon', price: 149,  stock: '3/3' },
  { key: 'chest_rare',     product: 'chest_rare',     img: ASSETS.ui.chestRare,     label: 'Rare',     price: 1449, stock: '2/2' },
  { key: 'chest_epic',     product: 'chest_epic',     img: ASSETS.ui.chestEpic,     label: 'Epic',     price: 7499, stock: '1/1', badge: '50% OFF' },
];

const FEATHER_PACKS = [
  { id: 'f0', qty: 500,    price: 0,    watchAd: true,  cooldown: '17h 33m', stock: '0/8' },
  { id: 'f1', product: 'feathers_1000',  qty: 1000,   price: 149,  badge: '50% OFF', stock: '3/3' },
  { id: 'f2', product: 'feathers_2500',  qty: 2500,   price: 749,  stock: '1/1' },
  { id: 'f3', product: 'feathers_8500',  qty: 8500,   price: 1999, stock: '1/1' },
  { id: 'f4', product: 'feathers_17000', qty: 17000,  price: 4999, badge: 'HOT DEAL', stock: '1/1' },
  { id: 'f5', product: 'feathers_50500', qty: 50500,  price: 6999, badge: '50% OFF', stock: '1/1' },
];

const BOOSTER_PACKS = [
  { id: 'b1', product: 'booster_x1', qty: 1, price: 100,  label: 'GET X1' },
  { id: 'b2', product: 'booster_x3', qty: 3, price: 250,  label: 'GET X3' },
  { id: 'b3', product: 'booster_x5', qty: 5, price: 400,  label: 'GET X5' },
];

const EPIC_BOOSTER_PACKS = [
  { id: 'eb1', product: 'epic_booster_x1', qty: 1, price: 250,  label: 'GET X1' },
  { id: 'eb2', product: 'epic_booster_x3', qty: 3, price: 675,  label: 'GET X3' },
  { id: 'eb3', product: 'epic_booster_x5', qty: 5, price: 1125, label: 'GET X5' },
];

const HAMMER_PACKS = [
  { id: 'h1', product: 'hammers_x5',  qty: 5,  price: 2700, label: 'GET X5' },
  { id: 'h2', product: 'hammers_x10', qty: 10, price: 4600, label: 'GET X10' },
  { id: 'h3', product: 'hammers_x15', qty: 15, price: 5500, label: 'GET X15' },
];

const STAR_CREDIT_PACKS = [
  { id: 'sc1', product: 'star_credits_100',  qty: 100,   price: 100,  label: 'GET 100' },
  { id: 'sc2', product: 'star_credits_500',  qty: 500,   price: 500,  label: 'GET 500' },
  { id: 'sc3', product: 'star_credits_1500', qty: 1500,  price: 1500, label: 'GET 1,500' },
  { id: 'sc4', product: 'star_credits_5000', qty: 5000,  price: 5000, label: 'GET 5,000', badge: 'BEST VALUE' },
];

const SPECIAL_OFFERS = [
  { id: 'so1', product: 'special_overcharge', name: 'Overcharge Pack', stock: '100/100', qty: 40,  icon: 'epicBooster', price: 5900, badge: 'HOT DEAL', desc: 'Epic Booster x40' },
  { id: 'so2', product: 'special_electra',    name: 'Electra Pack',    stock: '100/100', qty: 60,  icon: 'energy',      price: 3500, badge: 'HOT DEAL', desc: 'Booster x60' },
  { id: 'so3', product: 'special_tesla',      name: 'Energy Tesla',    stock: '100/100', multi: true, qty: 5, icon: 'epicBooster', price: 2000, badge: 'HOT DEAL', desc: 'Feathers x5,000 + Booster x30' },
];

function StarsBuyButton({ label, price, onClick, large = false }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 font-black text-white rounded-xl active:scale-95 transition-transform ${large ? 'py-3 text-xl' : 'py-2.5 text-base'}`}
      style={{ background: 'linear-gradient(180deg,#5bb8ff 0%,#2a7fd4 100%)', boxShadow: '0 3px 0 #1a5fa0' }}>
      <span>{label || price.toLocaleString()}</span>
      <span className="text-yellow-300">⭐</span>
    </button>
  );
}

export default function Market({ player, onRefresh }) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('special_offers');
  const [message, setMessage] = useState(null);
  const [chestReveal, setChestReveal] = useState(null); // { img, item } once a chest purchase succeeds
  const [cracked, setCracked] = useState(false);          // has the player tapped the breathing chest yet

  const CATEGORY_LABELS = {
    special_offers: `🔥 ${t('market.special')}`,
    star_credits:   `⭐ ${t('market.starCredits')}`,
    chests:         `📦 ${t('market.chests')}`,
    feathers:       t('market.feathers'),
    boosters:       t('market.boosters'),
    epic_boosters:  t('market.epicBoosters'),
    hammers:        t('market.hammers'),
  };

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  function handleStarsPurchase(productId) {
    payWithStars({
      player,
      product: productId,
      onSuccess: (data) => {
        const item = data.result?.item;
        if (item) {
          showMsg('success', `🎉 You got a ${item.rarity} ${item.name}! Check your Inventory.`);
        } else {
          showMsg('success', data.method === 'virtual_stars'
            ? '✅ Purchased with Star Credits!'
            : '✅ Purchase successful!');
        }
        onRefresh();
      },
      onCancelled: () => showMsg('error', 'Purchase cancelled.'),
      onError: (msg) => showMsg('error', msg),
    });
  }

  // Chests get the full cinematic reveal instead of a toast. The purchase
  // already returns the won item, so by the time the overlay shows up we
  // know everything we need — "cracking" the chest is just presentation.
  function handleBuyChest(chest) {
    payWithStars({
      player,
      product: chest.product,
      onSuccess: (data) => {
        const item = data.result?.item;
        if (item) {
          setChestReveal({ img: chest.img, item });
          setCracked(false);
        } else {
          showMsg('success', '✅ Purchase successful!');
        }
        onRefresh();
      },
      onCancelled: () => showMsg('error', 'Purchase cancelled.'),
      onError: (msg) => showMsg('error', msg),
    });
  }

  function closeChestReveal() {
    setChestReveal(null);
    setCracked(false);
  }

  return (
    <div className="flex flex-col h-full bg-amber-950">

      {/* Header */}
      <div className="relative"
        style={{ background: 'linear-gradient(180deg,#8B5E3C 0%,#6B4423 50%,#5C3A1E 100%)', borderBottom: '3px solid #3D2510' }}>
        <div className="h-3 flex overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`flex-1 ${i % 2 === 0 ? 'bg-red-600' : 'bg-white'}`} />
          ))}
        </div>
        <div className="px-4 pt-2 pb-1 text-center">
          <div className="text-yellow-300 font-black text-2xl tracking-widest drop-shadow" style={{ textShadow: '2px 2px 0 #7c4a00' }}>
            {t('market.store')}
          </div>
        </div>
        <div className="flex justify-center gap-3 pb-2 px-4">
          <div className="bg-amber-900 bg-opacity-70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <FeatherIcon size={15} />
            <span className="text-amber-200 text-xs font-bold">{(player?.feathers || 0).toLocaleString()}</span>
          </div>
          <div className="bg-amber-900 bg-opacity-70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-amber-200 text-xs font-bold">{(player?.stars || 0).toLocaleString()}</span>
          </div>
          <div className="bg-amber-900 bg-opacity-70 rounded-full px-3 py-1 flex items-center gap-1.5">
            <HammerIcon size={18} />
            <span className="text-amber-200 text-xs font-bold">{player?.hammers || 0}</span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto bg-amber-900 px-3 py-2 gap-2"
        style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all flex items-center gap-1 ${
              activeCategory === cat ? 'bg-amber-500 text-amber-950' : 'bg-amber-800 text-amber-300'
            }`}>
            {cat === 'feathers'
              ? <><FeatherIcon size={13} /> {t('market.feathers')}</>
              : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Toast */}
      {message && (
        <div className={`mx-4 mt-2 p-2 rounded-xl text-center text-sm font-bold ${message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {message.text}
        </div>
      )}

      {/* Stars notice */}
      <div className="mx-4 mt-2 px-3 py-1.5 rounded-xl bg-blue-900 bg-opacity-60 flex items-center gap-2">
        <span className="text-yellow-300 text-sm">⭐</span>
        <span className="text-blue-200 text-xs font-bold">{t('market.paysWith')}</span>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#2d1a0e' }}>

        {/* SPECIAL OFFERS */}
        {activeCategory === 'special_offers' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide">{t('market.special')}</div>
            {SPECIAL_OFFERS.map(offer => (
              <div key={offer.id} className="relative rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#f5deb3 0%,#e8c99a 100%)', border: '2px solid #c8a96e' }}>
                {offer.badge && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-sm px-4 py-1 z-10"
                    style={{ clipPath: 'polygon(10px 0,100% 0,100% 100%,0 100%)' }}>
                    {offer.badge}
                  </div>
                )}
                <div className="p-4">
                  <div className="text-amber-900 font-black text-base mb-3">
                    {offer.name} <span className="font-normal text-amber-700 text-sm">({offer.stock})</span>
                  </div>
                  <div className="flex items-end gap-3 mb-4">
                    <div className="w-28 h-28 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center shadow-inner relative p-2">
                      <img src={ASSETS.icons[offer.icon]} alt={offer.name}
                        style={{ width: 80, height: 80, objectFit: 'contain' }} />
                      <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">x{offer.qty}</div>
                    </div>
                    {offer.multi && (
                      <div className="w-16 h-16 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center shadow-inner relative p-1">
                        <BoosterIcon size={44} />
                        <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">x30</div>
                      </div>
                    )}
                    <div className="flex-1 flex justify-end text-5xl select-none">🦅</div>
                  </div>
                  <StarsBuyButton price={offer.price} onClick={() => handleStarsPurchase(offer.product)} large />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STAR CREDITS — top up the virtual wallet with real Telegram Stars */}
        {activeCategory === 'star_credits' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-1">{t('market.starCredits')}</div>
            <div className="text-center text-amber-500 text-xs mb-2 px-2">
              Top up your wallet once, then spend Star Credits in the store without a payment popup every time.
            </div>
            {STAR_CREDIT_PACKS.map(pack => (
              <div key={pack.id} className="relative rounded-2xl flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg,#f5e6a3 0%,#e8d070 50%,#f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                {pack.badge && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-3 py-1 z-10"
                    style={{ clipPath: 'polygon(8px 0,100% 0,100% 100%,0 100%)' }}>
                    {pack.badge}
                  </div>
                )}
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center text-4xl">⭐</div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-900 font-black text-sm">{pack.qty.toLocaleString()} Star Credits</span>
                  </div>
                  <StarsBuyButton label={pack.label} price={pack.price} onClick={() => handleStarsPurchase(pack.product)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHESTS */}
        {activeCategory === 'chests' && (
          <div className="p-4">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-4">{t('market.chests')}</div>
            <div className="grid grid-cols-2 gap-3">
              {CHEST_DATA.map(chest => (
                <div key={chest.key} className="relative rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#f0d9b5 0%,#e0c49a 100%)', border: '2px solid #c8a96e' }}>
                  {chest.badge && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-3 py-1 z-10"
                      style={{ clipPath: 'polygon(8px 0,100% 0,100% 100%,0 100%)' }}>
                      {chest.badge}
                    </div>
                  )}
                  <div className="p-3 flex flex-col items-center">
                    <div className="text-amber-900 font-black text-sm mb-2">
                      {chest.label} <span className="text-amber-600 font-normal">({chest.stock})</span>
                    </div>
                    <div className="w-36 h-36 relative mb-2">
                      <img src={chest.img} alt={chest.label} className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <div className="w-full mt-1">
                      <StarsBuyButton price={chest.price} onClick={() => handleBuyChest(chest)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATHERS */}
        {activeCategory === 'feathers' && (
          <div className="p-4">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-4 flex items-center justify-center gap-2">
              <FeatherIcon size={20} /> Feathers
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FEATHER_PACKS.map(pack => (
                <div key={pack.id} className="relative rounded-2xl overflow-hidden"
                  style={{ background: 'linear-gradient(135deg,#f0d9b5 0%,#e0c49a 100%)', border: '2px solid #c8a96e' }}>
                  {pack.badge && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-3 py-1 z-10"
                      style={{ clipPath: 'polygon(8px 0,100% 0,100% 100%,0 100%)' }}>
                      {pack.badge}
                    </div>
                  )}
                  <div className="p-3 flex flex-col items-center">
                    <div className="text-amber-900 font-black text-xs mb-2">
                      Feathers <span className="text-amber-600">({pack.stock})</span>
                    </div>
                    <div className="w-28 h-28 rounded-xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center shadow-inner mb-2 relative p-1">
                      <FeatherIcon size={68} />
                      <div className="absolute -bottom-2 -right-2 bg-amber-800 text-white text-xs font-black rounded-full px-2 py-0.5">
                        x{pack.qty.toLocaleString()}
                      </div>
                    </div>
                    {pack.watchAd ? (
                      <div className="w-full mt-2">
                        <div className="bg-amber-700 text-amber-200 text-xs text-center py-1 rounded-t-lg font-bold flex items-center justify-center gap-1">
                          ⏱ {pack.cooldown}
                        </div>
                        <button className="w-full py-2 rounded-b-xl font-black text-sm text-white bg-amber-800 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                          ▶ Watch Ad
                        </button>
                      </div>
                    ) : (
                      <div className="w-full mt-2">
                        <StarsBuyButton price={pack.price} onClick={() => handleStarsPurchase(pack.product)} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOSTERS */}
        {activeCategory === 'boosters' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-2">Boosters</div>
            {BOOSTER_PACKS.map(pack => (
              <div key={pack.id} className="rounded-2xl flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg,#f5e6a3 0%,#e8d070 50%,#f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center"><BoosterIcon size={52} /></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="bg-amber-800 text-white text-sm font-black px-4 py-1 rounded-full flex items-center gap-1">
                      {pack.price} <span className="text-yellow-300">⭐</span>
                    </div>
                  </div>
                  <StarsBuyButton label={pack.label} price={pack.price} onClick={() => handleStarsPurchase(pack.product)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EPIC BOOSTERS */}
        {activeCategory === 'epic_boosters' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-2">Epic Boosters</div>
            {EPIC_BOOSTER_PACKS.map(pack => (
              <div key={pack.id} className="rounded-2xl flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg,#f5e6a3 0%,#e8d070 50%,#f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center"><EpicBoosterIcon size={52} /></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="bg-amber-800 text-white text-sm font-black px-4 py-1 rounded-full flex items-center gap-1">
                      {pack.price} <span className="text-yellow-300">⭐</span>
                    </div>
                  </div>
                  <StarsBuyButton label={pack.label} price={pack.price} onClick={() => handleStarsPurchase(pack.product)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HAMMERS */}
        {activeCategory === 'hammers' && (
          <div className="p-4 flex flex-col gap-3">
            <div className="text-center text-amber-300 font-black text-lg tracking-wide mb-2">Hammers</div>
            {HAMMER_PACKS.map(pack => (
              <div key={pack.id} className="rounded-2xl flex items-center gap-4 px-4 py-3"
                style={{ background: 'linear-gradient(135deg,#f5e6a3 0%,#e8d070 50%,#f5e6a3 100%)', border: '2px solid #c8a030', boxShadow: '0 2px 0 #7c6010, inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center"><HammerIcon size={52} /></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-end">
                    <div className="bg-amber-800 text-white text-sm font-black px-4 py-1 rounded-full flex items-center gap-1">
                      {pack.price.toLocaleString()} <span className="text-yellow-300">⭐</span>
                    </div>
                  </div>
                  <StarsBuyButton label={pack.label} price={pack.price} onClick={() => handleStarsPurchase(pack.product)} />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {chestReveal && (
        <RewardRevealOverlay
          chestImg={chestReveal.img}
          item={chestReveal.item}
          cracked={cracked}
          onCrack={() => setCracked(true)}
          onClose={closeChestReveal}
          continueLabel={t('inventory.awesome')}
        />
      )}
    </div>
  );
}
