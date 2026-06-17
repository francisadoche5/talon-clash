import { useState, useEffect } from 'react';
import ASSETS from '../config/assets';
import { getSkills, upgradeSkill } from '../api';

const SKILL_INFO = {
  attack: { name: 'Attack', icon: '⚔️', color: 'text-orange-400' },
  hp: { name: 'HP', icon: '❤️', color: 'text-red-400' },
  defense: { name: 'Defense', icon: '🛡️', color: 'text-blue-400' },
  crit: { name: 'Crit', icon: '💥', color: 'text-yellow-400' }
};

export default function SkillTree({ player, onRefresh }) {
  const [skills, setSkills] = useState(null);
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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-amber-200 font-bold">Skill Tree</div>
        <div className="bg-amber-800 px-3 py-1 rounded-full text-amber-300 text-sm">
          <img src={ASSETS.icons.feathers} alt="feathers" style={{width:16,height:16,display:"inline",verticalAlign:"middle"}} /> {player?.skill_points || 0} points
        </div>
      </div>

      {message && (
        <div className={`mb-3 p-2 rounded-xl text-center text-sm ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {Object.entries(SKILL_INFO).map(([key, info]) => {
          const currentLevel = skills?.[`${key}_level`] || 0;
          const maxLevel = 10;
          return (
            <div key={key} className="bg-amber-900 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <div className={`font-bold ${info.color}`}>{info.name}</div>
                    <div className="text-amber-500 text-xs">Level {currentLevel}/{maxLevel}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={currentLevel >= maxLevel || (player?.skill_points || 0) < 1}
                  className={`px-4 py-2 rounded-xl font-bold text-sm ${
                    currentLevel >= maxLevel
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : (player?.skill_points || 0) < 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-amber-500 text-amber-900 hover:bg-amber-400 active:scale-95'
                  }`}
                >
                  {currentLevel >= maxLevel ? 'MAX' : 'Upgrade'}
                </button>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: maxLevel }).map((_, i) => (
                  <div key={i} className={`flex-1 h-2 rounded-full ${
                    i < currentLevel ? 'bg-amber-400' : 'bg-amber-800'
                  }`}></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 bg-amber-900 rounded-xl p-3 text-center text-amber-400 text-xs">
        Skill points are earned by leveling up in battle
      </div>
    </div>
  );
}
