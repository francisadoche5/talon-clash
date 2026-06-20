import { useState, useEffect, useRef, useCallback } from 'react';
import { BIRD_ANIMATION_CSS } from '../birdImages';
import ASSETS from '../config/assets';

if (typeof document !== 'undefined' && !document.getElementById('bird-anim-css')) {
  const s = document.createElement('style');
  s.id = 'bird-anim-css';
  s.textContent = BIRD_ANIMATION_CSS;
  document.head.appendChild(s);
}

const VICTORY_HEADER_IMG = ASSETS.battle.victoryHeader;
const DEFEAT_HEADER_IMG  = ASSETS.battle.defeatHeader;

const SPRITE_SHEETS = {
  1: { url: ASSETS.sprites.tier1, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
  2: { url: ASSETS.sprites.tier2, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
  3: { url: ASSETS.sprites.tier3, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
  4: { url: ASSETS.sprites.tier4, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
  5: { url: ASSETS.sprites.tier5, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
  6: { url: ASSETS.sprites.tier6, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
  7: { url: ASSETS.sprites.tier7, totalW: 1536, totalH: 1024, cols: 6, rows: 1 },
};

const ANIM_CONFIG = {
  idle:    { frames: [0, 1, 0], speed: 380 },
  walk:    { frames: [1, 0, 1], speed: 280 },
  attack:  { frames: [2, 2, 0], speed: 110 },
  hit:     { frames: [3, 3, 0], speed: 130 },
  victory: { frames: [4, 4, 4], speed: 450 },
  defeat:  { frames: [5],       speed: 999 },
};

function SpriteAnimator({ tier, animState = 'idle', flip = false, targetW = 160, clipH = 320, glowColor }) {
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);
  const loadedRef = useRef(false);
  const sheet  = SPRITE_SHEETS[tier] || SPRITE_SHEETS[1];
  const frameW = sheet.totalW / sheet.cols;
  const frameH = sheet.totalH / sheet.rows;
  const sc     = targetW / frameW;
  const dispW  = Math.round(frameW * sc);
  const dispH  = Math.round(frameH * sc);
  const config = ANIM_CONFIG[animState] || ANIM_CONFIG.idle;
  const [fi, setFi] = useState(config.frames[0]);

  useEffect(() => {
    setFi(config.frames[0]);
    if (config.frames.length === 1) return;
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % config.frames.length; setFi(config.frames[i]); }, config.speed);
    return () => clearInterval(id);
  }, [animState]);

  const drawFrame = useCallback((img, frameIdx) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, dispW, dispH);
    const col = frameIdx % sheet.cols;
    const row = Math.floor(frameIdx / sheet.cols);
    ctx.drawImage(img, col * frameW, row * frameH, frameW, frameH, 0, 0, dispW, dispH);
    try {
      const id   = ctx.getImageData(0, 0, dispW, dispH);
      const data = id.data;
      const len  = dispW * dispH;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const avg = (r+g+b)/3, variance = Math.max(Math.abs(r-g),Math.abs(g-b),Math.abs(r-b));
        if (avg > 145 && variance < 65) data[i+3] = 0;
      }
      const wasRemoved = new Uint8Array(len);
      for (let p = 0; p < len; p++) if (data[p*4+3] === 0) wasRemoved[p] = 1;
      for (let y = 0; y < dispH; y++) {
        for (let x = 0; x < dispW; x++) {
          const p = y*dispW+x;
          if (wasRemoved[p]) continue;
          const nbr = (x>0&&wasRemoved[p-1])||(x<dispW-1&&wasRemoved[p+1])||(y>0&&wasRemoved[p-dispW])||(y<dispH-1&&wasRemoved[p+dispW]);
          if (!nbr) continue;
          const i = p*4, avg=(data[i]+data[i+1]+data[i+2])/3, variance=Math.max(Math.abs(data[i]-data[i+1]),Math.abs(data[i+1]-data[i+2]),Math.abs(data[i]-data[i+2]));
          if (avg > 120 && variance < 80) data[i+3] = 0;
        }
      }
      ctx.putImageData(id, 0, 0);
    } catch (_) {}
  }, [dispW, dispH, frameW, frameH, sheet.cols]);

  useEffect(() => {
    loadedRef.current = false;
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; loadedRef.current = true; drawFrame(img, fi); };
    img.src = sheet.url;
  }, [sheet.url]);

  useEffect(() => { if (loadedRef.current && imgRef.current) drawFrame(imgRef.current, fi); }, [fi, drawFrame]);

  return (
    <canvas ref={canvasRef} width={dispW} height={dispH}
      style={{ display:'block', transform: flip?'scaleX(-1)':undefined,
        filter: glowColor?`drop-shadow(0 0 6px ${glowColor})`:undefined }} />
  );
}

const STYLES = `
  @keyframes slideInLeft  { from{transform:translateX(-140%) scale(0.7);opacity:0} to{transform:translateX(0) scale(1);opacity:1} }
  @keyframes slideInRight { from{transform:translateX(140%) scale(0.7);opacity:0} to{transform:translateX(0) scale(1);opacity:1} }
  @keyframes vsFlash      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
  @keyframes shake        { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(6px)} }
  @keyframes lungeRight   { 0%,100%{transform:translateX(0)} 45%{transform:translateX(35px)} }
  @keyframes lungeLeft    { 0%,100%{transform:translateX(0)} 45%{transform:translateX(-35px)} }
  @keyframes floatDmg     { 0%{opacity:1;transform:translateY(0) scale(0.8)} 20%{opacity:1;transform:translateY(-10px) scale(1.2)} 100%{opacity:0;transform:translateY(-55px) scale(0.9)} }
  @keyframes battleStart  { 0%{opacity:0;transform:scale(0.3) rotate(-10deg)} 50%{opacity:1;transform:scale(1.3) rotate(3deg)} 100%{opacity:0;transform:scale(1.6)} }
  @keyframes groundPulse  { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
  @keyframes cardRise     { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes rewardPop    { 0%{opacity:0;transform:scale(0.5) translateY(10px)} 70%{transform:scale(1.05) translateY(-2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes lvlUpIn      { 0%{opacity:0;transform:scale(0.6) translateY(30px)} 60%{transform:scale(1.05) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes expFill      { from{width:0%} to{width:100%} }
  @keyframes lvlGlow      { 0%,100%{box-shadow:0 0 20px rgba(34,197,94,0.4)} 50%{box-shadow:0 0 40px rgba(34,197,94,0.8)} }
  @keyframes headerFloat  { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }

  .slide-left   { animation: slideInLeft  0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .slide-right  { animation: slideInRight 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .vs-flash     { animation: vsFlash 1.2s ease-in-out infinite; }
  .lunge-r      { animation: lungeRight 0.42s ease-in-out; }
  .lunge-l      { animation: lungeLeft  0.42s ease-in-out; }
  .do-shake     { animation: shake 0.35s ease-in-out; }
  .float-dmg    { animation: floatDmg   0.85s ease-out forwards; }
  .battle-txt   { animation: battleStart 0.9s ease-in-out forwards; }
  .card-rise    { animation: cardRise   0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
  .reward-pop   { animation: rewardPop  0.45s cubic-bezier(0.22,1,0.36,1) both; }
  .lvl-up-in    { animation: lvlUpIn    0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .lvl-glow     { animation: lvlGlow    2s ease-in-out infinite; }
  .exp-fill     { animation: expFill    1.2s 0.3s ease-out both; }
  .hdr-float    { animation: headerFloat 0.5s cubic-bezier(0.22,1,0.36,1) both; }
`;

function HPBar({ current, max, flipped = false, flashing = false }) {
  const pct   = Math.max(0, Math.min(100, (current/max)*100));
  const color = pct > 55 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full">
      <div className="bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700"
        style={{ direction: flipped?'rtl':'ltr' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width:`${pct}%`, background:`linear-gradient(90deg,${color}cc,${color})`,
            filter: flashing?'brightness(1.5)':'none' }} />
      </div>
      <div className="text-xs mt-0.5 text-gray-400 font-mono" style={{ textAlign: flipped?'right':'left' }}>
        {current} / {max}
      </div>
    </div>
  );
}

function FloatingDamage({ damage, isCrit, isBlocked }) {
  return (
    <div className="float-dmg absolute pointer-events-none select-none"
      style={{ top:-10, left:'50%', transform:'translateX(-50%)', zIndex:10, whiteSpace:'nowrap' }}>
      {isBlocked
        ? <span className="font-black text-base text-blue-300 drop-shadow-lg">🛡 BLOCKED</span>
        : <span className={`font-black drop-shadow-lg ${isCrit?'text-2xl text-red-400':'text-lg text-orange-300'}`}>
            -{damage}{isCrit?' 💥':''}
          </span>}
    </div>
  );
}

function RewardTile({ label, icon, value, delay = 0 }) {
  if (value == null) return null;
  return (
    <div className="reward-pop flex flex-col items-center gap-1" style={{ animationDelay:`${delay}s` }}>
      <p className="text-[10px] font-bold text-gray-500">{label}</p>
      <div className="w-[54px] h-[54px] rounded-[14px] flex items-center justify-center"
        style={{ background:'linear-gradient(145deg,#f5e8b0 0%,#c9a840 100%)',
          boxShadow:'0 4px 0 #8a6810, 0 6px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55)',
          border:'1.5px solid #d4a830' }}>
        {typeof icon === 'string' && icon.startsWith('http')
          ? <img src={icon} alt={label} style={{ width:34, height:34, objectFit:'contain', filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
          : <span style={{ fontSize:26, filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{icon}</span>}
      </div>
      <p className="text-sm font-black text-gray-700">+{value}</p>
    </div>
  );
}

function LevelUpModal({ newLevel, onClose, onSelectUpgrade }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background:'rgba(0,0,0,0.78)', backdropFilter:'blur(6px)' }}>
      <div className="lvl-up-in lvl-glow w-full max-w-xs"
        style={{ background:'linear-gradient(160deg,#fdf6e0 0%,#ede1b4 100%)', borderRadius:28,
          border:'2px solid rgba(255,255,255,0.4)', boxShadow:'0 24px 60px rgba(0,0,0,0.7)',
          overflow:'visible', position:'relative' }}>
        <div className="absolute left-0 right-0 flex justify-center" style={{ top:-68, zIndex:10 }}>
          <div style={{ fontSize:70, filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.5))' }}>🦅</div>
        </div>
        <div className="flex items-center justify-center"
          style={{ marginTop:50, background:'linear-gradient(180deg,#4ade80 0%,#16a34a 50%,#14532d 100%)',
            clipPath:'polygon(4% 0%,96% 0%,100% 50%,96% 100%,4% 100%,0% 50%)',
            boxShadow:'0 6px 0 #052e16', padding:'10px 32px', margin:'0 12px' }}>
          <span className="font-black text-white text-2xl tracking-widest" style={{ textShadow:'0 2px 0 #052e16' }}>LEVEL UP</span>
        </div>
        <div className="px-6 pt-4 pb-6">
          <p className="text-center font-black text-gray-800 text-lg mb-4">Level {newLevel}</p>
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full">EXP</div>
              <div className="flex-1 relative bg-gray-200 rounded-full h-5 overflow-hidden">
                <div className="exp-fill h-full rounded-full absolute left-0 top-0"
                  style={{ background:'linear-gradient(90deg,#38bdf8,#0ea5e9)' }} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white z-10"
                  style={{ textShadow:'0 1px 2px rgba(0,0,0,0.4)' }}>100%</span>
              </div>
            </div>
          </div>
          <button onClick={() => { onSelectUpgrade?.(); onClose(); }}
            className="w-full py-4 rounded-2xl font-black text-base text-white active:translate-y-0.5 transition-transform"
            style={{ background:'linear-gradient(180deg,#4ade80 0%,#16a34a 50%,#166534 100%)',
              boxShadow:'0 5px 0 #052e16', border:'1.5px solid #4ade80', textShadow:'0 1px 3px rgba(0,0,0,0.4)' }}>
            SELECT UPGRADE
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BattleArena({ player, result, onClose, onSelectUpgrade, autoPlay }) {
  const [phase,           setPhase]           = useState('entrance');
  const [stepIdx,         setStepIdx]         = useState(0);
  const [showBattleStart, setShowBattleStart] = useState(false);
  const [showLevelUp,     setShowLevelUp]     = useState(false);
  const [playerHP,        setPlayerHP]        = useState(result?.playerStats?.hp  ?? 100);
  const [oppHP,           setOppHP]           = useState(result?.opponentStats?.hp ?? 100);
  const playerMaxHP = result?.playerStats?.hp  ?? 100;
  const oppMaxHP    = result?.opponentStats?.hp ?? 100;
  const [playerLunge, setPlayerLunge] = useState(false);
  const [oppLunge,    setOppLunge]    = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [oppShake,    setOppShake]    = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [oppFlash,    setOppFlash]    = useState(false);
  const [damages,     setDamages]     = useState([]);

  const log          = result?.log || [];
  const totalRounds  = log.length > 0 ? log[log.length-1].round : 0;
  const currentRound = stepIdx < log.length ? log[stepIdx]?.round : totalRounds;
  const playerTier   = player?.evolution_tier || 1;
  const oppTier      = result?.opponent?.evolution_tier || 1;
  const isEpic       = result?.mode === 'epic';
  const won          = result?.playerWon;
  const accentColor  = isEpic ? '#a855f7' : '#f59e0b';

  const arenaBackground = useRef(
    isEpic
      ? ASSETS.battle.arenaEpic[Math.floor(Math.random() * ASSETS.battle.arenaEpic.length)]
      : ASSETS.battle.arenaDefault[Math.floor(Math.random() * ASSETS.battle.arenaDefault.length)]
  ).current;

  useEffect(() => {
    const t1 = setTimeout(() => { setShowBattleStart(true); setPhase('countdown'); }, 2600);
    const t2 = setTimeout(() => { setShowBattleStart(false); setPhase('battle'); }, 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const advanceStep = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1;
      if (next >= log.length) { setTimeout(() => setPhase('result'), 600); return prev; }
      return next;
    });
  }, [log.length]);

  useEffect(() => {
    if (phase !== 'battle') return;
    if (stepIdx >= log.length) { setTimeout(() => setPhase('result'), 600); return; }
    const entry    = log[stepIdx];
    const isPlayer = entry.attacker === 'player';
    const tL = setTimeout(() => {
      if (isPlayer) { setPlayerLunge(true); setTimeout(()=>setPlayerLunge(false),420); }
      else          { setOppLunge(true);    setTimeout(()=>setOppLunge(false),420); }
    }, 80);
    const tH = setTimeout(() => {
      if (isPlayer) {
        setOppShake(true);  setTimeout(()=>setOppShake(false),350);
        setOppFlash(true);  setTimeout(()=>setOppFlash(false),350);
        setOppHP(p => Math.max(0, p - entry.damage));
      } else {
        setPlayerShake(true); setTimeout(()=>setPlayerShake(false),350);
        setPlayerFlash(true); setTimeout(()=>setPlayerFlash(false),350);
        setPlayerHP(p => Math.max(0, p - entry.damage));
      }
      const id = Date.now() + Math.random();
      setDamages(prev => [...prev, { id, target: isPlayer?'opp':'player', damage:entry.damage, isCrit:entry.isCrit, isBlocked:entry.isBlocked }]);
      setTimeout(() => setDamages(prev => prev.filter(d=>d.id!==id)), 900);
    }, 320);
    const tN = setTimeout(advanceStep, 950);
    return () => { clearTimeout(tL); clearTimeout(tH); clearTimeout(tN); };
  }, [phase, stepIdx]);

  // Auto Battle: skip the manual "Continue"/"Select Upgrade" taps and roll
  // straight into the next automatic fight once the result has been shown
  // briefly. Leveling up is already applied server-side, so there's nothing
  // to lose by not stopping for the upgrade screen mid-loop.
  useEffect(() => {
    if (!autoPlay || phase !== 'result') return;
    const t = setTimeout(() => onClose(), 2200);
    return () => clearTimeout(t);
  }, [autoPlay, phase]);

  const rewards    = result?.rewards || {};
  const rewardTiles = [
    { label:'EXP',      icon: ASSETS.icons.exp,      value: rewards.xp    },
    { label:'Glory',    icon: ASSETS.icons.glory,     value: rewards.glory },
    { label:'Feathers', icon: ASSETS.icons.feathers,  value: rewards.feathers ?? rewards.dust },
    won && rewards.stars  ? { label:'Stars',  icon: '⭐', value: rewards.stars } : null,
    won && rewards.crowns != null ? { label:'Crowns', icon: ASSETS.icons.crown, value: rewards.crowns } : null,
  ].filter(r => r && r.value != null);

  // Victory = green, Defeat = red
  const isVictory    = won;
  const ribbonBg     = isVictory ? 'linear-gradient(180deg,#22c55e 0%,#16a34a 50%,#14532d 100%)' : 'linear-gradient(180deg,#ef4444 0%,#dc2626 50%,#991b1b 100%)';
  const ribbonShadow = isVictory ? '#052e16' : '#5a0a0a';
  const resultBg     = isVictory ? 'radial-gradient(ellipse at 50% 0%,#0d2b00 0%,#050e00 100%)' : 'radial-gradient(ellipse at 50% 0%,#1a0500 0%,#070002 100%)';
  const headerImg    = isVictory ? VICTORY_HEADER_IMG : DEFEAT_HEADER_IMG;

  return (
    <div className="fixed inset-0 z-50 flex flex-col select-none"
      style={{ background: isEpic?'linear-gradient(180deg,#1a0030 0%,#2d0050 50%,#0d0020 100%)':'linear-gradient(180deg,#050a1a 0%,#0a1628 50%,#020810 100%)' }}>
      <style>{STYLES}</style>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(20)].map((_,i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width:Math.random()*2+1, height:Math.random()*2+1,
              left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, opacity:Math.random()*0.7+0.3 }} />
        ))}
      </div>

      {/* ── ENTRANCE ── */}
      {(phase==='entrance'||phase==='countdown') && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 relative">
          <div className="text-xs tracking-[0.3em] font-bold" style={{ color:accentColor }}>
            {isEpic?'⚡ EPIC BATTLE':'OPPONENT FOUND'}
          </div>
          <div className="w-full flex items-end justify-center gap-4 mt-auto">
            <div className="flex flex-col items-center slide-left">
              <div className="mb-2"><SpriteAnimator tier={playerTier} animState="walk" targetW={140} clipH={280} glowColor={`${accentColor}99`} /></div>
              <div className="text-white font-bold text-xs truncate max-w-[110px]">{player?.display_name||'You'}</div>
              <div className="text-xs mt-0.5 font-mono" style={{ color:accentColor }}>⚡ {player?.power?.toLocaleString()}</div>
              <div className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold border" style={{ borderColor:accentColor, color:accentColor, background:`${accentColor}18` }}>LVL {player?.level}</div>
            </div>
            <div className="flex flex-col items-center gap-1 mb-16">
              <div className="vs-flash font-black text-4xl" style={{ color:'#ff4444' }}>VS</div>
            </div>
            <div className="flex flex-col items-center slide-right">
              <div className="mb-2"><SpriteAnimator tier={oppTier} animState="walk" flip targetW={140} clipH={280} glowColor="#ef444499" /></div>
              <div className="text-white font-bold text-xs truncate max-w-[110px]">{result?.opponent?.display_name||'Opponent'}</div>
              <div className="text-xs mt-0.5 font-mono text-red-400">⚡ {result?.opponent?.power?.toLocaleString()}</div>
              <div className="mt-1 px-2 py-0.5 rounded-full text-xs font-bold border border-red-500 text-red-400" style={{ background:'#ef444418' }}>RIVAL</div>
            </div>
          </div>
          {showBattleStart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="battle-txt font-black text-5xl tracking-widest"
                style={{ color:accentColor, textShadow:`0 0 30px ${accentColor},0 0 60px ${accentColor}` }}>BATTLE!</div>
            </div>
          )}
          {!showBattleStart && <div className="text-gray-600 text-xs animate-pulse">Preparing arena…</div>}
        </div>
      )}

      {/* ── BATTLE ── */}
      {phase==='battle' && (
        <div className="flex-1 flex flex-col p-3 gap-3">
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 opacity-20" style={{ background:accentColor }} />
            <span className="text-xs font-bold tracking-widest" style={{ color:accentColor }}>ROUND {currentRound} / {totalRounds}</span>
            <div className="h-px flex-1 opacity-20" style={{ background:accentColor }} />
          </div>
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <div className="text-white text-xs font-bold mb-1 truncate">{player?.display_name||'You'}</div>
              <HPBar current={playerHP} max={playerMaxHP} flashing={playerFlash} />
            </div>
            <div className="text-gray-600 text-xs font-bold mt-1">⚔️</div>
            <div className="flex-1">
              <div className="text-white text-xs font-bold mb-1 text-right truncate">{result?.opponent?.display_name}</div>
              <HPBar current={oppHP} max={oppMaxHP} flipped flashing={oppFlash} />
            </div>
          </div>
          <div className="flex-1 relative rounded-2xl overflow-hidden flex items-end"
            style={{ backgroundImage:`url(${arenaBackground})`, backgroundSize:'cover', backgroundPosition:'center', minHeight:420 }}>
            <div className="absolute inset-0" style={{ background:'rgba(0,0,0,0.35)' }} />
            <div className="absolute bottom-10 left-6 right-6 h-px" style={{ background:accentColor, opacity:0.25, animation:'groundPulse 2s ease-in-out infinite' }} />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-1">
              <div className="relative flex flex-col items-center">
                <SpriteAnimator tier={playerTier} animState={playerShake?'hit':playerLunge?'attack':'idle'} targetW={160} clipH={320} glowColor={`${accentColor}88`} />
                {damages.filter(d=>d.target==='player').map(d=><FloatingDamage key={d.id} {...d} />)}
              </div>
              <div className="absolute bottom-2 left-0 right-0 text-center">
                {log[stepIdx] && (
                  <div className="text-xs font-bold" style={{ color:`${accentColor}cc` }}>
                    {log[stepIdx].attacker==='player'?`${player?.display_name||'You'} attacks!`:`${result?.opponent?.display_name} attacks!`}
                    {log[stepIdx].isCrit    && <span className="text-red-400 ml-1">CRITICAL!</span>}
                    {log[stepIdx].isBlocked && <span className="text-blue-400 ml-1">BLOCKED!</span>}
                  </div>
                )}
              </div>
              <div className="relative flex flex-col items-center">
                <SpriteAnimator tier={oppTier} animState={oppShake?'hit':oppLunge?'attack':'idle'} flip targetW={160} clipH={320} glowColor="#ef444488" />
                {damages.filter(d=>d.target==='opp').map(d=><FloatingDamage key={d.id} {...d} />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT ──
          Structure mirrors the competitor:
          • Dark background fills screen
          • Card slides up from bottom, takes lower 60% of screen
          • Header image is absolutely positioned, centred, overlapping
            the TOP edge of the card — peeking out above it
          • Ribbon sits inside the card right at the top
          • Rewards + Continue all inside card
      */}
      {phase==='result' && (
        <div className="flex-1 flex flex-col" style={{ background: resultBg }}>

          {/* Scrollable area */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-end">

            {/*
              Outer wrapper — position:relative so the header image can be
              absolutely positioned relative to it, peeking above the card.
            */}
            <div className="relative card-rise mx-0">

              {/* ── Header image — sits ABOVE the card, centred ── */}
              <div className="hdr-float absolute left-0 right-0 flex justify-center pointer-events-none"
                style={{
                  /* Push image up above the card top.
                     Adjust this number if you want more/less of the image above the ribbon. */
                  top: -185,
                  zIndex: 40,
                }}>
                <img
                  src={headerImg}
                  alt={isVictory ? 'Victory' : 'Defeat'}
                  style={{
                    width: 280,
                    height: 'auto',
                    objectFit: 'contain',
                    filter: isVictory
                      ? 'drop-shadow(0 8px 24px rgba(255,200,0,0.6)) drop-shadow(0 3px 10px rgba(0,0,0,0.9))'
                      : 'drop-shadow(0 8px 24px rgba(139,92,246,0.5)) drop-shadow(0 3px 10px rgba(0,0,0,0.9))',
                  }}
                />
              </div>

              {/* ── Card ── */}
              <div style={{
                background: 'linear-gradient(160deg,#fdf6e0 0%,#ede1b4 60%,#e0d09a 100%)',
                borderRadius: '28px 28px 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.35)',
                /* paddingTop leaves room for the image that overlaps above */
                paddingTop: 84,
              }}>

                {/* Victory / Defeat ribbon — at the very top of the card */}
                <div className="flex items-center justify-center mb-4"
                  style={{
                    background: ribbonBg,
                    clipPath: 'polygon(3% 0%,97% 0%,100% 50%,97% 100%,3% 100%,0% 50%)',
                    boxShadow: `0 6px 0 ${ribbonShadow}, inset 0 1px 0 rgba(255,255,255,0.3)`,
                    padding: '12px 0',
                    margin: '0 16px 16px',
                  }}>
                  <span className="font-black text-white text-3xl tracking-widest"
                    style={{ textShadow:`0 2px 0 ${ribbonShadow}` }}>
                    {isVictory ? 'Victory' : 'Defeat'}
                  </span>
                </div>

                {/* Rewards */}
                <div className="px-4 pb-5">
                  <p className="text-center font-black text-gray-700 text-sm mb-3">Your rewards</p>
                  <div className="flex justify-center gap-2 flex-nowrap overflow-x-auto px-1">
                    {rewardTiles.map((r,i) => (
                      <RewardTile key={r.label} label={r.label} icon={r.icon} value={r.value} delay={0.2+i*0.08} />
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-3">vs {result?.opponent?.display_name}</p>
                </div>

                {/* Continue — inside card, always visible */}
                <div className="px-4 pb-6">
                  <button
                    onClick={() => { if (result?.levelUp) setShowLevelUp(true); else onClose(); }}
                    className="w-full py-4 rounded-2xl font-black text-xl text-white active:translate-y-1 transition-transform"
                    style={{
                      background: 'linear-gradient(180deg,#f9b234 0%,#e67e22 50%,#c95e00 100%)',
                      boxShadow: '0 6px 0 #7a3800, 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.35)',
                      border: '1.5px solid #f5c060',
                      textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    }}>
                    Continue
                  </button>
                </div>

              </div>{/* end card */}
            </div>{/* end relative wrapper */}
          </div>{/* end scrollable */}
        </div>
      )}

      {showLevelUp && <LevelUpModal newLevel={result?.newLevel} onClose={onClose} onSelectUpgrade={onSelectUpgrade} />}
    </div>
  );
}
