# Talon Clash — Asset System Rules

## CDN Base
All assets are served via jsDelivr from this repo.
Base URL: `https://cdn.jsdelivr.net/gh/francisadoche5/talon-clash@main`

## Folder Structure
assets/
├── battle/   ← victory/defeat headers, arena backgrounds
├── icons/    ← reward icons (EXP, glory, feathers, crown)
├── ui/       ← app background, chest images
├── sprites/  ← bird sprite sheets + portrait images
└── emblems/  ← clan badges, rank icons (future)

## Asset Registry
All asset URLs live in ONE place only:
`frontend/src/config/assets.js`

## Rules for AI Tools
1. ALWAYS check `assets.js` before creating new assets
2. NEVER hardcode image URLs in components
3. ALWAYS import from `../config/assets` (or adjust path)
4. NEVER use ibb.co, imgur, or other external hosts
5. ALL new assets must be uploaded to the correct folder above
6. ALL new assets must be added to `assets.js` before use
7. Use transparent PNG for UI assets
8. Use PNG for backgrounds (WebP also accepted)
9. Use SVG for simple icons when possible
10. Files are uploaded with auto-generated names (file_000...) — use commit messages to identify them

## File Registry (what each file actually is)

### assets/battle/
| Filename | Purpose |
|---|---|
| `file_00000000c16471f498d60fa3da37e61d.png` | victory-header — swords + crown artwork |
| `file_0000000037cc71f481c27f128ad8b1f3.png` | defeat-header — defeat screen artwork |
| `file_00000000c95c71f4805ef91c107bb8d4.png` | arena-default-1 |
| `file_0000000024d871f4beb1767b0e213c8d.png` | arena-default-3 |
| `file_000000004f9471f4847da081ae2b715f.png` | arena-default-2 |
| `file_00000000ff5071f48e156987628ae7e6.png` | arena-default-4 |
| `file_000000003b1c71f4bf52d5c64e14ba94.png` | arena-epic-1 |
| `file_00000000cf6471f4a4fcf4476c748a2c.png` | arena-epic-2 |
| `file_00000000308871f4b8498e0a01b27cb5.png` | arena-epic-3 |
| `file_0000000002d471f4b1354dec2d19cf83.png` | arena-epic-4 |

### assets/icons/
| Filename | Purpose |
|---|---|
| `file_0000000006dc71f49873418884312ad8.png` | feathers-icon |
| `file_000000002a0471f4bdd814313b3a82d8.png` | crown-icon |
| `file_000000009c7071f4907f1bf38dedc54c.png` | glory-icon |
| `file_00000000ed4871f48d4571371ee180ab.png` | exp-icon |

### assets/ui/
| Filename | Purpose |
|---|---|
| `file_0000000060b471f4b3e4dcd50211c179.png` | app-bg — main app background |
| `file_00000000e5fc71f4933e1d844856cc37.png` | chest-common |
| `file_00000000338471f498849bccea66f7df.png` | chest-uncommon |
| `file_000000002fb871f4a915225a1259bad9.png` | chest-rare |
| `file_00000000a8c871f49a283a43f2bc0982.png` | chest-epic |
| `glow-common.webp` / `glow-uncommon.webp` / `glow-rare.webp` / `glow-epic.webp` / `glow-legendary.webp` | rarity glow burst — reward-reveal effect, all 5 tiers |
| `cloud-uncommon.webp` / `cloud-rare.webp` / `cloud-epic.webp` / `cloud-legendary.webp` | rarity cloud puff — reward-reveal effect (no common tier by design) |
| `magic-circle-common.webp` / `magic-circle-uncommon.webp` / `magic-circle-rare.webp` / `magic-circle-epic.webp` / `magic-circle-legendary.webp` | rotating rune circle — reward-reveal effect, all 5 tiers |
| `particles-common.webp` / `particles-uncommon.webp` / `particles-rare.webp` / `particles-epic.webp` / `particles-legendary.webp` | particle burst — reward-reveal effect, all 5 tiers |
| `floating-stars-common.webp` / `floating-stars-uncommon.webp` / `floating-stars-rare.webp` / `floating-stars-epic.webp` / `floating-stars-legendary.webp` | orbiting stars — reward-reveal effect, all 5 tiers |
| `reward-shine-common.webp` / `reward-shine-uncommon.webp` / `reward-shine-rare.webp` / `reward-shine-epic.webp` / `reward-shine-legendary.webp` | starburst shine behind reward item — reward-reveal effect, all 5 tiers |
| `collection-of-glowing-golden-bird-feathers.webp` | legendary-only drifting feathers flourish |
| `divine-feather-trail.webp` | system-wide trail behind the rising reward (all rarities) |

### assets/sprites/
| Filename | Purpose |
|---|---|
| `file_00000000a97471f4a6e4d20367884a33.png` | bird-tier1-sheet — Hatchling sprite sheet (1536×1024, 6 cols) |
| `file_000000009bc471f48c3308efa3c7d098.png` | bird-tier2-sheet — Fledgling sprite sheet |
| `file_00000000460471f4b811c0af85d0f18c.png` | bird-tier3-sheet — Sparrow Warrior sprite sheet |
| `file_000000000b9c71f49dec1841fc559486.png` | bird-tier4-sheet — Falcon Knight sprite sheet |
| `file_00000000063471f48f47da02ea25a8e1.png` | bird-tier5-sheet — War Hawk sprite sheet |
| `file_000000003e1c71f4bdcc16db3a72308d.png` | bird-tier6-sheet — Eagle Champion sprite sheet |
| `file_000000004c5471f4bd583d474681e6aa.png` | bird-tier7-sheet — Shadow Eagle sprite sheet |
| `file_000000008ed871f4adc0f69738442f0e.png` | bird-portrait-tier1 — Hatchling portrait |
| `file_0000000092c071f4918577ce6957faba.png` | bird-portrait-tier2 — Fledgling portrait |
| `file_00000000728471f4a959e552c7421eb3.png` | bird-portrait-tier3 — Sparrow Warrior portrait |
| `file_000000008e3c71f4bb71973d64c2b302.png` | bird-portrait-tier4 — Falcon Knight portrait |
| `file_0000000062b071f494c344932a2dc51d.png` | bird-portrait-tier5 — War Hawk portrait |
| `file_0000000086d071f4a979748dbde4b49d.png` | bird-portrait-tier6 — Eagle Champion portrait |
| `file_00000000621471f4a7e3996255b61f45.png` | bird-portrait-tier7 — Shadow Eagle portrait |

## How to Add a New Asset
1. Upload file to correct `assets/` subfolder on GitHub
2. Use the commit message to describe what it is (e.g. "arena-default-5.png")
3. Add entry to `assets.js` under the correct category using the actual filename
4. Update this file registry table above
5. Import ASSETS in your component
6. Use `ASSETS.category.assetName` in your JSX
