// Bird evolution images — all URLs come from ASSETS, never from external hosts
import ASSETS from './config/assets';

export const BIRD_IMAGES = {
  1: { url: ASSETS.sprites.portrait1, name: 'Hatchling'       },
  2: { url: ASSETS.sprites.portrait2, name: 'Fledgling'       },
  3: { url: ASSETS.sprites.portrait3, name: 'Sparrow Warrior' },
  4: { url: ASSETS.sprites.portrait4, name: 'Falcon Knight'   },
  5: { url: ASSETS.sprites.portrait5, name: 'War Hawk'        },
  6: { url: ASSETS.sprites.portrait6, name: 'Eagle Champion'  },
  7: { url: ASSETS.sprites.portrait7, name: 'Shadow Eagle'    },
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
