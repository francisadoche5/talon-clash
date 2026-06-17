import ASSETS from './config/assets';
import { useState, useEffect, useRef } from 'react';
import { login } from './api';
import Lobby from './components/Lobby';
import Market from './components/Market';
import Inventory from './components/Inventory';
import { EAGLE_ICON_URL, BIRD_ANIMATION_CSS } from './birdImages';

if (typeof document !== 'undefined' && !document.getElementById('bird-anim-css')) {
  const s = document.createElement('style');
  s.id = 'bird-anim-css';
  s.textContent = BIRD_ANIMATION_CSS;
  document.head.appendChild(s);
}
import Clans from './components/Clans';
import SkillTree from './components/SkillTree';
import Earn from './components/Earn';

const TABS = [
  { id: 'market',    label: 'Market',    icon: '🏪' },
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'lobby',     label: 'Lobby',     icon: '⚔️' },
  { id: 'clans',     label: 'Clans',     icon: '👥' },
  { id: 'skills',    label: 'Skills',    icon: '🌳' },
  { id: 'earn',      label: 'Earn',      icon: '💰' },
];

// Loading messages that cycle while waiting for Render cold start
const LOADING_MESSAGES = [
  'Loading...',
  'Waking up server...',
  'This can take up to 30 seconds...',
  'Almost there...',
  'Still connecting...',
];

export default function App() {
  const [player,    setPlayer]    = useState(null);
  const [activeTab, setActiveTab] = useState('lobby');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [loadMsg,   setLoadMsg]   = useState(LOADING_MESSAGES[0]);
  const [retrying,  setRetrying]  = useState(false);
  const msgIdx = useRef(0);

  useEffect(() => { initApp(); }, []);

  // Cycle loading messages so user knows we're still working
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      msgIdx.current = (msgIdx.current + 1) % LOADING_MESSAGES.length;
      setLoadMsg(LOADING_MESSAGES[msgIdx.current]);
    }, 5000);
    return () => clearInterval(id);
  }, [loading]);

  async function initApp() {
    setError(null);
    setLoading(true);
    setRetrying(false);
    msgIdx.current = 0;
    setLoadMsg(LOADING_MESSAGES[0]);

    try {
      const tg = window.Telegram?.WebApp;
      if (tg) tg.ready();

      const telegramUser = tg?.initDataUnsafe?.user || {
        id: 123456789,
        first_name: 'Test',
        username: 'testuser',
      };

      const res = await login(telegramUser);
      setPlayer(res.data.player);
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      setError(
        isTimeout
          ? 'Server is warming up. This can take 30 seconds on first load. Please retry.'
          : 'Failed to connect. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function refreshPlayer() {
    if (!player) return;
    login({ id: player.telegram_id, first_name: player.display_name })
      .then(res => setPlayer(res.data.player))
      .catch(() => {});
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden"
      style={{ backgroundImage:`url(${ASSETS.ui.appBg})`, backgroundSize:'cover', backgroundPosition:'center' }}>
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.55)' }} />

      <img src={EAGLE_ICON_URL} alt="Talon Clash"
        className="w-32 h-32 mb-4 object-contain relative z-10 bird-float"
        style={{ filter:'drop-shadow(0 0 24px rgba(251,191,36,0.8))' }} />

      <div className="text-amber-200 text-2xl font-black tracking-widest relative z-10"
        style={{ textShadow:'0 0 20px rgba(251,191,36,0.6)' }}>
        TALON CLASH
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-52 h-2 bg-amber-900 rounded-full overflow-hidden mt-6 mb-3">
        <div className="h-full bg-amber-400 rounded-full"
          style={{ width:'70%', animation:'pulse 1.5s ease-in-out infinite' }} />
      </div>

      {/* Cycling message */}
      <div className="text-amber-400 text-sm relative z-10 text-center px-8 min-h-[20px]">
        {loadMsg}
      </div>
    </div>
  );

  // ── Error screen ────────────────────────────────────────────────────────────
  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden"
      style={{ backgroundImage:`url(${ASSETS.ui.appBg})`, backgroundSize:'cover', backgroundPosition:'center' }}>
      <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.7)' }} />

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        {/* Big red X */}
        <div className="w-20 h-20 mb-5 flex items-center justify-center rounded-full"
          style={{ background:'rgba(220,38,38,0.2)', border:'2px solid rgba(220,38,38,0.5)' }}>
          <span className="text-red-400 font-black text-5xl leading-none">✕</span>
        </div>

        <p className="text-red-300 text-base font-bold leading-relaxed mb-8">{error}</p>

        <button
          onClick={initApp}
          disabled={retrying}
          className="px-10 py-3 rounded-full font-black text-white text-lg active:scale-95 transition-transform"
          style={{
            background: retrying
              ? '#78350f'
              : 'linear-gradient(180deg,#f9b234 0%,#e67e22 50%,#c95e00 100%)',
            boxShadow: retrying ? 'none' : '0 4px 0 #7a3800, 0 8px 20px rgba(0,0,0,0.4)',
            border: '1.5px solid #f5c060',
          }}>
          {retrying ? 'Connecting…' : 'Retry'}
        </button>
      </div>
    </div>
  );

  // ── Main app ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-amber-950 max-w-md mx-auto relative overflow-hidden">

      {/* Header */}
      <div className="bg-amber-900 px-4 py-2 flex items-center justify-between border-b border-amber-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold text-white">
            {player?.level}
          </div>
          <div>
            <div className="text-amber-100 text-sm font-bold">
              {player?.display_name?.substring(0, 10) || 'Player'}
            </div>
            <div className="text-amber-400 text-xs">{player?.xp}/{player?.xp_needed} XP</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span>⚡</span>
            <span className="text-yellow-300">{Math.floor(player?.energy||0)}/{player?.max_energy}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🪶</span>
            <span className="text-green-300">{player?.feathers?.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🌾</span>
            <span className="text-orange-300">{player?.food?.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Evolution banner */}
      <div className="bg-amber-800 py-1 px-4 text-center text-xs text-amber-300">
        {player?.evolution_name} • Power: {player?.power?.toLocaleString()}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'lobby'     && <Lobby     player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'market'    && <Market    player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'inventory' && <Inventory player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'clans'     && <Clans     player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'skills'    && <SkillTree player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'earn'      && <Earn      player={player} onRefresh={refreshPlayer} />}
      </div>

      {/* Bottom nav */}
      <div className="bg-amber-900 border-t border-amber-700 flex">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${
              activeTab === tab.id ? 'bg-amber-700 text-white' : 'text-amber-400'
            }`}>
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
