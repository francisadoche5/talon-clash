import { useState, useEffect, useRef, useCallback } from 'react';

const EVOLUTION_IMAGES = {
  1: '🐣', 2: '🐦', 3: '🦅', 4: '⚔️', 5: '🔥', 6: '👑', 7: '💀'
};

const ARENA_STYLES = `
  @keyframes slideInLeft {
    from { transform: translateX(-140%) scale(0.7); opacity: 0; }
    to   { transform: translateX(0)    scale(1);   opacity: 1; }
  }
  @keyframes slideInRight {
    from { transform: translateX(140%) scale(0.7); opacity: 0; }
    to   { transform: translateX(0)    scale(1);   opacity: 1; }
  }
  @keyframes vsFlash {
    0%, 100% { opacity: 1; transform: scale(1);   text-shadow: 0 0 20px #ff4444; }
    50%       { opacity: 0.6; transform: scale(1.15); text-shadow: 0 0 40px #ff0000, 0 0 80px #ff4444; }
  }
  @keyframes shake {
    0%,100% { transform: scaleX(var(--flip,1)) translateX(0); }
    20%     { transform: scaleX(var(--flip,1)) translateX(-10px); }
    40%     { transform: scaleX(var(--flip,1)) translateX(10px); }
    60%     { transform: scaleX(var(--flip,1)) translateX(-8px); }
    80%     { transform: scaleX(var(--flip,1)) translateX(6px); }
  }
  @keyframes lungeRight {
    0%,100% { transform: translateX(0); }
    45%     { transform: translateX(35px); }
  }
  @keyframes lungeLeft {
    0%,100% { transform: translateX(0); }
    45%     { transform: translateX(-35px); }
  }
  @keyframes floatDamage {
    0%   { opacity: 1; transform: translateY(0)   scale(0.8); }
    20%  { opacity: 1; transform: translateY(-10px) scale(1.2); }
    100% { opacity: 0; transform: translateY(-55px) scale(0.9); }
  }
  @keyframes victoryBounce {
    0%,100% { transform: translateY(0)   scale(1);   }
    40%     { transform: translateY(-24px) scale(1.25); }
    60%     { transform: translateY(-12px) scale(1.1); }
  }
  @keyframes defeatSlump {
    0%   { transform: scale(1)   rotate(0deg);  opacity: 1; }
    100% { transform: scale(0.75) rotate(-12deg); opacity: 0.4; }
  }
  @keyframes battleStart {
    0%   { opacity: 0; transform: scale(0.3) rotate(-10deg); }
    50%  { opacity: 1; transform: scale(1.3) rotate(3deg); }
    100% { opacity: 0; transform: scale(1.6) rotate(0deg); }
  }
  @keyframes groundPulse {
    0%,100% { opacity: 0.3; }
    50%     { opacity: 0.7; }
  }
  @keyframes hpFlash {
    0%,100% { filter: brightness(1); }
    50%     { filter: brightness(2); }
  }
  @keyframes starField {
    from { transform: translateY(0); }
    to   { transform: translateY(-200px); }
  }
  @keyframes rewardPop {
    0%   { opacity: 0; transform: scale(0.5) translateY(10px); }
    70%  { transform: scale(1.05) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  .bird-slide-left  { animation: slideInLeft  0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .bird-slide-right { animation: slideInRight 0.65s cubic-bezier(0.22,1,0.36,1) both; }
  .vs-flash         { animation: vsFlash 1.2s ease-in-out infinite; }
  .bird-lunge-right { animation: lungeRight 0.42s ease-in-out; }
  .bird-lunge-left  { animation: lungeLeft  0.42s ease-in-out; }
  .bird-shake       { animation: shake 0.35s ease-in-out; }
  .float-damage     { animation: floatDamage 0.85s ease-out forwards; }
  .victory-bounce   { animation: victoryBounce 0.7s ease-in-out infinite; }
  .defeat-slump     { animation: defeatSlump 0.5s ease-out forwards; }
  .battle-start-txt { animation: battleStart 0.9s ease-in-out forwards; }
  .reward-pop       { animation: rewardPop 0.45s cubic-bezier(0.22,1,0.36,1) both; }
`;

function HPBar({ current, max, flipped = false, flashing = false }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 55 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full">
      <div className="bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700"
        style={{ direction: flipped ? 'rtl' : 'ltr' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: flashing ? `0 0 12px ${color}` : 'none',
            filter: flashing ? 'brightness(1.5)' : 'none',
          }}
        />
      </div>
      <div className="text-xs mt-0.5 text-gray-400 font-mono" style={{ textAlign: flipped ? 'right' : 'left' }}>
        {current} / {max}
      </div>
    </div>
  );
}

function FloatingDamage({ damage, isCrit, isBlocked }) {
  return (
    <div className="float-damage absolute pointer-events-none select-none"
      style={{ top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, whiteSpace: 'nowrap' }}>
      {isBlocked ? (
        <span className="font-black text-base text-blue-300 drop-shadow-lg">🛡 BLOCKED</span>
      ) : (
        <span className={`font-black drop-shadow-lg ${isCrit ? 'text-2xl text-red-400' : 'text-lg text-orange-300'}`}>
          -{damage}{isCrit ? ' 💥' : ''}
        </span>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function BattleArena({ player, result, onClose }) {
  // ── State ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState('entrance');   // entrance | countdown | battle | result
  const [stepIdx, setStepIdx] = useState(0);
  const [showBattleStart, setShowBattleStart] = useState(false);

  const [playerHP, setPlayerHP] = useState(result.playerStats.hp);
  const [oppHP, setOppHP] = useState(result.opponentStats.hp);
  const playerMaxHP = result.playerStats.hp;
  const oppMaxHP    = result.opponentStats.hp;

  // animation flags
  const [playerLunge,   setPlayerLunge]   = useState(false);
  const [oppLunge,      setOppLunge]      = useState(false);
  const [playerShake,   setPlayerShake]   = useState(false);
  const [oppShake,      setOppShake]      = useState(false);
  const [playerHPFlash, setPlayerHPFlash] = useState(false);
  const [oppHPFlash,    setOppHPFlash]    = useState(false);
  const [damages,       setDamages]       = useState([]); // { id, target, damage, isCrit, isBlocked }

  const log     = result.log || [];
  const totalRounds = log.length > 0 ? log[log.length - 1].round : 0;
  const currentRound = stepIdx < log.length ? log[stepIdx]?.round : totalRounds;

  const oppBird    = EVOLUTION_IMAGES[result.opponent?.evolution_tier] || '🐦';
  const playerBird = EVOLUTION_IMAGES[player?.evolution_tier] || '🐣';

  const isEpic = result.mode === 'epic';

  // ── Phase transitions ────────────────────────────────────────────────────
  useEffect(() => {
    // After entrance (2.6s), show BATTLE START banner, then begin
    const t1 = setTimeout(() => {
      setShowBattleStart(true);
      setPhase('countdown');
    }, 2600);
    const t2 = setTimeout(() => {
      setShowBattleStart(false);
      setPhase('battle');
    }, 3700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Step through battle log ──────────────────────────────────────────────
  const advanceStep = useCallback(() => {
    setStepIdx(prev => {
      const next = prev + 1;
      if (next >= log.length) {
        setTimeout(() => setPhase('result'), 600);
        return prev;
      }
      return next;
    });
  }, [log.length]);

  useEffect(() => {
    if (phase !== 'battle') return;
    if (stepIdx >= log.length) {
      setTimeout(() => setPhase('result'), 600);
      return;
    }

    const entry = log[stepIdx];
    const isPlayerTurn = entry.attacker === 'player';
    const LUNGE_DELAY  = 80;
    const HIT_DELAY    = 320;
    const NEXT_DELAY   = 950;

    // Lunge
    const tLunge = setTimeout(() => {
      if (isPlayerTurn) setPlayerLunge(true);
      else              setOppLunge(true);
      setTimeout(() => { setPlayerLunge(false); setOppLunge(false); }, 420);
    }, LUNGE_DELAY);

    // Hit + damage
    const tHit = setTimeout(() => {
      if (isPlayerTurn) {
        setOppShake(true);
        setTimeout(() => setOppShake(false), 350);
        setOppHPFlash(true);
        setTimeout(() => setOppHPFlash(false), 350);
        setOppHP(prev => Math.max(0, prev - entry.damage));
      } else {
        setPlayerShake(true);
        setTimeout(() => setPlayerShake(false), 350);
        setPlayerHPFlash(true);
        setTimeout(() => setPlayerHPFlash(false), 350);
        setPlayerHP(prev => Math.max(0, prev - entry.damage));
      }
      const id = Date.now() + Math.random();
      setDamages(prev => [...prev, {
        id,
        target: isPlayerTurn ? 'opp' : 'player',
        damage: entry.damage,
        isCrit: entry.isCrit,
        isBlocked: entry.isBlocked,
      }]);
      setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 900);
    }, HIT_DELAY);

    // Next step
    const tNext = setTimeout(advanceStep, NEXT_DELAY);

    return () => { clearTimeout(tLunge); clearTimeout(tHit); clearTimeout(tNext); };
  }, [phase, stepIdx]);   // eslint-disable-line

  // ── Helpers ──────────────────────────────────────────────────────────────
  const arenaGrad = isEpic
    ? 'linear-gradient(180deg, #1a0030 0%, #2d0050 50%, #0d0020 100%)'
    : 'linear-gradient(180deg, #050a1a 0%, #0a1628 50%, #020810 100%)';

  const accentColor = isEpic ? '#a855f7' : '#f59e0b';

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none"
      style={{ background: arenaGrad }}>

      <style>{ARENA_STYLES}</style>

      {/* Subtle star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
            }} />
        ))}
      </div>

      {/* ── ENTRANCE PHASE ─────────────────────────────────────────────── */}
      {(phase === 'entrance' || phase === 'countdown') && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 relative">

          {/* Header */}
          <div className="text-center">
            <div className="text-xs tracking-[0.3em] font-bold mb-1"
              style={{ color: accentColor }}>
              {isEpic ? '⚡ EPIC BATTLE' : 'OPPONENT FOUND'}
            </div>
            <div className="text-gray-500 text-xs">
              {isEpic ? 'High-stakes arena' : 'Battle arena'}
            </div>
          </div>

          {/* Birds face-off */}
          <div className="w-full flex items-center justify-between">

            {/* Player bird entrance */}
            <div className="flex-1 flex flex-col items-center bird-slide-left">
              <div className="text-7xl mb-3 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.5))' }}>
                {playerBird}
              </div>
              <div className="text-white font-bold text-sm text-center truncate max-w-[100px]">
                {player?.display_name || 'You'}
              </div>
              <div className="text-xs mt-0.5 font-mono" style={{ color: accentColor }}>
                ⚡ {player?.power?.toLocaleString()}
              </div>
              <div className="mt-2 px-2 py-0.5 rounded-full text-xs font-bold border"
                style={{ borderColor: accentColor, color: accentColor, background: `${accentColor}18` }}>
                LVL {player?.level}
              </div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-1 mx-2">
              <div className="vs-flash font-black text-4xl" style={{ color: '#ff4444' }}>VS</div>
              <div className="w-px h-10 opacity-30" style={{ background: accentColor }} />
            </div>

            {/* Opponent bird entrance */}
            <div className="flex-1 flex flex-col items-center bird-slide-right">
              <div className="text-7xl mb-3 drop-shadow-2xl"
                style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 0 16px rgba(239,68,68,0.5))' }}>
                {oppBird}
              </div>
              <div className="text-white font-bold text-sm text-center truncate max-w-[100px]">
                {result.opponent?.display_name || 'Opponent'}
              </div>
              <div className="text-xs mt-0.5 font-mono text-red-400">
                ⚡ {result.opponent?.power?.toLocaleString()}
              </div>
              <div className="mt-2 px-2 py-0.5 rounded-full text-xs font-bold border border-red-500 text-red-400"
                style={{ background: '#ef444418' }}>
                RIVAL
              </div>
            </div>
          </div>

          {/* Battle start flash */}
          {showBattleStart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="battle-start-txt font-black text-5xl tracking-widest"
                style={{ color: accentColor, textShadow: `0 0 30px ${accentColor}, 0 0 60px ${accentColor}` }}>
                BATTLE!
              </div>
            </div>
          )}

          {!showBattleStart && (
            <div className="text-gray-600 text-xs animate-pulse">Preparing arena…</div>
          )}
        </div>
      )}

      {/* ── BATTLE PHASE ───────────────────────────────────────────────── */}
      {phase === 'battle' && (
        <div className="flex-1 flex flex-col p-3 gap-3">

          {/* Round counter */}
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 opacity-20" style={{ background: accentColor }} />
            <span className="text-xs font-bold tracking-widest" style={{ color: accentColor }}>
              ROUND {currentRound} / {totalRounds}
            </span>
            <div className="h-px flex-1 opacity-20" style={{ background: accentColor }} />
          </div>

          {/* HP bars */}
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <div className="text-white text-xs font-bold mb-1 truncate">
                {player?.display_name || 'You'}
              </div>
              <HPBar current={playerHP} max={playerMaxHP} flashing={playerHPFlash} />
            </div>
            <div className="text-gray-600 text-xs font-bold mt-1">⚔️</div>
            <div className="flex-1">
              <div className="text-white text-xs font-bold mb-1 text-right truncate">
                {result.opponent?.display_name}
              </div>
              <HPBar current={oppHP} max={oppMaxHP} flipped flashing={oppHPFlash} />
            </div>
          </div>

          {/* Arena floor */}
          <div className="flex-1 relative rounded-2xl overflow-hidden flex items-end"
            style={{
              background: isEpic
                ? 'radial-gradient(ellipse at 50% 80%, #200040 0%, #0d0020 100%)'
                : 'radial-gradient(ellipse at 50% 80%, #0a1628 0%, #020810 100%)',
              minHeight: 190,
              border: `1px solid ${accentColor}22`,
            }}>

            {/* Ground glow */}
            <div className="absolute bottom-0 left-0 right-0 h-12 rounded-b-2xl"
              style={{ background: `linear-gradient(0deg, ${accentColor}18, transparent)` }} />
            <div className="absolute bottom-10 left-6 right-6 h-px"
              style={{ background: accentColor, opacity: 0.25, animation: 'groundPulse 2s ease-in-out infinite' }} />

            {/* Birds */}
            <div className="absolute inset-0 flex items-center justify-between px-6 pb-10">

              {/* Player bird */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`text-6xl transition-none ${playerLunge ? 'bird-lunge-right' : ''} ${playerShake ? 'bird-shake' : ''}`}
                  style={{
                    filter: `drop-shadow(0 0 12px ${accentColor}88)`,
                    '--flip': 1,
                  }}>
                  {playerBird}
                </div>
                {damages.filter(d => d.target === 'player').map(d => (
                  <FloatingDamage key={d.id} damage={d.damage} isCrit={d.isCrit} isBlocked={d.isBlocked} />
                ))}
              </div>

              {/* Battle log line */}
              <div className="absolute bottom-2 left-0 right-0 text-center">
                {log[stepIdx] && (
                  <div className="text-xs font-bold" style={{ color: `${accentColor}cc` }}>
                    {log[stepIdx].attacker === 'player' ? `${player?.display_name || 'You'} attacks!` : `${result.opponent?.display_name} attacks!`}
                    {log[stepIdx].isCrit    && <span className="text-red-400 ml-1">CRITICAL!</span>}
                    {log[stepIdx].isBlocked && <span className="text-blue-400 ml-1">BLOCKED!</span>}
                  </div>
                )}
              </div>

              {/* Opponent bird */}
              <div className="relative flex flex-col items-center">
                <div
                  className={`text-6xl transition-none ${oppLunge ? 'bird-lunge-left' : ''} ${oppShake ? 'bird-shake' : ''}`}
                  style={{
                    transform: 'scaleX(-1)',
                    filter: 'drop-shadow(0 0 12px #ef444488)',
                    '--flip': -1,
                  }}>
                  {oppBird}
                </div>
                {damages.filter(d => d.target === 'opp').map(d => (
                  <FloatingDamage key={d.id} damage={d.damage} isCrit={d.isCrit} isBlocked={d.isBlocked} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT PHASE ───────────────────────────────────────────────── */}
      {phase === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 p-6">

          {/* Winner bird */}
          <div
            className={result.playerWon ? 'victory-bounce text-7xl' : 'defeat-slump text-7xl'}
            style={{
              filter: result.playerWon
                ? `drop-shadow(0 0 20px ${accentColor})`
                : 'drop-shadow(0 0 12px #ef444488) grayscale(0.4)',
            }}>
            {result.playerWon ? playerBird : oppBird}
          </div>

          {/* Outcome label */}
          <div className="text-center">
            <div className="font-black text-4xl tracking-wider"
              style={{ color: result.playerWon ? accentColor : '#ef4444',
                       textShadow: result.playerWon ? `0 0 24px ${accentColor}` : '0 0 24px #ef4444' }}>
              {result.playerWon ? '🏆 VICTORY' : '💀 DEFEAT'}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              vs {result.opponent?.display_name}
            </div>
          </div>

          {/* Rewards */}
          <div className="w-full rounded-2xl p-4 grid grid-cols-4 gap-3 text-center"
            style={{ background: '#ffffff0d', border: `1px solid ${accentColor}33` }}>
            {[
              { label: 'EXP',    color: '#60a5fa', value: `+${result.rewards?.xp}`       },
              { label: 'Glory',  color: accentColor, value: `+${result.rewards?.glory}`  },
              { label: '🪶',     color: '#4ade80', value: `+${result.rewards?.feathers}` },
              { label: 'Food',   color: '#fb923c', value: `+${result.rewards?.food}`     },
            ].map((r, i) => (
              <div key={r.label} className="reward-pop" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="text-xs mb-0.5" style={{ color: r.color }}>{r.label}</div>
                <div className="text-white font-bold text-sm">{r.value}</div>
              </div>
            ))}
          </div>

          {/* Bonus reward */}
          {result.rewards?.bonus && (
            <div className="reward-pop text-center px-4 py-2 rounded-xl"
              style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}55`,
                       animationDelay: '350ms' }}>
              <span className="text-sm font-bold" style={{ color: accentColor }}>
                🎁 Bonus: {result.rewards.bonus.type} ×{result.rewards.bonus.amount}
              </span>
            </div>
          )}

          {/* Level up */}
          {result.levelUp && (
            <div className="reward-pop text-center" style={{ animationDelay: '450ms' }}>
              <div className="font-black text-lg text-yellow-300 animate-bounce">
                🎉 LEVEL UP → {result.newLevel}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-transform mt-1"
            style={{
              background: result.playerWon
                ? `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`
                : 'linear-gradient(135deg, #374151, #1f2937)',
              color: result.playerWon ? '#1a0a00' : '#d1d5db',
              boxShadow: result.playerWon ? `0 4px 24px ${accentColor}66` : 'none',
            }}>
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}
