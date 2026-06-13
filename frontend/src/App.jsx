import { useState, useEffect } from 'react';
import { login } from './api';
import Lobby from './components/Lobby';
import Market from './components/Market';
import Inventory from './components/Inventory';
import Clans from './components/Clans';
import SkillTree from './components/SkillTree';
import Earn from './components/Earn';

const TABS = [
  { id: 'market', label: 'Market', icon: '🏪' },
  { id: 'inventory', label: 'Inventory', icon: '🎒' },
  { id: 'lobby', label: 'Lobby', icon: '⚔️' },
  { id: 'clans', label: 'Clans', icon: '👥' },
  { id: 'skills', label: 'Skills', icon: '🌳' },
  { id: 'earn', label: 'Earn', icon: '💰' }
];

export default function App() {
  const [player, setPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState('lobby');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initApp();
  }, []);

  async function initApp() {
    try {
      const tg = window.Telegram?.WebApp;
      if (tg) tg.ready();

      const telegramUser = tg?.initDataUnsafe?.user || {
        id: 123456789,
        first_name: 'Test',
        username: 'testuser'
      };

      const res = await login(telegramUser);
      setPlayer(res.data.player);
    } catch (err) {
      setError('Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function refreshPlayer() {
    if (player) {
      login({ id: player.telegram_id, first_name: player.display_name })
        .then(res => setPlayer(res.data.player));
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-amber-950">
      <div className="text-6xl mb-4 animate-bounce">🦅</div>
      <div className="text-amber-200 text-xl font-bold">Loading Talon Clash...</div>
      <div className="mt-4 w-48 h-2 bg-amber-900 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 animate-pulse rounded-full w-3/4"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-amber-950 p-6">
      <div className="text-4xl mb-4">❌</div>
      <div className="text-red-400 text-center">{error}</div>
      <button onClick={initApp} className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-full">
        Retry
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-amber-950 max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="bg-amber-900 px-4 py-2 flex items-center justify-between border-b border-amber-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-sm font-bold">
            {player?.level}
          </div>
          <div>
            <div className="text-amber-100 text-sm font-bold">
              {player?.display_name?.substring(0, 10) || 'Player'}
            </div>
            <div className="text-amber-400 text-xs">{player?.xp}/{player?.xp_needed} XP</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span>⚡</span>
            <span className="text-yellow-300">{Math.floor(player?.energy || 0)}/{player?.max_energy}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🪶</span>
            <span className="text-green-300">{player?.feathers?.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <span>🌾</span>
            <span className="text-orange-300">{player?.food?.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Evolution Banner */}
      <div className="bg-amber-800 py-1 px-4 text-center text-xs text-amber-300">
        {player?.evolution_name} • Power: {player?.power?.toLocaleString()}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'lobby' && <Lobby player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'market' && <Market player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'inventory' && <Inventory player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'clans' && <Clans player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'skills' && <SkillTree player={player} onRefresh={refreshPlayer} />}
        {activeTab === 'earn' && <Earn player={player} onRefresh={refreshPlayer} />}
      </div>

      {/* Bottom Nav */}
      <div className="bg-amber-900 border-t border-amber-700 flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${
              activeTab === tab.id ? 'bg-amber-700 text-white' : 'text-amber-400'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
