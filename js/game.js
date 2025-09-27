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
        this.isNightGame = Math.random() > 0.5; // Randomly decide if it's a night game
        this.stadium = new Stadium(this.ctx, this.currentStadium, this.isNightGame);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.currentOver = [];
        this.userTeam = null;
        this.oppositionTeam = null;
        this.currentBowler = null;
        this.batsmanStats = [];
        this.bowlerStats = [];
        this.previousOverBowler = null; // Track who bowled the previous over
        this.awaitingNextBall = false;
        this.justDeliveredBall = false; // Track if we just delivered a ball to prevent race conditions
        this.tournamentManager = null;
        this.isTournamentMode = false;
        this.tournamentTarget = null;
        this.celebrationInProgress = false;
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
        this.timingMeter = document.getElementById('timingMeter');
        this.timingMeterFill = document.getElementById('timingMeterFill');
        this.reqRunRateEl = document.getElementById('reqRunRate');
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
    // Method to generate match conditions (day/night and stadium)
    generateMatchConditions() {
        // Randomly select stadium
        this.currentStadium = this.stadiums[Math.floor(Math.random() * this.stadiums.length)];
        
        // Randomly decide day or night game (50% chance each)
        this.isNightGame = Math.random() > 0.5;
        
        // Display match condition feedback
        const conditionText = this.isNightGame ? 'Night Match' : 'Day Match';
        const stadiumName = this.getStadiumDisplayName(this.currentStadium);
        this.showMatchConditionFeedback(`${conditionText} at ${stadiumName}`);
    }
    
    // Helper method to get display name for stadium
    getStadiumDisplayName(stadiumType) {
        switch (stadiumType) {
            case 'lords':
                return "Lord's";
            case 'mcg':
                return "MCG";
            case 'wankhede':
                return "Wankhede";
            default:
                return "International Stadium";
        }
    }
    
    // Method to show match condition feedback
    showMatchConditionFeedback(text) {
        const conditionEl = document.getElementById('matchConditions');
        if (conditionEl) {
            conditionEl.textContent = text;
            conditionEl.style.display = 'block';
            
            // Apply appropriate CSS class for day/night styling
            conditionEl.classList.remove('day', 'night');
            conditionEl.classList.add(this.isNightGame ? 'night' : 'day');
        }
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
        
        if (this.isTournamentMode) {
            // Initialize tournament with selected team
            this.tournamentManager = new TournamentManager();
            this.tournamentManager.initializeTournament(team.id);
            
            // Set opposition for current match
            const currentMatchInfo = this.tournamentManager.getCurrentMatchInfo();
            if (currentMatchInfo) {
                this.oppositionTeam = currentMatchInfo.opposition;
            }
        } else {
            const oppositionTeams = IPL_TEAMS.filter(t => t.id !== team.id);
            this.oppositionTeam = oppositionTeams[Math.floor(Math.random() * oppositionTeams.length)];
        }
        this.showFeedback(`${team.name} selected!`, team.primaryColor);
        setTimeout(() => {
            this.showTeamDisplay();
        }, 800);
    }
    showTeamDisplay() {
        this.teamSelection.style.display = 'none';
        this.teamDisplay.style.display = 'flex';
        
        if (this.isTournamentMode && this.tournamentManager) {
            const currentMatchInfo = this.tournamentManager.getCurrentMatchInfo();
            if (currentMatchInfo) {
                this.userTeamName.textContent = `${this.userTeam.name} (Your Team) - ${currentMatchInfo.matchType}`;
            } else {
                this.userTeamName.textContent = `${this.userTeam.name} (Your Team) - Tournament Match`;
            }
        } else {
            this.userTeamName.textContent = `${this.userTeam.name} (Your Team)`;
        }
        
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
        
        if (this.isTournamentMode) {
            this.oppositionTeamName.textContent = `${this.oppositionTeam.name} - vs You`;
        } else {
            this.oppositionTeamName.textContent = `${this.oppositionTeam.name}`;
        }
        
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
        this.isTournamentMode = mode === 'tournament';
        
        if (this.isTournamentMode) {
            this.teamSelection.style.display = 'flex';
            this.teamDisplay.style.display = 'none';
            this.gameState = 'team_selection';
            this.showFeedback('Select your team for the tournament!', '#FFD700');
        } else {
            this.teamSelection.style.display = 'flex';
            this.teamDisplay.style.display = 'none';
            this.gameState = 'team_selection';
        }
        
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
        if (!this.isTournamentMode) {
            this.showFeedback('Select your team!', '#FFD700');
        }
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
        this.scorecardBtn.style.top = '115px';
        this.scorecardBtn.style.right = '20px';
        this.timingMeter.style.display = 'block';
        this.wicketsTaken = 0;
        this.celebrationInProgress = false; // Reset celebration state
        const difficulty = document.getElementById('difficulty').value;
        const difficulties = {
            amateur: {
                name: 'amateur',
                ballSpeed: 0.75,
                timingWindow: 1.3,
                swing: 35
            },
            pro: {
                name: 'pro',
                ballSpeed: 1.0,
                timingWindow: 1.0,
                swing: 70
            },
            legend: {
                name: 'legend',
                ballSpeed: 1.4,
                timingWindow: 0.7,
                swing: 110
            }
        };
        this.difficulty = difficulties[difficulty];
        
        // Generate match conditions (stadium and day/night)
        this.generateMatchConditions();
        
        this.score = 0;
        this.balls = 0;
        this.fours = 0;
        this.sixes = 0;
        this.currentOver = [];
        this.updateOverTracker();
        this.batsmanStats = [];
        this.bowlerStats = [];
        this.previousOverBowler = null; // Track who bowled the previous over
        this.milestonesReached = []; // Track milestones to avoid duplicate celebrations
        if (this.gameMode === 'quick') {
            this.wicketsTaken = 0;
            this.maxWickets = 10;
            this.maxOvers = 5;
            this.targetRuns = null;
        } else if (this.gameMode === 'tournament') {
            this.wicketsTaken = 0;
            this.maxWickets = 10;
            this.maxOvers = 20; // T20 format - 20 overs per side
            
            if (this.isTournamentMode) {
                // Generate target for user to chase (user always chases)
                const difficulty = document.getElementById('difficulty').value;
                let baseTarget;
                if (difficulty === 'amateur') baseTarget = 80 + Math.floor(Math.random() * 41); // 80-120
                else if (difficulty === 'pro') baseTarget = 120 + Math.floor(Math.random() * 61); // 120-180
                else baseTarget = 150 + Math.floor(Math.random() * 71); // 150-220
                
                this.targetRuns = baseTarget;
                this.tournamentTarget = baseTarget;
                this.showFeedback(`Chase Target: ${this.targetRuns}`, '#FFD700');
            } else {
                this.targetRuns = null;
            }
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
        // Randomly decide day or night game for each new match
        this.stadium = new Stadium(this.ctx, this.currentStadium, this.isNightGame);
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
        // Safety check: ensure we have an opposition team
        if (!this.oppositionTeam || !this.oppositionTeam.players) {
            console.error('No opposition team available for bowler selection');
            return;
        }
        
        const eligibleBowlers = this.oppositionTeam.players.filter(player =>
            (player.role.includes('Bowler') || player.role.includes('All-rounder'))
        );

        // Determine if we're starting a new over
        // A new over starts when we have no current bowler (game start) OR when we just completed 6 balls
        const isNewOver = !this.currentBowler || (this.balls % 6 === 0 && this.balls > 0);
        
        // CRITICAL FIX: Only select/change bowler at the start of a new over
        // During an over (balls 1-5 of any 6-ball sequence), keep the same bowler
        if (!isNewOver) {
            // We're in the middle of an over - keep current bowler, no changes allowed
            return;
        }

  
        if (eligibleBowlers.length === 0) {
            this.currentBowler = this.oppositionTeam.players[0];
        } else {
            // Apply cricket bowling restrictions
            let availableBowlers = [...eligibleBowlers];
            
            // RULE 1: No consecutive overs - exclude previous over's bowler
            // Only apply this rule when we have a previous over bowler (not at game start)
            if (this.previousOverBowler && this.balls > 0) {
                const beforeFilter = availableBowlers.length;
                availableBowlers = availableBowlers.filter(b => b.name !== this.previousOverBowler.name);
                  
                // If we've filtered out all bowlers, we need to allow the previous bowler to continue
                // This is a safety check to prevent the game from breaking
                if (availableBowlers.length === 0) {
                      availableBowlers = [this.previousOverBowler];
                }
            }
            
            // RULE 2: Limited overs restriction (n/5 rule)
            // In limited overs cricket, a bowler can't bowl more than maxOvers/5 overs
            // For a 20-over game, this means max 4 overs per bowler
            if (this.maxOvers && this.maxOvers > 0) {
                // Calculate max overs per bowler (20 overs -> 4 overs per bowler)
                const maxOversPerBowler = Math.min(4, Math.floor(this.maxOvers / 5));
                if (maxOversPerBowler > 0) {
                    availableBowlers = availableBowlers.filter(bowler => {
                        const bowlerStat = this.bowlerStats.find(b => b.name === bowler.name);
                        const bowlerOvers = bowlerStat ? Math.floor(bowlerStat.balls / 6) : 0;
                        return bowlerOvers < maxOversPerBowler;
                    });
                }
            }
            
            // If no bowlers available after restrictions, relax rules progressively
            if (availableBowlers.length === 0) {
                  // First, allow bowlers who haven't exceeded over limit (but may have bowled previous over)
                availableBowlers = [...eligibleBowlers];
                if (this.maxOvers && this.maxOvers > 0) {
                    // Calculate max overs per bowler (20 overs -> 4 overs per bowler)
                    const maxOversPerBowler = Math.min(4, Math.floor(this.maxOvers / 5));
                    if (maxOversPerBowler > 0) {
                        const limitedBowlers = availableBowlers.filter(bowler => {
                            const bowlerStat = this.bowlerStats.find(b => b.name === bowler.name);
                            const bowlerOvers = bowlerStat ? Math.floor(bowlerStat.balls / 6) : 0;
                            return bowlerOvers < maxOversPerBowler;
                        });
                        if (limitedBowlers.length > 0) {
                            availableBowlers = limitedBowlers;
                        }
                    }
                }
            }
            
            // Select a random bowler from available options
            const newBowler = availableBowlers[Math.floor(Math.random() * availableBowlers.length)];
                this.currentBowler = newBowler;
        }

        // Update UI with current bowler information
        if (this.bowlerNameEl && this.bowlerTeamEl) {
            this.bowlerNameEl.textContent = this.currentBowler.name;
            this.bowlerTeamEl.textContent = this.oppositionTeam.shortName;
            this.bowlerTeamEl.style.background = `linear-gradient(145deg, ${this.oppositionTeam.primaryColor}, ${this.adjustColor(this.oppositionTeam.primaryColor, -20)})`;
            this.bowlerTeamEl.style.color = this.oppositionTeam.secondaryColor;
        }
    }
    updateBowlerStats(runs = 0, isWicket = false) {
        // Only update stats for the current bowler who is actually bowling this ball
        if (!this.currentBowler) {
            console.warn('No current bowler set - cannot update bowling stats');
            return;
        }
        
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

        // Update stats only for the current bowler
        bowlerStat.runs += runs;
        bowlerStat.balls++;
        if (isWicket) bowlerStat.wickets++;
        
        // Log bowling stats for verification
        const bowlerOvers = Math.floor(bowlerStat.balls / 6);
        const bowlerBallsInOver = bowlerStat.balls % 6;
          
        // Check if bowler has completed an over
        if (bowlerBallsInOver === 1 && bowlerStat.balls > 1) { // First ball of a new over (after completing previous)
            const completedOvers = Math.floor((bowlerStat.balls - 1) / 6);
          }
        
        // Check if bowler has exceeded max overs (for debugging)
        if (this.maxOvers && this.maxOvers > 0) {
            const maxOversPerBowler = Math.min(4, Math.floor(this.maxOvers / 5));
            if (bowlerOvers > maxOversPerBowler) {
                console.error(`ERROR: ${bowlerName} has bowled ${bowlerOvers} overs, exceeding the limit of ${maxOversPerBowler} overs!`);
            }
        }
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
        // Also reset awaitingNextBall to ensure game continues properly
        this.awaitingNextBall = false;
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

        // Add total row for batsmen
        const totalRuns = this.batsmanStats.reduce((total, stat) => total + stat.runs, 0);
        const totalBalls = this.batsmanStats.reduce((total, stat) => total + stat.balls, 0);
        const totalFours = this.batsmanStats.reduce((total, stat) => total + stat.fours, 0);
        const totalSixes = this.batsmanStats.reduce((total, stat) => total + stat.sixes, 0);
        
        const totalRow = document.createElement('tr');
        totalRow.className = 'scorecard-total';
        totalRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td></td>
            <td></td>
            <td><strong>${totalRuns}</strong></td>
            <td><strong>${totalBalls}</strong></td>
            <td><strong>${totalFours}</strong></td>
            <td><strong>${totalSixes}</strong></td>
        `;
        this.scorecardBody.appendChild(totalRow);

        const bowlingBody = document.getElementById('bowlingScorecardBody');
        bowlingBody.innerHTML = '';

        // Only show bowlers who have bowled at least one ball
        // Filter out bowlers with 0 balls to avoid empty entries
        const activeBowlers = this.bowlerStats.filter(stat => stat.balls > 0);
        
        activeBowlers.forEach(stat => {
            // Calculate overs: complete overs + remaining balls
            const completeOvers = Math.floor(stat.balls / 6);
            const remainingBalls = stat.balls % 6;
            
            // Display overs properly: if remaining balls = 0, show just complete overs
            // If remaining balls > 0, show complete.remaining format
            let oversDisplay;
            if (remainingBalls === 0 && completeOvers > 0) {
                oversDisplay = completeOvers.toString();
            } else {
                oversDisplay = completeOvers + '.' + remainingBalls;
            }
            
            // Calculate economy rate only if bowler has bowled at least 6 balls (1 over)
            let economy;
            if (stat.balls >= 6) {
                economy = (stat.runs / (stat.balls / 6)).toFixed(2);
            } else {
                // For partial overs, show economy as runs per ball * 6
                economy = remainingBalls > 0 ? ((stat.runs / remainingBalls) * 6).toFixed(2) : '0.00';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${stat.name}</td>
                <td>${oversDisplay}</td>
                <td>${stat.runs}</td>
                <td>${stat.wickets}</td>
                <td>${economy}</td>
            `;
            bowlingBody.appendChild(row);
        });
        
        // Add total row for bowlers
        const totalBowlerRuns = this.bowlerStats.reduce((total, stat) => total + stat.runs, 0);
        const totalBowlerWickets = this.bowlerStats.reduce((total, stat) => total + stat.wickets, 0);
        const totalBowlerBalls = this.bowlerStats.reduce((total, stat) => total + stat.balls, 0);
        
        const totalBowlerOvers = Math.floor(totalBowlerBalls / 6);
        const totalBowlerBallsInOver = totalBowlerBalls % 6;
        let totalOversDisplay;
        if (totalBowlerBallsInOver === 0 && totalBowlerOvers > 0) {
            totalOversDisplay = totalBowlerOvers.toString();
        } else {
            totalOversDisplay = totalBowlerOvers + '.' + totalBowlerBallsInOver;
        }
        
        const totalBowlerRow = document.createElement('tr');
        totalBowlerRow.className = 'scorecard-total';
        totalBowlerRow.innerHTML = `
            <td><strong>Total</strong></td>
            <td><strong>${totalOversDisplay}</strong></td>
            <td><strong>${totalBowlerRuns}</strong></td>
            <td><strong>${totalBowlerWickets}</strong></td>
            <td></td>
        `;
        bowlingBody.appendChild(totalBowlerRow);
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
            !this.ball.isActive && !this.awaitingNextBall && !this.justDeliveredBall && !this.isGameOver()) {
            this.awaitingNextBall = true;
            setTimeout(() => {
                // Only call nextBall if game is not paused
                if (!this.gameLoopPaused) {
                    this.nextBall();
                }
            }, 1200);
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
            
            // Enhanced crowd members with better shapes
            this.ctx.fillStyle = person.color;
            
            // Draw crowd member as a simple person shape
            // Head
            this.ctx.beginPath();
            this.ctx.arc(x, y - person.size, person.size * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Body
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - person.size * 0.2);
            this.ctx.lineTo(x, y + person.size * 1.5);
            this.ctx.strokeStyle = person.color;
            this.ctx.lineWidth = person.size * 0.5;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
            
            // Arms
            this.ctx.beginPath();
            this.ctx.moveTo(x - person.size, y);
            this.ctx.lineTo(x + person.size, y);
            this.ctx.stroke();
            
            // Add cheering animation based on game events
            if (this.gameState === 'playing' && Math.random() < 0.02) {
                // Occasionally raise arms for cheering
                this.ctx.beginPath();
                this.ctx.moveTo(x - person.size, y - person.size);
                this.ctx.lineTo(x + person.size, y - person.size);
                this.ctx.stroke();
            }
            
            // Move crowd members slightly for dynamic effect
            person.x += (Math.random() - 0.5) * 0.01 * person.speed;
            if (person.x < 0) person.x = 0;
            if (person.x > 1) person.x = 1;
        });
    }
    checkHit() {
        if (this.batsman.isSwinging && this.ball.isActive && this.ball.isHittable()) {
            const result = this.ball.attemptHit(this.batsman.swingDirection);
            this.updateTimingMeter(result.timing, result.timingScore);
            this.batsman.isSwinging = false;
            
            // Handle new dismissal types from enhanced physics
            if (result.dismissal) {
                // For dismissals during a hit, the runs were already added to the batsman,
                // so we don't need to add them again in handleWicket
                this.handleWicket(result.dismissal, 0);
                if (result.dismissal === 'Caught') {
                    // Handle edge catches
                    const catcher = this.fielders.sort((a, b) =>
                        Math.hypot(a.x - this.ball.pos.x, a.y - this.ball.pos.y) -
                        Math.hypot(b.x - this.ball.pos.x, b.y - this.ball.pos.y)
                    )[0];
                    if (catcher) {
                        catcher.isCatching = true;
                        this.ball.travelTo(catcher.x, catcher.y);
                    }
                }
                return;
            }
            
            this.showFeedback(`${result.runs} · ${result.timing}`, result.color);
            this.playSound('hit', 0.8 + Math.random() * 0.2, 0.5);
            this.createParticles(this.ball.pos.x, this.ball.pos.y - this.ball.pos.z, 10, result.color);
            
            const isMishit = result.timingScore < 2;
            const isLofted = this.ball.vel.z > 40;
            const isCaught = false;

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

                const isPoorShot = result.timingScore <= 1; // Early, Late, Too Early, Too Late
                if (isPoorShot && result.runs > 0 && result.runs < 4) { // Only on singles, doubles, triples
                    const runOutChance = 0.1; // 10% chance of a run-out on a poor shot
                    if (Math.random() < runOutChance) {
                        // Find the closest fielder
                        const closestFielder = this.fielders.sort((a, b) =>
                            Math.hypot(a.x - this.ball.pos.x, a.y - this.ball.pos.y) -
                            Math.hypot(b.x - this.ball.pos.x, b.y - this.ball.pos.y)
                        )[0];

                        if (closestFielder) {
                            // Animate the fielder throwing the ball to the wickets
                            this.ball.travelTo(this.wicketsObject.x, this.wicketsObject.y);
                            // Adjust the score to reflect one less run (the batsman who got run out doesn't get credit for that run)
                            this.score -= 1;
                            // For run-out, we need to properly handle the batsman stats to avoid double counting
                            // Remove the previously added runs and add the adjusted runs
                            const currentBatsmanIndex = this.batsmanStats.findIndex(stat => stat.howOut === null || stat.howOut === undefined);
                            if (currentBatsmanIndex !== -1) {
                                const currentBatsman = this.batsmanStats[currentBatsmanIndex];
                                // Adjust the batsman's runs by removing the original runs and adding the adjusted ones
                                currentBatsman.runs = currentBatsman.runs - result.runs + (result.runs - 1);
                            }
                            this.handleWicket('Run Out!', result.runs -1); // Batsman completes one less run
                            return;
                        }
                    }
                }
                
                // Check for individual batsman milestone celebrations (50 and 100)
                this.checkIndividualMilestoneCelebration(result.runs);
                
                this.updateBowlerStats(result.runs);
                if (this.gameMode === 'runChase' && this.score >= this.targetRuns) {
                    this.showFeedback(`Chase Complete! ${this.score}/${this.targetRuns}`, '#01FF70');
                    setTimeout(() => this.endGame(), 2000);
                    return;
                }
                if (this.gameMode === 'tournament' && this.isTournamentMode && this.tournamentTarget && this.score >= this.tournamentTarget) {
                    this.showFeedback(`Chase Complete! ${this.score}/${this.tournamentTarget}`, '#01FF70');
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
                        // Create special boundary particles
                        this.createBoundaryParticles(this.ball.pos.x, 50, 30, '#FFD700');
                        if (result.runs === 6) {
                            this.wrapper.style.animation = 'shake 0.5s';
                            setTimeout(() => this.wrapper.style.animation = '', 500);
                            // Extra particles for sixes
                            this.createBoundaryParticles(this.ball.pos.x, 50, 20, '#FF4136');
                        }
                    } else {
                        // Regular particles for 1s, 2s, 3s
                        this.createParticles(this.ball.pos.x, 50, 8, '#ffffff');
                    }
                }
                this.ball.isActive = false;
                this.gameState = 'between_balls';
                this.awaitingNextBall = true;
                
                // If match ended on this delivery (e.g., overs exhausted in chase), end gracefully
                if (this.isGameOver()) {
                    setTimeout(() => this.endGame(), 1500);
                    return;
                }

                // Check if celebration is in progress and adjust delay accordingly
                let nextBallDelay = result.runs === 0 ? 1500 : 2000;
                if (this.celebrationInProgress) {
                    nextBallDelay += 3000; // Add extra delay for celebration
                }
                
                setTimeout(() => {
                    if (this.gameState === 'between_balls' && !this.celebrationInProgress) {
                        // Only call nextBall if game is not paused
                        if (!this.gameLoopPaused) {
                            this.nextBall();
                        }
                    }
                }, nextBallDelay);
            }
        }
    }
    onBallMissed() {
        if (this.ball.pos.z <= 5 && this.wicketsObject.checkCollision(this.ball)) {
            // Pass ball velocity and bowler style to wickets for enhanced physics
            const ballVelocity = {
                x: this.ball.vel.x,
                y: this.ball.vel.y,
                z: this.ball.vel.z
            };
            const bowlerStyle = this.currentBowler?.bowlingStyle || this.ball.bowlingStyle || 'Fast Medium';
            
            this.wicketsObject.hit(ballVelocity, bowlerStyle);
            this.handleWicket('Bowled!', 0);
            return;
        }

        const isSpin = this.ball.type === 'spin';
        const outOfCrease = this.batsman.swingState > 0.5; // Approximating being out of crease
        if (isSpin && outOfCrease && this.ball.pos.y > this.batsman.y && this.ball.pos.z < 10) {
            this.handleWicket('Stumped!', 0);
            return;
        }

        if (this.ball.pos.y > this.canvas.height) {
            this.ball.isActive = false;
            this.showFeedback('0 · Miss', '#FFA500');
            this.recordBallOutcome(0);
            // Credit the dot ball to the correct bowler BEFORE potential over change
            this.updateBowlerStats(0);
            this.incrementBall();
            this.updateScoreboard();
            this.gameState = 'between_balls';
            this.awaitingNextBall = true;

            // If match ended on this delivery (e.g., overs exhausted in chase), end gracefully
            if (this.isGameOver()) {
                setTimeout(() => this.endGame(), 1500);
                return;
            }

            setTimeout(() => {
                // Only call nextBall if game is not paused
                if (!this.gameLoopPaused) {
                    this.nextBall();
                }
            }, 1500);
        }
    }
    handleWicket(type, runsScoredOnWicket) {
        // 1. Play wicket sound effects followed by a subdued cheer.
        this.playSound('wicket', 1, 0.6);
        this.playSound('cheer', 0.8, 0.3);

        // 2. Update all relevant statistics for the dismissal.
        this.wicketsTaken++;
        this.updateBatsmanStats('wicket', type, runsScoredOnWicket);
        this.recordBallOutcome('W');
        // Credit the wicket ball to the correct bowler BEFORE potential over change
        this.updateBowlerStats(runsScoredOnWicket, true);
        this.incrementBall();
        this.updateScoreboard();
        this.showFeedback(`0 · ${type}`, '#FF4136');
        this.ball.isActive = false;
        this.gameState = 'between_balls';

        // 3. Create celebration particles for wicket
        this.createWicketParticles(this.ball.pos.x, this.ball.pos.y - this.ball.pos.z, 50);
        
        // 4. Add screen flash effect for dramatic wicket
        this.wrapper.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        setTimeout(() => {
            this.wrapper.style.backgroundColor = '';
        }, 300);

        // 5. If the match isn't over, schedule the next delivery after a delay.
        if (this.isGameOver()) {
            setTimeout(() => this.endGame(), 2000);
        } else {
            this.awaitingNextBall = true;
            this.gameLoopPaused = false;
            setTimeout(() => {
                // Only call nextBall if game is not paused
                if (!this.gameLoopPaused) {
                    this.nextBall();
                }
            }, 2000);
        }
    }
    updateBatsmanStats(eventType, value, runsScored = 0) {
        // Find the current batsman entry (one without a recorded dismissal).
        let batsmanIndex = this.batsmanStats.findIndex(stat => stat.howOut === null || stat.howOut === undefined);
        let batsmanStatEntry;

        // If no active entry exists, create one for the next player in the lineup.
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

        // Modify the stats based on the event type.
        if (eventType === 'runs') {
            // Runs scored: update tally and track boundaries.
            batsmanStatEntry.runs += value;
            batsmanStatEntry.balls += 1;
            if (value === 4) batsmanStatEntry.fours += 1;
            if (value === 6) batsmanStatEntry.sixes += 1;
        } else if (eventType === 'wicket') {
            // Wicket: record dismissal details and final runs for this ball
            // For wickets where runs were already recorded, this updates the final result of the ball
            batsmanStatEntry.howOut = value;
            batsmanStatEntry.balls += 1;
            // Only add the runs that were actually completed (this may adjust for cases like run-out)
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
            
            // Set the previous over bowler BEFORE selecting new bowler
            if (this.currentBowler) {
                        this.previousOverBowler = this.currentBowler;
            }
            
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
    // Reset state and start the next delivery
    nextBall() {
        this.awaitingNextBall = false; // clear waiting state between balls
        this.justDeliveredBall = true; // We're about to deliver a ball
        // Only resume game loop if it wasn't intentionally paused (e.g., for scorecard)
        if (!this.scorecardDisplay || this.scorecardDisplay.style.display !== 'flex') {
            this.gameLoopPaused = false; // resume game loop for the new ball
        }
        if (this.isGameOver()) {
            this.endGame();
            return;
        }
        this.ball.isActive = false;
        this.gameState = 'playing';
        this.wicketsObject.reset();
        this.bowler.startDelivery();
        
        // Reset ball trajectory visualization
        this.ball.showTrajectory = false;
        this.ball.trajectory = [];
        
        // Enhanced ball type selection based on actual bowler
        let ballTypes = ['fast', 'medium', 'spin'];
        let ballType;
        
        if (this.currentBowler) {
            const bowlerRole = this.currentBowler.role;
            
            // Determine likely ball type based on bowler's role
            if (bowlerRole.includes('Bowler')) {
                // Analyze bowler name for type hints (realistic but simplified)
                const name = this.currentBowler.name.toLowerCase();
                if (name.includes('bumrah') || name.includes('starc') || name.includes('cummins') || 
                    name.includes('shami') || name.includes('natarajan') || name.includes('malik')) {
                    ballTypes = ['fast', 'fast', 'medium']; // Fast bowlers
                } else if (name.includes('rashid') || name.includes('chahal') || name.includes('narine') || 
                           name.includes('chakravarthy') || name.includes('sharma') && name.includes('karn')) {
                    ballTypes = ['spin', 'spin', 'medium']; // Spin bowlers
                } else {
                    ballTypes = ['medium', 'medium', 'fast']; // Medium pace bowlers
                }
            } else if (bowlerRole.includes('All-rounder')) {
                ballTypes = ['medium', 'medium', 'spin']; // All-rounders tend to bowl medium/spin
            }
        }
        
        ballType = ballTypes[Math.floor(Math.random() * ballTypes.length)];
        const side = Math.random() > 0.5 ? 'off' : 'leg';
        
        // Pass bowler type and bowling style information to ball
        this.ball.bowl(ballType, side, this.currentBowler?.role, this.currentBowler?.bowlingStyle);
        
        // Reset the flag shortly after the ball is bowled
        setTimeout(() => {
            this.justDeliveredBall = false;
        }, 100); // Small buffer time to ensure ball is active
    }
    isGameOver() {
        const oversBowled = Math.floor(this.balls / 6);
        if (this.gameMode === 'tournament') {
            if (this.isTournamentMode && this.tournamentTarget) {
                return this.wicketsTaken >= this.maxWickets || oversBowled >= this.maxOvers || this.score >= this.tournamentTarget;
            } else {
                return this.wicketsTaken >= this.maxWickets;
            }
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
        this.timingMeter.style.display = 'none';
        let message = `Game Over! Score: ${this.score}`;
        let isWin = false;
        
        if (this.gameMode === 'challenge') {
            if (this.score >= this.targetRuns) {
                message = `Target Achieved! ${this.score}/${this.targetRuns}`;
                isWin = true;
            } else {
                message = `Target Missed! ${this.score}/${this.targetRuns}`;
            }
        } else if (this.gameMode === 'runChase') {
            if (this.score >= this.targetRuns) {
                message = `Chase Complete! ${this.score}/${this.targetRuns}`;
                isWin = true;
            } else {
                message = `Chase Failed! ${this.score}/${this.targetRuns}`;
            }
        } else if (this.gameMode === 'tournament' && this.isTournamentMode) {
            // Calculate opposition score (simplified)
            const oppositionScore = this.tournamentTarget - 1 + Math.floor(Math.random() * 20); // Random around target
            // T20 format: opposition innings is 20 overs (120 balls)
            const oppositionBalls = (this.maxOvers && this.maxOvers > 0 ? this.maxOvers : 20) * 6;
            
            if (this.score >= this.tournamentTarget) {
                message = `Chase Successful! ${this.score}/${this.tournamentTarget}`;
                isWin = true;
            } else {
                message = `Chase Failed! ${this.score}/${this.tournamentTarget}`;
                isWin = false;
            }
            
            // Complete the tournament match regardless of win/loss
            if (this.tournamentManager) {
                const matchResult = this.tournamentManager.completeUserMatch(
                    this.score, this.balls, oppositionScore, oppositionBalls, isWin
                );
                
                // Store match result for display
                this.lastMatchResult = matchResult;
            } else {
                console.error('Tournament manager not initialized!');
                // Fallback for debugging
                this.lastMatchResult = {
                    resultText: isWin ? `You won by ${this.score - oppositionScore} runs` : `You lost by ${oppositionScore - this.score} runs`
                };
            }
        }
        
        this.showFeedback(message, isWin ? '#01FF70' : '#FFDC00');
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('ultimateCricketHighScore', this.highScore);
            this.highScoreValueEl.textContent = this.highScore;
        }
        
        setTimeout(() => {
            if (this.isTournamentMode) {
                this.showTournamentResults();
            } else {
                this.returnToMenu();
            }
        }, 3000);
    }
    // Helper function to verify score consistency
    verifyScoreConsistency() {
        // Calculate total runs from batsman stats
        const totalBatsmanRuns = this.batsmanStats.reduce((total, stat) => total + stat.runs, 0);
        
        // Calculate total runs conceded by bowlers
        const totalBowlerRuns = this.bowlerStats.reduce((total, stat) => total + stat.runs, 0);
        
        // Log for debugging
        if (totalBatsmanRuns !== this.score) {
            console.warn(`Score mismatch: Game score (${this.score}) != Batsman stats total (${totalBatsmanRuns})`);
        }
        
        // Note: Bowler runs should match game score in most cases, but there might be edge cases
        // where they don't (like extras that aren't attributed to a specific bowler)
        return {
            score: this.score,
            batsmanTotal: totalBatsmanRuns,
            bowlerTotal: totalBowlerRuns,
            scoreMatchesBatsmen: totalBatsmanRuns === this.score
        };
    }

    // Function to test scoring consistency (for debugging)
    testScoringConsistency() {
        return this.verifyScoreConsistency();
    }

    updateScoreboard() {
        this.scoreEl.textContent = this.score;
        this.wicketsEl.textContent = this.wicketsTaken + '/' + this.maxWickets;
        if (this.gameMode === 'runChase') {
            this.oversEl.textContent = `${Math.floor(this.balls / 6)}.${this.balls % 6} (T: ${this.targetRuns})`;
        } else if (this.gameMode === 'tournament' && this.isTournamentMode && this.tournamentTarget) {
            this.oversEl.textContent = `${Math.floor(this.balls / 6)}.${this.balls % 6} (T: ${this.tournamentTarget})`;
        } else {
            this.oversEl.textContent = `${Math.floor(this.balls / 6)}.${this.balls % 6}`;
        }
        this.strikeRateEl.textContent = this.balls > 0 ? (this.score / this.balls * 100).toFixed(2) : '0.00';
        this.foursEl.textContent = this.fours;
        this.sixesEl.textContent = this.sixes;

        // Calculate and display Required Run Rate (Req RR) for chase modes
        let reqRRText = '—';
        let target = null;
        if (this.gameMode === 'runChase' && typeof this.targetRuns === 'number') {
            target = this.targetRuns;
        } else if (this.gameMode === 'tournament' && this.isTournamentMode && typeof this.tournamentTarget === 'number') {
            target = this.tournamentTarget;
        }
        if (target !== null && typeof this.maxOvers === 'number' && this.maxOvers > 0) {
            const runsRequired = Math.max(0, target - this.score);
            const ballsRemaining = Math.max(0, (this.maxOvers * 6) - this.balls);
            if (runsRequired === 0) {
                reqRRText = '0.00';
            } else if (ballsRemaining > 0) {
                const oversRemaining = ballsRemaining / 6;
                reqRRText = (runsRequired / oversRemaining).toFixed(2);
            } else {
                reqRRText = '—';
            }
        }
        if (this.reqRunRateEl) {
            this.reqRunRateEl.textContent = reqRRText;
        }

        // Verify score consistency (for debugging)
        const consistency = this.verifyScoreConsistency();
        if (!consistency.scoreMatchesBatsmen) {
            // Only log detailed info if there's a mismatch
            this.testScoringConsistency();
        }

        // Add animation class and remove it after animation ends
        const elementsToAnimate = [this.scoreEl, this.wicketsEl, this.oversEl, this.foursEl, this.sixesEl, this.strikeRateEl, this.reqRunRateEl].filter(Boolean);
        elementsToAnimate.forEach(el => {
            el.classList.add('score-update');
            el.addEventListener('animationend', () => {
                el.classList.remove('score-update');
            }, { once: true });
        });
    }

    updateTimingMeter(timing, timingScore) {
        let heightPercent = 0;
        let color = '#ff0000'; // Default red

        switch (timingScore) {
            case 3: // PERFECT!
                heightPercent = 100;
                color = `hsl(120, 100%, 50%)`; // Bright Green
                break;
            case 2: // GOOD
                heightPercent = 80;
                color = `hsl(60, 100%, 50%)`; // Yellow
                break;
            case 1: // EARLY/LATE
                if (timing === "EARLY") {
                    heightPercent = 60;
                    color = `hsl(30, 100%, 50%)`; // Orange
                } else { // LATE
                    heightPercent = 40;
                    color = `hsl(15, 100%, 50%)`; // Orange-Red
                }
                break;
            case 0: // TOO EARLY/TOO LATE
                if (timing === "TOO EARLY") {
                    heightPercent = 20;
                    color = `hsl(0, 100%, 50%)`; // Red
                } else { // TOO LATE
                    heightPercent = 10;
                    color = `hsl(0, 100%, 40%)`; // Darker Red
                }
                break;
        }

        this.timingMeterFill.style.height = `${heightPercent}%`;
        this.timingMeterFill.style.background = color;
    }

    showFeedback(text, color) {
        this.feedbackText.textContent = text;
        this.feedbackText.style.color = color;
        this.feedbackText.style.textShadow = `0 0 20px ${color}, 0 0 30px ${color}`;
        this.feedbackText.style.transform = 'translate(-50%, -50%) scale(1)';
        this.feedbackText.style.opacity = 1;
        
        // Enhanced effects for milestone celebrations
        if (text.includes('CENTURY') || text.includes('FIFTY')) {
            // Add special celebration animation
            this.feedbackText.style.animation = 'celebrationPulse 0.8s ease-in-out';
            this.feedbackText.style.fontSize = 'clamp(2.2rem, 7vw, 4rem)';
            
            setTimeout(() => {
                this.feedbackText.style.animation = 'feedbackPulse 0.3s ease-in-out infinite alternate';
                this.feedbackText.style.fontSize = 'clamp(2rem, 6vw, 3.5rem)';
            }, 800);
            
            setTimeout(() => {
                this.feedbackText.style.animation = '';
            }, 2000);
        } else if (text.includes('Boundary') || text.includes('SIX') || text.includes('Wicket') || text.includes('Target')) {
            // Add pulsing effect for important events
            this.feedbackText.style.animation = 'feedbackPulse 0.3s ease-in-out infinite alternate';
            setTimeout(() => {
                this.feedbackText.style.animation = '';
            }, 1500);
        }
        
        // Auto-hide timing based on text importance
        const hideDelay = (text.includes('CENTURY') || text.includes('FIFTY')) ? 2500 : 1500;
        
        setTimeout(() => {
            this.feedbackText.style.transform = 'translate(-50%, -50%) scale(0.7)';
            this.feedbackText.style.opacity = 0;
        }, hideDelay);
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
                glow: Math.random() > 0.5,
                type: 'standard'
            });
        }
    }
    
    // Create special effect particles for boundaries
    createBoundaryParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 12 + 6,
                color: color,
                speedX: (Math.random() - 0.5) * 20,
                speedY: (Math.random() - 0.5) * 20,
                life: 1.5,
                glow: true,
                type: 'boundary'
            });
        }
    }
    
    // Create celebration particles for wickets
    createWicketParticles(x, y, count) {
        for (let i = 0; i < count; i++) {
            const colors = ['#FF4136', '#01FF70', '#FFDC00', '#B10DC9', '#FF851B'];
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                speedX: (Math.random() - 0.5) * 25,
                speedY: (Math.random() - 0.5) * 25 - 5, // Upward bias
                life: 2.0,
                glow: true,
                type: 'celebration'
            });
        }
    }
    
    checkIndividualMilestoneCelebration(runsScored) {
        // Get the current batsman's stats
        const currentBatsmanIndex = this.batsmanStats.findIndex(stat => stat.howOut === null || stat.howOut === undefined);
        if (currentBatsmanIndex === -1) return;
        
        const currentBatsman = this.batsmanStats[currentBatsmanIndex];
        const previousBatsmanScore = currentBatsman.runs - runsScored;
        const currentBatsmanScore = currentBatsman.runs;
        
        // Check if individual batsman crossed 50 or 100
        const crossedFifty = previousBatsmanScore < 50 && currentBatsmanScore >= 50 && !this.milestonesReached.includes(`${currentBatsman.name}_50`);
        const crossedCentury = previousBatsmanScore < 100 && currentBatsmanScore >= 100 && !this.milestonesReached.includes(`${currentBatsman.name}_100`);
        
        if (crossedCentury) {
            this.milestonesReached.push(`${currentBatsman.name}_100`);
            this.celebrateMilestone('century', currentBatsman.name);
        } else if (crossedFifty) {
            this.milestonesReached.push(`${currentBatsman.name}_50`);
            this.celebrateMilestone('fifty', currentBatsman.name);
        }
    }
    
    celebrateMilestone(milestone, batsmanName) {
        // Set celebration flag to prevent next ball during animation
        this.celebrationInProgress = true;
        
        // Trigger batsman celebration animation
        this.batsman.celebrate(milestone);
        
        // Pause the game temporarily for celebration (but not if game is ending)
        if (!this.isGameOver()) {
            this.gameLoopPaused = true;
        }
        
        if (milestone === 'century') {
            // Century celebration - more elaborate
            // Shorten the text to prevent overflow and make it more punchy
            const shortName = batsmanName.split(' ').pop(); // Use last name only
            this.showFeedback(`💯 ${shortName} CENTURY! 💯`, '#FFD700');
            this.playSound('cheer', 1.5, 0.8);
            
            // Create special century particles
            this.createCelebrationParticles(this.batsman.x, this.batsman.y - 30, 80, '#FFD700');
            
            // Screen effects
            this.wrapper.style.animation = 'celebrate 1s ease-in-out';
            this.wrapper.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
            
            setTimeout(() => {
                this.wrapper.style.animation = '';
                this.wrapper.style.backgroundColor = '';
                this.celebrationInProgress = false;
                if (!this.isGameOver()) {
                    this.gameLoopPaused = false;
                    // Schedule next ball after celebration ends
                    setTimeout(() => {
                        if (this.gameState === 'between_balls') {
                            this.nextBall();
                        }
                    }, 500);
                }
            }, 3000);
            
        } else if (milestone === 'fifty') {
            // Fifty celebration - moderate
            // Shorten the text to prevent overflow
            const shortName = batsmanName.split(' ').pop(); // Use last name only
            this.showFeedback(`⭐ ${shortName} FIFTY! ⭐`, '#01FF70');
            this.playSound('cheer', 1.2, 0.6);
            
            // Create fifty particles
            this.createCelebrationParticles(this.batsman.x, this.batsman.y - 30, 50, '#01FF70');
            
            // Mild screen effect
            this.wrapper.style.backgroundColor = 'rgba(1, 255, 112, 0.15)';
            
            setTimeout(() => {
                this.wrapper.style.backgroundColor = '';
                this.celebrationInProgress = false;
                if (!this.isGameOver()) {
                    this.gameLoopPaused = false;
                    // Schedule next ball after celebration ends
                    setTimeout(() => {
                        if (this.gameState === 'between_balls') {
                            this.nextBall();
                        }
                    }, 500);
                }
            }, 2500);
        }
    }
    
    createCelebrationParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            // Enhanced particle spread and variety
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 80 + Math.random() * 70;
            const spreadX = Math.cos(angle) * distance;
            const spreadY = Math.sin(angle) * distance;
            
            this.particles.push({
                x: x + spreadX,
                y: y + spreadY,
                size: Math.random() * 15 + 8, // Larger particles
                color: color,
                speedX: (Math.random() - 0.5) * 25,
                speedY: -Math.random() * 20 - 8, // More upward velocity
                life: 2.0 + Math.random() * 1.0, // Longer life
                glow: true,
                type: 'celebration',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
        
        // Add extra burst effect for celebration
        for (let i = 0; i < count / 2; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 30,
                size: Math.random() * 20 + 12,
                color: color,
                speedX: (Math.random() - 0.5) * 15,
                speedY: -Math.random() * 25 - 10,
                life: 2.5,
                glow: true,
                type: 'celebration',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3
            });
        }
    }
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= deltaTime * 2;
            
            // Update rotation if particle has it
            if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
                p.rotation += p.rotationSpeed;
            }
            
            // Add gravity effect for celebration particles
            if (p.type === 'celebration') {
                p.speedY += deltaTime * 20; // Gravity
                p.speedX *= 0.99; // Air resistance
            }
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            
            // Apply glow effect based on particle type
            if (p.glow) {
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = p.type === 'boundary' ? 25 : 
                                  p.type === 'celebration' ? 20 : 15;
            }
            
            // Draw different shapes based on particle type
            switch (p.type) {
                case 'boundary':
                    // Star-shaped particles for boundaries
                    this.ctx.fillStyle = p.color;
                    this.drawStar(p.x, p.y, p.size * 0.5, p.size, 5);
                    break;
                case 'celebration':
                    // Enhanced sparkle effect for celebrations with rotation
                    this.ctx.save();
                    if (p.rotation !== undefined) {
                        this.ctx.translate(p.x, p.y);
                        this.ctx.rotate(p.rotation);
                        this.ctx.translate(-p.x, -p.y);
                    }
                    this.ctx.fillStyle = p.color;
                    this.drawEnhancedSparkle(p.x, p.y, p.size);
                    this.ctx.restore();
                    break;
                default:
                    // Standard circular particles
                    this.ctx.fillStyle = p.color;
                    this.ctx.beginPath();
                    this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    this.ctx.fill();
            }
            
            this.ctx.shadowBlur = 0;
        });
        this.ctx.globalAlpha = 1.0;
    }
    
    // Draw a star shape for special effects
    drawStar(cx, cy, innerRadius, outerRadius, points) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / points;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < points; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // Draw a sparkle effect
    drawSparkle(cx, cy, size) {
        // Draw main diamond
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - size);
        this.ctx.lineTo(cx + size * 0.7, cy);
        this.ctx.lineTo(cx, cy + size);
        this.ctx.lineTo(cx - size * 0.7, cy);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw cross lines
        this.ctx.beginPath();
        this.ctx.moveTo(cx - size * 0.5, cy);
        this.ctx.lineTo(cx + size * 0.5, cy);
        this.ctx.moveTo(cx, cy - size * 0.5);
        this.ctx.lineTo(cx, cy + size * 0.5);
        this.ctx.stroke();
    }
    
    // Enhanced sparkle for celebrations
    drawEnhancedSparkle(cx, cy, size) {
        // Draw main star shape
        this.ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const radius = i % 2 === 0 ? size : size * 0.4;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add inner glow circle
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    returnToMenu() {
        // Remove all tournament overlays and results
        document.querySelectorAll('.tournament-results-overlay, .tournament-overlay').forEach(el => el.remove());
        
        // Reset tournament mode state
        this.isTournamentMode = false;
        this.tournamentManager = null;
        this.lastMatchResult = null;
        this.celebrationInProgress = false; // Reset celebration state
        
        // Show main menu
        this.menu.style.display = 'flex';
        this.wrapper.classList.remove('playing');
        this.scoreboard.style.display = 'none';
        this.overTracker.style.display = 'none';
        this.scorecardBtn.style.display = 'none';
        this.feedbackText.style.opacity = 0;
        this.hideScorecard();
        
        // Hide team selection and display screens
        this.teamSelection.style.display = 'none';
        this.teamDisplay.style.display = 'none';
        
        // Reset game state
        this.gameState = 'menu';
    }
    
    showTournamentResults() {
        // Hide game elements
        this.wrapper.classList.remove('playing');
        this.scoreboard.style.display = 'none';
        this.overTracker.style.display = 'none';
        this.scorecardBtn.style.display = 'none';
        this.feedbackText.style.opacity = 0;
        this.hideScorecard();
        
        // Show tournament results
        this.showTournamentResultsScreen();
    }
    
    showTournamentResultsScreen() {
        // Remove any existing tournament results
        const existingResults = document.getElementById('tournamentResults');
        if (existingResults) {
            existingResults.remove();
        }
        
        // Create tournament results screen
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'tournamentResults';
        resultsDiv.className = 'tournament-results-overlay';
        
        const tournamentData = this.tournamentManager.getTournamentData();
        const isComplete = tournamentData.isComplete;
        const hasNextMatch = tournamentData.currentMatch !== null;
        
        // Start building HTML early to avoid use-before-declaration
        let resultHTML = `
            <div class="tournament-results-content">
                <h2>Match Result</h2>
                <div class="match-result">
                    <p class="result-text">${this.lastMatchResult ? this.lastMatchResult.resultText : 'Match completed'}</p>
                </div>
        `;

        // If no next match, try to find one by completing any remaining AI matches
        if (!isComplete && !hasNextMatch) {
            this.checkTournamentProgress();
            // Refresh tournament data after progress check
            const updatedTournamentData = this.tournamentManager.getTournamentData();
            const updatedHasNextMatch = updatedTournamentData.currentMatch !== null;
            const canStillQualify = updatedHasNextMatch ? false : this.tournamentManager.canUserStillQualify();
            
            // Use updated data
            if (updatedHasNextMatch) {
                const nextMatchInfo = this.tournamentManager.getCurrentMatchInfo();
                resultHTML += `
                    <div class="next-match-info">
                        <h3>Next Match</h3>
                        <p>${nextMatchInfo.matchType}: ${this.userTeam.shortName} vs ${nextMatchInfo.opposition.shortName}</p>
                    </div>
                    <div class="tournament-buttons">
                        <button class="menu-btn tournament-btn" onclick="game.showPointsTable()">Points Table</button>
                        <button class="menu-btn tournament-btn" onclick="game.showFixtures()">Fixtures</button>
                        <button class="menu-btn tournament-btn next-match-btn" onclick="game.playNextTournamentMatch()">Next Match</button>
                    </div>
                `;
                resultHTML += `</div>`;
                resultsDiv.innerHTML = resultHTML;
                document.body.appendChild(resultsDiv);
                return;
            }
        }
        
        // Check if user can still qualify (only if tournament not complete and no current match)
        const canStillQualify = !isComplete && !hasNextMatch ? this.tournamentManager.canUserStillQualify() : false;
        
        if (isComplete) {
            const userWonTournament = tournamentData.tournamentWinner && tournamentData.tournamentWinner.id === this.userTeam.id;
            
            if (userWonTournament) {
                resultHTML += `
                    <div class="tournament-victory">
                        <h3>🎆🏆 TOURNAMENT CHAMPIONS! 🏆🎆</h3>
                        <div class="victory-animation">🎊🎉🎊🎉🎊</div>
                        <p class="champion-text">Congratulations! ${this.userTeam.name} are the tournament winners!</p>
                        <div class="fireworks">✨🎆✨🎆✨🎆✨</div>
                    </div>
                    <button class="menu-btn tournament-btn victory-btn" onclick="game.returnToMenu()">Celebrate Victory!</button>
                `;
            } else {
                resultHTML += `
                    <div class="tournament-complete">
                        <h3>🏆 Tournament Complete! 🏆</h3>
                        <p class="winner">Winner: ${tournamentData.tournamentWinner.name}</p>
                    </div>
                    <button class="menu-btn tournament-btn" onclick="game.returnToMenu()">Back to Menu</button>
                `;
            }
        } else if (hasNextMatch) {
            const nextMatchInfo = this.tournamentManager.getCurrentMatchInfo();
            resultHTML += `
                <div class="next-match-info">
                    <h3>Next Match</h3>
                    <p>${nextMatchInfo.matchType}: ${this.userTeam.shortName} vs ${nextMatchInfo.opposition.shortName}</p>
                </div>
                <div class="tournament-buttons">
                    <button class="menu-btn tournament-btn" onclick="game.showPointsTable()">Points Table</button>
                    <button class="menu-btn tournament-btn" onclick="game.showFixtures()">Fixtures</button>
                    <button class="menu-btn tournament-btn next-match-btn" onclick="game.playNextTournamentMatch()">Next Match</button>
                </div>
            `;
        } else if (canStillQualify) {
            // User has completed their matches but can still qualify - wait for other matches
            resultHTML += `
                <div class="tournament-waiting">
                    <h3>Waiting for Other Matches</h3>
                    <p>You have completed your group matches. Waiting for other teams to finish.</p>
                    <p>You can still qualify for the final!</p>
                </div>
                <div class="tournament-buttons">
                    <button class="menu-btn tournament-btn" onclick="game.showPointsTable()">Points Table</button>
                    <button class="menu-btn tournament-btn" onclick="game.showFixtures()">Fixtures</button>
                    <button class="menu-btn tournament-btn" onclick="game.checkTournamentProgress()">Check Progress</button>
                </div>
            `;
        } else {
            // User eliminated
            resultHTML += `
                <div class="tournament-eliminated">
                    <h3>Tournament Over</h3>
                    <p>Your team has been eliminated from the tournament.</p>
                </div>
                <div class="tournament-buttons">
                    <button class="menu-btn tournament-btn" onclick="game.showPointsTable()">Final Points Table</button>
                    <button class="menu-btn tournament-btn" onclick="game.showFixtures()">All Results</button>
                    <button class="menu-btn tournament-btn" onclick="game.returnToMenu()">Back to Menu</button>
                </div>
            `;
        }
        
        resultHTML += `</div>`;
        resultsDiv.innerHTML = resultHTML;
        
        document.body.appendChild(resultsDiv);
    }
    
    showPointsTable() {
        if (!this.tournamentManager) {
            console.error('Tournament manager not initialized');
            return;
        }
        
        try {
            const pointsTable = this.tournamentManager.getPointsTable();
            
            // Remove existing overlays
            document.querySelectorAll('.tournament-overlay').forEach(el => el.remove());
            
            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'tournament-overlay points-table-overlay';
            
            let tableHTML = `
                <div class="tournament-content">
                    <h2>Points Table</h2>
                    <div class="groups-container">
                        <div class="group-table">
                            <h3>Group A</h3>
                            <table class="points-table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>M</th>
                                        <th>W</th>
                                        <th>L</th>
                                        <th>Pts</th>
                                        <th>NRR</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            pointsTable.groupA.forEach(team => {
                const isUserTeam = team.team.id === this.userTeam.id;
                tableHTML += `
                    <tr class="${isUserTeam ? 'user-team-row' : ''}">
                        <td class="team-name">${team.team.shortName}</td>
                        <td>${team.matches}</td>
                        <td>${team.won}</td>
                        <td>${team.lost}</td>
                        <td>${team.points}</td>
                        <td>${team.nrr}</td>
                    </tr>
                `;
            });
            
            tableHTML += `
                                </tbody>
                            </table>
                        </div>
                        <div class="group-table">
                            <h3>Group B</h3>
                            <table class="points-table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>M</th>
                                        <th>W</th>
                                        <th>L</th>
                                        <th>Pts</th>
                                        <th>NRR</th>
                                    </tr>
                                </thead>
                                <tbody>
            `;
            
            pointsTable.groupB.forEach(team => {
                const isUserTeam = team.team.id === this.userTeam.id;
                tableHTML += `
                    <tr class="${isUserTeam ? 'user-team-row' : ''}">
                        <td class="team-name">${team.team.shortName}</td>
                        <td>${team.matches}</td>
                        <td>${team.won}</td>
                        <td>${team.lost}</td>
                        <td>${team.points}</td>
                        <td>${team.nrr}</td>
                    </tr>
                `;
            });
            
            tableHTML += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <button class="menu-btn tournament-btn" onclick="game.closeTournamentOverlay()">Close</button>
                </div>
            `;
            
            overlayDiv.innerHTML = tableHTML;
            document.body.appendChild(overlayDiv);
        } catch (error) {
            console.error('Error showing points table:', error);
        }
    }
    
    showFixtures() {
        if (!this.tournamentManager) {
            console.error('Tournament manager not initialized');
            return;
        }
        
        try {
            const fixtures = this.tournamentManager.getFixtures();
            
            // Remove existing overlays
            document.querySelectorAll('.tournament-overlay').forEach(el => el.remove());
            
            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'tournament-overlay fixtures-overlay';
            
            let fixturesHTML = `
                <div class="tournament-content">
                    <h2>Tournament Fixtures</h2>
                    <div class="fixtures-container">
            `;
            
            const groupAMatches = fixtures.filter(f => f.type === 'Group A');
            const groupBMatches = fixtures.filter(f => f.type === 'Group B');
            const finalMatch = fixtures.filter(f => f.type === 'Final');
            
            fixturesHTML += `<div class="fixture-group">
                                <h3>Group A Matches</h3>`;
            
            groupAMatches.forEach(match => {
                const statusClass = match.completed ? 'completed' : 'pending';
                fixturesHTML += `
                    <div class="fixture-item ${statusClass}">
                        <div class="match-teams">${match.team1} vs ${match.team2}</div>
                        <div class="match-result">${match.result}</div>
                    </div>
                `;
            });
            
            fixturesHTML += `</div><div class="fixture-group">
                                <h3>Group B Matches</h3>`;
            
            groupBMatches.forEach(match => {
                const statusClass = match.completed ? 'completed' : 'pending';
                fixturesHTML += `
                    <div class="fixture-item ${statusClass}">
                        <div class="match-teams">${match.team1} vs ${match.team2}</div>
                        <div class="match-result">${match.result}</div>
                    </div>
                `;
            });
            
            fixturesHTML += `</div>`;
            
            if (finalMatch.length > 0) {
                fixturesHTML += `<div class="fixture-group">
                                    <h3>Final</h3>`;
                finalMatch.forEach(match => {
                    const statusClass = match.completed ? 'completed' : 'pending';
                    fixturesHTML += `
                        <div class="fixture-item ${statusClass}">
                            <div class="match-teams">${match.team1} vs ${match.team2}</div>
                            <div class="match-result">${match.result}</div>
                        </div>
                    `;
                });
                fixturesHTML += `</div>`;
            }
            
            fixturesHTML += `
                    </div>
                    <button class="menu-btn tournament-btn" onclick="game.closeTournamentOverlay()">Close</button>
                </div>
            `;
            
            overlayDiv.innerHTML = fixturesHTML;
            document.body.appendChild(overlayDiv);
        } catch (error) {
            console.error('Error showing fixtures:', error);
        }
    }
    
    closeTournamentOverlay() {
        document.querySelectorAll('.tournament-overlay').forEach(el => el.remove());
    }
    
    playNextTournamentMatch() {
        // Remove tournament results
        document.querySelectorAll('.tournament-results-overlay, .tournament-overlay').forEach(el => el.remove());
        
        // Reset game state for next match
        this.gameState = 'team_selection';
        
        // Update opposition team for next match
        const nextMatchInfo = this.tournamentManager.getCurrentMatchInfo();
        if (nextMatchInfo) {
            this.oppositionTeam = nextMatchInfo.opposition;
            
            // Generate new match conditions for tournament match (day/night and stadium)
            this.generateMatchConditions();
            
            // Reset previous match data
            this.score = 0;
            this.balls = 0;
            this.wicketsTaken = 0;
            this.fours = 0;
            this.sixes = 0;
            this.currentOver = [];
            this.batsmanStats = [];
            this.bowlerStats = [];
            this.lastMatchResult = null;
            
            // CRITICAL: Reset bowler state for new match
            this.currentBowler = null;
            this.previousOverBowler = null;
            this.milestonesReached = []; // Reset milestone tracking
            this.celebrationInProgress = false; // Reset celebration state
            
            // Show team display for next match
            this.showTeamDisplay();
        } else {
            console.error('No next match available');
            this.returnToMenu();
        }
    }
    
    checkTournamentProgress() {
        // Remove current overlays
        document.querySelectorAll('.tournament-overlay').forEach(el => el.remove());
        
        // Get tournament data
        const tournamentData = this.tournamentManager.getTournamentData();
        
        // Simulate any remaining AI vs AI matches to progress tournament
        const remainingAIMatches = tournamentData.totalMatches.filter(m => !m.isUserMatch && !m.result);
        
        if (remainingAIMatches.length > 0) {
            // Complete all remaining AI matches
            remainingAIMatches.forEach(match => {
                const result = this.tournamentManager.simulateMatch(match.team1, match.team2);
                match.result = result;
                this.tournamentManager.updateStandings(match);
                this.tournamentManager.completedMatches.push(match);
            });
        }
        
        // After completing AI matches, check if user can progress
        this.tournamentManager.findNextUserMatch();
        
        // Show updated tournament status
        setTimeout(() => {
            this.showTournamentResults();
        }, 500);
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
