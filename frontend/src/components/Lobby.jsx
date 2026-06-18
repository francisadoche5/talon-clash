import { useState, useEffect, useRef } from 'react';
import { fight, getPublicConfig, createInvoice, getQuests, claimQuest } from '../api';
import BattleArena from './BattleArena';
import { getBirdUrl } from '../birdImages';
import axios from 'axios';
import ASSETS from '../config/assets';

const EI = ({ size = 22 }) => (
  <img src={ASSETS.icons.energy} alt="energy"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);
const FeatherIcon = ({ size = 16 }) => (
  <img src={ASSETS.icons.feathers} alt="feathers"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);
// Picks the right icon for a quest reward (feathers, glory, exp, energy...).
// Falls back to a gift emoji for reward types without a dedicated icon (food, seeds).
const RewardIcon = ({ type, size = 14 }) => {
  const map = { feathers: ASSETS.icons.feathers, glory: ASSETS.icons.glory, exp: ASSETS.icons.exp, energy: ASSETS.icons.energy };
  const src = map[type];
  if (src) return <img src={src} alt={type} style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />;
  return <span style={{ fontSize: size }}>🎁</span>;
};

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://talon-clash.onrender.com';

// Grant 50 energy after a watched ad
async function claimAdEnergy(telegramId) {
  const res = await axios.post(`${API_BASE}/api/energy/ad-claim`, { telegram_id: telegramId });
  return res.data;
}

// ── Energy Modal ───────────────────────────────────────────────────────────────
function EnergyModal({ player, onClose, onPurchased }) {
  const energy    = Math.floor(player?.energy    || 0);
  const maxEnergy = player?.max_energy || 400;

  // How many ads the user has watched this session (max 10 per day from backend)
  const adsWatched  = player?.ads_watched_today  || 0;
  const adsLimit    = 10;
  const adsLeft     = Math.max(0, adsLimit - adsWatched);
  const [watching,  setWatching]  = useState(false);
  const [adMsg,     setAdMsg]     = useState(null);

  const STAR_OPTIONS = [
    { id: 'energy_250', amount: 250, price: 250, icon: ASSETS.icons.energy,      top: '#5bb8ff', mid: '#2d7dd2', bot: '#1a5fa0', shadow: '#0d3d70', border: '#7fcfff' },
    { id: 'energy_750', amount: 750, price: 750, icon: ASSETS.icons.epicBooster, top: '#a78bfa', mid: '#7c3aed', bot: '#5b21b6', shadow: '#3b0e8f', border: '#c4b5fd' },
  ];

  async function handleWatchAd() {
    if (adsLeft <= 0) return;
    setWatching(true);
    setAdMsg(null);
    try {
      // Show Telegram rewarded ad if available
      if (window.Telegram?.WebApp?.showAd) {
        await new Promise((resolve, reject) => {
          window.Telegram.WebApp.showAd({ type: 'rewarded' }, (result) => {
            if (result?.status === 'watched') resolve();
            else reject(new Error('Ad not completed'));
          });
        });
      }
      // Grant energy on backend
      await claimAdEnergy(player.telegram_id);
      setAdMsg({ type: 'success', text: '+50 ⚡ Energy added!' });
      onPurchased();
    } catch (err) {
      setAdMsg({ type: 'error', text: 'Ad not completed. Try again.' });
    } finally {
      setWatching(false);
    }
  }

  async function handleStarRefill(optionId) {
    try {
      const res  = await createInvoice(player.telegram_id, optionId);
      const link = res.data.link;
      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(link, (status) => {
          if (status === 'paid') { onPurchased(); onClose(); }
        });
      } else {
        window.open(link, '_blank');
        onClose();
      }
    } catch {
      alert('Could not process payment. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.65)' }}>
      <div className="w-full max-w-sm rounded-t-[32px] overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#fdf6e0 0%,#ede1b4 100%)',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.8)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <div className="w-8" />
          <h2 className="font-black text-gray-800 text-xl tracking-wide">Energy</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-black text-lg">✕</button>
        </div>

        {/* Energy pill */}
        <div className="flex flex-col items-center py-4 gap-1">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full font-black text-lg text-white"
            style={{ background: 'linear-gradient(145deg,#c9a840,#8a6810)',
              boxShadow: '0 4px 0 #5a3800, 0 6px 16px rgba(0,0,0,0.3)', border: '1.5px solid #e8c060' }}>
            <span style={{ fontSize: 22 }}><EI size={28} /></span>
            <span>{energy}/{maxEnergy}</span>
          </div>
          <p className="text-amber-700 text-sm font-bold mt-1">+0.17 <EI size={14} /> each 10 seconds</p>
          <p className="text-amber-600 font-black text-sm mt-1">Restore energy instantly</p>
        </div>

        {/* Ad message */}
        {adMsg && (
          <div className={`mx-4 mb-2 py-2 px-3 rounded-xl text-center text-sm font-bold ${adMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {adMsg.text}
          </div>
        )}

        {/* Options row */}
        <div className="flex gap-3 px-4 pb-8">

          {/* ── Option 1: FREE — Watch Ad ── */}
          <button
            onClick={handleWatchAd}
            disabled={watching || adsLeft <= 0}
            className="flex-1 rounded-2xl overflow-hidden active:scale-95 transition-transform disabled:opacity-60"
            style={{ boxShadow: '0 4px 0 #1a4a00, 0 6px 20px rgba(0,0,0,0.3)' }}>

            {/* FREE badge */}
            <div className="flex items-center justify-center py-1.5 font-black text-white text-xs gap-1"
              style={{ background: 'linear-gradient(180deg,#6abf47 0%,#4aa024 100%)' }}>
              FREE
            </div>

            {/* Icon area */}
            <div className="flex flex-col items-center justify-center py-3 gap-2"
              style={{ background: 'linear-gradient(180deg,#4aa024 0%,#2d7010 100%)' }}>
              <img src={ASSETS.icons.booster} alt="booster" style={{width:34,height:34,objectFit:'contain'}} />
              <div className="px-2 py-1 rounded-lg font-black text-white text-xs flex items-center gap-1"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                +50 <EI size={16} />
              </div>
            </div>

            {/* Bottom — ads counter / Watch Ad */}
            <div className="py-2 font-black text-white text-xs text-center flex flex-col items-center"
              style={{ background: 'linear-gradient(180deg,#6abf47 0%,#4aa024 100%)' }}>
              {watching ? (
                <span>Loading…</span>
              ) : adsLeft <= 0 ? (
                <span>Limit reached</span>
              ) : (
                <>
                  <span>Watch Ad</span>
                  <span className="opacity-80 text-[10px]">{adsLeft}/{adsLimit} left today</span>
                </>
              )}
            </div>
          </button>

          {/* ── Options 2 & 3: Star purchases ── */}
          {STAR_OPTIONS.map((opt) => (
            <button key={opt.id}
              onClick={() => handleStarRefill(opt.id)}
              className="flex-1 rounded-2xl overflow-hidden active:scale-95 transition-transform"
              style={{ boxShadow: `0 4px 0 ${opt.shadow}, 0 6px 20px rgba(0,0,0,0.3)` }}>

              <div className="flex items-center justify-center py-1.5 font-black text-white text-xs"
                style={{ background: `linear-gradient(180deg,${opt.top} 0%,${opt.mid} 100%)` }}>
                +⊕
              </div>

              <div className="flex flex-col items-center justify-center py-3 gap-2"
                style={{ background: `linear-gradient(180deg,${opt.mid} 0%,${opt.bot} 100%)` }}>
                <img src={opt.icon} alt="" style={{width:34,height:34,objectFit:'contain'}} />
                <div className="px-2 py-1 rounded-lg font-black text-white text-xs flex items-center gap-1"
                  style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${opt.border}40` }}>
                  {opt.amount} <EI size={16} />
                </div>
              </div>

              <div className="py-2 font-black text-white text-sm text-center"
                style={{ background: `linear-gradient(180deg,${opt.top} 0%,${opt.mid} 100%)` }}>
                {opt.price} ⭐
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Daily Quests Modal — full list with progress + claim ───────────────────────
function QuestsModal({ quests, claimingId, onClaim, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.65)' }}>
      <div className="w-full max-w-sm rounded-t-[32px] overflow-hidden flex flex-col" style={{ maxHeight: '80vh',
        background: 'linear-gradient(160deg,#fdf6e0 0%,#ede1b4 100%)',
        boxShadow: '0 -16px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.8)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="w-8" />
          <h2 className="font-black text-gray-800 text-xl tracking-wide">Daily Quests</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500 font-black text-lg">✕</button>
        </div>

        {/* Quest list */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">
          {quests.length === 0 && (
            <p className="text-amber-700 text-sm text-center py-8 font-bold">No active quests right now.</p>
          )}
          {quests.map(q => {
            const pct   = Math.min(100, (q.progress / q.requirement_amount) * 100);
            const ready = q.is_completed && !q.is_claimed;
            return (
              <div key={q.id} className="rounded-2xl p-3" style={{ background: '#e8d5b7', border: '2px solid #b8956a' }}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="text-amber-900 font-bold text-sm">{q.title}</div>
                  <div className="text-amber-700 text-xs font-black flex items-center gap-1 flex-shrink-0">
                    +{q.reward_amount}<RewardIcon type={q.reward_type} size={14} />
                  </div>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-2 overflow-hidden mb-1.5">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: q.is_claimed ? '#9ca3af' : 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                  }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-amber-600 text-[11px] font-bold">
                    {Math.min(q.progress, q.requirement_amount)}/{q.requirement_amount}
                  </span>
                  <button
                    disabled={!ready || claimingId === q.id}
                    onClick={() => onClaim(q.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-transform ${
                      q.is_claimed ? 'bg-gray-300 text-gray-500'
                      : ready ? 'bg-green-500 text-white active:scale-95'
                      : 'bg-amber-200 text-amber-500'}`}>
                    {q.is_claimed ? 'Claimed' : claimingId === q.id ? '…' : ready ? 'Claim' : 'In Progress'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Returns the correct lobby background based on current hour ─────────────────
// Day:   06:00 – 19:59  →  lobbyBgDay images
// Night: 20:00 – 05:59  →  lobbyBgNight images
function getLobbyBackground() {
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;
  const pool  = isDay ? ASSETS.ui.lobbyBgDay : ASSETS.ui.lobbyBgNight;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Characteristics Modal ──────────────────────────────────────────────────────
function CharacteristicsModal({ player, onClose }) {
  const lvl  = player?.level || 1;
  const tier = player?.evolution_tier || 1;
  const atk  = 10 + lvl * 5;

  const stats = [
    { icon: '👊', label: 'Power',       value: (player?.power || 0).toLocaleString(),       wide: true },
    { icon: '❤️', label: 'HP',          value: (100 + lvl * 50).toLocaleString() },
    { icon: '🛡️', label: 'Defence',     value: (5 + lvl * 2).toLocaleString() },
    { icon: '⚔️', label: 'Attack Min',  value: Math.floor(atk * 0.7).toLocaleString() },
    { icon: '🗡️', label: 'Attack Max',  value: atk.toLocaleString() },
    { icon: '💨', label: 'Dodge',       value: `${Math.min((lvl * 0.5).toFixed(1), 30)}%` },
    { icon: '💀', label: 'Crit',        value: `${(10 + tier * 2).toFixed(1)}%` },
    { icon: '🔥', label: 'Crit Damage', value: `${150 + tier * 10}.0%` },
    { icon: '⚡', label: 'Extra Attack', value: `${tier * 5}.0%` },
    { icon: '✨', label: 'Stun',        value: `${(tier * 2).toFixed(1)}%` },
    { icon: '🪃', label: 'Parry',       value: `${(lvl * 0.3).toFixed(1)}%` },
    { icon: '🔰', label: 'Block',       value: `${(tier * 3).toFixed(1)}%` },
    { icon: '🌀', label: 'Stun Resist', value: '2.0%' },
    { icon: '🔮', label: 'Crit Resist', value: `${(tier * 3).toFixed(1)}%` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-t-[32px] overflow-hidden flex flex-col"
        style={{ maxHeight: '85vh', background: 'linear-gradient(160deg,#fdf6e0 0%,#ede1b4 100%)',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.8)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0"
          style={{ background: 'linear-gradient(180deg,#d4a855 0%,#b8842a 100%)', borderRadius: '32px 32px 0 0' }}>
          <div className="w-8" />
          <h2 className="font-black text-white text-xl tracking-wide">Characteristics</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-black text-lg">✕</button>
        </div>

        {/* Power hero row */}
        <div className="flex flex-col items-center py-4 gap-0.5 flex-shrink-0"
          style={{ background: '#f5e8c0' }}>
          <div className="text-amber-700 font-bold text-sm">Your power</div>
          <div className="text-amber-900 font-black text-4xl">{(player?.power || 0).toLocaleString()}</div>
        </div>

        {/* Stats grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            {stats.filter(s => !s.wide).map(s => (
              <div key={s.label} className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
                style={{ background: '#e8d5b7', border: '1.5px solid #c4a06a' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(145deg,#d4a855,#8a5a10)' }}>
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-amber-700 text-[10px] font-bold leading-tight">{s.label}</div>
                  <div className="text-amber-900 font-black text-sm leading-tight">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <div className="px-4 pb-7 flex-shrink-0">
          <button onClick={onClose}
            className="w-full py-3.5 rounded-2xl font-black text-white text-base active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(180deg,#f4a024 0%,#c97010 100%)',
              boxShadow: '0 4px 0 #7a3a00, 0 6px 16px rgba(0,0,0,0.25)' }}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Lobby ─────────────────────────────────────────────────────────────────
export default function Lobby({ player, onRefresh }) {
  const [lobbyBg,         setLobbyBg]         = useState(() => getLobbyBackground());
  const [mode,            setMode]            = useState('normal');
  const [battling,        setBattling]        = useState(false);
  const [battleResult,    setBattleResult]    = useState(null);
  const [showEpicInfo,    setShowEpicInfo]    = useState(false);
  const [showAutoBattle,  setShowAutoBattle]  = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [autoPrices,      setAutoPrices]      = useState({ days3: 199, days14: 499 });
  const [lastBattleResult,      setLastBattleResult]      = useState(null);
  const [showCharacteristics,   setShowCharacteristics]   = useState(false);
  const [quests,          setQuests]          = useState([]);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [questCycleIndex, setQuestCycleIndex] = useState(0);
  const [claimingId,      setClaimingId]      = useState(null);

  const energyCost = mode === 'epic' ? 200 : 25;
  const hasEnergy  = (player?.energy || 0) >= energyCost;

  async function loadQuests() {
    if (!player?.telegram_id) return;
    try {
      const res = await getQuests(player.telegram_id);
      setQuests(res.data?.quests || []);
    } catch {}
  }

  // Re-evaluate background every minute so day↔night switches at the right time
  useEffect(() => {
    const id = setInterval(() => setLobbyBg(getLobbyBackground()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { loadQuests(); }, [player?.telegram_id]);

  // Auto-cycle the lobby preview through each active quest (paused briefly after a manual swipe)
  useEffect(() => {
    if (quests.length <= 1) return;
    const t = setInterval(() => {
      if (Date.now() - lastSwipeAtRef.current < 4000) return;
      setQuestCycleIndex(i => (i + 1) % quests.length);
    }, 3500);
    return () => clearInterval(t);
  }, [quests.length]);

  useEffect(() => {
    setQuestCycleIndex(i => (quests.length ? i % quests.length : 0));
  }, [quests.length]);

  async function handleClaimQuest(questId) {
    setClaimingId(questId);
    try {
      await claimQuest(player.telegram_id, questId);
      await loadQuests();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not claim reward.');
    } finally {
      setClaimingId(null);
    }
  }

  // ── Swipe support for the quest preview card ──
  const touchStartRef   = useRef(null);
  const swipeHandledRef = useRef(false);
  const lastSwipeAtRef  = useRef(0);

  function handleQuestTouchStart(e) {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swipeHandledRef.current = false;
  }
  function handleQuestTouchMove(e) {
    if (!touchStartRef.current || swipeHandledRef.current || quests.length <= 1) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
      swipeHandledRef.current = true;
      lastSwipeAtRef.current  = Date.now();
      const len = quests.length;
      setQuestCycleIndex(i => (dx < 0 ? (i + 1) % len : (i - 1 + len) % len));
    }
  }
  function handleQuestClick() {
    // Swallow the click that follows a swipe gesture so it doesn't also open the modal
    if (swipeHandledRef.current) { swipeHandledRef.current = false; return; }
    setShowQuestsModal(true);
  }

  useEffect(() => {
    getPublicConfig()
      .then(res => {
        const cfg = res.data?.config || [];
        const get = (key, fallback) => { const f = cfg.find(c => c.key === key); return f ? parseInt(f.value)||fallback : fallback; };
        setAutoPrices({ days3: get('auto_battle_3days_stars', 199), days14: get('auto_battle_14days_stars', 499) });
      }).catch(() => {});
  }, []);

  async function handleBattle() {
    if (!hasEnergy) { setShowEnergyModal(true); return; }
    setBattling(true);
    setLastBattleResult(null);
    try {
      const res = await fight(player.telegram_id, mode);
      setBattleResult({ ...res.data, mode });
      onRefresh();
      loadQuests();
    } catch (err) {
      setLastBattleResult({ error: err.response?.data?.error || 'Battle failed' });
    } finally {
      setBattling(false);
    }
  }

  function handleArenaClose() {
    setLastBattleResult(battleResult);
    setBattleResult(null);
  }

  async function handleAutoPurchase(days) {
    try {
      const product = days === 3 ? 'auto_battle_3d' : 'auto_battle_14d';
      const res  = await createInvoice(player.telegram_id, product);
      const link = res.data.link;
      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(link, (status) => {
          if (status === 'paid') { setShowAutoBattle(false); onRefresh(); }
        });
      } else {
        window.open(link, '_blank');
      }
    } catch {
      alert('Could not create invoice. Please try again.');
    }
  }

  return (
    <>
      {battleResult && !battleResult.error && (
        <BattleArena player={player} result={battleResult} onClose={handleArenaClose} />
      )}

      {/* Searching overlay */}
      {battling && !battleResult && (
        <div className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.65)' }}>
          <style>{`
            @keyframes coin3d { 0%{transform:rotateY(0deg)} 45%{transform:rotateY(170deg)} 50%{transform:rotateY(180deg)} 95%{transform:rotateY(350deg)} 100%{transform:rotateY(360deg)} }
            @keyframes dotPulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.1)} }
            .coin-3d { animation: coin3d 1.6s ease-in-out infinite; }
            .dot1 { animation: dotPulse 1.4s 0s    infinite; }
            .dot2 { animation: dotPulse 1.4s 0.22s infinite; }
            .dot3 { animation: dotPulse 1.4s 0.44s infinite; }
          `}</style>
          <div className="w-full rounded-t-[32px] flex flex-col items-center gap-7 pt-8 pb-14"
            style={{ background: 'linear-gradient(160deg,#fdf6e3 0%,#f0e0b0 100%)', boxShadow: '0 -12px 60px rgba(0,0,0,0.5)' }}>
            <p className="text-2xl font-black tracking-wide" style={{ color: '#c0392b' }}>Searching for opponent</p>
            <div className="coin-3d w-28 h-28 rounded-full flex items-center justify-center"
              style={{ background: 'radial-gradient(circle at 32% 28%,#fff1a0,#f5a623 45%,#8b5e00 100%)', border: '3px solid #c87d10' }}>
              <span style={{ fontSize: 52 }}><img src={ASSETS.icons.feathers} alt="feathers" style={{width:90,height:90,display:"block",objectFit:"contain"}} /></span>
            </div>
            <div className="flex gap-2 items-center">
              {['dot1','dot2','dot3'].map(d => (
                <div key={d} className={`${d} w-3 h-3 rounded-full`} style={{ background: '#c0392b' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {showEnergyModal && (
        <EnergyModal player={player} onClose={() => setShowEnergyModal(false)} onPurchased={onRefresh} />
      )}

      {showQuestsModal && (
        <QuestsModal quests={quests} claimingId={claimingId} onClaim={handleClaimQuest} onClose={() => setShowQuestsModal(false)} />
      )}

      {showCharacteristics && (
        <CharacteristicsModal player={player} onClose={() => setShowCharacteristics(false)} />
      )}

      <div
        className="relative min-h-full"
        style={{
          backgroundImage: `url(${lobbyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'local',
        }}
      >
        {/* Dark overlay so UI text stays readable over any background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.38)' }} />

        <div className="relative z-10 p-4 flex flex-col gap-4">

        {/* Bird Display — floating image only, no card */}
        <div className="flex flex-col items-center gap-3 pt-2 pb-1">

          {/* Power badge — tap to open Characteristics */}
          <button
            onClick={() => setShowCharacteristics(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-white active:scale-95 transition-transform"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', fontSize: 14 }}>
            <span>👊</span>
            <span>Power: {(player?.power || 0).toLocaleString()}</span>
            <span style={{ fontSize: 11, opacity: 0.8 }}>▾</span>
          </button>

          {/* Bird image only — large, floating */}
          <img
            src={getBirdUrl(player?.evolution_tier || 1)}
            alt={player?.evolution_name || 'Bird'}
            className="object-contain drop-shadow-2xl"
            style={{ width: 180, height: 180, filter: 'drop-shadow(0 0 28px rgba(251,191,36,0.65))' }}
          />
        </div>

        {/* Daily Quests — premium card */}
        <style>{`
          @keyframes questShine{0%{left:-60%}60%{left:160%}100%{left:160%}}
          @keyframes battleGlow{0%,100%{box-shadow:0 4px 0 #7a3800,0 0 18px rgba(251,191,36,0.35),0 8px 24px rgba(0,0,0,0.4)}50%{box-shadow:0 4px 0 #7a3800,0 0 38px rgba(251,191,36,0.85),0 0 60px rgba(251,191,36,0.3),0 8px 24px rgba(0,0,0,0.4)}}
          @keyframes epicGlow{0%,100%{box-shadow:0 4px 0 #4a00a0,0 0 18px rgba(167,139,250,0.4)}50%{box-shadow:0 4px 0 #4a00a0,0 0 40px rgba(167,139,250,0.9),0 0 60px rgba(167,139,250,0.35)}}
          @keyframes battlePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.018)}}
          @keyframes swordSpin{0%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}100%{transform:rotate(-8deg)}}
          @keyframes battleShimmer{0%{left:-80%}60%{left:160%}100%{left:160%}}
        `}</style>
        <button
          onClick={handleQuestClick}
          onTouchStart={handleQuestTouchStart}
          onTouchMove={handleQuestTouchMove}
          style={{
            width:'100%', borderRadius:16,
            background:'linear-gradient(145deg,#4a1f00,#2e1000)',
            border:'1.5px solid #8a4a10',
            boxShadow:'0 4px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,200,80,0.12)',
            padding:'10px 12px', position:'relative', overflow:'hidden',
            display:'flex', flexDirection:'column', gap:4,
          }}
          className="active:scale-95 transition-transform select-none">
          {/* Shine sweep */}
          <div style={{
            position:'absolute',top:0,left:'-60%',width:'35%',height:'100%',
            background:'linear-gradient(90deg,transparent,rgba(255,210,80,0.15),transparent)',
            animation:'questShine 5s ease-in-out infinite',pointerEvents:'none',
          }}/>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:22 }}>📋</span>
            <div style={{ flex:1, minWidth:0, textAlign:'left' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <div style={{ color:'#f5c842', fontSize:12, fontWeight:800, letterSpacing:0.3 }}>Daily Quests</div>
                {quests[questCycleIndex] && (
                  <div style={{ color:'#86efac', fontSize:11, fontWeight:800, display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
                    +{quests[questCycleIndex].reward_amount}
                    <RewardIcon type={quests[questCycleIndex].reward_type} size={12} />
                  </div>
                )}
              </div>
              {quests[questCycleIndex] ? (
                <>
                  <div style={{ color:'rgba(255,200,100,0.7)', fontSize:11, marginTop:1 }}>{quests[questCycleIndex].title}</div>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                    <div style={{ flex:1, background:'rgba(0,0,0,0.4)', borderRadius:6, height:6, overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:6, transition:'width 0.4s ease',
                        width:`${Math.min(100,(quests[questCycleIndex].progress/quests[questCycleIndex].requirement_amount)*100)}%`,
                        background:'linear-gradient(90deg,#f5c842,#fb923c)',
                        boxShadow:'0 0 6px rgba(245,200,66,0.6)',
                      }}/>
                    </div>
                    <span style={{ color:'rgba(255,200,80,0.6)', fontSize:10, flexShrink:0 }}>
                      {Math.min(quests[questCycleIndex].progress,quests[questCycleIndex].requirement_amount)}/{quests[questCycleIndex].requirement_amount}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ color:'rgba(255,180,60,0.6)', fontSize:11, marginTop:1 }}>{quests.length===0?'Tap to view quests':'Loading…'}</div>
              )}
            </div>
          </div>
          {quests.length > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:4 }}>
              {quests.map((q,i) => (
                <div key={q.id} style={{
                  width:5,height:5,borderRadius:'50%',
                  background: i===questCycleIndex ? '#f5c842' : 'rgba(245,200,66,0.25)',
                  transition:'background 0.3s',
                }}/>
              ))}
            </div>
          )}
        </button>


        {/* ── Battle Control — animated premium ── */}
        <div style={{
          borderRadius:20, overflow:'hidden', display:'flex', alignItems:'stretch',
          animation: battling ? 'none'
            : mode==='epic' ? 'epicGlow 2.2s ease-in-out infinite, battlePulse 2.2s ease-in-out infinite'
            : hasEnergy    ? 'battleGlow 2s ease-in-out infinite, battlePulse 2s ease-in-out infinite'
            : 'none',
          background: battling ? '#374151'
            : mode==='epic' ? 'linear-gradient(180deg,#7c3aed 0%,#5b21b6 100%)'
            : hasEnergy    ? 'linear-gradient(180deg,#f5a020 0%,#c96000 100%)'
            : 'linear-gradient(180deg,#991b1b 0%,#7f1d1d 100%)',
          border: battling ? '1.5px solid #4b5563'
            : mode==='epic' ? '1.5px solid #a78bfa'
            : hasEnergy    ? '1.5px solid #f5c842'
            : '1.5px solid #ef4444',
          position:'relative',
        }}>

          {/* MODE button */}
          <button
            onClick={() => { const n=mode==='epic'?'normal':'epic'; setMode(n); if(n==='epic') setShowEpicInfo(true); }}
            disabled={battling}
            style={{
              padding:'0 18px', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:12, flexShrink:0,
              color: battling ? '#6b7280' : mode==='epic' ? '#e9d5ff' : hasEnergy ? '#3d1a00' : '#fff',
              borderRight: `1px solid ${battling?'#4b5563':mode==='epic'?'rgba(167,139,250,0.3)':'rgba(0,0,0,0.25)'}`,
              background:'transparent', letterSpacing:0.5,
            }}
            className="active:scale-95 transition-transform">
            <span style={{ animation: battling ? 'none' : 'swordSpin 2s ease-in-out infinite', display:'inline-block' }}>🔄</span>
            <span style={{ marginLeft:4 }}>MODE</span>
          </button>

          {/* BATTLE / EPIC center button */}
          <button onClick={handleBattle} disabled={battling}
            style={{
              flex:1, display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'14px 8px', gap:2,
              background:'transparent', position:'relative', overflow:'hidden',
              cursor: battling ? 'not-allowed' : 'pointer',
            }}
            className="active:scale-95 transition-transform">

            {/* Shimmer sweep over BATTLE */}
            {!battling && (
              <div style={{
                position:'absolute',top:0,left:'-80%',width:'45%',height:'100%',
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)',
                animation:'battleShimmer 2.8s ease-in-out infinite',
                pointerEvents:'none',
              }}/>
            )}

            {!battling && (
              <span style={{
                fontSize:11, fontWeight:800, display:'flex', alignItems:'center', gap:4,
                color: mode==='epic' ? '#fca5a5' : hasEnergy ? '#3d1a00' : '#fecaca',
                opacity:0.9,
              }}>
                {energyCost} <EI size={13} />
              </span>
            )}
            <span style={{
              fontWeight:900, fontSize:24, letterSpacing:1.5,
              color: battling ? '#9ca3af' : '#fff',
              textShadow: battling ? 'none'
                : mode==='epic' ? '0 0 20px rgba(196,181,253,0.8), 0 2px 4px rgba(0,0,0,0.5)'
                : hasEnergy    ? '0 0 20px rgba(255,200,60,0.9), 0 2px 4px rgba(0,0,0,0.5)'
                : '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {battling ? '⚔️ Searching…' : mode==='epic' ? '✦ EPIC ✦' : '⚔ BATTLE'}
            </span>
          </button>

          {/* AUTO button */}
          <button onClick={() => setShowAutoBattle(true)} disabled={battling}
            style={{
              padding:'0 18px', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:800, fontSize:12, flexShrink:0,
              color: battling ? '#6b7280' : mode==='epic' ? '#e9d5ff' : hasEnergy ? '#3d1a00' : '#fff',
              borderLeft:`1px solid ${battling?'#4b5563':mode==='epic'?'rgba(167,139,250,0.3)':'rgba(0,0,0,0.25)'}`,
              background:'transparent', letterSpacing:0.5,
            }}
            className="active:scale-95 transition-transform">
            <span>AUTO</span>
            <span style={{ marginLeft:4, fontSize:14 }}>⚙️</span>
          </button>
        </div>



        {/* Epic Info Modal */}
        {showEpicInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-amber-50 text-amber-900 rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-black text-center mb-4">Welcome to Epic Mode!</h2>
              <p className="text-sm mb-3 text-center">Stronger rivals, greater risks, and even greater prizes!</p>
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div><div className="font-bold mb-1">Victory:</div><div>• EXP x2</div><div>• Glory x2</div><div>• Food x250</div></div>
                <div><div className="font-bold mb-1">Defeat:</div><div>• EXP x2</div><div>• Glory x2</div><div>• <img src={ASSETS.icons.feathers} alt="feathers" style={{width:14,height:14,display:"inline",verticalAlign:"middle"}} /> x150</div><div>• Food x100</div></div>
              </div>
              <button onClick={() => setShowEpicInfo(false)} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold">CLOSE</button>
            </div>
          </div>
        )}

        {/* Auto Battle Modal */}
        {showAutoBattle && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50">
            <div className="w-full max-w-sm rounded-t-3xl overflow-hidden" style={{ background: '#e8d5b7' }}>
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <h2 className="text-xl font-black text-amber-900">Auto Battle</h2>
                <button onClick={() => setShowAutoBattle(false)} className="text-red-500 text-2xl font-black">✕</button>
              </div>
              <div className="mx-5 mb-3"><div className="rounded-xl py-2 text-center font-black text-base text-amber-100" style={{ background: '#7a5230' }}>{player?.auto_battle_active?'✅ Active':'Inactive'}</div></div>
              <div className="mx-5 mb-3 rounded-2xl overflow-hidden" style={{ height: 160, background: '#c4a882' }}>
                <div className="w-full h-full flex items-center justify-center text-7xl">⚔️🦅⚔️</div>
              </div>
              <div className="mx-5 mb-4 rounded-2xl p-4" style={{ background: '#d4b896', border: '2px solid #b8956a' }}>
                <p className="text-amber-900 font-bold text-sm text-center">Unlock AutoBattle to speed up your progress!</p>
              </div>
              <div className="flex gap-3 mx-5 mb-3">
                {[{days:3,price:autoPrices.days3},{days:14,price:autoPrices.days14}].map(o => (
                  <div key={o.days} className="flex-1 flex flex-col items-center">
                    <div className="z-10 mb-[-10px] px-3 py-1 rounded-full font-black text-sm text-white" style={{ background:'#3a3a3a' }}>{o.price} ⭐</div>
                    <button onClick={() => handleAutoPurchase(o.days)}
                      className="w-full pt-4 pb-3 rounded-2xl font-black text-white text-lg"
                      style={{ background: 'linear-gradient(180deg,#5bb8ff 0%,#2d7dd2 100%)', border: '3px solid #1a5fa0' }}>
                      {o.days} DAYS
                    </button>
                  </div>
                ))}
              </div>
              <div className="mx-5 mb-6">
                <button onClick={() => setShowAutoBattle(false)}
                  className="w-full py-4 rounded-2xl font-black text-amber-900 text-base"
                  style={{ background: '#e8d5b7', border: '2px solid #b8956a' }}>TO LOBBY</button>
              </div>
            </div>
          </div>
        )}
      </div>   {/* end relative z-10 content */}
      </div>   {/* end background wrapper */}
    </>
  );
}
