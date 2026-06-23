const CDN = 'https://cdn.jsdelivr.net/gh/francisadoche5/talon-clash@main';

const ASSETS = {
  battle: {
    victoryHeader: `${CDN}/assets/battle/victory-header.webp`,
    defeatHeader:  `${CDN}/assets/battle/defeat-header.webp`,
    arenaDefault: [
      `${CDN}/assets/battle/arena-default-1.webp`,
      `${CDN}/assets/battle/arena-default-2.webp`,
      `${CDN}/assets/battle/arena-default-3.webp`,
      `${CDN}/assets/battle/arena-default-4.webp`,
    ],
    arenaEpic: [
      `${CDN}/assets/battle/arena-epic-1.webp`,
      `${CDN}/assets/battle/arena-epic-2.webp`,
      `${CDN}/assets/battle/arena-epic-3.webp`,
      `${CDN}/assets/battle/arena-epic-4.webp`,
    ],
  },
  icons: {
    feathers:    `${CDN}/assets/icons/feathers-icon.webp`,
    crown:       `${CDN}/assets/icons/crown-icon.webp`,
    glory:       `${CDN}/assets/icons/glory-icon.webp`,
    exp:         `${CDN}/assets/icons/exp-icon.webp`,
    energy:      `${CDN}/assets/icons/energy-icon.webp`,
    hammer:      `${CDN}/assets/icons/hammer-icon.webp`,
    booster:     `${CDN}/assets/icons/booster-icon.webp`,
    epicBooster: `${CDN}/assets/icons/epic-booster-icon.webp`,
    points:      `${CDN}/assets/icons/points-icon.webp`,
  },
  ui: {
    appBg:         `${CDN}/assets/ui/app-bg.webp`,
    chestCommon:   `${CDN}/assets/ui/chest-common.webp`,
    chestUncommon: `${CDN}/assets/ui/chest-uncommon.webp`,
    chestRare:     `${CDN}/assets/ui/chest-rare.webp`,
    chestEpic:     `${CDN}/assets/ui/chest-epic.webp`,
    lobbyBgDay:  [
      `${CDN}/assets/ui/Lobby%20bg%20day%201.webp`,
      `${CDN}/assets/ui/Lobby%20bg%20day%202.webp`,
    ],
    lobbyBgNight: [
      `${CDN}/assets/ui/Lobby%20bg%20night%201.webp`,
      `${CDN}/assets/ui/Lobby%20bg%20night%202.webp`,
    ],
  },
  // Rarity-tiered reward-reveal effects, used in the chest-opening animation
  // sequence (see Inventory.jsx RewardReveal). Each is keyed by rarity;
  // `cloud` has no `common` entry by design — the cloud layer is simply
  // skipped for common-rarity reveals.
  effects: {
    glow: {
      common:    `${CDN}/assets/ui/glow-common.webp`,
      uncommon:  `${CDN}/assets/ui/glow-uncommon.webp`,
      rare:      `${CDN}/assets/ui/glow-rare.webp`,
      epic:      `${CDN}/assets/ui/glow-epic.webp`,
      legendary: `${CDN}/assets/ui/glow-legendary.webp`,
    },
    cloud: {
      uncommon:  `${CDN}/assets/ui/cloud-uncommon.webp`,
      rare:      `${CDN}/assets/ui/cloud-rare.webp`,
      epic:      `${CDN}/assets/ui/cloud-epic.webp`,
      legendary: `${CDN}/assets/ui/cloud-legendary.webp`,
    },
    magicCircle: {
      common:    `${CDN}/assets/ui/magic-circle-common.webp`,
      uncommon:  `${CDN}/assets/ui/magic-circle-uncommon.webp`,
      rare:      `${CDN}/assets/ui/magic-circle-rare.webp`,
      epic:      `${CDN}/assets/ui/magic-circle-epic.webp`,
      legendary: `${CDN}/assets/ui/magic-circle-legendary.webp`,
    },
    particles: {
      common:    `${CDN}/assets/ui/particles-common.webp`,
      uncommon:  `${CDN}/assets/ui/particles-uncommon.webp`,
      rare:      `${CDN}/assets/ui/particles-rare.webp`,
      epic:      `${CDN}/assets/ui/particles-epic.webp`,
      legendary: `${CDN}/assets/ui/particles-legendary.webp`,
    },
    floatingStars: {
      common:    `${CDN}/assets/ui/floating-stars-common.webp`,
      uncommon:  `${CDN}/assets/ui/floating-stars-uncommon.webp`,
      rare:      `${CDN}/assets/ui/floating-stars-rare.webp`,
      epic:      `${CDN}/assets/ui/floating-stars-epic.webp`,
      legendary: `${CDN}/assets/ui/floating-stars-legendary.webp`,
    },
    rewardShine: {
      common:    `${CDN}/assets/ui/reward-shine-common.webp`,
      uncommon:  `${CDN}/assets/ui/reward-shine-uncommon.webp`,
      rare:      `${CDN}/assets/ui/reward-shine-rare.webp`,
      epic:      `${CDN}/assets/ui/reward-shine-epic.webp`,
      legendary: `${CDN}/assets/ui/reward-shine-legendary.webp`,
    },
    // Legendary-only flourish: feathers drifting down behind the reward.
    legendaryFeathers: `${CDN}/assets/ui/collection-of-glowing-golden-bird-feathers.webp`,
    // System-wide signature trail, used behind the reward as it rises.
    featherTrail: `${CDN}/assets/ui/divine-feather-trail.webp`,
  },
  sprites: {
    // Sprite sheets
    tier1: `${CDN}/assets/sprites/bird-tier1-sheet.webp`,
    tier2: `${CDN}/assets/sprites/bird-tier2-sheet.webp`,
    tier3: `${CDN}/assets/sprites/bird-tier3-sheet.webp`,
    tier4: `${CDN}/assets/sprites/bird-tier4-sheet.webp`,
    tier5: `${CDN}/assets/sprites/bird-tier5-sheet.webp`,
    tier6: `${CDN}/assets/sprites/bird-tier6-sheet.webp`,
    tier7: `${CDN}/assets/sprites/bird-tier7-sheet.webp`,
    // Portraits
    portrait1: `${CDN}/assets/sprites/bird-portrait-tier1.webp`,
    portrait2: `${CDN}/assets/sprites/bird-portrait-tier2.webp`,
    portrait3: `${CDN}/assets/sprites/bird-portrait-tier3.webp`,
    portrait4: `${CDN}/assets/sprites/bird-portrait-tier4.webp`,
    portrait5: `${CDN}/assets/sprites/bird-portrait-tier5.webp`,
    portrait6: `${CDN}/assets/sprites/bird-portrait-tier6.webp`,
    portrait7: `${CDN}/assets/sprites/bird-portrait-tier7.webp`,
  },
};

export default ASSETS;
