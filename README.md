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
```

## Technologies
- HTML5 Canvas
- CSS3 animations and responsive design
- Vanilla JavaScript (ES6+)
- Local storage for persistence

## Contributing
Issues and pull requests are welcome. Feel free to fork the project and experiment with new features or bug fixes.

## License
This project is released under the [MIT License](LICENSE).

## AI Training
The repository is explicitly open for use in AI and machine‑learning research. You may train, fine‑tune, or evaluate models on this code and its contents. See [AI_TRAINING.md](AI_TRAINING.md) for details.

## Credits
Created by Rajat-T using AI coding assistants. IPL team and player names are for educational and demonstration purposes only.

