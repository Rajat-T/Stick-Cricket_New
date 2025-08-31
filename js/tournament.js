class TournamentManager {
    constructor() {
        this.groups = { A: [], B: [] };
        this.groupMatches = { A: [], B: [] };
        this.groupStandings = { A: [], B: [] };
        this.finalMatch = null;
        this.currentMatch = null;
        this.userTeam = null;
        this.tournamentWinner = null;
        this.completedMatches = [];
        this.totalMatches = [];
    }

    initializeTournament(userTeamId) {
        // Get user selected team
        this.userTeam = IPL_TEAMS.find(t => t.id === userTeamId);
        
        // Get remaining teams (excluding user team)
        const otherTeams = IPL_TEAMS.filter(t => t.id !== userTeamId);
        
        // Randomly shuffle and select 5 teams from the remaining teams
        const shuffledTeams = this.shuffleArray([...otherTeams]);
        const selectedTeams = shuffledTeams.slice(0, 5);
        
        // Create all 6 teams including user team
        const allTournamentTeams = [this.userTeam, ...selectedTeams];
        
        // Randomly divide into groups
        this.divideIntoGroups(allTournamentTeams);
        
        // Generate group matches
        this.generateGroupMatches();
        
        // Initialize standings
        this.initializeStandings();
        
        // Generate all match results (except user matches)
        this.generateMatchResults();
        
        // Find first user match
        this.findNextUserMatch();
        
        return this.getTournamentData();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    divideIntoGroups(teams) {
        const shuffledTeams = this.shuffleArray(teams);
        
        // Ensure user team is placed randomly in either group
        const userTeamIndex = shuffledTeams.findIndex(t => t.id === this.userTeam.id);
        const userInGroupA = Math.random() < 0.5;
        
        if (userInGroupA) {
            this.groups.A = [this.userTeam];
            this.groups.B = [];
            
            // Add other teams alternately
            const otherTeams = shuffledTeams.filter(t => t.id !== this.userTeam.id);
            for (let i = 0; i < otherTeams.length; i++) {
                if (this.groups.A.length < 3) {
                    this.groups.A.push(otherTeams[i]);
                } else {
                    this.groups.B.push(otherTeams[i]);
                }
            }
        } else {
            this.groups.B = [this.userTeam];
            this.groups.A = [];
            
            // Add other teams alternately
            const otherTeams = shuffledTeams.filter(t => t.id !== this.userTeam.id);
            for (let i = 0; i < otherTeams.length; i++) {
                if (this.groups.A.length < 3) {
                    this.groups.A.push(otherTeams[i]);
                } else {
                    this.groups.B.push(otherTeams[i]);
                }
            }
        }
    }

    generateGroupMatches() {
        // Generate matches for Group A
        const groupATeams = this.groups.A;
        for (let i = 0; i < groupATeams.length; i++) {
            for (let j = i + 1; j < groupATeams.length; j++) {
                this.groupMatches.A.push({
                    id: `A_${i}_${j}`,
                    team1: groupATeams[i],
                    team2: groupATeams[j],
                    result: null,
                    isUserMatch: groupATeams[i].id === this.userTeam.id || groupATeams[j].id === this.userTeam.id
                });
            }
        }

        // Generate matches for Group B
        const groupBTeams = this.groups.B;
        for (let i = 0; i < groupBTeams.length; i++) {
            for (let j = i + 1; j < groupBTeams.length; j++) {
                this.groupMatches.B.push({
                    id: `B_${i}_${j}`,
                    team1: groupBTeams[i],
                    team2: groupBTeams[j],
                    result: null,
                    isUserMatch: groupBTeams[i].id === this.userTeam.id || groupBTeams[j].id === this.userTeam.id
                });
            }
        }

        // Combine all matches for easy access
        this.totalMatches = [...this.groupMatches.A, ...this.groupMatches.B];
    }

    initializeStandings() {
        // Initialize Group A standings
        this.groupStandings.A = this.groups.A.map(team => ({
            team: team,
            matches: 0,
            won: 0,
            lost: 0,
            points: 0,
            runsFor: 0,
            ballsFor: 0,
            runsAgainst: 0,
            ballsAgainst: 0,
            nrr: 0.00
        }));

        // Initialize Group B standings
        this.groupStandings.B = this.groups.B.map(team => ({
            team: team,
            matches: 0,
            won: 0,
            lost: 0,
            points: 0,
            runsFor: 0,
            ballsFor: 0,
            runsAgainst: 0,
            ballsAgainst: 0,
            nrr: 0.00
        }));
    }

    generateMatchResults() {
        // Generate results for all non-user matches
        [...this.groupMatches.A, ...this.groupMatches.B].forEach(match => {
            if (!match.isUserMatch) {
                const result = this.simulateMatch(match.team1, match.team2);
                match.result = result;
                this.updateStandings(match);
                this.completedMatches.push(match);
            }
        });
    }

    simulateMatch(team1, team2) {
        // Simulate a match between two AI teams
        const team1Score = this.generateScore();
        const team2Score = this.generateScore();
        
        // Determine winner
        let winner, loser, winMargin, winType;
        if (team1Score.runs > team2Score.runs) {
            winner = team1;
            loser = team2;
            winMargin = team1Score.runs - team2Score.runs;
            winType = 'runs';
        } else {
            winner = team2;
            loser = team1;
            winMargin = team2Score.runs - team1Score.runs;
            winType = 'runs';
        }

        return {
            team1Score: team1Score,
            team2Score: team2Score,
            winner: winner,
            loser: loser,
            winMargin: winMargin,
            winType: winType,
            resultText: this.generateResultText(winner, loser, winMargin, winType)
        };
    }

    generateScore() {
        // Generate realistic cricket scores
        const overs = Math.floor(Math.random() * 20) + 10; // 10-30 overs
        const wickets = Math.floor(Math.random() * 8) + 2; // 2-10 wickets
        const runsPerOver = 4 + Math.random() * 8; // 4-12 runs per over
        const runs = Math.floor(overs * runsPerOver);
        const balls = overs * 6;

        return { runs, balls, wickets, overs };
    }

    generateResultText(winner, loser, margin, type) {
        return `${winner.shortName} beats ${loser.shortName} by ${margin} ${type}`;
    }

    updateStandings(match) {
        const result = match.result;
        const group = this.getTeamGroup(match.team1);
        
        // Update team1 stats
        const team1Standing = this.groupStandings[group].find(s => s.team.id === match.team1.id);
        team1Standing.matches++;
        team1Standing.runsFor += result.team1Score.runs;
        team1Standing.ballsFor += result.team1Score.balls;
        team1Standing.runsAgainst += result.team2Score.runs;
        team1Standing.ballsAgainst += result.team2Score.balls;

        // Update team2 stats
        const team2Standing = this.groupStandings[group].find(s => s.team.id === match.team2.id);
        team2Standing.matches++;
        team2Standing.runsFor += result.team2Score.runs;
        team2Standing.ballsFor += result.team2Score.balls;
        team2Standing.runsAgainst += result.team1Score.runs;
        team2Standing.ballsAgainst += result.team1Score.balls;

        // Update win/loss and points
        if (result.winner.id === match.team1.id) {
            team1Standing.won++;
            team1Standing.points += 2;
            team2Standing.lost++;
        } else {
            team2Standing.won++;
            team2Standing.points += 2;
            team1Standing.lost++;
        }

        // Calculate NRR
        this.calculateNRR(team1Standing);
        this.calculateNRR(team2Standing);

        // Sort standings
        this.sortStandings(group);
    }

    calculateNRR(teamStanding) {
        const runRate = teamStanding.ballsFor > 0 ? (teamStanding.runsFor / teamStanding.ballsFor) * 6 : 0;
        const runRateAgainst = teamStanding.ballsAgainst > 0 ? (teamStanding.runsAgainst / teamStanding.ballsAgainst) * 6 : 0;
        teamStanding.nrr = parseFloat((runRate - runRateAgainst).toFixed(2));
    }

    sortStandings(group) {
        this.groupStandings[group].sort((a, b) => {
            // First by points
            if (b.points !== a.points) return b.points - a.points;
            // Then by NRR
            return b.nrr - a.nrr;
        });
    }

    getTeamGroup(team) {
        return this.groups.A.find(t => t.id === team.id) ? 'A' : 'B';
    }

    findNextUserMatch() {
        const userMatches = this.totalMatches.filter(m => m.isUserMatch && !m.result);
        
        if (userMatches.length > 0) {
            this.currentMatch = userMatches[0];
            return;
        }
        
        // Check if final has already been played
        if (this.finalMatch && this.finalMatch.result) {
            this.currentMatch = null;
            return;
        }
        
        // No user matches left, check if final is available
        if (this.areGroupsComplete()) {
            this.setupFinal();
            return;
        }
        
        // User has no more matches but groups aren't complete
        this.currentMatch = null;
    }

    areGroupsComplete() {
        const groupAComplete = this.groupMatches.A.every(m => m.result);
        const groupBComplete = this.groupMatches.B.every(m => m.result);
        return groupAComplete && groupBComplete;
    }

    canUserStillQualify() {
        const userGroup = this.getTeamGroup(this.userTeam);
        const userGroupStandings = this.groupStandings[userGroup];
        const userStanding = userGroupStandings.find(s => s.team.id === this.userTeam.id);
        
        if (!userStanding) return false;
        
        // User can qualify if:
        // 1. They are currently in 1st place, OR
        // 2. They have matches remaining and can mathematically reach 1st place
        
        if (userStanding === userGroupStandings[0]) {
            return true; // Currently in 1st place
        }
        
        // Check remaining matches for user
        const userRemainingMatches = this.totalMatches.filter(m => m.isUserMatch && !m.result).length;
        if (userRemainingMatches === 0) {
            return userStanding === userGroupStandings[0]; // No more matches, must be 1st
        }
        
        // Calculate maximum possible points
        const maxPossiblePoints = userStanding.points + (userRemainingMatches * 2);
        const currentLeaderPoints = userGroupStandings[0].points;
        
        // Calculate leader's remaining matches
        const leaderTeam = userGroupStandings[0].team;
        const leaderRemainingMatches = this.totalMatches.filter(m => 
            (m.team1.id === leaderTeam.id || m.team2.id === leaderTeam.id) && !m.result
        ).length;
        
        const leaderMaxPoints = currentLeaderPoints + (leaderRemainingMatches * 2);
        
        // User can qualify if they can equal or exceed leader's max points
        // and have a chance to improve NRR
        return maxPossiblePoints >= leaderMaxPoints;
    }

    setupFinal() {
        // Don't setup final if it already exists
        if (this.finalMatch) {
            return;
        }
        
        const groupAWinner = this.groupStandings.A[0];
        const groupBWinner = this.groupStandings.B[0];
        
        // Check if user qualified for final
        const userQualified = groupAWinner.team.id === this.userTeam.id || groupBWinner.team.id === this.userTeam.id;
        
        if (userQualified) {
            this.finalMatch = {
                id: 'final',
                team1: groupAWinner.team,
                team2: groupBWinner.team,
                result: null,
                isUserMatch: true,
                isFinal: true
            };
            this.currentMatch = this.finalMatch;
        } else {
            // Simulate final if user didn't qualify
            const finalResult = this.simulateMatch(groupAWinner.team, groupBWinner.team);
            this.finalMatch = {
                id: 'final',
                team1: groupAWinner.team,
                team2: groupBWinner.team,
                result: finalResult,
                isUserMatch: false,
                isFinal: true
            };
            this.tournamentWinner = finalResult.winner;
        }
    }

    completeUserMatch(userScore, userBalls, oppositionScore, oppositionBalls, userWon) {
        if (!this.currentMatch) {
            return null;
        }

        const userTeamIsTeam1 = this.currentMatch.team1.id === this.userTeam.id;
        const oppositionTeam = userTeamIsTeam1 ? this.currentMatch.team2 : this.currentMatch.team1;
        
        let team1Score, team2Score;
        if (userTeamIsTeam1) {
            team1Score = { runs: userScore, balls: userBalls };
            team2Score = { runs: oppositionScore, balls: oppositionBalls };
        } else {
            team1Score = { runs: oppositionScore, balls: oppositionBalls };
            team2Score = { runs: userScore, balls: userBalls };
        }

        // Determine winner/loser using provided outcome when available.
        // Fallback to score comparison if userWon is undefined.
        let winner, loser, winMargin, winType;
        if (typeof userWon === 'boolean') {
            if (userWon) {
                winner = this.userTeam;
                loser = oppositionTeam;
                // Prefer a positive, sensible margin. If user's runs exceed opposition, show runs; otherwise show wickets.
                if (userScore > oppositionScore) {
                    winMargin = userScore - oppositionScore;
                    winType = 'runs';
                } else {
                    const wicketsLeft = 1 + Math.floor(Math.random() * 6); // 1-6 wickets left
                    winMargin = wicketsLeft;
                    winType = 'wickets';
                }
            } else {
                winner = oppositionTeam;
                loser = this.userTeam;
                // Ensure a non-negative runs margin for a loss
                winMargin = Math.max(1, oppositionScore - userScore);
                winType = 'runs';
            }
        } else {
            // Legacy path: decide purely by runs (may be inaccurate for chases)
            if (userScore > oppositionScore) {
                winner = this.userTeam;
                loser = oppositionTeam;
                winMargin = userScore - oppositionScore;
                winType = 'runs';
            } else if (oppositionScore > userScore) {
                winner = oppositionTeam;
                loser = this.userTeam;
                const wicketsLeft = 10 - Math.floor(Math.random() * 5);
                winMargin = wicketsLeft;
                winType = 'wickets';
            } else {
                if (userBalls < oppositionBalls) {
                    winner = this.userTeam;
                    loser = oppositionTeam;
                } else {
                    winner = oppositionTeam;
                    loser = this.userTeam;
                }
                winMargin = Math.abs(userBalls - oppositionBalls);
                winType = 'balls';
            }
        }

        const matchResult = {
            team1Score,
            team2Score,
            winner,
            loser,
            winMargin,
            winType,
            resultText: this.generateResultText(winner, loser, winMargin, winType)
        };
        
        this.currentMatch.result = matchResult;

        // Update standings if it's a group match
        if (!this.currentMatch.isFinal) {
            this.updateStandings(this.currentMatch);
        } else {
            this.tournamentWinner = winner;
        }

        this.completedMatches.push(this.currentMatch);
        
        // Find next match
        this.findNextUserMatch();
        
        return matchResult;
    }

    getTournamentData() {
        return {
            groups: this.groups,
            groupStandings: this.groupStandings,
            groupMatches: this.groupMatches,
            finalMatch: this.finalMatch,
            currentMatch: this.currentMatch,
            completedMatches: this.completedMatches,
            totalMatches: this.totalMatches,
            tournamentWinner: this.tournamentWinner,
            userTeam: this.userTeam,
            isComplete: this.isComplete()
        };
    }

    isComplete() {
        return this.finalMatch && this.finalMatch.result;
    }

    getFixtures() {
        const fixtures = [];
        
        // Group A matches
        this.groupMatches.A.forEach(match => {
            fixtures.push({
                matchId: match.id,
                type: 'Group A',
                team1: match.team1.shortName,
                team2: match.team2.shortName,
                result: match.result ? match.result.resultText : 'Pending',
                completed: !!match.result
            });
        });

        // Group B matches
        this.groupMatches.B.forEach(match => {
            fixtures.push({
                matchId: match.id,
                type: 'Group B',
                team1: match.team1.shortName,
                team2: match.team2.shortName,
                result: match.result ? match.result.resultText : 'Pending',
                completed: !!match.result
            });
        });

        // Final
        if (this.finalMatch) {
            fixtures.push({
                matchId: 'final',
                type: 'Final',
                team1: this.finalMatch.team1.shortName,
                team2: this.finalMatch.team2.shortName,
                result: this.finalMatch.result ? this.finalMatch.result.resultText : 'Pending',
                completed: !!this.finalMatch.result
            });
        }

        return fixtures;
    }

    getPointsTable() {
        return {
            groupA: [...this.groupStandings.A],
            groupB: [...this.groupStandings.B]
        };
    }

    getNextOpposition() {
        if (!this.currentMatch) return null;
        
        return this.currentMatch.team1.id === this.userTeam.id ? 
            this.currentMatch.team2 : this.currentMatch.team1;
    }

    getCurrentMatchInfo() {
        if (!this.currentMatch) return null;
        
        const opposition = this.getNextOpposition();
        return {
            matchType: this.currentMatch.isFinal ? 'Final' : `Group ${this.getTeamGroup(this.userTeam)}`,
            opposition: opposition,
            isChaseMatch: true // User always chases
        };
    }
}
