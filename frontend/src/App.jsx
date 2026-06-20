import ASSETS from './config/assets';
import { useState, useEffect, useRef } from 'react';
import { login } from './api';
import Lobby from './components/Lobby';
import Market from './components/Market';
import Inventory from './components/Inventory';
import { EAGLE_ICON_URL, BIRD_ANIMATION_CSS } from './birdImages';
import { useLanguage } from './i18n/LanguageContext';

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
  { id: 'market',    labelKey: 'nav.market',    icon: '🏪' },
  { id: 'inventory', labelKey: 'nav.inventory', icon: '🎒' },
  { id: 'lobby',     labelKey: 'nav.lobby',     icon: '⚔️' },
  { id: 'clans',     labelKey: 'nav.clans',     icon: '👥' },
  { id: 'skills',    labelKey: 'nav.skills',    icon: '🌳' },
  { id: 'earn',      labelKey: 'nav.earn',      icon: '💰' },
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
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const msgIdx = useRef(0);
  const { t, language, setLanguage, languages } = useLanguage();

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
      // Carries the referrer's id when the player opened the bot via a
      // referral deep link (https://t.me/<bot>?start=ref_<telegram_id>).
      const startParam = tg?.initDataUnsafe?.start_param;

      const res = await login(telegramUser, startParam);
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

      {/* Language switcher — always available, top-right corner */}
      <button onClick={() => setShowLanguagePicker(true)}
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 40,
          background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,220,80,0.35)',
          borderRadius: 999, padding: '4px 9px',
          display: 'flex', alignItems: 'center', gap: 4,
          color: '#f5c842', fontWeight: 800, fontSize: 12,
        }}>
        <span>🌐</span>
        <span>{languages.find(l => l.code === language)?.flag || '🏳️'}</span>
      </button>

      {showLanguagePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end z-50"
          onClick={() => setShowLanguagePicker(false)}>
          <div onClick={e => e.stopPropagation()}
            className="w-full max-w-md mx-auto bg-amber-900 rounded-t-3xl p-5 pb-7">
            <div className="text-amber-300 font-black text-center mb-4">{t('common.language')}</div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map(l => (
                <button key={l.code}
                  onClick={() => { setLanguage(l.code); setShowLanguagePicker(false); }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{
                    background: l.code === language ? '#f4a024' : 'rgba(0,0,0,0.3)',
                    color: l.code === language ? '#3d1a00' : '#fff',
                  }}>
                  <span style={{ fontSize: 18 }}>{l.flag}</span>
                  <span className="font-bold text-sm">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Premium Header — lobby only */}
      {activeTab === 'lobby' && <div style={{
        background: 'linear-gradient(180deg,#5c2e00 0%,#3d1a00 100%)',
        borderBottom: '1.5px solid #b8742a',
        boxShadow: '0 3px 16px rgba(0,0,0,0.55)',
        padding: '10px 14px 8px',
      }} className="flex items-center justify-between">

        {/* Left — level badge + name + XP */}
        <div className="flex items-center gap-2.5">
          {/* Level badge */}
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(145deg,#f5c842,#b87a10)',
            boxShadow: '0 2px 0 #6b3f00, 0 4px 10px rgba(0,0,0,0.45)',
            border: '2px solid #f0d060',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight: 900, fontSize: 15, color: '#3d1a00',
            flexShrink: 0,
          }}>
            {player?.level}
          </div>

          {/* Name + XP bar */}
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, lineHeight: 1.2,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {player?.display_name?.substring(0, 12) || 'Player'}
            </div>
            <div style={{ color: '#f5c842', fontSize: 10, fontWeight: 700 }}>
              {player?.xp?.toLocaleString()}/{player?.xp_needed?.toLocaleString()} XP
            </div>
          </div>
        </div>

        {/* Right — resources */}
        <div className="flex items-center gap-2.5">
          {/* Energy */}
          <div style={{ display:'flex', alignItems:'center', gap:3,
            background:'rgba(0,0,0,0.3)', borderRadius:10, padding:'2px 7px',
            border:'1px solid rgba(255,220,80,0.25)' }}>
            <img src={ASSETS.icons.energy} alt="energy" style={{width:15,height:15,objectFit:'contain'}} />
            <span style={{ color:'#ffe566', fontWeight:800, fontSize:11 }}>
              {Math.floor(player?.energy||0)}/{player?.max_energy}
            </span>
          </div>
          {/* Feathers */}
          <div style={{ display:'flex', alignItems:'center', gap:3 }}>
            <img src={ASSETS.icons.feathers} alt="feathers" style={{width:15,height:15,objectFit:'contain'}} />
            <span style={{ color:'#86efac', fontWeight:800, fontSize:11 }}>
              {player?.feathers?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>}

      {/* Premium Evolution Banner — lobby only */}
      {activeTab === 'lobby' && <div style={{
        background: 'linear-gradient(90deg,#3d1a00 0%,#6b3300 40%,#6b3300 60%,#3d1a00 100%)',
        borderBottom: '1px solid #a06020',
        padding: '5px 16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Shine sweep */}
        <div style={{
          position:'absolute', top:0, left:'-60%', width:'40%', height:'100%',
          background:'linear-gradient(90deg,transparent,rgba(255,220,80,0.18),transparent)',
          animation: 'bannerShine 4s ease-in-out infinite',
          pointerEvents:'none',
        }} />
        <style>{`@keyframes bannerShine{0%{left:-60%}60%{left:160%}100%{left:160%}}`}</style>
        <span style={{ color:'#f5c842', fontWeight:800, fontSize:12,
          textShadow:'0 0 10px rgba(245,200,66,0.5)', letterSpacing: 0.5 }}>
          {player?.evolution_name} • Power: {player?.power?.toLocaleString()}
        </span>
      </div>}

      {/* Main content */}
      <div className="flex-1 min-h-0" style={{ overflow: activeTab === 'lobby' ? 'hidden' : 'auto' }}>
        {activeTab === 'lobby'     && <Lobby     player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'market'    && <Market    player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'inventory' && <Inventory player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'clans'     && <Clans     player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'skills'    && <SkillTree player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'earn'      && <Earn      player={player} onRefresh={refreshPlayer} />}
      </div>

      {/* Premium Bottom Nav */}
      <div style={{
        background: 'linear-gradient(180deg,#3d1a00 0%,#2a0f00 100%)',
        borderTop: '1.5px solid #8a4a10',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
        display: 'flex',
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, paddingTop: 8, paddingBottom: 8,
                display:'flex', flexDirection:'column', alignItems:'center', gap: 2,
                background: active
                  ? 'linear-gradient(180deg,#6b3300 0%,#4a1f00 100%)'
                  : 'transparent',
                borderTop: active ? '2px solid #f5c842' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 800,
                color: active ? '#f5c842' : '#9a6030',
                letterSpacing: 0.3,
              }}>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
