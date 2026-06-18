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
  const [lastBattleResult, setLastBattleResult] = useState(null);
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

        {/* Bird Display */}
        <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-2xl p-6 text-center relative overflow-hidden" style={{ minHeight: 200 }}>
          <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle,#4a90d9 0%,transparent 70%)' }} />
          <div className="flex justify-center mb-2 relative z-10">
            <img src={getBirdUrl(player?.evolution_tier || 1)} alt={player?.evolution_name || 'Bird'}
              className="w-24 h-24 object-contain drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.5))' }} />
          </div>
          <div className="text-amber-300 font-bold text-lg relative z-10">{player?.evolution_name}</div>
          <div className="text-amber-400 text-sm relative z-10">Power: {player?.power?.toLocaleString()}</div>
          <div className="flex justify-center gap-6 mt-3 relative z-10">
            <div className="text-center"><div className="text-red-400 text-xs">HP</div><div className="text-white text-sm font-bold">{100 + (player?.level||1)*50}</div></div>
            <div className="text-center"><div className="text-orange-400 text-xs">ATK</div><div className="text-white text-sm font-bold">{10 + (player?.level||1)*5}</div></div>
            <div className="text-center"><div className="text-blue-400 text-xs">DEF</div><div className="text-white text-sm font-bold">{5 + (player?.level||1)*2}</div></div>
          </div>
        </div>

        {/* Daily Quests — shortcut into the full quest list (tap to open, swipe to preview) */}
        <button
          onClick={handleQuestClick}
          onTouchStart={handleQuestTouchStart}
          onTouchMove={handleQuestTouchMove}
          className="w-full bg-amber-900 rounded-xl px-3 py-2 flex flex-col gap-1 active:scale-95 transition-transform select-none">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="text-amber-200 text-xs font-bold truncate">Daily Quests</div>
                {quests[questCycleIndex] && (
                  <div className="text-amber-300 text-[11px] font-black flex items-center gap-0.5 flex-shrink-0">
                    +{quests[questCycleIndex].reward_amount}
                    <RewardIcon type={quests[questCycleIndex].reward_type} size={12} />
                  </div>
                )}
              </div>
              {quests[questCycleIndex] ? (
                <>
                  <div className="text-amber-400 text-[11px] truncate">{quests[questCycleIndex].title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-amber-950 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${Math.min(100, (quests[questCycleIndex].progress / quests[questCycleIndex].requirement_amount) * 100)}%`,
                        background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
                    </div>
                    <span className="text-amber-500 text-[10px] flex-shrink-0">
                      {Math.min(quests[questCycleIndex].progress, quests[questCycleIndex].requirement_amount)}/{quests[questCycleIndex].requirement_amount}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-amber-400 text-[11px]">{quests.length === 0 ? 'Tap to view quests' : 'Loading…'}</div>
              )}
            </div>
          </div>
          {quests.length > 1 && (
            <div className="flex justify-center gap-1">
              {quests.map((q, i) => (
                <div key={q.id} className="w-1 h-1 rounded-full"
                  style={{ background: i === questCycleIndex ? '#fbbf24' : 'rgba(251,191,36,0.35)' }} />
              ))}
            </div>
          )}
        </button>


        {/* Mode / Fight / Auto — merged into a single control */}
        <div className={`rounded-2xl overflow-hidden flex items-stretch transition-colors ${
          battling
            ? 'bg-gray-700'
            : mode === 'epic'
              ? 'bg-purple-700 border border-purple-400'
              : hasEnergy ? 'bg-amber-500' : 'bg-red-800'
        }`}>
          <button
            onClick={() => { const n = mode==='epic'?'normal':'epic'; setMode(n); if(n==='epic') setShowEpicInfo(true); }}
            disabled={battling}
            className="px-4 flex items-center justify-center text-sm font-bold flex-shrink-0 active:scale-95 transition-transform"
            style={{ color: battling ? '#9ca3af' : mode==='epic' ? '#e9d5ff' : (hasEnergy ? '#78350f' : '#ffffff') }}>
            MODE 🔄
          </button>

          <button onClick={handleBattle} disabled={battling}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 active:scale-95 transition-transform disabled:cursor-not-allowed">
            {!battling && (
              <span className="text-xs font-bold flex items-center gap-1"
                style={{ color: mode==='epic' ? '#fca5a5' : (hasEnergy ? '#78350f' : '#fecaca') }}>
                {energyCost} <EI size={12} />
              </span>
            )}
            <span className={`font-black text-xl ${battling ? 'text-gray-400' : mode==='epic' || !hasEnergy ? 'text-white' : 'text-amber-900'}`}>
              {battling ? '⚔️ Finding opponent…' : mode === 'epic' ? 'EPIC' : 'BATTLE'}
            </span>
          </button>

          <button onClick={() => setShowAutoBattle(true)} disabled={battling}
            className="px-4 flex items-center justify-center text-sm font-bold flex-shrink-0 active:scale-95 transition-transform"
            style={{ color: battling ? '#9ca3af' : mode==='epic' ? '#e9d5ff' : (hasEnergy ? '#78350f' : '#ffffff') }}>
            AUTO ⚙️
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
