# Ultimate Stick Cricket – IPL Edition

A browser-based stick cricket game inspired by the Indian Premier League. The project uses only HTML5, CSS3, and vanilla JavaScript with all gameplay rendered on the HTML5 canvas. The entire codebase was produced with the assistance of AI coding tools and is meant to be easy to study or extend.

## Features
- **Multiple Game Modes** – Quick Play, Tournament, Survival, Challenge, and Run Chase.
- **Tournament Engine** – Full IPL-style tournament with six teams, group stages, automatic AI simulations, and a final.
- **Authentic Teams** – Choose from CSK, MI, RCB, KKR, GT, and SRH with real player names.
- **Responsive Canvas Graphics** – Animated stick figures, ball physics, crowd effects, and dynamic scoreboards.
- **Keyboard & Touch Controls** – Arrow keys (← → ↑ ↓) or mobile taps for shot selection.
- **Audio/Visual Feedback** – Particle effects, crowd animation, and synthesized sound.
- **High‑Score Tracking** – Local storage remembers your personal bests.
- **Tunable Physics** – Realistic wicket logic with centralized config for edges, LBW, catches, and timing.

## Tournament Details
- Six teams split into two groups.
- Round‑robin group stage (two matches per team) with user always chasing.
- Net Run Rate (NRR) used for tie‑breaking in the standings.
- Top team from each group reaches the final; win to claim the trophy!

## Getting Started
1. Clone or download this repository.
2. Open `index.html` in a modern browser, or serve the folder with any static web server.
3. Pick a mode, choose your team, and start swinging.

No build step or dependencies are required.

## Controls
- **Batting:** use the arrow keys for different shots.
- **Menu Navigation:** mouse or touch input.
- Supports desktop and mobile browsers.

## File Structure
```
index.html           # Main page and canvas container
css/style.css        # Styles for menus, overlays, and scoreboards
js/main.js           # Entry point that sets up the UI and game instance
js/game.js           # Core game state and match handling
js/tournament.js     # Tournament logic, standings, and simulations
js/teams.js          # Team and player definitions
js/components/*.js   # Ball, bat, bowler, fielder, stadium, wickets, etc.
js/config.js         # Central gameplay tuning (edges/LBW/catches/timing/wickets)
```

## Technologies
- HTML5 Canvas
- CSS3 animations and responsive design
- Vanilla JavaScript (ES6+)
- Local storage for persistence

## Gameplay Physics & Tuning

Recent updates improve realism and reduce unfair wickets. Wickets now fall mainly for mistimed shots, missed deliveries, or genuinely good balls. All tuning is centralized in `js/config.js` and is optional — if the file or any key is missing, the game falls back to safe defaults.

What changed by default
- Edges: Lower generation rates, hard-capped per difficulty, and not every edge is out. Some edges result in dots or scrappy singles.
- LBW: Reduced multipliers and a global cap so LBWs feel earned. Good timing very rarely triggers LBW.
- Timing: Slightly wider timing window to reduce cheap dismissals.
- Mishit catches: Lower default chance for a simple catch on lofted mishits.
- Bowled detection: Slightly stricter collision window to avoid phantom bowled; clean misses still hit the stumps realistically.

Central config (js/config.js)
- timing:
  - baseWindow: base timing window in pixels (before difficulty scaling). Default 26.
- edges:
  - capByDifficulty: maximum edge probability per difficulty, e.g. `{ amateur: 0.20, pro: 0.25, legend: 0.30 }`.
  - wicketOnEdgeBase: base chance an edge is out per bowler type, e.g. `{ Fast: 0.45, 'Fast Medium': 0.35, Spin: 0.25 }`.
  - wicketOnEdgeDiffScale: difficulty scaling for edge → wicket chance, e.g. `{ amateur: 0.7, pro: 1.0, legend: 1.15 }`.
  - wicketOnEdgeCap: upper limit on edge → wicket chance (default 0.6).
  - scrappySingleProb: chance that a non-dismissal edge results in a single (default 0.2).
  - bowlerEdgeMultiplier: edge generation multiplier by bowler type.
  - surpriseSlowFactorFast: extra edge factor for surprise slower balls from fast bowlers.
- lbw:
  - bowlerMultiplier: `{ Fast, 'Fast Medium', Spin }` multipliers for LBW likelihood.
  - bowlerMultiplierSpinHigh: multiplier applied for high-spin deliveries.
  - poorTimingFactor, wrongShotFactor, goodTimingSmallChanceFactor: situational LBW scalars.
  - cap: hard cap so LBW rarely feels unfair (default 0.18).
- catches:
  - mishitLoftedProb: chance a lofted mishit is simply caught (default 0.15).
- wickets:
  - marginXBallRadiusFactor: horizontal tolerance for bowled detection, in ball radii (default 0.5).
  - depthTopPaddingBallRadiusFactor: vertical tolerance above the crease for a valid bowled (default 0.6).

Safe tuning guidelines
- Prefer small, incremental changes (±10–20%) and test 2–3 overs per difficulty.
- Keep caps within [0.1, 0.4] for edges and [0.1, 0.25] for LBW to avoid extremes.
- If you increase `timing.baseWindow`, consider reducing boundary frequency by lowering bat exit speeds or swing in advanced tweaks.

Backwards compatibility
- If `js/config.js` is removed or any key is undefined, the code uses internal defaults. This prevents runtime errors and keeps gameplay working.

Quick testing tips
- Amateur: you should rarely see instant edge-outs on decent timing.
- Pro: edges and catches appear but don’t dominate; bowled mostly on genuine misses.
- Legend: more edges carry, but still capped to feel fair.

## Contributing
Issues and pull requests are welcome. Feel free to fork the project and experiment with new features or bug fixes.

## License
This project is released under the [MIT License](LICENSE).

## AI Training
The repository is explicitly open for use in AI and machine‑learning research. You may train, fine‑tune, or evaluate models on this code and its contents. See [AI_TRAINING.md](AI_TRAINING.md) for details.

## Credits
Created by Rajat-T using AI coding assistants. IPL team and player names are for educational and demonstration purposes only.
