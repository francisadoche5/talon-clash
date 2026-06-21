import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api';
import { getBirdUrl } from '../birdImages';
import ASSETS from '../config/assets';

const GloryIcon = ({ size = 16 }) => (
  <img src={ASSETS.icons.glory} alt="glory"
    style={{ width: size, height: size, display: 'inline', verticalAlign: 'middle', objectFit: 'contain' }} />
);

// Top-3 get a medal-coloured rank badge, everyone else gets a plain one —
// mirrors the look of the reference leaderboard the player shared.
const RANK_STYLES = {
  1: { bg: 'linear-gradient(145deg,#fff1a0,#f5a623 45%,#8b5e00 100%)', border: '#f0d060', text: '#3d1a00' },
  2: { bg: 'linear-gradient(145deg,#f3f6fa,#c7d2dc 45%,#7e8a96 100%)', border: '#e2e8f0', text: '#3d1a00' },
  3: { bg: 'linear-gradient(145deg,#ffd9b0,#e0883a 45%,#8a4a10 100%)', border: '#f0a860', text: '#3d1a00' },
};

function RankBadge({ rank }) {
  const style = RANK_STYLES[rank];
  if (style) {
    return (
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: style.bg, border: `1.5px solid ${style.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: 13, color: style.text,
        boxShadow: '0 2px 0 rgba(0,0,0,0.25)',
      }}>
        {rank}
      </div>
    );
  }
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 12, color: '#e8d5b7',
    }}>
      {rank}
    </div>
  );
}

function Row({ rank, name, glory, tier, highlight }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 14,
      background: highlight ? 'linear-gradient(145deg,#4ade80,#16a34a)' : 'rgba(0,0,0,0.22)',
      border: highlight ? '1.5px solid #86efac' : '1px solid rgba(255,255,255,0.08)',
    }}>
      <RankBadge rank={rank} />
      <img src={getBirdUrl(tier || 1)} alt="" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, color: highlight ? '#06270f' : '#f5e8c0', fontWeight: 800, fontSize: 13 }}
        className="truncate">
        {name || 'Player'}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        background: 'rgba(0,0,0,0.3)', borderRadius: 999, padding: '3px 8px',
      }}>
        <span style={{ color: highlight ? '#fff' : '#f5c842', fontWeight: 900, fontSize: 12 }}>
          {(glory || 0).toLocaleString()}
        </span>
        <GloryIcon size={14} />
      </div>
    </div>
  );
}

export default function Leaderboard({ player, onClose }) {
  const [entries, setEntries]   = useState([]);
  const [myRank,  setMyRank]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(false);

  useEffect(() => {
    if (!player?.telegram_id) return;
    getLeaderboard(player.telegram_id)
      .then(res => {
        setEntries(res.data?.leaderboard || []);
        setMyRank(res.data?.myRank || null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [player?.telegram_id]);

  // Is the player already visible inside the fetched top list?
  const myRowInList = entries.findIndex(e => e.telegram_id === player?.telegram_id);
  const showPinnedRow = myRank && myRowInList === -1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backdropFilter: 'blur(5px)', background: 'rgba(0,0,0,0.65)' }}>
      <div className="w-full max-w-sm rounded-t-[32px] overflow-hidden flex flex-col"
        style={{ maxHeight: '85vh',
          background: 'linear-gradient(160deg,#3d2200 0%,#241200 100%)',
          boxShadow: '0 -16px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,200,80,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="w-8" />
          <div className="flex flex-col items-center">
            <h2 className="font-black text-amber-100 text-xl tracking-wide">🏆 Leaderboard</h2>
            <p className="text-amber-400 text-[11px] font-bold">Ranked by Glory</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center text-red-300 font-black text-lg">✕</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
          {loading && (
            <p className="text-amber-400 text-sm text-center py-10 font-bold">Loading leaderboard…</p>
          )}
          {!loading && error && (
            <p className="text-red-300 text-sm text-center py-10 font-bold">Could not load the leaderboard. Try again later.</p>
          )}
          {!loading && !error && entries.length === 0 && (
            <p className="text-amber-400 text-sm text-center py-10 font-bold">No ranked players yet — be the first to earn Glory!</p>
          )}
          {!loading && !error && entries.map((e, i) => (
            <Row key={e.telegram_id}
              rank={i + 1}
              name={e.display_name || e.username}
              glory={e.glory}
              tier={e.evolution_tier}
              highlight={e.telegram_id === player?.telegram_id}
            />
          ))}

          {showPinnedRow && (
            <>
              <div className="text-center text-amber-500 text-xs font-black py-1">• • •</div>
              <Row rank={myRank.rank}
                name={myRank.display_name || myRank.username || 'You'}
                glory={myRank.glory}
                tier={myRank.evolution_tier}
                highlight
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
