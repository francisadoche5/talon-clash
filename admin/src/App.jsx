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

  // LOGIN SCREEN
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
    <div className="min-h-screen bg-slate-900 flex flex-col">

      {/* TOP NAVBAR */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦅</span>
          <span className="text-amber-400 font-black text-lg">Talon Clash</span>
          <span className="bg-amber-500 text-amber-900 text-xs font-black px-2 py-0.5 rounded-lg">ADMIN</span>
        </div>
        <button onClick={logout}
          className="bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl">
          Logout
        </button>
      </div>

      {/* SCROLLABLE TAB BAR */}
      <div className="bg-slate-800 border-t border-slate-700 px-2 py-2 flex gap-2 overflow-x-auto sticky top-[60px] z-10"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-amber-900'
                : 'bg-slate-700 text-slate-300'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 overflow-y-auto max-w-2xl w-full mx-auto">

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-center text-sm font-bold ${
            message.type === 'success' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {loading && (
          <div className="text-center text-slate-400 mt-12 text-lg">Loading...</div>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab === 'Dashboard' && d && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">📊 Dashboard</h2>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-amber-400">{d.stats?.totalPlayers || 0}</div>
                <div className="text-slate-400 text-xs mt-1">Players</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-blue-400">{d.stats?.totalBattles || 0}</div>
                <div className="text-slate-400 text-xs mt-1">Battles</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <div className="text-3xl font-black text-green-400">{d.stats?.totalClans || 0}</div>
                <div className="text-slate-400 text-xs mt-1">Clans</div>
              </div>
            </div>

            <h3 className="text-white font-bold mb-3">🏆 Top Players</h3>
            <div className="bg-slate-800 rounded-2xl overflow-hidden">
              {d.stats?.topPlayers?.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border-b border-slate-700 last:border-0">
                  <div className="text-amber-400 font-black w-8 text-lg">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{p.display_name}</div>
                    <div className="text-slate-400 text-xs">{p.evolution_name}</div>
                  </div>
                  <div className="text-amber-300 font-bold text-sm">{p.power?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAYERS ── */}
        {activeTab === 'Players' && d && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">👥 Players</h2>
            <div className="flex flex-col gap-3">
              {d.players?.map(p => (
                <div key={p.telegram_id} className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-bold text-base">{p.display_name}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.is_banned ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                    }`}>
                      {p.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm mb-3">
                    <div><span className="text-slate-400">Power </span><span className="text-amber-300 font-bold">{p.power?.toLocaleString()}</span></div>
                    <div><span className="text-slate-400">Level </span><span className="text-slate-200">{p.level}</span></div>
                  </div>
                  <button onClick={async () => {
                    await banPlayer(p.telegram_id, 'Admin ban', !p.is_banned);
                    loadTab('Players');
                    showMsg(p.is_banned ? 'Player unbanned!' : 'Player banned!');
                  }}
                    className={`w-full py-2 rounded-xl text-sm font-bold ${
                      p.is_banned ? 'bg-green-700 text-white' : 'bg-red-700 text-white'
                    }`}>
                    {p.is_banned ? '✅ Unban Player' : '🚫 Ban Player'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STORE ── */}
        {activeTab === 'Store' && d && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">🛒 Store Items</h2>
            <div className="flex flex-col gap-3">
              {d.items?.map(item => (
                <div key={item.id} className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-white font-bold">{item.name}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400 mb-3">
                    <span>{item.category}</span>
                    <span className="text-amber-300 font-bold">{item.price} {item.currency}</span>
                  </div>
                  <button onClick={async () => {
                    await saveStoreItem({ ...item, is_active: !item.is_active });
                    loadTab('Store');
                    showMsg('Item updated!');
                  }}
                    className="w-full py-2 rounded-xl text-sm font-bold bg-amber-600 text-white">
                    Toggle {item.is_active ? 'OFF' : 'ON'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUESTS ── */}
        {activeTab === 'Quests' && d && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">⚔️ Quests</h2>
            <div className="flex flex-col gap-3">
              {d.quests?.map(quest => (
                <div key={quest.id} className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-white font-bold">{quest.title}</div>
                    <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-bold ${
                      quest.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {quest.is_active ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <div className="text-slate-400 text-sm mb-1">
                    {quest.reset_type} • {quest.requirement_amount} {quest.requirement_type}
                  </div>
                  <div className="text-amber-300 text-sm mb-3">
                    Reward: {quest.reward_amount} {quest.reward_type}
                  </div>
                  <button onClick={async () => {
                    await saveQuest({ ...quest, is_active: !quest.is_active });
                    loadTab('Quests');
                    showMsg('Quest updated!');
                  }}
                    className={`w-full py-2 rounded-xl text-sm font-bold ${
                      quest.is_active ? 'bg-red-700 text-white' : 'bg-green-700 text-white'
                    }`}>
                    {quest.is_active ? 'Disable Quest' : 'Enable Quest'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENTS ── */}
        {activeTab === 'Announcements' && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">📢 Announcements</h2>
            <div className="bg-slate-800 rounded-2xl p-4 mb-4">
              <h3 className="text-white font-bold mb-3">Send New</h3>
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
                className="w-full bg-amber-500 text-amber-900 py-3 rounded-xl font-bold">
                📣 Send to All Players
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

        {/* ── CONFIG ── */}
        {activeTab === 'Config' && d && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">⚙️ Config</h2>

            {/* Clan Creation Currency */}
            <div className="bg-slate-800 rounded-2xl p-4 mb-4">
              <div className="text-amber-400 font-bold text-sm mb-1">👥 Clan Creation Currency</div>
              <div className="text-slate-400 text-xs mb-3">Choose how players pay to create a clan</div>
              {(() => {
                const curr = d.config?.find(c => c.key === 'clan_creation_currency')?.value || 'feathers';
                const featherCost = d.config?.find(c => c.key === 'clan_creation_feathers')?.value || '500';
                const starCost = d.config?.find(c => c.key === 'clan_creation_stars')?.value || '50';
                return (
                  <div>
                    <div className="flex gap-2 mb-3">
                      <button onClick={async () => {
                        await updateConfig('clan_creation_currency', 'feathers');
                        loadTab('Config');
                        showMsg('Set to Feathers!');
                      }}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                          curr === 'feathers' ? 'bg-amber-500 text-amber-900' : 'bg-slate-700 text-slate-300'
                        }`}>
                        🪶 Feathers
                      </button>
                      <button onClick={async () => {
                        await updateConfig('clan_creation_currency', 'stars');
                        loadTab('Config');
                        showMsg('Set to Telegram Stars!');
                      }}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                          curr === 'stars' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                        ⭐ Stars
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="text-slate-400 text-xs mb-1">🪶 Feather cost</div>
                        <div className="flex gap-1">
                          <input defaultValue={featherCost} id="cfg-clan-feathers"
                            className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                          <button onClick={async () => {
                            const val = document.getElementById('cfg-clan-feathers').value;
                            await updateConfig('clan_creation_feathers', val);
                            loadTab('Config'); showMsg('Saved!');
                          }} className="bg-amber-500 text-amber-900 px-3 py-2 rounded-xl text-sm font-bold">Save</button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-slate-400 text-xs mb-1">⭐ Star cost</div>
                        <div className="flex gap-1">
                          <input defaultValue={starCost} id="cfg-clan-stars"
                            className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                          <button onClick={async () => {
                            const val = document.getElementById('cfg-clan-stars').value;
                            await updateConfig('clan_creation_stars', val);
                            loadTab('Config'); showMsg('Saved!');
                          }} className="bg-blue-500 text-white px-3 py-2 rounded-xl text-sm font-bold">Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex flex-col gap-3">
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
                      className={`w-full py-2 rounded-xl text-sm font-bold ${
                        cfg.value === 'true' ? 'bg-green-700 text-white' : 'bg-slate-600 text-slate-300'
                      }`}>
                      {cfg.value === 'true' ? '✅ ON — tap to disable' : '❌ OFF — tap to enable'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input defaultValue={cfg.value} id={`cfg-${cfg.key}`}
                        className="flex-1 bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                      <button onClick={async () => {
                        const val = document.getElementById(`cfg-${cfg.key}`).value;
                        await updateConfig(cfg.key, val);
                        loadTab('Config');
                        showMsg('Saved!');
                      }}
                        className="bg-amber-500 text-amber-900 px-4 py-2 rounded-xl text-sm font-bold">
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EVOLUTIONS ── */}
        {activeTab === 'Evolutions' && d && !loading && (
          <div>
            <h2 className="text-2xl font-black text-white mb-4">🧬 Evolutions</h2>
            <div className="flex flex-col gap-3">
              {d.evolutions?.map(evo => (
                <div key={evo.tier} className="bg-slate-800 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{evo.emoji}</span>
                    <div className="text-white font-bold text-lg">{evo.name}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Min Power</div>
                      <input defaultValue={evo.min_power} id={`min-${evo.tier}`}
                        className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs mb-1">Max Power</div>
                      <input defaultValue={evo.max_power} id={`max-${evo.tier}`}
                        className="w-full bg-slate-700 text-white rounded-xl px-3 py-2 text-sm outline-none" />
                    </div>
                  </div>
                  <button onClick={async () => {
                    const min = parseInt(document.getElementById(`min-${evo.tier}`).value);
                    const max = parseInt(document.getElementById(`max-${evo.tier}`).value);
                    await updateEvolution({ ...evo, min_power: min, max_power: max });
                    showMsg('Saved!');
                  }}
                    className="w-full bg-amber-500 text-amber-900 py-2 rounded-xl font-bold text-sm">
                    Save Changes
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
