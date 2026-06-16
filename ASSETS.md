# Talon Clash — Asset System Rules

## CDN Base
All assets are served via jsDelivr from this repo.
Base URL: `https://cdn.jsdelivr.net/gh/francisadoche5/talon-clash@main`

## Folder Structure
assets/
├── battle/   ← victory/defeat headers, arena backgrounds
├── icons/    ← reward icons (EXP, glory, food, feathers, crowns)
├── ui/       ← buttons, panels, ribbons
├── sprites/  ← bird sprite sheets
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
8. Use WebP for large backgrounds
9. Use SVG for simple icons when possible
10. Naming convention: `what-it-is-type.ext`
    Examples: victory-header.png, continue-button.png, exp-icon.png

## Current Assets
### battle/
- `victoryHeader` — victory screen swords + crown artwork
- `defeatHeader`  — defeat screen header artwork

## How to Add a New Asset
1. Upload file to correct `assets/` subfolder on GitHub
2. Add entry to `assets.js` under the correct category
3. Import ASSETS in your component
4. Use `ASSETS.category.assetName` in your JSX
