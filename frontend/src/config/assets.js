const CDN = 'https://cdn.jsdelivr.net/gh/francisadoche5/talon-clash@main';

const ASSETS = {
  battle: {
    victoryHeader: `${CDN}/assets/battle/file_00000000c16471f498d60fa3da37e61d.png`,
    defeatHeader:  `${CDN}/assets/battle/file_0000000037cc71f481c27f128ad8b1f3.png`,
    // 4 default arena backgrounds (randomly picked each battle)
    arenaDefault: [
      `${CDN}/assets/battle/arena-default-1.png`,
      `${CDN}/assets/battle/arena-default-2.png`,
      `${CDN}/assets/battle/arena-default-3.png`,
      `${CDN}/assets/battle/arena-default-4.png`,
    ],
    // 4 epic arena backgrounds (randomly picked each battle)
    arenaEpic: [
      `${CDN}/assets/battle/arena-epic-1.png`,
      `${CDN}/assets/battle/arena-epic-2.png`,
      `${CDN}/assets/battle/arena-epic-3.png`,
      `${CDN}/assets/battle/arena-epic-4.png`,
    ],
  },
  icons: {
    exp:      `${CDN}/assets/icons/exp-icon.png`,
    glory:    `${CDN}/assets/icons/glory-icon.png`,
    feathers: `${CDN}/assets/icons/feathers-icon.png`,
    crown:    `${CDN}/assets/icons/crown-icon.png`,
  },
  ui: {
    appBg:        `${CDN}/assets/ui/app-bg.png`,
    chestCommon:   `${CDN}/assets/ui/chest-common.png`,
    chestUncommon: `${CDN}/assets/ui/chest-uncommon.png`,
    chestRare:     `${CDN}/assets/ui/chest-rare.png`,
    chestEpic:     `${CDN}/assets/ui/chest-epic.png`,
  },
  sprites: {
    // Sprite sheets for battle animation (1536×1024, 6 cols × 1 row)
    tier1: `${CDN}/assets/sprites/bird-tier1-sheet.png`,
    tier2: `${CDN}/assets/sprites/bird-tier2-sheet.png`,
    tier3: `${CDN}/assets/sprites/bird-tier3-sheet.png`,
    tier4: `${CDN}/assets/sprites/bird-tier4-sheet.png`,
    tier5: `${CDN}/assets/sprites/bird-tier5-sheet.png`,
    tier6: `${CDN}/assets/sprites/bird-tier6-sheet.png`,
    tier7: `${CDN}/assets/sprites/bird-tier7-sheet.png`,
    // Portrait images (used in Lobby, Inventory, etc.)
    portrait1: `${CDN}/assets/sprites/bird-portrait-tier1.png`,
    portrait2: `${CDN}/assets/sprites/bird-portrait-tier2.png`,
    portrait3: `${CDN}/assets/sprites/bird-portrait-tier3.png`,
    portrait4: `${CDN}/assets/sprites/bird-portrait-tier4.png`,
    portrait5: `${CDN}/assets/sprites/bird-portrait-tier5.png`,
    portrait6: `${CDN}/assets/sprites/bird-portrait-tier6.png`,
    portrait7: `${CDN}/assets/sprites/bird-portrait-tier7.png`,
  },
};

export default ASSETS;
