// Bird evolution images hosted on ImgBB
export const BIRD_IMAGES = {
  1: {
    url: 'https://i.ibb.co/9kT3nZ7J/file-0000000014847246b80a48fe533f31d5.png',
    name: 'Hatchling',
  },
  2: {
    url: 'https://i.ibb.co/CKwfQtB7/file-000000007a1072469dd84108e55402bd.png',
    name: 'Fledgling',
  },
  3: {
    url: 'https://i.ibb.co/1fzHLSZH/file-0000000096487246931a2c0dbec005f0.png',
    name: 'Sparrow Warrior',
  },
  4: {
    url: 'https://i.ibb.co/hxxPRSjp/file-00000000013871f4a4b71b74836d094a.png',
    name: 'Falcon Knight',
  },
  5: {
    url: 'https://i.ibb.co/MD1hF5Kt/file-000000004e0471f4ac3392179d653351.png',
    name: 'War Hawk',
  },
  6: {
    url: 'https://i.ibb.co/5WBp9Vcb/file-00000000c7547243ad91c9ed0ef799d3.png',
    name: 'Eagle Champion',
  },
  7: {
    url: 'https://i.ibb.co/7twQ8YWx/file-000000007d3871f4ab13bc841fa74a5b.png',
    name: 'Shadow Eagle',
  },
};

export function getBirdUrl(tier) {
  return (BIRD_IMAGES[tier] || BIRD_IMAGES[1]).url;
}

export function getBirdName(tier) {
  return (BIRD_IMAGES[tier] || BIRD_IMAGES[1]).name;
}

// Eagle Champion used as generic icon across the app
export const EAGLE_ICON_URL = BIRD_IMAGES[6].url;

// CSS keyframes string — inject once into a <style> tag at app root
export const BIRD_ANIMATION_CSS = `
  @keyframes birdFloat {
    0%, 100% { transform: translateY(0px);    }
    50%       { transform: translateY(-10px);  }
  }
  @keyframes birdFloatFlip {
    0%, 100% { transform: scaleX(-1) translateY(0px);   }
    50%       { transform: scaleX(-1) translateY(-10px); }
  }
  @keyframes birdPulseGlow {
    0%, 100% { opacity: 1;   }
    50%       { opacity: 0.7; }
  }
  .bird-float      { animation: birdFloat      3s ease-in-out infinite; }
  .bird-float-flip { animation: birdFloatFlip  3s ease-in-out infinite; }
  .bird-glow-pulse { animation: birdPulseGlow  2s ease-in-out infinite; }
`;
