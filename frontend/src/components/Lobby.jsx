import { useState, useEffect } from 'react';
import { fight, getPublicConfig, createInvoice } from '../api';

const EVOLUTION_IMAGES = {
  1: '🐣', 2: '🐦', 3: '🦅', 4: '⚔️', 5: '🔥', 6: '👑', 7: '💀'
};

export default function Lobby({ player, onRefresh }) {
  const [mode, setMode] = useState('normal');
  const [battling, setBattling] = useState(false);
  const [result, setResult] = useState(null);
  const [showEpicInfo, setShowEpicInfo] = useState(false);
  const [showAutoBattle, setShowAutoBattle] = useState(false);
  const [autoPrices, setAutoPrices] = useState({ days3: 199, days14: 499 });

  const energyCost = mode === 'epic' ? 200 : 25;
  const hasEnergy = (player?.energy || 0) >= energyCost;

  useEffect(() => {
    getPublicConfig()
      .then(res => {
        const cfg = res.data?.config || [];
        const get = (key, fallback) => {
          const found = cfg.find(c => c.key === key);
          return found ? parseInt(found.value) || fallback : fallback;
        };
        setAutoPrices({
          days3: get('auto_battle_3days_stars', 199),
          days14: get('auto_battle_14days_stars', 499),
        });
      })
      .catch(() => {});
  }, []);

  function handleModeToggle() {
    const next = mode === 'epic' ? 'normal' : 'epic';
    setMode(next);
    if (next === 'epic') setShowEpicInfo(true);
  }

  async function handleBattle() {
    if (!hasEnergy) return;
    setBattling(true);
    setResult(null);
    try {
      const res = await fight(player.telegram_id, mode);
      setResult(res.data);
      onRefresh();
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Battle failed' });
    } finally {
      setBattling(false);
    }
  }

  async function handleAutoPurchase(days) {
    try {
      const product = days === 3 ? 'auto_battle_3d' : 'auto_battle_14d';
      const res = await createInvoice(player.telegram_id, product);
      const link = res.data.link;
      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(link, (status) => {
          if (status === 'paid') {
            setShowAutoBattle(false);
            onRefresh();
          }
        });
      } else {
        window.open(link, '_blank');
      }
    } catch (err) {
      alert('Could not create invoice. Please try again.');
    }
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Bird Display */}
      <div className="bg-gradient-to-b from-blue-900 to-blue-950 rounded-2xl p-6 text-center relative overflow-hidden" style={{minHeight: 200}}>
        <div className="absolute inset-0 opacity-20" style={{background: 'radial-gradient(circle, #4a90d9 0%, transparent 70%)'}}></div>
        <div className="text-8xl mb-2 relative z-10">{EVOLUTION_IMAGES[player?.evolution_tier] || '🐣'}</div>
        <div className="text-amber-300 font-bold text-lg relative z-10">{player?.evolution_name}</div>
        <div className="text-amber-400 text-sm relative z-10">Power: {player?.power?.toLocaleString()}</div>
        <div className="flex justify-center gap-6 mt-3 relative z-10">
          <div className="text-center">
            <div className="text-red-400 text-xs">HP</div>
            <div className="text-white text-sm font-bold">{100 + (player?.level || 1) * 50}</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 text-xs">ATK</div>
            <div className="text-white text-sm font-bold">{10 + (player?.level || 1) * 5}</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 text-xs">DEF</div>
            <div className="text-white text-sm font-bold">{5 + (player?.level || 1) * 2}</div>
          </div>
        </div>
      </div>

      {/* Daily Quest Progress */}
      <div className="bg-amber-900 rounded-xl p-3 flex items-center gap-3">
        <span className="text-2xl">📋</span>
        <div className="flex-1">
          <div className="text-amber-200 text-sm font-bold">Daily Quests</div>
          <div className="text-amber-400 text-xs">{player?.battles_played || 0} battles played today</div>
        </div>
        <div className="text-amber-300 text-xs">+500🪶</div>
      </div>

      {/* Mode Selector */}
      <div className={`rounded-2xl p-4 flex items-center justify-between ${mode === 'epic' ? 'bg-purple-900 border border-purple-500' : 'bg-amber-800'}`}>
        <button onClick={handleModeToggle} className="text-amber-300 text-sm font-bold">
          MODE 🔄
        </button>
        <div className="text-center">
          <div className="text-white font-black text-xl">{mode === 'epic' ? 'EPIC' : 'BATTLE'}</div>
          <div className={`text-xs ${mode === 'epic' ? 'text-red-400' : 'text-yellow-300'}`}>{energyCost} ⚡</div>
        </div>
        <button onClick={() => setShowAutoBattle(true)} className="text-amber-300 text-sm font-bold">
          AUTO ⚙️
        </button>
      </div>

      {/* Battle Button */}
      <button
        onClick={handleBattle}
        disabled={battling || !hasEnergy}
        className={`w-full py-4 rounded-2xl font-black text-xl transition-all ${
          hasEnergy && !battling
            ? mode === 'epic'
              ? 'bg-purple-600 hover:bg-purple-500 active:scale-95 text-white'
              : 'bg-amber-500 hover:bg-amber-400 active:scale-95 text-amber-900'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {battling ? '⚔️ Fighting...' : hasEnergy ? `⚔️ FIGHT (${energyCost}⚡)` : '⚡ Not enough energy'}
      </button>

      {/* Battle Result */}
      {result && !result.error && (
        <div className={`rounded-2xl p-4 border-2 ${result.playerWon ? 'bg-green-950 border-green-500' : 'bg-red-950 border-red-500'}`}>
          <div className="text-center text-2xl font-black mb-2">
            {result.playerWon ? '🏆 VICTORY!' : '💀 DEFEAT'}
          </div>
          <div className="text-center text-sm text-gray-300 mb-3">
            vs {result.opponent?.display_name}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><div className="text-blue-400 text-xs">EXP</div><div className="text-white font-bold">+{result.rewards?.xp}</div></div>
            <div><div className="text-yellow-400 text-xs">Glory</div><div className="text-white font-bold">+{result.rewards?.glory}</div></div>
            <div><div className="text-green-400 text-xs">🪶</div><div className="text-white font-bold">+{result.rewards?.feathers}</div></div>
            <div><div className="text-orange-400 text-xs">Food</div><div className="text-white font-bold">+{result.rewards?.food}</div></div>
          </div>
          {result.rewards?.bonus && (
            <div className="mt-2 text-center text-yellow-300 text-sm">
              🎁 Bonus: {result.rewards.bonus.type} x{result.rewards.bonus.amount}
            </div>
          )}
          {result.levelUp && (
            <div className="mt-2 text-center text-yellow-300 font-bold animate-bounce">
              🎉 LEVEL UP! Now Level {result.newLevel}
            </div>
          )}
        </div>
      )}

      {result?.error && (
        <div className="bg-red-950 border border-red-500 rounded-xl p-3 text-center text-red-300">
          {result.error}
        </div>
      )}

      {/* Epic Mode Info Modal — shown only when switching TO epic */}
      {showEpicInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-50 text-amber-900 rounded-2xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-black text-center mb-4">Welcome to Epic Mode!</h2>
            <p className="text-sm mb-3 text-center">Stronger rivals, greater risks, and even greater prizes!</p>
            <div className="grid grid-cols-2 gap-4 text-xs mb-4">
              <div>
                <div className="font-bold mb-1">Victory Rewards:</div>
                <div>• EXP x2 Bonus</div>
                <div>• Glory x2 Bonus</div>
                <div>• Food x250</div>
              </div>
              <div>
                <div className="font-bold mb-1">Defeat Rewards:</div>
                <div>• EXP x2 Bonus</div>
                <div>• Glory x2 Bonus</div>
                <div>• 🪶 x150</div>
                <div>• Food x100</div>
              </div>
            </div>
            <button onClick={() => setShowEpicInfo(false)}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold">
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Auto Battle Modal */}
      {showAutoBattle && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50">
          <div className="w-full max-w-sm rounded-t-3xl overflow-hidden" style={{ background: '#e8d5b7' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <h2 className="text-xl font-black text-amber-900">Auto Battle</h2>
              <button onClick={() => setShowAutoBattle(false)}
                className="text-red-500 text-2xl font-black leading-none">✕</button>
            </div>

            {/* Status badge */}
            <div className="mx-5 mb-3">
              <div className="rounded-xl py-2 text-center font-black text-base text-amber-100"
                style={{ background: '#7a5230' }}>
                {player?.auto_battle_active ? '✅ Active' : 'Inactive'}
              </div>
            </div>

            {/* Battle image */}
            <div className="mx-5 mb-3 rounded-2xl overflow-hidden" style={{ height: 160, background: '#c4a882' }}>
              <div className="w-full h-full flex items-center justify-center text-7xl">
                ⚔️🦅⚔️
              </div>
            </div>

            {/* Description box */}
            <div className="mx-5 mb-4 rounded-2xl p-4" style={{ background: '#d4b896', border: '2px solid #b8956a' }}>
              <p className="text-amber-900 font-bold text-sm text-center leading-relaxed">
                Unlock AutoBattle to speed up your progress! Complete multiple fights in just a few seconds.
              </p>
              <p className="text-amber-800 text-sm text-center mt-2">
                ⏳ AutoBattle remains active for the purchased duration.
              </p>
            </div>

            {/* Purchase buttons */}
            <div className="flex gap-3 mx-5 mb-3">
              {/* 3 Days */}
              <div className="flex-1 flex flex-col items-center">
                <div className="z-10 mb-[-10px] px-3 py-1 rounded-full font-black text-sm text-white flex items-center gap-1"
                  style={{ background: '#3a3a3a' }}>
                  {autoPrices.days3} ⭐
                </div>
                <button onClick={() => handleAutoPurchase(3)}
                  className="w-full pt-4 pb-3 rounded-2xl font-black text-white text-lg"
                  style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2d7dd2 100%)', border: '3px solid #1a5fa0' }}>
                  3 DAYS
                </button>
              </div>

              {/* 14 Days */}
              <div className="flex-1 flex flex-col items-center">
                <div className="z-10 mb-[-10px] px-3 py-1 rounded-full font-black text-sm text-white flex items-center gap-1"
                  style={{ background: '#3a3a3a' }}>
                  {autoPrices.days14} ⭐
                </div>
                <button onClick={() => handleAutoPurchase(14)}
                  className="w-full pt-4 pb-3 rounded-2xl font-black text-white text-lg"
                  style={{ background: 'linear-gradient(180deg, #5bb8ff 0%, #2d7dd2 100%)', border: '3px solid #1a5fa0' }}>
                  14 DAYS
                </button>
              </div>
            </div>

            {/* To Lobby button */}
            <div className="mx-5 mb-6">
              <button onClick={() => setShowAutoBattle(false)}
                className="w-full py-4 rounded-2xl font-black text-amber-900 text-base"
                style={{ background: '#e8d5b7', border: '2px solid #b8956a' }}>
                TO LOBBY
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
