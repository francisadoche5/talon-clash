import { useState, useEffect } from 'react';
import { getClans, getMyClan, createClan, joinClan, leaveClan, getPublicConfig } from '../api';
import { payWithStars } from '../starsPayment';
import ASSETS from '../config/assets';
import { EAGLE_ICON_URL } from '../birdImages';

// Extra API calls for apply/approval system
import axios from 'axios';
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://talon-clash.onrender.com';
const applyToClan = (telegramId, clanId) =>
  axios.post(`${API_BASE}/api/clans/apply`, { telegram_id: telegramId, clan_id: clanId });
const getPendingApplications = (clanId) =>
  axios.get(`${API_BASE}/api/clans/${clanId}/applications`);
const respondToApplication = (clanId, applicantId, action) =>
  axios.post(`${API_BASE}/api/clans/${clanId}/applications/${applicantId}`, { action });
const updateClanJoinType = (clanId, leaderId, joinType) =>
  axios.post(`${API_BASE}/api/clans/${clanId}/settings`, { leader_id: leaderId, join_type: joinType });

export default function Clans({ player, onRefresh }) {
  const [tab, setTab] = useState('browse');
  const [clans, setClans] = useState([]);
  const [myClan, setMyClan] = useState(null);
  const [myMembers, setMyMembers] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [clanName, setClanName] = useState('');
  const [newJoinType, setNewJoinType] = useState('open');
  const [message, setMessage] = useState(null);
  const [clanCurrency, setClanCurrency] = useState('feathers');
  const [clanCost, setClanCost] = useState({ feathers: 500, stars: 50 });
  const [sortBy, setSortBy] = useState('power');

  const isLeader = myClan && myClan.created_by === player?.telegram_id;

  useEffect(() => {
    loadData();
    getPublicConfig()
      .then(res => {
        const cfg = res.data?.config || [];
        const get = (key, fallback) => {
          const found = cfg.find(c => c.key === key);
          return found ? found.value : fallback;
        };
        setClanCurrency(get('clan_creation_currency', 'feathers'));
        setClanCost({
          feathers: parseInt(get('clan_creation_feathers', '500')) || 500,
          stars: parseInt(get('clan_creation_stars', '50')) || 50,
        });
      })
      .catch(() => {});
  }, []);

  async function loadData() {
    try {
      const [allClans, myData] = await Promise.all([
        getClans(sortBy),
        getMyClan(player.telegram_id)
      ]);
      setClans(allClans.data.clans || []);
      const clan = myData.data.clan;
      const members = myData.data.members || [];
      setMyClan(clan);
      setMyMembers(members);

      if (clan) {
        setTab('my');
        // Load pending applications if leader
        if (clan.created_by === player?.telegram_id) {
          try {
            const apps = await getPendingApplications(clan.id);
            setPendingApplications(apps.data.applications || []);
          } catch {}
        }
      }
    } catch {}
  }

  async function handleCreate() {
    if (!clanName.trim()) return;
    try {
      if (clanCurrency === 'stars') {
        payWithStars({
          player,
          product: 'clan_create',
          onSuccess: async () => {
            await createClan(player.telegram_id, clanName, '🦅', newJoinType);
            setShowCreate(false);
            setClanName('');
            await loadData();
            onRefresh();
            showMsg('success', 'Clan created!');
          },
          onError: (msg) => showMsg('error', msg || 'Could not process payment. Try again.'),
        });
        return;
      }
      await createClan(player.telegram_id, clanName, '🦅', newJoinType);
      showMsg('success', 'Clan created!');
      setShowCreate(false);
      setClanName('');
      await loadData();
      onRefresh();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed');
    }
  }

  async function handleJoinOrApply(clan) {
    try {
      if (clan.join_type === 'approval') {
        await applyToClan(player.telegram_id, clan.id);
        showMsg('success', 'Application sent! Waiting for approval.');
      } else {
        await joinClan(player.telegram_id, clan.id);
        showMsg('success', 'Joined clan!');
        await loadData();
        onRefresh();
      }
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed');
    }
  }

  async function handleLeave() {
    try {
      await leaveClan(player.telegram_id);
      setMyClan(null);
      setMyMembers([]);
      setTab('browse');
      await loadData();
      onRefresh();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed');
    }
  }

  async function handleApplication(applicantId, action) {
    try {
      await respondToApplication(myClan.id, applicantId, action);
      showMsg('success', action === 'accept' ? 'Member accepted!' : 'Application declined.');
      await loadData();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed');
    }
  }

  async function handleToggleJoinType() {
    if (!isLeader) return;
    const newType = myClan.join_type === 'open' ? 'approval' : 'open';
    try {
      await updateClanJoinType(myClan.id, player.telegram_id, newType);
      showMsg('success', `Clan is now ${newType === 'open' ? 'Open' : 'Approval required'}`);
      await loadData();
    } catch (err) {
      showMsg('error', err.response?.data?.error || 'Failed');
    }
  }

  function showMsg(type, text) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  // Clan power = sum of all members' individual power
  const calculatedClanPower = myMembers.reduce((sum, m) => sum + (m.players?.power || 0), 0);

  const costLabel = clanCurrency === 'stars'
    ? `${clanCost.stars} ⭐`
    : `${clanCost.feathers} feathers`;

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

      {/* MY CLAN TAB */}
      {tab === 'my' && (
        myClan ? (
          <div>
            {/* Clan Card */}
            <div className="bg-amber-900 rounded-2xl p-4 mb-4">
              <div className="flex justify-center mb-2"><img src={EAGLE_ICON_URL} alt="Clan" className="w-10 h-10 object-contain" /></div>
              <div className="text-white font-black text-xl text-center">{myClan.name}</div>
              <div className="text-amber-400 text-sm text-center">
                Level {myClan.level} • {myClan.member_count}/{myClan.max_members} members
              </div>
              <div className="text-amber-300 text-center mt-1 font-bold">
                Power: {calculatedClanPower.toLocaleString()}
              </div>

              {/* Join type badge */}
              <div className="flex justify-center mt-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  myClan.join_type === 'open'
                    ? 'bg-green-800 text-green-300'
                    : 'bg-yellow-800 text-yellow-300'
                }`}>
                  {myClan.join_type === 'open' ? '🔓 Open' : '🔒 Approval Required'}
                </span>
              </div>
            </div>

            {/* Leader Controls */}
            {isLeader && (
              <div className="mb-4">
                <div className="text-amber-400 text-xs font-bold mb-2">LEADER CONTROLS</div>
                <button onClick={handleToggleJoinType}
                  className={`w-full py-3 rounded-xl font-bold text-sm mb-2 ${
                    myClan.join_type === 'open'
                      ? 'bg-yellow-800 text-yellow-200'
                      : 'bg-green-800 text-green-200'
                  }`}>
                  {myClan.join_type === 'open'
                    ? '🔒 Switch to Approval Required'
                    : '🔓 Switch to Open Clan'}
                </button>

                {/* Pending applications */}
                {pendingApplications.length > 0 && (
                  <div className="bg-amber-900 rounded-2xl p-4 mb-2">
                    <div className="text-white font-bold mb-3">
                      Applications ({pendingApplications.length})
                    </div>
                    <div className="flex flex-col gap-2">
                      {pendingApplications.map(app => (
                        <div key={app.player_id}
                          className="bg-amber-800 rounded-xl p-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold text-white">
                            {app.players?.level || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-bold">
                              {app.players?.display_name || 'Player'}
                            </div>
                            <div className="text-amber-400 text-xs">
                              Power: {(app.players?.power || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApplication(app.player_id, 'accept')}
                              className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                              ✓
                            </button>
                            <button
                              onClick={() => handleApplication(app.player_id, 'decline')}
                              className="bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                              ✗
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Members list */}
            {myMembers.length > 0 && (
              <div className="bg-amber-900 rounded-2xl p-4 mb-4">
                <div className="text-amber-400 text-xs font-bold mb-3">MEMBERS</div>
                <div className="flex flex-col gap-2">
                  {myMembers.map((m, i) => (
                    <div key={m.player_id || i}
                      className="flex items-center gap-3 py-1">
                      <div className="w-7 h-7 rounded-full bg-amber-700 flex items-center justify-center text-xs font-bold text-white">
                        {m.players?.level || '?'}
                      </div>
                      <div className="flex-1 text-white text-sm">
                        {m.players?.display_name || 'Player'}
                        {m.role === 'leader' && (
                          <span className="ml-2 text-xs text-amber-400">👑</span>
                        )}
                      </div>
                      <div className="text-amber-300 text-xs">
                        ⚡ {(m.players?.power || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
              Create Clan ({costLabel})
            </button>
          </div>
        )
      )}

      {/* BROWSE TAB */}
      {tab === 'browse' && (
        <div className="flex flex-col gap-3">
          {!myClan && (
            <button onClick={() => setShowCreate(true)}
              className="w-full bg-amber-600 text-white py-3 rounded-xl font-bold">
              + Create Clan ({costLabel})
            </button>
          )}

          {/* Sort controls */}
          <div className="flex gap-2">
            <button onClick={() => setSortBy('power')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                sortBy === 'power' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
              }`}>
              By Power
            </button>
            <button onClick={() => setSortBy('level')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                sortBy === 'level' ? 'bg-amber-600 text-white' : 'bg-amber-900 text-amber-400'
              }`}>
              By Level
            </button>
          </div>

          {clans.map(clan => {
            const isFull = clan.member_count >= clan.max_members;
            return (
              <div key={clan.id} className="bg-amber-900 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <img src={EAGLE_ICON_URL} alt="Clan" className="w-9 h-9 object-contain flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="text-white font-bold">{clan.name}</div>
                      <div className="text-amber-400 text-xs">
                        👥 {clan.member_count}/{clan.max_members}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-amber-500 text-xs">Lvl {clan.level}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        clan.join_type === 'open'
                          ? 'bg-green-900 text-green-400'
                          : 'bg-yellow-900 text-yellow-400'
                      }`}>
                        {clan.join_type === 'open' ? '🔓 Open' : '🔒 Approval'}
                      </span>
                    </div>
                    <div className="text-amber-300 text-xs font-bold">
                      TOTAL ⚡ {(clan.total_power || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                {!myClan && (
                  <button
                    onClick={() => handleJoinOrApply(clan)}
                    disabled={isFull}
                    className={`mt-3 w-full py-2 rounded-xl text-sm font-bold ${
                      isFull
                        ? 'bg-amber-800 text-amber-600 cursor-not-allowed'
                        : clan.join_type === 'approval'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-600 text-white'
                    }`}>
                    {isFull ? 'FULL' : clan.join_type === 'approval' ? 'Apply' : 'Join'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Clan Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-white font-black text-lg mb-1 text-center">Create Clan</h3>
            <p className="text-amber-400 text-xs text-center mb-4">
              Cost: {costLabel} {clanCurrency === 'stars' ? '(Telegram Stars)' : '(Feathers)'}
            </p>
            <input
              value={clanName}
              onChange={e => setClanName(e.target.value)}
              placeholder="Clan name (3-18 chars)"
              maxLength={18}
              className="w-full bg-amber-800 text-white rounded-xl px-4 py-3 mb-4 outline-none placeholder-amber-500"
            />

            {/* Join type selector */}
            <div className="mb-4">
              <div className="text-amber-400 text-xs font-bold mb-2">JOIN TYPE</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewJoinType('open')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold ${
                    newJoinType === 'open'
                      ? 'bg-green-700 text-white'
                      : 'bg-amber-800 text-amber-400'
                  }`}>
                  🔓 Open
                </button>
                <button
                  onClick={() => setNewJoinType('approval')}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold ${
                    newJoinType === 'approval'
                      ? 'bg-yellow-700 text-white'
                      : 'bg-amber-800 text-amber-400'
                  }`}>
                  🔒 Approval
                </button>
              </div>
              <div className="text-amber-500 text-xs mt-1 text-center">
                {newJoinType === 'open'
                  ? 'Anyone can join instantly'
                  : 'Members must apply and be accepted by you'}
              </div>
            </div>

            <div className={`flex items-center justify-center gap-2 mb-4 py-2 rounded-xl text-sm font-bold ${
              clanCurrency === 'stars' ? 'bg-blue-900 text-blue-200' : 'bg-amber-800 text-amber-200'
            }`}>
              {clanCurrency === 'stars' ? '⭐ Pay with Telegram Stars' : 'Pay with Feathers'}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)}
                className="flex-1 bg-amber-800 text-amber-300 py-3 rounded-xl font-bold">
                Cancel
              </button>
              <button onClick={handleCreate}
                className="flex-1 bg-amber-500 text-amber-900 py-3 rounded-xl font-bold">
                Create ({costLabel})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
