import { useState, useEffect } from 'react';
import { getClans, getMyClan, createClan, joinClan, leaveClan } from '../api';

export default function Clans({ player, onRefresh }) {
  const [tab, setTab] = useState('browse');
  const [clans, setClans] = useState([]);
  const [myClan, setMyClan] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [clanName, setClanName] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [allClans, myData] = await Promise.all([
        getClans(),
        getMyClan(player.telegram_id)
      ]);
      setClans(allClans.data.clans || []);
      setMyClan(myData.data.clan);
      if (myData.data.clan) setTab('my');
    } catch {}
  }

  async function handleCreate() {
    if (!clanName.trim()) return;
    try {
      await createClan(player.telegram_id, clanName, '🦅', 'open');
      setMessage({ type: 'success', text: 'Clan created!' });
      setShowCreate(false);
      setClanName('');
      await loadData();
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleJoin(clanId) {
    try {
      await joinClan(player.telegram_id, clanId);
      setMessage({ type: 'success', text: 'Joined clan!' });
      await loadData();
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  }

  async function handleLeave() {
    try {
      await leaveClan(player.telegram_id);
      setMyClan(null);
      setTab('browse');
      await loadData();
      onRefresh();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed' });
    }
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('my')}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'my' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
          }`}>
          My Clan
        </button>
        <button onClick={() => setTab('browse')}
          className={`flex-1 py-2 rounded-xl font-bold text-sm ${
            tab === 'browse' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
          }`}>
          Browse
        </button>
      </div>

      {message && (
        <div className={`mb-3 p-2 rounded-xl text-center text-sm ${
          message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {tab === 'my' && (
        myClan ? (
          <div>
            <div className="bg-amber-900 rounded-2xl p-4 mb-4">
              <div className="text-3xl text-center mb-2">🦅</div>
              <div className="text-white font-black text-xl text-center">{myClan.name}</div>
              <div className="text-amber-400 text-sm text-center">
                Level {myClan.level} • {myClan.member_count}/{myClan.max_members} members
              </div>
              <div className="text-amber-300 text-center mt-1">
                Power: {myClan.total_power?.toLocaleString()}
              </div>
            </div>
            <button onClick={handleLeave}
              className="w-full bg-red-900 text-red-300 py-3 rounded-xl font-bold">
              Leave Clan
            </button>
          </div>
        ) : (
          <div className="text-center mt-8">
            <div className="text-4xl mb-4">👥</div>
            <div className="text-amber-400 mb-4">You are not in a clan</div>
            <button onClick={() => setShowCreate(true)}
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold">
              Create Clan (500🪶)
            </button>
          </div>
        )
      )}

      {tab === 'browse' && (
        <div className="flex flex-col gap-3">
          {!myClan && (
            <button onClick={() => setShowCreate(true)}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold">
              + Create Clan (500🪶)
            </button>
          )}
          {clans.map(clan => (
            <div key={clan.id} className="bg-amber-900 rounded-2xl p-4 flex items-center gap-3">
              <div className="text-3xl">🦅</div>
              <div className="flex-1">
                <div className="text-white font-bold">{clan.name}</div>
                <div className="text-amber-400 text-xs">
                  Lvl {clan.level} • {clan.member_count}/{clan.max_members}
                </div>
                <div className="text-amber-300 text-xs">
                  Power: {clan.total_power?.toLocaleString()}
                </div>
              </div>
              {!myClan && clan.join_type !== 'power' && (
                <button onClick={() => handleJoin(clan.id)}
                  className="bg-green-600 text-white text-xs px-3 py-2 rounded-xl font-bold">
                  Join
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-black text-lg mb-4 text-center">Create Clan</h3>
            <input
              value={clanName}
              onChange={e => setClanName(e.target.value)}
              placeholder="Clan name (3-18 chars)"
              maxLength={18}
              className="w-full bg-amber-800 text-white rounded-xl px-4 py-3 mb-4 outline-none placeholder-amber-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 bg-amber-800 text-amber-300 py-3 rounded-xl font-bold">
                Cancel
              </button>
              <button onClick={handleCreate}
                className="flex-1 bg-amber-500 text-amber-900 py-3 rounded-xl font-bold">
                Create (500🪶)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
