import { useState, useEffect } from 'react';
import { fight, getPublicConfig, createInvoice } from '../api';
import BattleArena from './BattleArena';
import { getBirdUrl } from '../birdImages';
import axios from 'axios';

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
    { id: 'energy_250', amount: 250, price: 250, top: '#5bb8ff', mid: '#2d7dd2', bot: '#1a5fa0', shadow: '#0d3d70', border: '#7fcfff' },
    { id: 'energy_750', amount: 750, price: 750, top: '#a78bfa', mid: '#7c3aed', bot: '#5b21b6', shadow: '#3b0e8f', border: '#c4b5fd' },
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
            <span style={{ fontSize: 22 }}>⚡</span>
            <span>{energy}/{maxEnergy}</span>
          </div>
          <p className="text-amber-700 text-sm font-bold mt-1">+0.17 ⚡ each 10 seconds</p>
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
              <span style={{ fontSize: 34 }}>📺</span>
              <div className="px-2 py-1 rounded-lg font-black text-white text-xs flex items-center gap-1"
                style={{ background: 'rgba(0,0,0,0.4)' }}>
                +50 ⚡
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
                <span style={{ fontSize: 34 }}>⚗️</span>
                <div className="px-2 py-1 rounded-lg font-black text-white text-xs flex items-center gap-1"
                  style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${opt.border}40` }}>
                  {opt.amount} ⚡
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

// ── Main Lobby ─────────────────────────────────────────────────────────────────
export default function Lobby({ player, onRefresh }) {
  const [mode,            setMode]            = useState('normal');
  const [battling,        setBattling]        = useState(false);
  const [battleResult,    setBattleResult]    = useState(null);
  const [showEpicInfo,    setShowEpicInfo]    = useState(false);
  const [showAutoBattle,  setShowAutoBattle]  = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [autoPrices,      setAutoPrices]      = useState({ days3: 199, days14: 499 });
  const [lastBattleResult, setLastBattleResult] = useState(null);

  const energyCost = mode === 'epic' ? 200 : 25;
  const hasEnergy  = (player?.energy || 0) >= energyCost;

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
              <span style={{ fontSize: 52 }}>🪶</span>
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

      <div className="p-4 flex flex-col gap-4">

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

        {/* Daily Quest */}
        <div className="bg-amber-900 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div className="flex-1">
            <div className="text-amber-200 text-sm font-bold">Daily Quests</div>
            <div className="text-amber-400 text-xs">{player?.battles_played || 0} battles played today</div>
          </div>
          <div className="text-amber-300 text-xs">+500🪶</div>
        </div>

        {/* Energy bar — tappable */}
        <button onClick={() => setShowEnergyModal(true)}
          className="w-full bg-amber-900 rounded-xl p-3 flex items-center gap-3 active:scale-95 transition-transform">
          <span className="text-2xl">⚡</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="text-amber-200 text-sm font-bold">Energy</div>
              <div className="text-amber-300 text-xs font-bold">{Math.floor(player?.energy||0)} / {player?.max_energy||400}</div>
            </div>
            <div className="w-full bg-amber-950 rounded-full h-2 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width:`${Math.min(100,((player?.energy||0)/(player?.max_energy||400))*100)}%`,
                  background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
            </div>
          </div>
          <span className="text-amber-500 text-xs">+</span>
        </button>

        {/* Mode Selector */}
        <div className={`rounded-2xl p-4 flex items-center justify-between ${mode==='epic'?'bg-purple-900 border border-purple-500':'bg-amber-800'}`}>
          <button onClick={() => { const n = mode==='epic'?'normal':'epic'; setMode(n); if(n==='epic') setShowEpicInfo(true); }}
            className="text-amber-300 text-sm font-bold">MODE 🔄</button>
          <div className="text-center">
            <div className="text-white font-black text-xl">{mode==='epic'?'EPIC':'BATTLE'}</div>
            <div className={`text-xs ${mode==='epic'?'text-red-400':'text-yellow-300'}`}>{energyCost} ⚡</div>
          </div>
          <button onClick={() => setShowAutoBattle(true)} className="text-amber-300 text-sm font-bold">AUTO ⚙️</button>
        </div>

        {/* Battle Button */}
        <button onClick={handleBattle} disabled={battling}
          className={`w-full py-4 rounded-2xl font-black text-xl transition-all ${
            !battling
              ? mode==='epic'
                ? 'bg-purple-600 hover:bg-purple-500 active:scale-95 text-white'
                : hasEnergy
                  ? 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-900'
                  : 'bg-red-800 hover:bg-red-700 active:scale-95 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
          {battling ? '⚔️ Finding opponent...' : hasEnergy ? `⚔️ FIGHT (${energyCost}⚡)` : `⚡ No Energy — Tap to Refill`}
        </button>

        {/* Last battle summary */}
        {lastBattleResult && !lastBattleResult.error && (
          <div className={`rounded-2xl p-4 border-2 ${lastBattleResult.playerWon?'bg-green-950 border-green-500':'bg-red-950 border-red-500'}`}>
            <div className="text-center text-2xl font-black mb-2">{lastBattleResult.playerWon?'🏆 VICTORY!':'💀 DEFEAT'}</div>
            <div className="text-center text-sm text-gray-300 mb-3">vs {lastBattleResult.opponent?.display_name}</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><div className="text-blue-400 text-xs">EXP</div><div className="text-white font-bold">+{lastBattleResult.rewards?.xp}</div></div>
              <div><div className="text-yellow-400 text-xs">Glory</div><div className="text-white font-bold">+{lastBattleResult.rewards?.glory}</div></div>
              <div><div className="text-green-400 text-xs">🪶</div><div className="text-white font-bold">+{lastBattleResult.rewards?.feathers}</div></div>
            </div>
            {lastBattleResult.levelUp && (
              <div className="mt-2 text-center text-yellow-300 font-bold animate-bounce">🎉 LEVEL UP! Now Level {lastBattleResult.newLevel}</div>
            )}
          </div>
        )}
        {lastBattleResult?.error && (
          <div className="bg-red-950 border border-red-500 rounded-xl p-3 text-center text-red-300">{lastBattleResult.error}</div>
        )}

        {/* Epic Info Modal */}
        {showEpicInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-amber-50 text-amber-900 rounded-2xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-black text-center mb-4">Welcome to Epic Mode!</h2>
              <p className="text-sm mb-3 text-center">Stronger rivals, greater risks, and even greater prizes!</p>
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div><div className="font-bold mb-1">Victory:</div><div>• EXP x2</div><div>• Glory x2</div><div>• Food x250</div></div>
                <div><div className="font-bold mb-1">Defeat:</div><div>• EXP x2</div><div>• Glory x2</div><div>• 🪶 x150</div><div>• Food x100</div></div>
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
      </div>
    </>
  );
}
