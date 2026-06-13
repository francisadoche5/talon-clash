import { useState, useEffect } from 'react';
import {
  adminLogin, getStats, getPlayers, banPlayer,
  getStoreItems, saveStoreItem, deleteStoreItem,
  getQuests, saveQuest, getAnnouncements,
  createAnnouncement, getConfig, updateConfig,
  getEvolutions, updateEvolution
} from './api';

const TABS = ['Dashboard', 'Players', 'Store', 'Quests', 'Announcements', 'Config', 'Evolutions'];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (token) loadTab(activeTab);
  }, [token, activeTab]);

  async function handleLogin() {
    try {
      const res = await adminLogin(username, password);
      localStorage.setItem('admin_token', res.data.token);
      setToken(res.data.token);
    } catch {
      setLoginError('Invalid credentials');
    }
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setToken(null);
  }

  async function loadTab(tab) {
    setLoading(true);
    try {
      let res;
      if (tab === 'Dashboard') res = await getStats();
      else if (tab === 'Players') res = await getPlayers();
      else if (tab === 'Store') res = await getStoreItems();
      else if (tab === 'Quests') res = await getQuests();
      else if (tab === 'Announcements') res = await getAnnouncements();
      else if (tab === 'Config') res = await getConfig();
      else if (tab === 'Evolutions') res = await getEvolutions();
      setData(prev => ({ ...prev, [tab]: res?.data }));
    } catch {}
    finally { setLoading(false); }
  }

  function showMsg(text, type = 'success') {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }

  if (!token) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-4xl text-center mb-2">🦅</div>
        <h1 className="text-white text-2xl font-black text-center mb-6">Talon Clash Admin</h1>
        {loginError && (
          <div className="bg-red-900 text-red-300 p-3 rounded-xl mb-4 text-sm text-center">
            {loginError}
          </div>
        )}
        <input value={username} onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 mb-3 outline-none" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 mb-4 outline-none" />
        <button onClick={handleLogin}
          className="w-full bg-amber-500 text-amber-900 py-3 rounded-xl font-black text-lg">
          Login
        </button>
      </div>
    </div>
  );

  const d = data[activeTab];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-48 bg-slate-800 min-h-screen p-4 flex flex-col">
        <div className="text-amber-400 font-black text-lg mb-6">🦅 Admin</div>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`text-left px-3 py-2 rounded-xl mb-1 text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-amber-500 text-amber-900' : 'text-slate-400 hover:text-white'
            }`}>
            {tab}
          </button>
        ))}
        <button onClick={logout} className="mt-auto text-red-400 text-sm px-3 py-2">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-center ${
            message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {loading && <div className="text-center text-slate-400 mt-8">Loading...</div>}

        {/* DASHBOARD */}
        {activeTab === 'Dashboard' && d && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Dashboard</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-amber-400">{d.stats?.totalPlayers || 0}</div>
                <div className="text-slate-400 text-sm mt-1">Total Players</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-blue-400">{d.stats?.totalBattles || 0}</div>
                <div className="text-slate-400 text-sm mt-1">Total Battles</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-6 text-center">
                <div className="text-3xl font-black text-green-400">{d.stats?.totalClans || 0}</div>
                <div className="text-slate-400 text-sm mt-1">Total Clans</div>
              </div>
            </div>
            <h3 className="text-white font-bold mb-3">Top Players</h3>
            <div className="bg-slate-800 rounded-2xl overflow-hidden">
              {d.stats?.topPlayers?.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-700">
                  <div className="text-amber-400 font-black w-6">#{i + 1}</div>
                  <div className="flex-1 text-white">{p.display_name}</div>
                  <div className="text-slate-400 text-sm">{p.evolution_name}</div>
                  <div className="text-amber-300 font-bold">{p.power?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYERS */}
        {activeTab === 'Players' && d && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Players</h2>
            <div className="bg-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400">Name</th>
                    <th className="text-left p-4 text-slate-400">Power</th>
                    <th className="text-left p-4 text-slate-400">Level</th>
                    <th className="text-left p-4 text-slate-400">Status</th>
                    <th className="p-4 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.players?.map(p => (
                    <tr key={p.telegram_id} className="border-b border-slate-700">
                      <td className="p-4 text-white">{p.display_name}</td>
                      <td className="p-4 text-amber-300">{p.power?.toLocaleString()}</td>
                      <td className="p-4 text-slate-300">{p.level}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          p.is_banned ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                        }`}>
                          {p.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={async () => {
                          await banPlayer(p.telegram_id, 'Admin ban', !p.is_banned);
                          loadTab('Players');
                          showMsg(p.is_banned ? 'Player unbanned!' : 'Player banned!');
                        }}
                          className={`text-xs px-3 py-1 rounded-lg font-bold ${
                            p.is_banned ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                          }`}>
                          {p.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STORE */}
        {activeTab === 'Store' && d && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Store Items</h2>
            <div className="bg-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400">Name</th>
                    <th className="text-left p-4 text-slate-400">Category</th>
                    <th className="text-left p-4 text-slate-400">Price</th>
                    <th className="text-left p-4 text-slate-400">Currency</th>
                    <th className="text-left p-4 text-slate-400">Active</th>
                    <th className="p-4 text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {d.items?.map(item => (
                    <tr key={item.id} className="border-b border-slate-700">
                      <td className="p-4 text-white">{item.name}</td>
                      <td className="p-4 text-slate-300">{item.category}</td>
                      <td className="p-4 text-amber-300">{item.price}</td>
                      <td className="p-4 text-slate-300">{item.currency}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {item.is_active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={async () => {
                          await saveStoreItem({ ...item, is_active: !item.is_active });
                          loadTab('Store');
                          showMsg('Item updated!');
                        }}
                          className="text-xs px-3 py-1 rounded-lg font-bold bg-amber-700 text-white">
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QUESTS */}
        {activeTab === 'Quests' && d && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Quests</h2>
            <div className="flex flex-col gap-3">
              {d.quests?.map(quest => (
                <div key={quest.id} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-white font-bold">{quest.title}</div>
                    <div className="text-slate-400 text-sm">
                      {quest.reset_type} • {quest.requirement_amount} {quest.requirement_type}
                    </div>
                    <div className="text-amber-300 text-sm">
                      Reward: {quest.reward_amount} {quest.reward_type}
                    </div>
                  </div>
                  <button onClick={async () => {
                    await saveQuest({ ...quest, is_active: !quest.is_active });
                    loadTab('Quests');
                    showMsg('Quest updated!');
                  }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      quest.is_active ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                    }`}>
                    {quest.is_active ? 'Active' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === 'Announcements' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Announcements</h2>
            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4">Send New Announcement</h3>
              <input id="ann-title" placeholder="Title"
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 mb-3 outline-none" />
              <textarea id="ann-message" placeholder="Message" rows={3}
                className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 mb-3 outline-none resize-none" />
              <button onClick={async () => {
                const title = document.getElementById('ann-title').value;
                const message = document.getElementById('ann-message').value;
                if (!title || !message) return;
                await createAnnouncement({ title, message, is_active: true });
                showMsg('Announcement sent!');
                loadTab('Announcements');
              }}
                className="bg-amber-500 text-amber-900 px-6 py-3 rounded-xl font-bold">
                Send to All Players
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {d?.announcements?.map(ann => (
                <div key={ann.id} className="bg-slate-800 rounded-xl p-4">
                  <div className="text-white font-bold">{ann.title}</div>
                  <div className="text-slate-400 text-sm mt-1">{ann.message}</div>
                  <div className="text-slate-500 text-xs mt-2">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONFIG */}
        {activeTab === 'Config' && d && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Feature Toggles & Config</h2>
            <div className="grid grid-cols-2 gap-4">
              {d.config?.map(cfg => (
                <div key={cfg.key} className="bg-slate-800 rounded-2xl p-4">
                  <div className="text-amber-400 font-bold text-sm mb-1">{cfg.key}</div>
                  <div className="text-slate-400 text-xs mb-3">{cfg.description}</div>
                  {cfg.value === 'true' || cfg.value === 'false' ? (
                    <button onClick={async () => {
                      await updateConfig(cfg.key, cfg.value === 'true' ? 'false' : 'true');
                      loadTab('Config');
                      showMsg('Updated!');
                    }}
                      className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        cfg.value === 'true' ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                      }`}>
                      {cfg.value === 'true' ? '✅ ON' : '❌ OFF'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input defaultValue={cfg.value} id={`cfg-${cfg.key}`}
                        className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm outline-none" />
                      <button onClick={async () => {
                        const val = document.getElementById(`cfg-${cfg.key}`).value;
                        await updateConfig(cfg.key, val);
                        loadTab('Config');
                        showMsg('Saved!');
                      }}
                        className="bg-amber-500 text-amber-900 px-3 py-2 rounded-lg text-sm font-bold">
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVOLUTIONS */}
        {activeTab === 'Evolutions' && d && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Evolution Thresholds</h2>
            <div className="flex flex-col gap-3">
              {d.evolutions?.map(evo => (
                <div key={evo.tier} className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
                  <div className="text-3xl">{evo.emoji}</div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{evo.name}</div>
                    <div className="flex gap-3 mt-2">
                      <div>
                        <div className="text-slate-400 text-xs">Min Power</div>
                        <input defaultValue={evo.min_power} id={`min-${evo.tier}`}
                          className="w-24 bg-slate-700 text-white rounded-lg px-2 py-1 text-sm outline-none" />
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Max Power</div>
                        <input defaultValue={evo.max_power} id={`max-${evo.tier}`}
                          className="w-24 bg-slate-700 text-white rounded-lg px-2 py-1 text-sm outline-none" />
                      </div>
                    </div>
                  </div>
                  <button onClick={async () => {
                    const min = parseInt(document.getElementById(`min-${evo.tier}`).value);
                    const max = parseInt(document.getElementById(`max-${evo.tier}`).value);
                    await updateEvolution({ ...evo, min_power: min, max_power: max });
                    showMsg('Saved!');
                  }}
                    className="bg-amber-500 text-amber-900 px-4 py-2 rounded-xl font-bold text-sm">
                    Save
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
