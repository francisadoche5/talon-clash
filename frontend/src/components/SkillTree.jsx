import { useState, useEffect } from 'react';
import ASSETS from '../config/assets';
import { getSkills, upgradeSkill } from '../api';

const SKILL_INFO = {
  attack:       { name: 'Attack',       icon: '⚔️',  color: '#fb923c', desc: 'Increases Attack Min & Max' },
  hp:           { name: 'HP',           icon: '❤️',  color: '#f87171', desc: 'Increases max health points' },
  defense:      { name: 'Defence',      icon: '🛡️',  color: '#60a5fa', desc: 'Reduces incoming damage' },
  crit:         { name: 'Crit Chance',  icon: '💥',  color: '#facc15', desc: 'Increases critical hit chance' },
  crit_damage:  { name: 'Crit Damage',  icon: '🔥',  color: '#f97316', desc: 'Increases critical hit multiplier' },
  dodge:        { name: 'Dodge',        icon: '💨',  color: '#34d399', desc: 'Chance to evade incoming attacks' },
  extra_attack: { name: 'Extra Attack', icon: '⚡',  color: '#a78bfa', desc: 'Chance to strike an extra time' },
};

export default function SkillTree({ player, onRefresh }) {
  const [skills,  setSkills]  = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadSkills(); }, []);

  async function loadSkills() {
    try {
      const res = await getSkills(player.telegram_id);
      setSkills(res.data.skills);
    } catch {}
  }

  async function handleUpgrade(skillType) {
    try {
      const res = await upgradeSkill(player.telegram_id, skillType);
      if (res.data.error) throw new Error(res.data.error);
      setMessage({ type: 'success', text: `${SKILL_INFO[skillType].name} upgraded to Lvl ${res.data.newLevel}!` });
      await loadSkills();
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || err.message || 'Failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  const points = player?.skill_points || 0;
  const maxLevel = 10;

  return (
    <div style={{ padding: '16px 14px', minHeight: '100%',
      background: 'linear-gradient(180deg,#2a0f00 0%,#1a0800 100%)' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 16 }}>
        <div style={{ color:'#f5c842', fontWeight:900, fontSize:18, letterSpacing:0.5,
          textShadow:'0 0 12px rgba(245,200,66,0.5)' }}>
          Skill Tree
        </div>
        {/* Points pill */}
        <div style={{
          display:'flex', alignItems:'center', gap:6,
          background:'linear-gradient(145deg,#5c2e00,#3a1500)',
          border:'1.5px solid #b8742a', borderRadius:20,
          padding:'5px 12px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
        }}>
          <img src={ASSETS.icons.points} alt="points"
            style={{width:16,height:16,objectFit:'contain'}} />
          <span style={{ color:'#f5c842', fontWeight:800, fontSize:13 }}>
            {points} {points === 1 ? 'point' : 'points'}
          </span>
        </div>
      </div>

      {/* 1-point cost note */}
      <div style={{
        background:'rgba(245,200,66,0.08)', border:'1px solid rgba(245,200,66,0.2)',
        borderRadius:10, padding:'6px 12px', marginBottom:14, textAlign:'center',
        color:'#f5c842', fontSize:11, fontWeight:700,
      }}>
        Every upgrade costs exactly 1 skill point
      </div>

      {/* Toast */}
      {message && (
        <div style={{
          marginBottom:12, padding:'8px 14px', borderRadius:12, textAlign:'center',
          fontSize:13, fontWeight:700,
          background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
          color: message.type === 'success' ? '#86efac' : '#fca5a5',
        }}>
          {message.text}
        </div>
      )}

      {/* Skill cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {Object.entries(SKILL_INFO).map(([key, info]) => {
          const currentLevel = skills?.[`${key}_level`] || 0;
          const pct = (currentLevel / maxLevel) * 100;
          const maxed   = currentLevel >= maxLevel;
          const canBuy  = !maxed && points >= 1;

          return (
            <div key={key} style={{
              borderRadius:18,
              background:'linear-gradient(145deg,#3d1a00,#2a0f00)',
              border:'1.5px solid #6b3300',
              boxShadow:'0 4px 14px rgba(0,0,0,0.4)',
              padding:'14px 14px 12px',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>

                {/* Icon + name */}
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:42, height:42, borderRadius:12, flexShrink:0,
                    background:'linear-gradient(145deg,#5c2e00,#3a1200)',
                    border:`2px solid ${info.color}55`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:22,
                    boxShadow:`0 0 10px ${info.color}33`,
                  }}>
                    {info.icon}
                  </div>
                  <div>
                    <div style={{ color: info.color, fontWeight:800, fontSize:14, lineHeight:1.2 }}>
                      {info.name}
                    </div>
                    <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, marginTop:1 }}>
                      {info.desc}
                    </div>
                    <div style={{ color:'#f5c842', fontSize:10, fontWeight:700, marginTop:2 }}>
                      Lvl {currentLevel}/{maxLevel}
                    </div>
                  </div>
                </div>

                {/* Upgrade button */}
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={!canBuy}
                  style={{
                    padding:'8px 14px', borderRadius:12, fontWeight:900, fontSize:12,
                    flexShrink:0, transition:'all 0.15s', letterSpacing:0.3,
                    ...(maxed
                      ? { background:'#1a1a1a', color:'#555', border:'1px solid #333', cursor:'not-allowed' }
                      : canBuy
                        ? { background:'linear-gradient(145deg,#f5c842,#c97010)',
                            color:'#3d1a00', border:'1.5px solid #f0d060',
                            boxShadow:'0 3px 0 #7a3800, 0 5px 12px rgba(0,0,0,0.3)',
                            cursor:'pointer' }
                        : { background:'#2a1000', color:'#6b3300', border:'1px solid #4a2000', cursor:'not-allowed' }
                    ),
                  }}>
                  {maxed ? 'MAX' : canBuy ? 'Upgrade' : 'No pts'}
                </button>
              </div>

              {/* XP bar */}
              <div style={{
                height:6, borderRadius:6, overflow:'hidden',
                background:'rgba(255,255,255,0.07)',
              }}>
                <div style={{
                  height:'100%', borderRadius:6, transition:'width 0.4s ease',
                  width: `${pct}%`,
                  background: maxed
                    ? 'linear-gradient(90deg,#f5c842,#f0a020)'
                    : `linear-gradient(90deg,${info.color}cc,${info.color})`,
                  boxShadow: maxed ? `0 0 6px #f5c84270` : `0 0 6px ${info.color}55`,
                }} />
              </div>

              {/* Level dots */}
              <div style={{ display:'flex', gap:3, marginTop:5 }}>
                {Array.from({ length: maxLevel }).map((_, i) => (
                  <div key={i} style={{
                    flex:1, height:3, borderRadius:3,
                    background: i < currentLevel
                      ? info.color
                      : 'rgba(255,255,255,0.08)',
                    transition:'background 0.3s',
                  }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop:16, background:'rgba(245,200,66,0.06)',
        border:'1px solid rgba(245,200,66,0.15)',
        borderRadius:12, padding:'10px 14px', textAlign:'center',
        color:'#9a6030', fontSize:11, fontWeight:700,
      }}>
        Skill points earned by leveling up in battle
      </div>
    </div>
  );
}
