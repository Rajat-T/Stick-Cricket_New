class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.wrapper = document.getElementById('gameWrapper');
        this.gameState = 'menu';
        this.lastTime = 0;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.particles = [];
        this.crowd = [];
        this.initCrowd();
        this.initUI();
        this.initInput();
        this.highScore = localStorage.getItem('ultimateCricketHighScore') || 0;
        this.highScoreValueEl.textContent = this.highScore;
        this.stadiums = ['lords', 'mcg', 'wankhede'];
        this.currentStadium = 'lords';
        this.stadium = new Stadium(this.ctx, this.currentStadium);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.currentOver = [];
        this.userTeam = null;
        this.oppositionTeam = null;
        this.currentBowler = null;
        this.batsmanStats = [];
        this.bowlerStats = [];
        this.awaitingNextBall = false;
        requestAnimationFrame(t => this.gameLoop(t));
    }
    initUI() {
        this.menu = document.getElementById('gameMenu');
        this.teamSelection = document.getElementById('teamSelection');
        this.teamDisplay = document.getElementById('teamDisplay');
        this.scoreboard = document.getElementById('scoreboard');
        this.feedbackText = document.getElementById('feedbackText');
        this.overTracker = document.getElementById('overTracker');
        this.overBallsContainer = document.getElementById('overBalls');
        this.teamsContainer = document.getElementById('teamsContainer');
        this.userTeamPlayers = document.getElementById('userTeamPlayers');
        this.oppositionTeamPlayers = document.getElementById('oppositionTeamPlayers');
        this.userTeamName = document.getElementById('userTeamName');
        this.oppositionTeamName = document.getElementById('oppositionTeamName');
        this.bowlerNameEl = document.getElementById('bowlerName');
        this.bowlerTeamEl = document.getElementById('bowlerTeam');
        this.scoreEl = document.getElementById('score');
        this.oversEl = document.getElementById('overs');
        this.wicketsEl = document.getElementById('wickets');
        this.strikeRateEl = document.getElementById('strikeRate');
        this.foursEl = document.getElementById('fours');
        this.sixesEl = document.getElementById('sixes');
        this.highScoreValueEl = document.getElementById('highScoreValue');
        this.scorecardBtn = document.getElementById('scorecardBtn');
        this.scorecardDisplay = document.getElementById('scorecardDisplay');
        this.scorecardBody = document.getElementById('scorecardBody');
        this.backToGameBtn = document.getElementById('backToGameBtn');
        document.getElementById('quickPlayBtn').addEventListener('click', () => this.prepareGame('quick'));
        document.getElementById('tournamentBtn').addEventListener('click', () => this.prepareGame('tournament'));
        document.getElementById('survivalBtn').addEventListener('click', () => this.prepareGame('survival'));
        document.getElementById('challengeBtn').addEventListener('click', () => this.prepareGame('challenge'));
        document.getElementById('runChaseBtn').addEventListener('click', () => this.prepareGame('runChase'));
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        this.scorecardBtn.addEventListener('click', () => this.showScorecard());
        this.backToGameBtn.addEventListener('click', () => this.hideScorecard());
    }
    renderTeamSelection() {
        this.teamsContainer.innerHTML = '';
        IPL_TEAMS.forEach(team => {
            const wrapper = document.createElement('div');
            wrapper.className = 'team-card';
            wrapper.setAttribute('data-team-id', team.id);
            const logoBtn = document.createElement('button');
            logoBtn.className = 'team-logo';
            logoBtn.style.background = `linear-gradient(145deg, ${team.primaryColor}, ${this.adjustColor(team.primaryColor, -20)})`;
            logoBtn.style.color = team.secondaryColor;
            logoBtn.textContent = team.shortName;
            logoBtn.style.border = 'none';
            logoBtn.style.cursor = 'pointer';
            const nameBtn = document.createElement('button');
            nameBtn.className = 'team-name';
            nameBtn.textContent = team.name;
            nameBtn.style.background = 'transparent';
            nameBtn.style.border = 'none';
            nameBtn.style.cursor = 'pointer';
            nameBtn.style.color = 'inherit';
            logoBtn.addEventListener('click', (e) => {
                this.selectTeam(team, wrapper);
            });
            nameBtn.addEventListener('click', (e) => {
                this.selectTeam(team, wrapper);
            });
            wrapper.appendChild(logoBtn);
            wrapper.appendChild(nameBtn);
            wrapper.addEventListener('click', (e) => {
                this.selectTeam(team, wrapper);
            });
            this.teamsContainer.appendChild(wrapper);
        });
    }
    adjustColor(color, amount) {
        let usePound = false;
        if (color[0] == "#") {
            color = color.slice(1);
            usePound = true;
        }
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        if (r > 255) r = 255;
        else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amount;
        if (b > 255) b = 255;
        else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amount;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        const combined = g | (b << 8) | (r << 16);
        return (usePound ? "#" : "") + combined.toString(16).padStart(6, '0');
    }
    selectTeam(team, element) {
        const allCards = document.querySelectorAll('.team-card');
        allCards.forEach(card => {
            card.classList.remove('selected');
            card.style.borderColor = 'transparent';
            card.style.transform = 'scale(1)';
        });
        if (element) {
            element.classList.add('selected');
            element.style.borderColor = 'var(--secondary-color)';
            element.style.transition = 'transform 0.3s ease';
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1.02)';
            }, 300);
        } else {
            const teamCard = document.querySelector(`.team-card[data-team-id="${team.id}"]`);
            if (teamCard) {
                teamCard.classList.add('selected');
                teamCard.style.borderColor = 'var(--secondary-color)';
                teamCard.style.transition = 'transform 0.3s ease';
                teamCard.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    teamCard.style.transform = 'scale(1.02)';
                }, 300);
            }
        }
        this.userTeam = team;
        const oppositionTeams = IPL_TEAMS.filter(t => t.id !== team.id);
        this.oppositionTeam = oppositionTeams[Math.floor(Math.random() * oppositionTeams.length)];
        this.showFeedback(`${team.name} selected!`, team.primaryColor);
        setTimeout(() => {
            this.showTeamDisplay();
        }, 800);
    }
    showTeamDisplay() {
        this.teamSelection.style.display = 'none';
        this.teamDisplay.style.display = 'flex';
        this.userTeamName.textContent = `${this.userTeam.name} (Your Team)`;
        this.userTeamName.style.color = this.userTeam.primaryColor;
        this.userTeamName.style.textShadow = `0 0 10px ${this.userTeam.primaryColor}`;
        this.userTeamPlayers.innerHTML = '';
        this.userTeam.players.forEach(player => {
            const li = document.createElement('li');
            li.className = 'player-item';
            li.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-role">${player.role}</span>
            `;
            this.userTeamPlayers.appendChild(li);
        });
        this.oppositionTeamName.textContent = `${this.oppositionTeam.name}`;
        this.oppositionTeamName.style.color = this.oppositionTeam.primaryColor;
        this.oppositionTeamName.style.textShadow = `0 0 10px ${this.oppositionTeam.primaryColor}`;
        this.oppositionTeamPlayers.innerHTML = '';
        this.oppositionTeam.players.forEach(player => {
            const li = document.createElement('li');
            li.className = 'player-item';
            const isBowler = player.role.includes('Bowler') || player.role.includes('All-rounder');
            const bowlerIndicator = isBowler ? '<span class="bowler-indicator"></span>' : '';
            li.innerHTML = `
                <span class="player-name">${player.name}${bowlerIndicator}</span>
                <span class="player-role">${player.role}</span>
            `;
            this.oppositionTeamPlayers.appendChild(li);
        });
    }
    prepareGame(mode) {
        this.gameMode = mode;
        this.menu.style.display = 'none';
        this.teamSelection.style.display = 'flex';
        this.teamDisplay.style.display = 'none';
        this.gameState = 'team_selection';
        this.userTeam = null;
        this.oppositionTeam = null;
        const cards = document.querySelectorAll('.team-card');
        cards.forEach(card => {
            card.style.borderColor = 'transparent';
            card.classList.remove('selected');
        });
        if (this.teamsContainer) {
            this.teamsContainer.innerHTML = '';
        }
        this.renderTeamSelection();
        this.showFeedback('Select your team!', '#FFD700');
        this.teamSelection.style.pointerEvents = 'auto';
    }
    startGame() {
        if (!this.userTeam) {
            alert('Please select a team first!');
            return;
        }
        this.teamDisplay.style.display = 'none';
        this.wrapper.classList.add('playing');
        this.scoreboard.style.display = 'block';
        this.overTracker.style.display = 'block';
        this.scorecardBtn.style.display = 'block';
        this.scorecardBtn.style.top = '120px';
        this.scorecardBtn.style.right = '15px';
        this.wicketsTaken = 0;
        const difficulty = document.getElementById('difficulty').value;
        const difficulties = {
            amateur: {
                ballSpeed: 0.8,
                timingWindow: 1.2,
                swing: 40
            },
            pro: {
                ballSpeed: 1.0,
                timingWindow: 1.0,
                swing: 70
            },
            legend: {
                ballSpeed: 1.3,
                timingWindow: 0.8,
                swing: 100
            }
        };
        this.difficulty = difficulties[difficulty];
        this.currentStadium = this.stadiums[Math.floor(Math.random() * this.stadiums.length)];
        this.score = 0;
        this.balls = 0;
        this.fours = 0;
        this.sixes = 0;
        this.currentOver = [];
        this.updateOverTracker();
        this.batsmanStats = [];
        this.bowlerStats = [];
        if (this.gameMode === 'quick') {
            this.wicketsTaken = 0;
            this.maxWickets = 10;
            this.maxOvers = 5;
            this.targetRuns = null;
        } else if (this.gameMode === 'tournament') {
            this.wicketsTaken = 0;
            this.maxWickets = 10;
            this.maxOvers = 50;
            this.targetRuns = null;
        } else if (this.gameMode === 'survival') {
            this.wicketsRemaining = 1;
            this.maxOvers = 999;
            this.targetRuns = null;
        } else if (this.gameMode === 'runChase') {
            this.maxOvers = 10;
            this.maxWickets = 10;
            const diff = document.getElementById('difficulty').value;
            if (diff === 'amateur') this.targetRuns = 20 + Math.floor(Math.random() * 11);
            else if (diff === 'pro') this.targetRuns = 31 + Math.floor(Math.random() * 40);
            else this.targetRuns = 70 + Math.floor(Math.random() * 31);
            this.showFeedback(`Target: ${this.targetRuns} in 10 overs`, '#FFD700');
        } else if (this.gameMode === 'challenge') {
            this.wicketsTaken = 0;
            this.maxWickets = 10;
            this.maxOvers = 5;
            this.targetRuns = 50;
        }
        this.stadium = new Stadium(this.ctx, this.currentStadium);
        this.wicketsObject = new Wickets(this.ctx);
        this.batsman = new Batsman(this.ctx);
        this.ball = new Ball(this.ctx, this.difficulty, () => this.onBallMissed());
        this.fielders = this.createFielders();
        this.bowler = new Bowler(this.ctx);
        this.particles = [];
        this.selectBowler();
        this.gameState = 'between_balls';
        this.updateScoreboard();
        this.nextBall();
    }
    selectBowler() {
        const eligibleBowlers = this.oppositionTeam.players.filter(player =>
            (player.role.includes('Bowler') || player.role.includes('All-rounder'))
        );

        // Get current bowler's stats
        const currentBowlerStats = this.bowlerStats.find(b => b.name === this.currentBowler?.name);
        const currentBowlerBalls = currentBowlerStats?.balls || 0;

        // Only change bowler if:
        // 1. No current bowler OR
        // 2. Current bowler has completed an over (balls % 6 === 0)
        if (!this.currentBowler || currentBowlerBalls % 6 === 0) {
            if (eligibleBowlers.length === 0) {
                this.currentBowler = this.oppositionTeam.players[0];
            } else {
                // Try to pick a different bowler than the last one
                let newBowler;
                if (eligibleBowlers.length > 1) {
                    const otherBowlers = eligibleBowlers.filter(b => b.name !== this.currentBowler?.name);
                    newBowler = otherBowlers[Math.floor(Math.random() * otherBowlers.length)];
                } else {
                    newBowler = eligibleBowlers[0];
                }
                this.currentBowler = newBowler;
            }

            this.bowlerNameEl.textContent = this.currentBowler.name;
            this.bowlerTeamEl.textContent = this.oppositionTeam.shortName;
            this.bowlerTeamEl.style.background = `linear-gradient(145deg, ${this.oppositionTeam.primaryColor}, ${this.adjustColor(this.oppositionTeam.primaryColor, -20)})`;
            this.bowlerTeamEl.style.color = this.oppositionTeam.secondaryColor;
        }
    }
    updateBowlerStats(runs = 0, isWicket = false) {
        const bowlerName = this.currentBowler.name;
        let bowlerStat = this.bowlerStats.find(b => b.name === bowlerName);

        if (!bowlerStat) {
            bowlerStat = {
                name: bowlerName,
                runs: 0,
                wickets: 0,
                balls: 0
            };
            this.bowlerStats.push(bowlerStat);
        }

        bowlerStat.runs += runs;
        bowlerStat.balls++;
        if (isWicket) bowlerStat.wickets++;
    }
    showScorecard() {
        this.gameLoopPaused = true;
        this.scoreboard.style.display = 'none';
        this.overTracker.style.display = 'none';
        this.scorecardBtn.style.display = 'none';
        this.feedbackText.style.display = 'none';
        this.populateScorecard();
        this.scorecardDisplay.style.display = 'flex';
    }
    hideScorecard() {
        this.scorecardDisplay.style.display = 'none';
        this.scoreboard.style.display = 'block';
        this.overTracker.style.display = 'block';
        this.scorecardBtn.style.display = 'block';
        this.feedbackText.style.display = 'block';
        this.gameLoopPaused = false;
    }
    populateScorecard() {
        this.scorecardBody.innerHTML = '';
        this.batsmanStats.forEach(stats => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stats.name}</td>
                <td>${stats.bowler || '-'}</td>
                <td>${stats.howOut || 'Not Out'}</td>
                <td>${stats.runs}</td>
                <td>${stats.balls}</td>
                <td>${stats.fours}</td>
                <td>${stats.sixes}</td>
            `;
            this.scorecardBody.appendChild(row);
        });

        const bowlingBody = document.getElementById('bowlingScorecardBody');
        bowlingBody.innerHTML = '';

        this.bowlerStats.forEach(stat => {
            const overs = Math.floor(stat.balls / 6) + '.' + (stat.balls % 6);
            const economy = stat.balls > 0 ? (stat.runs / (stat.balls / 6)).toFixed(2) : '0.00';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.name}</td>
                <td>${overs}</td>
                <td>${stat.runs}</td>
                <td>${stat.wickets}</td>
                <td>${economy}</td>
            `;
            bowlingBody.appendChild(row);
        });
    }
    initInput() {
        this.input = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        document.addEventListener('keydown', e => this.handleKey(e.key, true));
        document.addEventListener('keyup', e => this.handleKey(e.key, false));
        this.wrapper.addEventListener('touchstart', e => {
            e.preventDefault();
            const touchX = e.touches[0].clientX;
            const rect = this.wrapper.getBoundingClientRect();
            if (touchX < rect.left + rect.width / 2) this.handleKey('ArrowLeft', true);
            else this.handleKey('ArrowRight', true);
        }, {
            passive: false
        });
        this.wrapper.addEventListener('touchend', e => {
            this.input.left = false;
            this.input.right = false;
        }, {
            passive: false
        });
    }
    handleKey(key, isPressed) {
        if (this.gameState !== 'playing') return;
        switch (key) {
            case 'ArrowLeft':
            case 'a':
                this.input.left = isPressed;
                if (isPressed) this.batsman.swing('left');
                break;
            case 'ArrowRight':
            case 'd':
                this.input.right = isPressed;
                if (isPressed) this.batsman.swing('right');
                break;
            case 'ArrowUp':
            case 'w':
                this.input.up = isPressed;
                if (isPressed) this.batsman.swing('up');
                break;
            case 'ArrowDown':
            case 's':
                this.input.down = isPressed;
                if (isPressed) this.batsman.swing('down');
                break;
        }
    }
    resizeCanvas() {
        const rect = this.wrapper.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        if (this.stadium) this.stadium.draw();
        if (this.wicketsObject) this.wicketsObject.draw();
        if (this.batsman) this.batsman.draw();
        if (this.bowler) this.bowler.draw();
        if (this.fielders) this.fielders.forEach(f => f.draw());
    }
    gameLoop(timestamp) {
        if (this.gameLoopPaused) {
            requestAnimationFrame(t => this.gameLoop(t));
            return;
        }

        if ((this.gameState === 'playing' || this.gameState === 'between_balls') &&
            !this.ball.isActive && !this.awaitingNextBall && !this.isGameOver()) {
            this.awaitingNextBall = true;
            setTimeout(() => this.nextBall(), 1200);
        }

        if (this.lastTime === 0) {
            this.lastTime = timestamp;
        }
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stadium.draw();
        this.drawCrowd();
        if (this.gameState === 'playing' || this.gameState === 'between_balls') {
            this.bowler.update(deltaTime);
            this.ball.update(deltaTime);
            this.batsman.update(deltaTime);
            this.wicketsObject.update(deltaTime);
            this.fielders.forEach(f => f.update(deltaTime, this.ball));
            this.checkHit();
            this.fielders.forEach(f => f.draw());
            this.bowler.draw();
            this.wicketsObject.draw();
            this.ball.draw();
            this.batsman.draw();
        }
        this.updateParticles(deltaTime);
        this.drawParticles();
        requestAnimationFrame(t => this.gameLoop(t));
    }
    createFielders() {
        const positions = [
            { x: 0.7, y: 0.3 },
            { x: 0.3, y: 0.3 },
            { x: 0.5, y: 0.35 },
            { x: 0.2, y: 0.5 },
            { x: 0.8, y: 0.5 },
            { x: 0.6, y: 0.4 },
            { x: 0.4, y: 0.4 },
            { x: 0.1, y: 0.5 },
            { x: 0.9, y: 0.5 }
        ];
        return positions.map(p => new Fielder(this.ctx, p.x, p.y));
    }
    initCrowd() {
        this.crowd = [];
        for (let i = 0; i < 100; i++) {
            this.crowd.push({
                x: Math.random(),
                y: 0.9 + Math.random() * 0.1,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                speed: 0.2 + Math.random() * 0.5
            });
        }
    }
    drawCrowd() {
        const W = this.canvas.width;
        const H = this.canvas.height;
        this.crowd.forEach(person => {
            const x = W * person.x;
            const y = H * person.y;
            this.ctx.fillStyle = person.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, person.size, 0, Math.PI * 2);
            this.ctx.fill();
            person.x += (Math.random() - 0.5) * 0.01 * person.speed;
            if (person.x < 0) person.x = 0;
            if (person.x > 1) person.x = 1;
        });
    }
    checkHit() {
        if (this.batsman.isSwinging && this.ball.isActive && this.ball.isHittable()) {
            const result = this.ball.attemptHit(this.batsman.swingDirection);
            this.batsman.isSwinging = false;
            this.showFeedback(`${result.runs} · ${result.timing}`, result.color);
            this.playSound('hit', 0.8 + Math.random() * 0.2, 0.5);
            this.createParticles(this.ball.pos.x, this.ball.pos.y - this.ball.pos.z, 10, result.color);
            const isMishit = result.timingScore < 2;
            const isLofted = this.ball.vel.z > 40;
            const isCaught = isMishit && isLofted && Math.random() < 0.33;
            if (isCaught) {
                this.handleWicket('Caught!', result.runs);
                const catcher = this.fielders.sort((a, b) =>
                    Math.hypot(a.x - this.ball.pos.x, a.y - this.ball.pos.y) -
                    Math.hypot(b.x - this.ball.pos.x, b.y - this.ball.pos.y)
                )[0];
                if (catcher) {
                    catcher.isCatching = true;
                    this.ball.travelTo(catcher.x, catcher.y);
                }
            } else {
                this.score += result.runs;
                this.updateBatsmanStats('runs', result.runs);
                this.updateBowlerStats(result.runs);
                if (this.gameMode === 'runChase' && this.score >= this.targetRuns) {
                    this.showFeedback(`Chase Complete! ${this.score}/${this.targetRuns}`, '#01FF70');
                    setTimeout(() => this.endGame(), 2000);
                    return;
                }
                if (result.runs === 4) this.fours++;
                if (result.runs === 6) this.sixes++;
                this.recordBallOutcome(result.runs);
                this.incrementBall();
                this.updateScoreboard();
                if (this.gameMode === 'challenge' && this.score >= this.targetRuns) {
                    this.showFeedback('Target Achieved!', '#01FF70');
                    setTimeout(() => this.endGame(), 3000);
                    return;
                }
                if (result.runs === 0) {
                    this.showFeedback('DOT BALL', '#FFFFFF');
                } else {
                    this.playSound('cheer', 1, 0.2);
                    if (result.runs >= 4) {
                        this.createParticles(this.ball.pos.x, 50, 20, '#FFD700');
                        if (result.runs === 6) {
                            this.wrapper.style.animation = 'shake 0.5s';
                            setTimeout(() => this.wrapper.style.animation = '', 500);
                        }
                    }
                    this.createParticles(this.ball.pos.x, 50, 8, '#ffffff');
                }
                this.ball.isActive = false;
                this.gameState = 'between_balls';
                this.awaitingNextBall = true;
                setTimeout(() => {
                    if (this.gameState === 'between_balls') {
                        this.nextBall();
                    }
                }, result.runs === 0 ? 1500 : 2000);
            }
        }
    }
    onBallMissed() {
        if (this.ball.pos.z <= 5 && this.wicketsObject.checkCollision(this.ball)) {
            this.wicketsObject.hit();
            this.handleWicket('Bowled!', 0);
            return;
        }
        if (this.ball.pos.y > this.canvas.height) {
            this.ball.isActive = false;
            this.showFeedback('0 · Miss', '#FFA500');
            this.recordBallOutcome(0);
            this.incrementBall();
            this.updateScoreboard();
            // FIX: Update bowler stats for dot balls
            this.updateBowlerStats(0);
            this.gameState = 'between_balls';
            this.awaitingNextBall = true;
            setTimeout(() => this.nextBall(), 1500);
        }
    }
    handleWicket(type, runsScoredOnWicket) {
        this.playSound('wicket', 1, 0.6);
        this.playSound('cheer', 0.8, 0.3);
        this.wicketsTaken++;
        this.updateBatsmanStats('wicket', type, runsScoredOnWicket);
        this.recordBallOutcome('W');
        this.incrementBall();
        this.updateScoreboard();
        this.showFeedback(`0 · ${type}`, '#FF4136');
        this.ball.isActive = false;
        this.updateBowlerStats(runsScoredOnWicket, true);
        this.gameState = 'between_balls';
        if (this.isGameOver()) {
            setTimeout(() => this.endGame(), 2000);
        } else {
            this.awaitingNextBall = true;
            this.gameLoopPaused = false;
            setTimeout(() => this.nextBall(), 2000);
        }
    }
    updateBatsmanStats(eventType, value, runsScored = 0) {
        let batsmanIndex = this.batsmanStats.findIndex(stat => stat.howOut === null || stat.howOut === undefined);
        let batsmanStatEntry;
        if (batsmanIndex === -1) {
            const nextBatsmanIndex = this.batsmanStats.length;
            if (nextBatsmanIndex < this.userTeam.players.length) {
                const nextBatsmanName = this.userTeam.players[nextBatsmanIndex].name;
                batsmanStatEntry = {
                    name: nextBatsmanName,
                    runs: 0,
                    balls: 0,
                    fours: 0,
                    sixes: 0,
                    howOut: null,
                    bowler: null
                };
                this.batsmanStats.push(batsmanStatEntry);
                batsmanIndex = this.batsmanStats.length - 1;
            } else {
                console.warn("No more batsmen to track stats for.");
                return;
            }
        } else {
            batsmanStatEntry = this.batsmanStats[batsmanIndex];
        }
        if (eventType === 'runs') {
            batsmanStatEntry.runs += value;
            batsmanStatEntry.balls += 1;
            if (value === 4) batsmanStatEntry.fours += 1;
            if (value === 6) batsmanStatEntry.sixes += 1;
        } else if (eventType === 'wicket') {
            batsmanStatEntry.howOut = value;
            batsmanStatEntry.balls += 1;
            batsmanStatEntry.runs += runsScored;
            if (runsScored === 4) batsmanStatEntry.fours += 1;
            if (runsScored === 6) batsmanStatEntry.sixes += 1;
            batsmanStatEntry.bowler = this.currentBowler.name;
        }
    }
    recordBallOutcome(outcome) {
        const outcomeStr = (outcome === 'W') ? 'W' : outcome.toString();
        this.currentOver.push(outcomeStr);
        this.updateOverTracker();
    }
    incrementBall() {
        this.balls++;
        if (this.balls % 6 === 0) {
            const lastBall = this.currentOver[this.currentOver.length - 1] || '·';
            this.showFeedback(`Over complete – last ball: ${lastBall}`, '#FFD700');
            this.currentOver = [];
            this.updateOverTracker();
            this.selectBowler();
        }
    }
    updateOverTracker() {
        this.overBallsContainer.innerHTML = '';
        this.currentOver.forEach(outcome => {
            const ballEl = document.createElement('div');
            ballEl.className = 'ball-outcome';
            ballEl.textContent = outcome;
            if (outcome === 'W') {
                ballEl.classList.add('wicket');
            } else if (outcome === '4') {
                ballEl.classList.add('boundary');
            } else if (outcome === '6') {
                ballEl.classList.add('six');
            }
            this.overBallsContainer.appendChild(ballEl);
        });
        const remaining = 6 - this.currentOver.length;
        for (let i = 0; i < remaining; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'ball-outcome';
            placeholder.textContent = '•';
            this.overBallsContainer.appendChild(placeholder);
        }
    }
    nextBall() {
        this.awaitingNextBall = false;
        this.gameLoopPaused = false;
        if (this.isGameOver()) {
            this.endGame();
            return;
        }
        this.ball.isActive = false;
        this.gameState = 'playing';
        this.wicketsObject.reset();
        this.bowler.startDelivery();
        const ballTypes = ['fast', 'medium', 'spin'];
        const ballType = ballTypes[Math.floor(Math.random() * ballTypes.length)];
        const side = Math.random() > 0.5 ? 'off' : 'leg';
        this.ball.bowl(ballType, side);
    }
    isGameOver() {
        const oversBowled = Math.floor(this.balls / 6);
        if (this.gameMode === 'tournament') {
            return this.wicketsTaken >= this.maxWickets;
        }
        if (this.gameMode === 'quick') {
            return oversBowled >= this.maxOvers || this.wicketsTaken >= this.maxWickets;
        }
        if (this.gameMode === 'challenge') {
            return oversBowled >= this.maxOvers;
        }
        if (this.gameMode === 'survival') {
            return this.wicketsRemaining <= 0;
        }
        if (this.gameMode === 'runChase') {
            return this.wicketsTaken >= this.maxWickets || oversBowled >= this.maxOvers || this.score >= this.targetRuns;
        }
        return false;
    }
    endGame() {
        this.gameState = 'game_over';
        let message = `Game Over! Score: ${this.score}`;
        if (this.gameMode === 'challenge') {
            if (this.score >= this.targetRuns) {
                message = `Target Achieved! ${this.score}/${this.targetRuns}`;
            } else {
                message = `Target Missed! ${this.score}/${this.targetRuns}`;
            }
        } else if (this.gameMode === 'runChase') {
            if (this.score >= this.targetRuns) {
                message = `Chase Complete! ${this.score}/${this.targetRuns}`;
            } else {
                message = `Chase Failed! ${this.score}/${this.targetRuns}`;
            }
        }
        this.showFeedback(message, '#FFDC00');
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('ultimateCricketHighScore', this.highScore);
            this.highScoreValueEl.textContent = this.highScore;
        }
        setTimeout(() => {
            this.menu.style.display = 'flex';
            this.wrapper.classList.remove('playing');
            this.scoreboard.style.display = 'none';
            this.overTracker.style.display = 'none';
            this.scorecardBtn.style.display = 'none';
            this.feedbackText.style.opacity = 0;
            this.hideScorecard();
        }, 3000);
    }
    updateScoreboard() {
        this.scoreEl.textContent = this.score;
        this.wicketsEl.textContent = this.wicketsTaken + '/' + this.maxWickets;
        if (this.gameMode === 'runChase') {
            this.oversEl.textContent = `${Math.floor(this.balls / 6)}.${this.balls % 6} (T: ${this.targetRuns})`;
        } else {
            this.oversEl.textContent = `${Math.floor(this.balls / 6)}.${this.balls % 6}`;
        }
        this.strikeRateEl.textContent = this.balls > 0 ? (this.score / this.balls * 100).toFixed(2) : '0.00';
        this.foursEl.textContent = this.fours;
        this.sixesEl.textContent = this.sixes;

        // Add animation class and remove it after animation ends
        const elementsToAnimate = [this.scoreEl, this.wicketsEl, this.oversEl, this.foursEl, this.sixesEl, this.strikeRateEl];
        elementsToAnimate.forEach(el => {
            el.classList.add('score-update');
            el.addEventListener('animationend', () => {
                el.classList.remove('score-update');
            }, { once: true });
        });
    }

    showFeedback(text, color) {
        this.feedbackText.textContent = text;
        this.feedbackText.style.color = color;
        this.feedbackText.style.transform = 'translate(-50%, -50%) scale(1)';
        this.feedbackText.style.opacity = 1;
        setTimeout(() => {
            this.feedbackText.style.transform = 'translate(-50%, -50%) scale(0.7)';
            this.feedbackText.style.opacity = 0;
        }, 1500);
    }
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 8 + 4,
                color: color,
                speedX: (Math.random() - 0.5) * 12,
                speedY: (Math.random() - 0.5) * 12,
                life: 1.0,
                glow: Math.random() > 0.5
            });
        }
    }
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= deltaTime * 2;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            if (p.glow) {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 15;
            }
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        this.ctx.globalAlpha = 1.0;
    }
    playSound(type, pitch = 1, gain = 0.5) {
        if (!this.audioContext) return;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
        switch (type) {
            case 'hit':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(200 * pitch, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
                break;
            case 'cheer':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400 * pitch, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
                break;
            case 'wicket':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(150 * pitch, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
                break;
        }
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }
}
