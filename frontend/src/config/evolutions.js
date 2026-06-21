// Mirrors backend/config/evolutions.js — keep both in sync if tiers change.
// Used to show "progress to next bird" bars in the UI without a round trip.

export const EVOLUTIONS = [
  { tier: 1, name: 'Hatchling',       minPower: 0,      maxPower: 500 },
  { tier: 2, name: 'Fledgling',       minPower: 501,    maxPower: 2000 },
  { tier: 3, name: 'Sparrow Warrior', minPower: 2001,   maxPower: 5000 },
  { tier: 4, name: 'Falcon Knight',   minPower: 5001,   maxPower: 15000 },
  { tier: 5, name: 'War Hawk',        minPower: 15001,  maxPower: 40000 },
  { tier: 6, name: 'Eagle Champion',  minPower: 40001,  maxPower: 100000 },
  { tier: 7, name: 'Shadow Eagle',    minPower: 100001, maxPower: 999999999 },
];

export function getEvolutionByPower(power) {
  return EVOLUTIONS.find(e => power >= e.minPower && power <= e.maxPower) || EVOLUTIONS[0];
}

// Returns { current, next, progressPct, powerToNext } describing how close
// the player is to evolving into their next bird form. `next` is null and
// progressPct is 100 once the player has reached the final tier.
export function getEvolutionProgress(power) {
  const current = getEvolutionByPower(power);
  const next = EVOLUTIONS.find(e => e.tier === current.tier + 1) || null;

  if (!next) {
    return { current, next: null, progressPct: 100, powerToNext: 0 };
  }

  const tierSpan = current.maxPower - current.minPower + 1;
  const intoTier = Math.max(0, power - current.minPower);
  const progressPct = Math.max(0, Math.min(100, (intoTier / tierSpan) * 100));
  const powerToNext = Math.max(0, next.minPower - power);

  return { current, next, progressPct, powerToNext };
}
