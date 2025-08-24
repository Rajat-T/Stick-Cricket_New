# Ultimate Stick Cricket - IPL Edition

A fully-featured stick cricket game built using HTML5, CSS3, and JavaScript, inspired by IPL teams and players. Created entirely using AI tools (Qwen Coder, Kimi K2, Gemini 2.5 Pro, Deepseek).

## Features

- **Game Modes:** Quick Play, Tournament, Survival, Challenge, and Run Chase.
- **Tournament Mode:** Complete IPL-style tournament with 6 teams, group stages, and finals.
- **IPL Teams:** Select from real IPL teams (CSK, MI, RCB, KKR, GT, SRH) with authentic player lineups.
- **Canvas Graphics:** All gameplay and visuals rendered using HTML5 Canvas.
- **Responsive UI:** Modern, animated interface with scoreboard, over tracker, team selection, and scorecard.
- **Controls:** Arrow keys for shot selection (left, right, up, down) and touch support for mobile.
- **Physics:** Realistic ball movement, swing, bounce, and hit detection.
- **Audio & Visual Effects:** Particle effects, crowd animation, and synthesized sound feedback.
- **Scorecard:** Detailed match stats including batsman, bowler, runs, balls, 4s, 6s, and wicket info.
- **High Score Tracking:** Local storage for high scores.
- **Tournament Features:** Points table, fixtures, Net Run Rate (NRR) calculations, and elimination system.

## Tournament Mode Details

- **6 IPL Teams:** Randomly divided into 2 groups of 3 teams each
- **Group Stage:** Each team plays 2 matches within their group (round-robin)
- **Chase Format:** User always chases targets set by AI opponents
- **Net Run Rate:** Advanced tie-breaking system using cricket's standard NRR calculation
- **Points System:** 2 points for win, 0 for loss
- **Qualification:** Top team from each group advances to the final
- **Interactive UI:** 
  - Live points table with team standings, matches, wins, losses, points, and NRR
  - Complete fixtures showing all match results and upcoming games
  - User team highlighting in standings
  - Real-time tournament progression
- **Smart Progression:** Automatic AI match simulation and tournament advancement
- **Elimination Handling:** Proper user elimination detection and menu return functionality

## File Structure

- `index.html` — Main game UI and canvas.
- `css/style.css` — Responsive, animated styles for game elements and tournament UI.
- `js/main.js` — Entry point, initializes game and UI with global game instance.
- `js/game.js` — Core game logic, state management, event handling, and tournament integration.
- `js/tournament.js` — Complete tournament management system with NRR calculations and standings.
- `js/teams.js` — IPL team and player data.
- `js/components/ball.js` — Ball physics, swing, bounce, hit logic.
- `js/components/batsman.js` — Batsman character, swing animation.
- `js/components/bowler.js` — Bowler character, delivery animation.
- `js/components/character.js` — Base class for all stick figures.
- `js/components/fielder.js` — Fielder AI, catching logic.
- `js/components/stadium.js` — Stadium rendering, pitch, crowd, and features.
- `js/components/wickets.js` — Wickets and bails, collision and animation.

## How to Play

- **Select Mode:** Choose your preferred game mode and difficulty.
- **Pick Team:** Select your IPL team and view lineups.
- **Batting:** Use arrow keys (←, →, ↑, ↓) for different shots. Timing and shot selection matter!
- **Scoring:** Hit boundaries, chase targets, and avoid getting out.
- **View Scorecard:** Track your performance and stats.
- **Tournament Mode:** 
  - Select your team to enter the tournament
  - Play group stage matches (always chasing targets)
  - Check Points Table and Fixtures anytime during the tournament
  - Advance to the final if you top your group
  - Win the tournament to become champion!

## Recent Updates & Bug Fixes

### Tournament System Enhancements:
- **Fixed Match Result Recording:** Corrected winner/loser assignment in tournament matches
- **Improved Tournament Progression:** Automatic continuation after failed chases
- **Enhanced UI Functionality:** Fixed Points Table and Fixtures button accessibility
- **Game State Management:** Proper reset between tournament matches
- **UI Layout Fixes:** Resolved start game button overlap with team lineups
- **Menu Navigation:** Fixed "Back to Menu" button functionality when eliminated
- **Global Instance Management:** Ensured tournament functions work from all UI contexts
- **Error Handling:** Added comprehensive error handling for tournament operations

### Technical Improvements:
- Simplified winner/loser assignment logic to prevent match result errors
- Enhanced tournament overlay cleanup and state reset
- Improved game state transitions between matches
- Better separation of tournament and regular game modes

## Technologies Used

- HTML5 Canvas
- CSS3 (animations, gradients, responsive design)
- Vanilla JavaScript (ES6+)
- Local Storage (high scores)
- AI-generated code and assets

## Credits

- Created by Rajat-T using AI coding assistants.
- IPL teams and player names for educational/demo purposes only.
