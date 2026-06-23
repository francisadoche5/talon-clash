import { useState, useEffect } from 'react';
import ASSETS from '../config/assets';

const RARITY_COLORS = {
  common:    'border-gray-500 bg-gray-900',
  uncommon:  'border-green-500 bg-green-950',
  rare:      'border-blue-500 bg-blue-950',
  epic:      'border-purple-500 bg-purple-950',
  legendary: 'border-yellow-500 bg-yellow-950',
};

const SLOT_ICONS = {
  weapon: '⚔️',
  armor:  '🛡️',
  helmet: '⛑️',
  boots:  '👟',
  ring:   '💍',
  mount:  '🦅',
};

const STAGE_ORDER = ['circle', 'glow', 'cloud', 'particles', 'reward', 'stars', 'feathers', 'banner', 'button'];
const STAGE_DELAY = {
  circle: 650, glow: 750, cloud: 600, particles: 650,
  reward: 800, stars: 700, feathers: 900, banner: 600, button: 450,
};
function stagesFor(rarity) {
  return STAGE_ORDER.filter(s => s !== 'feathers' || rarity === 'legendary');
}

const LAYER = {
  position: 'absolute', top: 0, left: 0,
  width: '100%', height: '100%',
  objectFit: 'contain', pointerEvents: 'none',
};

export default function RewardRevealOverlay({
  chestImg, item, cracked, onCrack, onClose, continueLabel = 'Awesome!',
}) {
  const [stageIndex, setStageIndex] = useState(-1);
  const stages = item ? stagesFor(item.rarity) : [];

  useEffect(() => {
    if (!cracked || !item) { setStageIndex(-1); return; }
    let cumulative = 0;
    const timeouts = stages.map((stage, i) => {
      cumulative += STAGE_DELAY[stage];
      return setTimeout(() => setStageIndex(i), cumulative);
    });
    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cracked, item]);

  const visible = (name) => {
    const idx = stages.indexOf(name);
    return idx !== -1 && idx <= stageIndex;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', animation: 'fadeIn 350ms ease' }}
    >
      {/* ── PRE-CRACK: breathing chest + TAP prompt ── */}
      {!cracked && (
        <div
          className="flex flex-col items-center gap-6"
          onClick={onCrack}
          style={{ cursor: 'pointer' }}
        >
          {/* Pulsing ring behind chest */}
          <div style={{ position: 'relative', width: 260, height: 260 }}>
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              animation: 'ringPulse 1.6s ease-out infinite',
              background: 'radial-gradient(circle, rgba(255,200,50,0.18) 0%, transparent 70%)',
            }} />
            <img
              src={chestImg}
              alt="chest"
              style={{
                ...LAYER,
                animation: 'chestBreathe 1.8s ease-in-out infinite',
              }}
            />
          </div>

          {/* TAP label */}
          <div style={{ animation: 'tapPulse 1.2s ease-in-out infinite' }}>
            <div style={{
              background: 'linear-gradient(180deg,#ffe066 0%,#ffaa00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              filter: 'drop-shadow(0 2px 8px rgba(255,180,0,0.7))',
            }}>
              ✦ TAP TO OPEN ✦
            </div>
          </div>
        </div>
      )}

      {/* ── POST-CRACK: cinematic animation stages ── */}
      {cracked && item && (
        <div style={{ position: 'relative', width: 260, height: 260 }}>
          {visible('circle') && (
            <img src={ASSETS.effects.magicCircle[item.rarity]} alt=""
              style={{ ...LAYER, animation: 'fadeIn 500ms ease forwards, circleSpin 14s linear infinite' }} />
          )}
          {visible('glow') && (
            <img src={ASSETS.effects.glow[item.rarity]} alt=""
              style={{ ...LAYER, animation: 'glowExpand 700ms ease forwards' }} />
          )}
          {visible('cloud') && ASSETS.effects.cloud[item.rarity] && (
            <img src={ASSETS.effects.cloud[item.rarity]} alt=""
              style={{ ...LAYER, animation: 'cloudIn 600ms ease forwards' }} />
          )}
          {visible('particles') && (
            <img src={ASSETS.effects.particles[item.rarity]} alt=""
              style={{ ...LAYER, animation: 'particleBurst 650ms ease forwards' }} />
          )}
          {visible('reward') && (
            <img src={ASSETS.effects.featherTrail} alt=""
              style={{ ...LAYER, opacity: 0.85, animation: 'fadeIn 500ms ease forwards' }} />
          )}
          {visible('reward') && (
            <img src={ASSETS.effects.rewardShine[item.rarity]} alt=""
              style={{ ...LAYER, animation: 'fadeIn 500ms ease forwards, circleSpin 18s linear infinite' }} />
          )}
          {visible('stars') && (
            <img src={ASSETS.effects.floatingStars[item.rarity]} alt=""
              style={{ ...LAYER, animation: 'fadeIn 500ms ease forwards, circleSpin 10s linear infinite reverse' }} />
          )}
          {visible('feathers') && item.rarity === 'legendary' && (
            <img src={ASSETS.effects.legendaryFeathers} alt=""
              style={{ ...LAYER, animation: 'fadeIn 500ms ease forwards, feathersDrift 5s ease-in-out infinite 500ms' }} />
          )}
          {visible('reward') && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 10, animation: 'rewardRise 700ms ease forwards',
            }}>
              <div style={{ fontSize: 64, filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.65))' }}>
                {SLOT_ICONS[item.slot]}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Banner + stats */}
      {cracked && item && visible('banner') && (
        <>
          <div
            className={`mt-4 px-5 py-2 rounded-full border-2 font-black text-sm uppercase tracking-wide text-center ${RARITY_COLORS[item.rarity]}`}
            style={{ animation: 'bannerIn 500ms ease forwards' }}
          >
            <span className="text-white">{item.rarity} • {item.name}</span>
          </div>
          <div className="text-amber-400 text-xs text-center mt-2">
            Lvl {item.level}&nbsp;&nbsp;⚔️ +{item.attack_bonus}&nbsp;&nbsp;❤️ +{item.hp_bonus}&nbsp;&nbsp;🛡️ +{item.defense_bonus}
          </div>
        </>
      )}

      {/* Continue button */}
      {cracked && item && visible('button') && (
        <button
          onClick={onClose}
          className="mt-5 bg-amber-500 text-amber-900 font-bold px-8 py-3 rounded-xl active:scale-95 transition-transform"
          style={{ animation: 'fadeIn 400ms ease forwards' }}
        >
          {continueLabel}
        </button>
      )}

      <style>{`
        @keyframes fadeIn       { from{opacity:0}              to{opacity:1} }
        @keyframes chestBreathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.09)} }
        @keyframes tapPulse     { 0%,100%{opacity:1; transform:scale(1)} 50%{opacity:0.55; transform:scale(0.94)} }
        @keyframes ringPulse    { 0%{transform:scale(0.85); opacity:0} 50%{opacity:1} 100%{transform:scale(1.5); opacity:0} }
        @keyframes circleSpin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes glowExpand   { 0%{opacity:0;transform:scale(0)} 55%{opacity:1;transform:scale(1.35)} 100%{opacity:0.85;transform:scale(1)} }
        @keyframes cloudIn      { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
        @keyframes particleBurst{ 0%{opacity:0;transform:scale(0.4)} 45%{opacity:1;transform:scale(1.25)} 100%{opacity:0.85;transform:scale(1)} }
        @keyframes rewardRise   { from{opacity:0;transform:translateY(60px) scale(0.6)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes feathersDrift{ 0%{transform:translateY(-4%)} 50%{transform:translateY(6%)} 100%{transform:translateY(-4%)} }
        @keyframes bannerIn     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
