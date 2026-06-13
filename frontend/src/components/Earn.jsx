import { useState, useEffect } from 'react';
import { getQuests, claimQuest } from '../api';

export default function Earn({ player, onRefresh }) {
  const [tab, setTab] = useState('daily');
  const [quests, setQuests] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadQuests(); }, []);

  async function loadQuests() {
    try {
      const res = await getQuests(player.telegram_id);
      setQuests(res.data.quests || []);
    } catch {}
  }

  async function handleClaim(quest) {
    try {
      const res = await claimQuest(player.telegram_id, quest.id);
      setMessage({ type: 'success', text: `Claimed ${res.data.reward.amount} ${res.data.reward.type}!` });
      await loadQuests();
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  const filtered = quests.filter(q => q.reset_type === tab);

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('daily')}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'daily' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
          }`}>
          Daily
        </button>
        <button onClick={() => setTab('weekly')}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'weekly' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
          }`}>
          Weekly
        </button>
      </div>

      {message && (
        <div className={`mb-3 p-2 rounded-xl text-center text-sm ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* AdQuests Banner */}
      <div className="bg-orange-900 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <span className="text-3xl">📺</span>
        <div className="flex-1">
          <div className="text-white font-bold">AdQuests</div>
          <div className="text-orange-300 text-xs">Watch ads and earn 🪶 as reward!</div>
          <div className="text-orange-400 text-xs">+400🪶 per ad • 30 ads per day</div>
        </div>
        <button className="bg-purple-600 text-white text-xs px-3 py-2 rounded-xl font-bold">
          WATCH
        </button>
      </div>

      {/* Referral Banner */}
      <div className="bg-blue-900 rounded-2xl p-4 mb-4 flex items-center gap-3">
        <span className="text-3xl">👥</span>
        <div className="flex-1">
          <div className="text-white font-bold">Invite Friends</div>
          <div className="text-blue-300 text-xs">Earn 🪶 for every friend you invite</div>
        </div>
        <button className="bg-blue-500 text-white text-xs px-3 py-2 rounded-xl font-bold">
          INVITE
        </button>
      </div>

      {/* Quests */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center text-amber-400 mt-4">No quests available</div>
        ) : (
          filtered.map(quest => {
            const progress = Math.min(quest.progress, quest.requirement_amount);
            const percent = (progress / quest.requirement_amount) * 100;
            return (
              <div key={quest.id} className="bg-amber-900 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center justify-center text-2xl">
                    🪶
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{quest.title}</div>
                    <div className="text-amber-400 text-xs">
                      +{quest.reward_amount} {quest.reward_type}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(quest)}
                    disabled={!quest.is_completed || quest.is_claimed}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${
                      quest.is_claimed
                        ? 'bg-gray-700 text-gray-500'
                        : quest.is_completed
                        ? 'bg-amber-500 text-amber-900'
                        : 'bg-amber-800 text-amber-500 cursor-not-allowed'
                    }`}
                  >
                    {quest.is_claimed ? 'Done' : 'CLAIM'}
                  </button>
                </div>
                <div className="bg-amber-800 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all"
                    style={{ width: `${percent}%` }}>
                  </div>
                </div>
                <div className="text-amber-500 text-xs mt-1">
                  {progress}/{quest.requirement_amount}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
