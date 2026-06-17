import { useState, useEffect } from 'react';
import ASSETS from '../config/assets';
import { getQuests, claimQuest } from '../api';

export default function Earn({ player, onRefresh }) {
  const [tab, setTab] = useState('daily');
  const [quests, setQuests] = useState([]);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState([]);

  const BOT_USERNAME = import.meta.env.VITE_BOT_USERNAME || 'Talonclashbot';
  const referralLink = `https://t.me/${BOT_USERNAME}?start=ref_${player?.telegram_id}`;

  useEffect(() => { loadQuests(); }, []);

  async function loadQuests() {
    try {
      const res = await getQuests(player.telegram_id);
      setQuests(res.data.quests || []);
      // Load referred players if available
      if (res.data.referred_players) {
        setInvitedFriends(res.data.referred_players);
      }
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

  function handleCopyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = referralLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleShare() {
    const text = `🦅 Join me in Talon Clash! Battle birds, level up, and earn rewards!\n\n${referralLink}`;
    if (window.Telegram?.WebApp?.openTelegramLink) {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('🦅 Join me in Talon Clash! Battle birds, level up, and earn rewards!')}`;
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      if (navigator.share) {
        navigator.share({ title: 'Talon Clash', text, url: referralLink });
      } else {
        handleCopyLink();
      }
    }
  }

  const filtered = quests.filter(q => q.reset_type === tab);

  // Placeholder invited friends from referral data on player
  const friends = invitedFriends.length > 0
    ? invitedFriends
    : (player?.referred_players || []);

  return (
    <div className="p-4">
      {/* Three-tab navigation: Daily | Weekly | Invite Friends */}
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
        <button onClick={() => setTab('invite')}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'invite' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
          }`}>
          Invite
        </button>
      </div>

      {message && (
        <div className={`mb-3 p-2 rounded-xl text-center text-sm ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* AdQuests Banner — shown on daily/weekly */}
      {(tab === 'daily' || tab === 'weekly') && (
        <div className="bg-orange-900 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-3xl">📺</span>
          <div className="flex-1">
            <div className="text-white font-bold">AdQuests</div>
            <div className="text-orange-300 text-xs">Watch ads and earn feathers as reward!</div>
            <div className="text-orange-400 text-xs">+400 feathers per ad • 30 ads per day</div>
          </div>
          <button className="bg-purple-600 text-white text-xs px-3 py-2 rounded-xl font-bold">
            WATCH
          </button>
        </div>
      )}

      {/* INVITE FRIENDS TAB */}
      {tab === 'invite' && (
        <div>
          {/* Referral Card */}
          <div className="bg-blue-900 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">👥</span>
              <div>
                <div className="text-white font-bold">Invite Friends</div>
                <div className="text-blue-300 text-xs">Earn feathers for every friend you invite</div>
              </div>
            </div>

            <div className="bg-blue-950 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
              <span className="text-blue-300 text-xs flex-1 truncate">{referralLink}</span>
              <button onClick={handleCopyLink}
                className={`flex-shrink-0 text-xs px-3 py-1 rounded-lg font-bold transition-all ${
                  copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                {copied ? '✅ Copied!' : 'Copy'}
              </button>
            </div>

            <button onClick={handleShare}
              className="w-full bg-blue-500 text-white py-2 rounded-xl font-bold text-sm">
              📤 Share via Telegram
            </button>
          </div>

          {/* Invited Friends List */}
          <div className="bg-amber-900 rounded-2xl p-4">
            <div className="text-white font-bold mb-3 flex items-center justify-between">
              <span>Invited Friends</span>
              <span className="text-amber-400 text-sm">{friends.length} invited</span>
            </div>

            {friends.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🫂</div>
                <div className="text-amber-400 text-sm">No friends invited yet</div>
                <div className="text-amber-600 text-xs mt-1">Share your link above to invite!</div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {friends.map((friend, i) => (
                  <div key={friend.telegram_id || i}
                    className="bg-amber-800 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold text-white">
                      {friend.level || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-bold">
                        {friend.display_name || friend.username || 'Player'}
                      </div>
                      <div className="text-amber-400 text-xs">
                        {friend.evolution_name || 'Fledgling'} • Power: {(friend.power || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-amber-300 text-xs font-bold"><img src={ASSETS.icons.feathers} alt="feathers" style={{width:14,height:14,display:"inline",verticalAlign:"middle"}} /><//div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DAILY / WEEKLY QUESTS */}
      {(tab === 'daily' || tab === 'weekly') && (
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
                    <div className="w-12 h-12 bg-green-900 rounded-xl flex items-center justify-center">
                      <img src={ASSETS.icons.feathers} alt="feathers" style={{width:28,height:28,objectFit:'contain'}} />
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
      )}
    </div>
  );
}
