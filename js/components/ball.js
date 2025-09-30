class Ball {
    constructor(ctx, difficulty, onMiss) {
        this.ctx = ctx;
        this.difficulty = difficulty;
        this.onMiss = onMiss;
        // Gravity acceleration scaling the ball's downward pull
        this.G = 980 * 0.10;
        // Coefficient for air resistance slowing a struck ball
        this.AIR_DRAG = 0.12;
        // Energy retention when a fast ball strikes the pitch
        this.BOUNCE_FAST = 0.45;
        // Energy retention for medium pace deliveries
        this.BOUNCE_MED = 0.52;
        // Energy retention for spin bowling
        this.BOUNCE_SPIN = 0.58;
        // Surface friction reducing horizontal speed after bounce
        this.GROUND_FRICTION = 0.10;
        // Base magnitude of sideways swing acceleration
        this.SWING_BASE = 85;
        // Rate at which swing acceleration decays over time
        this.SWING_DECAY = 2.2;
        // Multiplier to spin rate imparted after a bounce
        this.SPIN_AFTER_BOUNCE = 2.4;
        
        // Enhanced physics parameters for realism
        this.surpriseDelivery = false;
        this.actualBowlerType = null;
        this.edgeRisk = 0;
        this.lbwRisk = 0;
        this.spinRate = 0;
        this.dragCoeff = this.AIR_DRAG;
        
        // Trajectory visualization
        this.trajectory = [];
        this.showTrajectory = false;
        this.trajectoryColor = '#FFFFFF';
        this.trajectoryType = null; // 'Lofted' | 'Ground'
        this.trajectoryStartTime = 0;
        this.trajectoryDurationMs = 0;
        this.trajectoryTTL = 1800; // ms: keep tracer visible ~1.8s
        
        this.reset();
    }
    // Restore ball to an inactive starting state with no motion or swing
    reset() {
        this.isActive = false;
        this.isHit = false;
        this.hasBounced = false;
        this.type = "medium";
        this.pos = { x: 0, y: 0, z: 18 };
        this.vel = { x: 0, y: 0, z: 0 };
        this.swingAccel = 0;
        this.swingSign = 1;
        this.trail = [];
        this.surpriseDelivery = false;
        this.actualBowlerType = null;
        this.edgeRisk = 0;
        this.lbwRisk = 0;
        this.spinRate = 0;
        this.spinDrift = 0;
        this.dragCoeff = this.AIR_DRAG;
        
        // Reset trajectory
        this.trajectory = [];
        this.showTrajectory = false;
        this.trajectoryColor = '#FFFFFF';
        this.trajectoryType = null;
        this.trajectoryStartTime = 0;
        this.trajectoryDurationMs = 0;
        this.trajectoryTTL = 1800;
    }
    bowl(type, side, bowlerType = null, bowlingStyle = null) {
        this.reset();
        this.isActive = true;
        this.actualBowlerType = bowlerType;
        this.bowlingStyle = bowlingStyle;
        
        // Determine if this is a surprise delivery based on bowler type and difficulty
        const difficultyLevel = this.difficulty?.name || 'pro';
        let surpriseChance = 0;
        if (difficultyLevel === 'amateur') surpriseChance = 0.05;
        else if (difficultyLevel === 'pro') surpriseChance = 0.15;
        else surpriseChance = 0.25; // legend
        
        this.surpriseDelivery = Math.random() < surpriseChance;
        
        // Enhanced delivery type selection based on bowling style
        if (bowlingStyle) {
            // Override type based on actual bowling style and add variations
            if (bowlingStyle === 'Fast') {
                if (Math.random() < 0.2) { // 20% chance for special delivery
                    this.type = Math.random() < 0.5 ? 'yorker' : 'bouncer';
                } else if (this.surpriseDelivery && Math.random() < 0.3) {
                    this.type = 'medium'; // Slower ball variation
                } else {
                    this.type = 'fast';
                }
            } else if (bowlingStyle === 'Fast Medium') {
                if (Math.random() < 0.1) { // 10% chance for special delivery
                    this.type = Math.random() < 0.5 ? 'yorker' : 'bouncer';
                } else if (this.surpriseDelivery && Math.random() < 0.4) {
                    this.type = Math.random() < 0.5 ? 'fast' : 'medium'; // Speed variations
                } else {
                    this.type = 'medium';
                }
            } else if (bowlingStyle === 'Spin') {
                if (this.surpriseDelivery && Math.random() < 0.2) {
                    this.type = 'medium'; // Quicker delivery
                } else {
                    this.type = 'spin';
                }
            } else {
                // Fallback to original logic
                if (this.surpriseDelivery) {
                    if (type === 'fast' && Math.random() < 0.7) {
                        this.type = 'medium';
                    } else if (type === 'spin' && Math.random() < 0.6) {
                        this.type = 'medium';
                    } else {
                        this.type = type;
                        this.surpriseDelivery = false;
                    }
                } else {
                    this.type = type;
                }
            }
        } else {
            // Original surprise delivery logic for backward compatibility
            if (this.surpriseDelivery) {
                if (type === 'fast' && Math.random() < 0.7) {
                    this.type = 'medium';
                } else if (type === 'spin' && Math.random() < 0.6) {
                    this.type = 'medium';
                } else {
                    this.type = type;
                    this.surpriseDelivery = false;
                }
            } else {
                this.type = type;
            }
        }
        
        const W = this.ctx.canvas.width;
        const H = this.ctx.canvas.height;
        this.pos.x = W / 2 + (Math.random() - 0.5) * 20;
        this.pos.y = H * 0.55;
        this.pos.z = 22;
        
        // More realistic pitch variation based on bowler skill and difficulty
        const r = Math.random();
        let pitchY;
        const difficultyPitchFactor = difficultyLevel === 'amateur' ? 0.15 : difficultyLevel === 'pro' ? 0.1 : 0.05;

        if (this.type === 'yorker') {
            pitchY = H * (0.92 + (Math.random() - 0.5) * 0.02); // Pitches very close to the batsman
        } else if (this.type === 'bouncer') {
            pitchY = H * (0.7 + (Math.random() - 0.5) * 0.05); // Pitches short
        } else {
            if (r < 0.15) pitchY = H * (0.72 + difficultyPitchFactor);
            else if (r < 0.8) pitchY = H * (0.80 + difficultyPitchFactor);
            else pitchY = H * (0.88 + difficultyPitchFactor);
        }
        
        const lineOffset = (side === 'off' ? -24 : 24) + (Math.random() - 0.5) * 18;
        const targetXAtStumps = W / 2 + lineOffset;
        
        // Enhanced speed calculation with bowling style variations
        const speedScale = this.difficulty?.ballSpeed ?? 1.0;
        let speedVariation = 0.85 + Math.random() * 0.3; // ±15% base variation
        let vyBase;
        
        // Bowling style-specific speed characteristics
        if (this.bowlingStyle === 'Fast') {
            // Fast bowlers: 140-155 kmph equivalent
            if (this.type === 'fast') {
                vyBase = (320 + Math.random() * 50) * speedScale * speedVariation; // 320-370 base
            } else {
                vyBase = (250 + Math.random() * 30) * speedScale * speedVariation; // Slower ball
            }
        } else if (this.bowlingStyle === 'Fast Medium') {
            // Fast medium bowlers: 125-140 kmph equivalent
            if (this.type === 'fast') {
                vyBase = (290 + Math.random() * 30) * speedScale * speedVariation; // 290-320 base
            } else {
                vyBase = (240 + Math.random() * 40) * speedScale * speedVariation; // 240-280 base
            }
        } else if (this.bowlingStyle === 'Spin') {
            // Spin bowlers: 80-95 kmph equivalent, with occasional quicker ones
            if (this.type === 'medium') {
                vyBase = (200 + Math.random() * 25) * speedScale * speedVariation; // Quicker delivery
            } else {
                vyBase = (140 + Math.random() * 25) * speedScale * speedVariation; // 140-165 base (slower)
            }
        } else {
            // Original logic for backward compatibility
            if (this.type === 'fast') {
                vyBase = (300 + Math.random() * 40) * speedScale * speedVariation;
            } else if (this.type === 'medium') {
                vyBase = (230 + Math.random() * 40) * speedScale * speedVariation;
            } else { // spin
                vyBase = (180 + Math.random() * 30) * speedScale * speedVariation;
            }
        }
        
        this.vel.y = vyBase;
        const tToStumps = (H * 0.90 - this.pos.y) / this.vel.y;
        this.vel.x = ((targetXAtStumps - this.pos.x) / Math.max(tToStumps, 0.001));
        const tToPitch = Math.max((pitchY - this.pos.y) / this.vel.y, 0.05);
        this.vel.z = (0.5 * this.G * tToPitch - this.pos.z / tToPitch);
        
        // Enhanced swing mechanics based on bowling style
        this.swingSign = (Math.random() < 0.5 ? -1 : 1) * (side === 'off' ? -1 : 1);
        const swingScale = (this.difficulty?.swing ?? 60) / 100;
        const baseSwing = this.SWING_BASE * swingScale;
        
        if (this.bowlingStyle === 'Fast') {
            // Fast bowlers: Excellent swing, especially conventional swing
            if (this.type === 'fast') {
                this.swingAccel = baseSwing * (1.2 + Math.random() * 0.4) * this.swingSign; // High swing
            } else {
                this.swingAccel = baseSwing * (0.6 + Math.random() * 0.3) * this.swingSign; // Reduced swing on slower balls
            }
        } else if (this.bowlingStyle === 'Fast Medium') {
            // Fast medium: Moderate swing, more consistent
            this.swingAccel = baseSwing * (0.8 + Math.random() * 0.3) * this.swingSign;
        } else if (this.bowlingStyle === 'Spin') {
            // Spin bowlers: Less conventional swing, but more drift and turn
            this.swingAccel = baseSwing * (0.4 + Math.random() * 0.2) * this.swingSign;
            this.spinRate = 2.0 + Math.random() * 3.0; // High spin rate
            
            // Add spin drift effect - ball changes direction more after pitching
            this.spinDrift = (Math.random() - 0.5) * 60; // Lateral drift
        } else {
            // Original logic
            if (this.type === 'fast') {
                this.swingAccel = baseSwing * (0.8 + Math.random() * 0.3) * this.swingSign;
            } else if (this.type === 'medium') {
                this.swingAccel = baseSwing * (0.9 + Math.random() * 0.4) * this.swingSign;
            } else { // spin
                this.swingAccel = baseSwing * (1.1 + Math.random() * 0.5) * this.swingSign;
                this.spinRate = 1.5 + Math.random() * 2.0;
            }
        }
        
        // Calculate edge and LBW risk based on delivery parameters
        this.calculateRisks();
        this.hasBounced = false;
    }
    calculateRisks() {
        const difficultyLevel = this.difficulty?.name || 'pro';
        const W = this.ctx.canvas.width;
        
        // Edge risk based on ball position, swing, and difficulty
        const lateralDistance = Math.abs(this.pos.x - W / 2);
        const swingIntensity = Math.abs(this.swingAccel);
        
        this.edgeRisk = (lateralDistance / 50) * (swingIntensity / 100) * 0.3;
        
        if (difficultyLevel === 'amateur') this.edgeRisk *= 0.5;
        else if (difficultyLevel === 'legend') this.edgeRisk *= 1.8;
        
        // LBW risk calculation based on proper cricket rules
        const stumpsX = W / 2;
        const lineDeviation = Math.abs(this.pos.x - stumpsX);
        
        // Check if ball is in line with stumps or on off side (proper LBW line condition)
        const isInLBWLine = this.pos.x >= stumpsX - 12 && this.pos.x <= stumpsX + 25; // Tighter line requirement
        
        // LBW risk only applies if:
        // 1. Ball is on proper line (in line or off side)
        // 2. Ball would have hit the stumps (straight enough)
        if (isInLBWLine && lineDeviation < 15) { // More strict line requirement
            this.lbwRisk = Math.max(0, (15 - lineDeviation) / 15) * 0.06; // Much reduced base risk (was 0.15)
        } else {
            this.lbwRisk = 0; // No LBW risk if ball is not on proper line
        }
        
        // Further reduce LBW risk based on difficulty
        if (difficultyLevel === 'amateur') this.lbwRisk *= 0.1; // Was 0.2
        else if (difficultyLevel === 'pro') this.lbwRisk *= 0.5; // New moderate reduction
        else if (difficultyLevel === 'legend') this.lbwRisk *= 0.8; // Was 1.2
    }
    
    isHittable() {
        const H = this.ctx.canvas.height;
        return this.pos.y > H * 0.86 && this.pos.y < H * 0.95 && this.pos.z < 12 && !this.isHit;
    }
    attemptHit(swingDirection) {
        const H = this.ctx.canvas.height;
        const W = this.ctx.canvas.width;
        const idealY = H * 0.90;
        const timingDiff = this.pos.y - idealY;
        
        // Enhanced timing window calculation with difficulty scaling
        const difficultyLevel = this.difficulty?.name || 'pro';
        let baseTimingWindow = (window.GameTuning?.timing?.baseWindow) ?? 26; // Centralized tuning override
        
        // Adjust base timing window for surprise deliveries
        if (this.surpriseDelivery) {
            baseTimingWindow *= 0.8; // Make surprise deliveries harder to time
        }
        
        const timingWindow = baseTimingWindow * (this.difficulty?.timingWindow ?? 1.0);
        
        let timing, color, power, timingScore;
        const absTimingDiff = Math.abs(timingDiff);
        
        // More stringent timing requirements for higher scores
        if (absTimingDiff < timingWindow * 0.2) {
            timing = "PERFECT!"; color = "#01FF70"; power = 1.65; timingScore = 3;
        } else if (absTimingDiff < timingWindow * 0.5) {
            timing = "GOOD"; color = "#FFDC00"; power = 1.15; timingScore = 2;
        } else if (absTimingDiff < timingWindow * 0.8) {
            if (timingDiff < 0) {
                timing = "EARLY"; color = "#7FDBFF"; power = 0.7; timingScore = 1;
            } else {
                timing = "LATE"; color = "#FF851B"; power = 0.55; timingScore = 1;
            }
        } else {
            // Very poor timing - higher chance of dismissal
            if (timingDiff < 0) {
                timing = "TOO EARLY"; color = "#B10DC9"; power = 0.3; timingScore = 0;
            } else {
                timing = "TOO LATE"; color = "#FF4136"; power = 0.2; timingScore = 0;
            }
        }
        
        // Enhanced directional play with more realistic consequences
        const intendedSide = (this.pos.x < W / 2) ? "left" : "right";
        const directionOK = (swingDirection === intendedSide) || (swingDirection === "up") || (swingDirection === "down");
        
        // Enhanced edge detection with bowler-specific characteristics
        let isEdged = false;
        if (!directionOK || timingScore === 0) {
            // Calculate bowler-specific edge risk multipliers
            let bowlerEdgeMultiplier = 1.0;

            if (this.bowlingStyle === 'Fast') {
                // Fast bowlers more likely to generate edges due to pace and swing
                bowlerEdgeMultiplier = window.GameTuning?.edges?.bowlerEdgeMultiplier?.Fast ?? 1.2;
                if (this.type === 'fast' && this.surpriseDelivery) {
                    const s = window.GameTuning?.edges?.surpriseSlowFactorFast ?? 1.6;
                    bowlerEdgeMultiplier = s; // Slower ball surprise factor
                }
            } else if (this.bowlingStyle === 'Fast Medium') {
                // Moderate edge generation
                bowlerEdgeMultiplier = window.GameTuning?.edges?.bowlerEdgeMultiplier?.['Fast Medium'] ?? 1.1;
            } else if (this.bowlingStyle === 'Spin') {
                // Spin bowlers less likely to generate edges, but can get catches
                bowlerEdgeMultiplier = window.GameTuning?.edges?.bowlerEdgeMultiplier?.Spin ?? 0.6;
                if (this.spinRate > 3.0) {
                    bowlerEdgeMultiplier = Math.max(bowlerEdgeMultiplier, 0.9); // High spin can deceive
                }
            }

            let edgeChance = this.edgeRisk * bowlerEdgeMultiplier *
                              (directionOK ? 1.0 : 1.5) *
                              (timingScore === 0 ? 2.0 : 1.0);
            // Difficulty-aware cap to prevent excessive edge dismissals
            const diff = this.difficulty?.name || 'pro';
            const edgeCap = window.GameTuning?.edges?.capByDifficulty?.[diff] ?? (diff === 'amateur' ? 0.20 : diff === 'legend' ? 0.30 : 0.25);
            edgeChance = Math.min(edgeChance, edgeCap);

            if (Math.random() < edgeChance) {
                isEdged = true;
                // Not every edge is out. Favor play-and-miss or streaky runs.
                // Chance that an edged ball results in an actual dismissal
                let wicketEdgeChance = (this.bowlingStyle === 'Fast') ?
                    (window.GameTuning?.edges?.wicketOnEdgeBase?.Fast ?? 0.45) :
                    (this.bowlingStyle === 'Fast Medium') ? (window.GameTuning?.edges?.wicketOnEdgeBase?.['Fast Medium'] ?? 0.35)
                    : (window.GameTuning?.edges?.wicketOnEdgeBase?.Spin ?? 0.25);
                const diffEdgeScale = window.GameTuning?.edges?.wicketOnEdgeDiffScale?.[diff] ?? (diff === 'amateur' ? 0.7 : diff === 'legend' ? 1.15 : 1.0);
                const edgeWicketCap = window.GameTuning?.edges?.wicketOnEdgeCap ?? 0.6;
                wicketEdgeChance = Math.min(wicketEdgeChance * diffEdgeScale, edgeWicketCap);
                if (Math.random() < wicketEdgeChance) {
                    const dismissalType = this.bowlingStyle === 'Fast' ? 'Caught Behind' : 'Caught';
                    return {
                        timing: "EDGED!",
                        runs: 0,
                        color: "#FF4136",
                        timingScore: 0,
                        dismissal: dismissalType,
                        bowlerStyle: this.bowlingStyle
                    };
                } else {
                    // Edge not carried: treat as dot or a scrappy single
                    const scrappyRuns = Math.random() < (window.GameTuning?.edges?.scrappySingleProb ?? 0.2) ? 1 : 0;
                    return {
                        timing: "EDGED!",
                        runs: scrappyRuns,
                        color: "#FF851B",
                        timingScore: 0
                    };
                }
            }
        }
        
        // Enhanced LBW system based on bowler type and proper cricket rules
        if (!isEdged && this.lbwRisk > 0) {
            let lbwChance = 0;
            let bowlerLBWMultiplier = 1.0;
            
            // Bowler-specific LBW characteristics
            if (this.bowlingStyle === 'Fast') {
                bowlerLBWMultiplier = window.GameTuning?.lbw?.bowlerMultiplier?.Fast ?? 0.4;
            } else if (this.bowlingStyle === 'Fast Medium') {
                bowlerLBWMultiplier = window.GameTuning?.lbw?.bowlerMultiplier?.['Fast Medium'] ?? 0.9;
            } else if (this.bowlingStyle === 'Spin') {
                bowlerLBWMultiplier = window.GameTuning?.lbw?.bowlerMultiplier?.Spin ?? 1.2;
                if (this.spinRate > 3.5) {
                    bowlerLBWMultiplier = window.GameTuning?.lbw?.bowlerMultiplierSpinHigh ?? 1.4;
                }
            }
            
            // Calculate LBW chance based on timing and shot selection
            if (timingScore === 0) {
                lbwChance = this.lbwRisk * bowlerLBWMultiplier * (window.GameTuning?.lbw?.poorTimingFactor ?? 1.8);
            } else if (!directionOK && timingScore === 1) {
                lbwChance = this.lbwRisk * bowlerLBWMultiplier * (window.GameTuning?.lbw?.wrongShotFactor ?? 0.9);
            }
            
            // Defensive shots are much safer from LBW
            if (swingDirection === "down") {
                lbwChance *= 0.05; // Defensive shots greatly reduce LBW risk
            }
            
            // Very small chance of LBW even with decent timing if ball is very straight
            if (timingScore >= 2 && this.lbwRisk > 0.05) {
                lbwChance = this.lbwRisk * bowlerLBWMultiplier * (window.GameTuning?.lbw?.goodTimingSmallChanceFactor ?? 0.05);
            }
            // Cap LBW chance so it rarely feels unfair
            lbwChance = Math.min(lbwChance, window.GameTuning?.lbw?.cap ?? 0.18);
            
            if (Math.random() < lbwChance) {
                return { 
                    timing: "LBW!", 
                    runs: 0, 
                    color: "#FF4136", 
                    timingScore: 0, 
                    dismissal: "LBW",
                    bowlerStyle: this.bowlingStyle
                };
            }
        }
        
        if (!directionOK) power *= 0.45;
        
        let shotType = "normal";
        if (swingDirection == "up") { shotType = "straight"; power *= 1.3; }
        else if (swingDirection == "down") { 
            shotType = "defensive"; 
            power *= 0.25;
            // Defensive shots are much safer - greatly reduce edge and LBW risk
            if (this.edgeRisk > 0) this.edgeRisk *= 0.2; // Even safer from edges
            if (this.lbwRisk > 0) this.lbwRisk *= 0.05; // Much safer from LBW (was 0.1)
        }
        
        this.isHit = true;
        
        let angle;
        if (shotType === "straight") angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.15;
        else if (shotType === "defensive") angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.06;
        else angle = (swingDirection === "left" ? Math.PI * 1.25 : Math.PI * 1.75) + (Math.random() - 0.5) * 0.3;
        
        const incomingVec = { x: this.vel.x, y: this.vel.y, z: this.vel.z };
        const batSpeed = 450 * power; // Enhanced bat speed for better shot power
        const batVel = {
            x: Math.cos(angle) * batSpeed,
            y: Math.sin(angle) * batSpeed
        };
        
        const loftBase = 75 * power * (shotType === "defensive" ? 0.3 : 1);
        batVel.z = loftBase + Math.max(0, -0.18 * batVel.y);
        
        const e = 0.58;
        this.vel.x = (1 + e) * batVel.x - e * incomingVec.x;
        this.vel.y = (1 + e) * batVel.y - e * incomingVec.y;
        this.vel.z = Math.max(0, (1 + e) * batVel.z - e * incomingVec.z);
        
        // Enhanced 4s and 6s system with realistic timing requirements
        let runs = 0;
        const postSpeed = Math.hypot(this.vel.x, this.vel.y);
        const totalVelocity = Math.hypot(this.vel.x, this.vel.y, this.vel.z); // Include loft velocity
        
        if (shotType === "defensive") {
            runs = Math.random() < 0.15 ? 1 : 0;
        } else {
            // 6s: Only achievable with PERFECT timing (sweet spot connection)
            if (timing === "PERFECT!" && timingScore === 3) {
                if (totalVelocity > 650 && this.vel.z > 80) { // High loft and speed
                    runs = 6;
                } else if (postSpeed > 520) { // Excellent timing along ground
                    runs = 4;
                } else if (postSpeed > 320) {
                    runs = Math.random() < 0.8 ? 2 : 3;
                } else if (postSpeed > 180) {
                    runs = Math.random() < 0.7 ? 1 : 2;
                } else {
                    runs = 1;
                }
            }
            // 4s: Achievable with GOOD or PERFECT timing
            else if (timingScore >= 2) { // GOOD or PERFECT
                if (postSpeed > 480 && (this.vel.z > 40 || postSpeed > 550)) {
                    runs = 4;
                } else if (postSpeed > 350) {
                    runs = Math.random() < 0.8 ? 2 : 3;
                } else if (postSpeed > 220) {
                    runs = Math.random() < 0.75 ? 2 : 1;
                } else if (postSpeed > 140) {
                    runs = Math.random() < 0.6 ? 1 : 0;
                } else {
                    runs = 0;
                }
            }
            // Singles and doubles for moderate timing
            else if (timingScore === 1) { // EARLY or LATE
                if (postSpeed > 280) {
                    runs = Math.random() < 0.6 ? 2 : 1;
                } else if (postSpeed > 160) {
                    runs = Math.random() < 0.5 ? 1 : 0;
                } else {
                    runs = 0;
                }
            }
            // Very poor timing - mostly dots
            else { // timingScore === 0
                runs = postSpeed > 200 ? (Math.random() < 0.2 ? 1 : 0) : 0;
            }
        }
        
        // Extra power bonus for perfect connection
        if (timing === "PERFECT!" && runs > 0 && Math.random() < 0.15) {
            runs = Math.min(6, runs + 1); // Small chance to upgrade score
        }
        
        // Set trajectory based on shot direction and runs scored
        if (typeof swingDirection !== 'undefined') {
            this.setTrajectory(swingDirection, runs);
        }
        
        return { timing, runs, color, timingScore };
    }
    
    // Set trajectory visualization based on shot result
    setTrajectory(direction, runs) {
        this.showTrajectory = true;
        this.trajectory = [];
        this.trajectoryStartTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        this.trajectoryDurationMs = 0;
        
        // Set color and trajectory characteristics based on runs scored
        if (runs === 6) {
            // Six - high trajectory
            this.trajectoryColor = '#FF4136'; // Red for sixes
            this.setSixTrajectory(direction);
            this.trajectoryType = 'Lofted';
        } else if (runs === 4) {
            // Four - fast grounded trajectory
            this.trajectoryColor = '#0074D9'; // Blue for fours
            this.setFourTrajectory(direction);
            this.trajectoryType = 'Ground';
        } else if (runs > 0) {
            // Other runs - slower grounded trajectory
            this.trajectoryColor = '#01FF70'; // Green for singles, doubles, triples
            this.setRunTrajectory(direction, runs);
            // Decide lofted vs ground from height
            const maxZ = this.trajectory.reduce((m, p) => Math.max(m, p.z || 0), 0);
            this.trajectoryType = maxZ > 35 ? 'Lofted' : 'Ground';
        } else {
            // Dot ball or wicket - defensive trajectory
            this.trajectoryColor = '#FFDC00'; // Yellow for defensive shots
            this.setDefensiveTrajectory(direction);
            this.trajectoryType = 'Ground';
        }
    }
    
    // High trajectory for sixes
    setSixTrajectory(direction) {
        const startPos = { x: this.pos.x, y: this.pos.y, z: this.pos.z };
        let posX = startPos.x;
        let posY = startPos.y;
        let posZ = startPos.z;
        
        // Adjust velocity based on shot direction
        let velX = this.vel.x * 0.7; // Reduce horizontal speed
        let velY = this.vel.y * 0.8; // Reduce forward speed
        let velZ = this.vel.z * 1.5; // Increase vertical speed for height
        
        // Apply direction modifiers
        switch(direction) {
            case 'left':
                velX -= 100; // More leftward
                break;
            case 'right':
                velX += 100; // More rightward
                break;
            case 'up':
                velZ *= 1.2; // Even higher for straight shots
                break;
            case 'down':
                velZ *= 0.5; // Less height for defensive shots
                break;
        }
        
        // Add starting point
        this.trajectory.push({ x: posX, y: posY, z: posZ });
        
        // Simulate trajectory for visualization
        const dt = 0.05;
        const maxPoints = 40; // More points for longer trajectory
        
        for (let i = 0; i < maxPoints; i++) {
            // Apply physics
            velZ -= this.G * dt * 0.8;
            posX += velX * dt;
            posY += velY * dt;
            posZ += velZ * dt;
            
            // Add point to trajectory
            this.trajectory.push({ x: posX, y: posY, z: posZ });
            
            // Stop if ball goes too far or too low
            if (posZ < -50 || posY > startPos.y + 500) break;
        }
        // Record simulated duration for HUD animation
        this.trajectoryDurationMs = Math.max(this.trajectory.length * dt * 1000, this.trajectoryDurationMs);
    }
    
    // Fast grounded trajectory for fours
    setFourTrajectory(direction) {
        const startPos = { x: this.pos.x, y: this.pos.y, z: this.pos.z };
        let posX = startPos.x;
        let posY = startPos.y;
        let posZ = startPos.z;
        
        // Adjust velocity for fast grounded shot
        let velX = this.vel.x * 1.2; // Increase horizontal speed
        let velY = this.vel.y * 1.3; // Increase forward speed
        let velZ = this.vel.z * 0.3; // Reduce vertical speed
        
        // Apply direction modifiers
        switch(direction) {
            case 'left':
                velX -= 150; // More leftward
                break;
            case 'right':
                velX += 150; // More rightward
                break;
            case 'up':
                velY *= 1.1; // More forward for straight shots
                break;
            case 'down':
                velY *= 0.7; // Less forward for defensive shots
                break;
        }
        
        // Add starting point
        this.trajectory.push({ x: posX, y: posY, z: posZ });
        
        // Simulate trajectory for visualization
        const dt = 0.04;
        const maxPoints = 30;
        
        for (let i = 0; i < maxPoints; i++) {
            // Apply physics
            velZ -= this.G * dt * 1.2;
            posX += velX * dt;
            posY += velY * dt;
            posZ += velZ * dt;
            
            // Keep ball grounded (don't go below ground)
            if (posZ < 0) {
                posZ = 0;
                if (velZ < 0) velZ = 0;
            }
            
            // Add point to trajectory
            this.trajectory.push({ x: posX, y: posY, z: posZ });
            
            // Stop if ball goes too far
            if (posY > startPos.y + 400) break;
        }
    }
    
    // Slower grounded trajectory for singles, doubles, triples
    setRunTrajectory(direction, runs) {
        const startPos = { x: this.pos.x, y: this.pos.y, z: this.pos.z };
        let posX = startPos.x;
        let posY = startPos.y;
        let posZ = startPos.z;
        
        // Adjust velocity for slower grounded shot
        let velX = this.vel.x * 0.8; // Moderate horizontal speed
        let velY = this.vel.y * (0.5 + runs * 0.2); // Speed based on runs (1=0.7, 2=0.9, 3=1.1)
        let velZ = this.vel.z * 0.2; // Very little vertical speed
        
        // Apply direction modifiers
        switch(direction) {
            case 'left':
                velX -= 80; // Moderate leftward
                break;
            case 'right':
                velX += 80; // Moderate rightward
                break;
            case 'up':
                velY *= 1.1;
                break;
            case 'down':
                velY *= 0.8; // Less forward for defensive shots
                break;
        }
        
        // Add starting point
        this.trajectory.push({ x: posX, y: posY, z: posZ });
        
        // Simulate trajectory for visualization
        const dt = 0.05;
        const maxPoints = 25;
        
        for (let i = 0; i < maxPoints; i++) {
            // Apply physics
            velZ -= this.G * dt * 1.5;
            posX += velX * dt;
            posY += velY * dt;
            posZ += velZ * dt;
            
            // Keep ball grounded
            if (posZ < 0) {
                posZ = 0;
                if (velZ < 0) velZ = 0;
            }
            
            // Add point to trajectory
            this.trajectory.push({ x: posX, y: posY, z: posZ });
            
            // Stop if ball goes too far
            if (posY > startPos.y + 300) break;
        }
        this.trajectoryDurationMs = Math.max(this.trajectory.length * dt * 1000, this.trajectoryDurationMs);
    }
    
    // Defensive trajectory for dot balls
    setDefensiveTrajectory(direction) {
        const startPos = { x: this.pos.x, y: this.pos.y, z: this.pos.z };
        let posX = startPos.x;
        let posY = startPos.y;
        let posZ = startPos.z;
        
        // Adjust velocity for defensive shot
        let velX = this.vel.x * 0.3; // Very little horizontal speed
        let velY = this.vel.y * 0.2; // Very little forward speed
        let velZ = this.vel.z * 0.1; // Very little vertical speed
        
        // Apply direction modifiers
        switch(direction) {
            case 'left':
                velX -= 30; // Minimal leftward
                break;
            case 'right':
                velX += 30; // Minimal rightward
                break;
            case 'up':
                velY *= 1.2;
                break;
            case 'down':
                velY *= 0.5; // Very little forward
                break;
        }
        
        // Add starting point
        this.trajectory.push({ x: posX, y: posY, z: posZ });
        
        // Simulate trajectory for visualization
        const dt = 0.05;
        const maxPoints = 15;
        
        for (let i = 0; i < maxPoints; i++) {
            // Apply physics
            velZ -= this.G * dt * 2; // Strong gravity to keep ball grounded
            posX += velX * dt;
            posY += velY * dt;
            posZ += velZ * dt;
            
            // Keep ball grounded
            if (posZ < 0) {
                posZ = 0;
                if (velZ < 0) velZ = 0;
            }
            
            // Add point to trajectory
            this.trajectory.push({ x: posX, y: posY, z: posZ });
            
            // Stop if ball goes too far
            if (posY > startPos.y + 100) break;
        }
        this.trajectoryDurationMs = Math.max(this.trajectory.length * dt * 1000, this.trajectoryDurationMs);
    }
    travelTo(x, y) {
        this.vel.x = (x - this.pos.x) * 2;
        this.vel.y = (y - this.pos.y) * 2;
        this.vel.z = 12;
    }
    update(dt) {
        if (!this.isActive) return;
        this.trail.push({ x: this.pos.x, y: this.pos.y, z: this.pos.z });
        if (this.trail.length > 12) this.trail.shift();
        if (!this.isHit) {
            const decay = Math.exp(-this.SWING_DECAY * dt);
            this.swingAccel *= decay;
            this.vel.x += this.swingAccel * dt;
            
            // Apply spin drift for spin bowlers - lateral movement that increases after pitch
            if (this.bowlingStyle === 'Spin' && this.spinDrift && this.spinRate > 0) {
                const spinEffect = this.hasBounced ? this.spinDrift * 2.5 : this.spinDrift * 0.8;
                this.vel.x += spinEffect * dt;
            }
            
            this.vel.z -= this.G * dt;
            this.pos.x += this.vel.x * dt;
            this.pos.y += this.vel.y * dt;
            this.pos.z += this.vel.z * dt;
            if (this.pos.z <= 0 && this.vel.z < 0) {
                const vx = this.vel.x, vy = this.vel.y, vz = this.vel.z;
                const horizSpeed = Math.hypot(vx, vy);
                const speed = Math.hypot(horizSpeed, vz);
                const angle = Math.atan2(-vz, horizSpeed);
                this.pos.z = 0;
                let e = this.BOUNCE_MED;
                if (this.type === "fast") e = this.BOUNCE_FAST;
                else if (this.type === "spin") e = this.BOUNCE_SPIN;
                else if (this.type === "bouncer") e = 0.7; // Higher bounce for bouncers
                const angleFactor = 1 - 0.3 * (angle / (Math.PI / 2));
                const speedFactor = 1 - Math.min(speed / 600, 1) * 0.25;
                e *= angleFactor * speedFactor;
                e = Math.max(0, Math.min(e, 0.9));
                const normalVel = -vz;
                const frictionImpulse = this.GROUND_FRICTION * normalVel;
                this.vel.z = normalVel * e;
                if (horizSpeed > 0) {
                    const fricScale = Math.max(horizSpeed - frictionImpulse, 0) / horizSpeed;
                    this.vel.x = vx * fricScale;
                    this.vel.y = vy * fricScale;
                }
                this.spinRate += Math.abs(this.vel.x) * 0.02;
                if (this.type === "spin") this.spinRate *= this.SPIN_AFTER_BOUNCE;
                this.hasBounced = true;
            }
            if (this.pos.y > this.ctx.canvas.height + 10) {
                this.isActive = false;
                this.onMiss && this.onMiss();
            }
        } else {
            this.vel.z -= this.G * dt;
            const speed = Math.hypot(this.vel.x, this.vel.y, this.vel.z);
            if (speed > 0) {
                const drag = this.dragCoeff * speed;
                this.vel.x -= drag * (this.vel.x / speed) * dt;
                this.vel.y -= drag * (this.vel.y / speed) * dt;
                this.vel.z -= drag * (this.vel.z / speed) * dt;
            }
            this.pos.x += this.vel.x * dt;
            this.pos.y += this.vel.y * dt;
            this.pos.z += this.vel.z * dt;
            if (this.pos.z <= 0 && this.vel.z < 0) {
                const vx = this.vel.x, vy = this.vel.y, vz = this.vel.z;
                const horizSpeed = Math.hypot(vx, vy);
                const speed = Math.hypot(horizSpeed, vz);
                const angle = Math.atan2(-vz, horizSpeed);
                this.pos.z = 0;
                let e = 0.55;
                const angleFactor = 1 - 0.3 * (angle / (Math.PI / 2));
                const speedFactor = 1 - Math.min(speed / 600, 1) * 0.25;
                e *= angleFactor * speedFactor;
                e = Math.max(0, Math.min(e, 0.9));
                const normalVel = -vz;
                const frictionImpulse = this.GROUND_FRICTION * 0.8 * normalVel;
                this.vel.z = normalVel * e;
                if (horizSpeed > 0) {
                    const fricScale = Math.max(horizSpeed - frictionImpulse, 0) / horizSpeed;
                    this.vel.x = vx * fricScale;
                    this.vel.y = vy * fricScale;
                }
                this.spinRate += Math.abs(this.vel.x) * 0.02;
            }
            const W = this.ctx.canvas.width, H = this.ctx.canvas.height;
            if (this.pos.y < -20 || this.pos.x < -20 || this.pos.x > W + 20 || this.pos.z < -12) {
                this.isActive = false;
            }
        }
    }
    draw() {
        const W = this.ctx.canvas.width;
        const H = this.ctx.canvas.height;
        const scale = 0.5 + (this.pos.y / H);
        const shadowRadius = 5 * scale;

        // Expire trajectory after TTL
        if (this.showTrajectory) {
            const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            if (this.trajectoryStartTime && now - this.trajectoryStartTime > (this.trajectoryTTL || 1800)) {
                this.showTrajectory = false;
                this.trajectory = [];
            }
        }

        // Draw aesthetic trajectory overlay (glow + motion dashes)
        if (this.showTrajectory && this.trajectory.length > 1) {
            this.drawPrettyTrajectory();
        }
        
        // If ball is not active, skip rendering the ball itself
        if (!this.isActive) return;

        // Draw shadow with better blur effect
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.ellipse(this.pos.x, this.pos.y + 10, shadowRadius, shadowRadius / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Enhanced 3D ball with better lighting and texture
        const ballX = this.pos.x;
        const ballY = this.pos.y - this.pos.z;
        const ballRadius = 5 * scale;
        
        // Create a more realistic cricket ball with leather texture
        const ballGradient = this.ctx.createRadialGradient(
            ballX - ballRadius * 0.3, 
            ballY - ballRadius * 0.3, 
            0, 
            ballX, 
            ballY, 
            ballRadius
        );
        
        // Cricket ball colors - red with subtle variations
        ballGradient.addColorStop(0, '#FF4136');  // Brighter red center
        ballGradient.addColorStop(0.7, '#CC2E29'); // Main red
        ballGradient.addColorStop(1, '#A61A15');   // Darker edges
        
        this.ctx.beginPath();
        this.ctx.fillStyle = ballGradient;
        this.ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add cricket ball stitching with better visibility
        this.ctx.strokeStyle = '#111111';
        this.ctx.lineWidth = 1.5;
        this.ctx.lineCap = 'round';
        
        // Draw the characteristic cricket ball seam pattern
        this.ctx.beginPath();
        this.ctx.ellipse(ballX, ballY, ballRadius * 0.8, ballRadius * 0.3, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.ellipse(ballX, ballY, ballRadius * 0.8, ballRadius * 0.3, -Math.PI / 4, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Add highlight for 3D effect
        const highlightGradient = this.ctx.createRadialGradient(
            ballX - ballRadius * 0.4, 
            ballY - ballRadius * 0.4, 
            0, 
            ballX - ballRadius * 0.4, 
            ballY - ballRadius * 0.4, 
            ballRadius * 0.5
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.beginPath();
        this.ctx.fillStyle = highlightGradient;
        this.ctx.arc(ballX - ballRadius * 0.3, ballY - ballRadius * 0.3, ballRadius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw trail for fast balls
        if (this.type === 'fast' && this.vel.y > 200) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const alpha = i / this.trail.length;
                
                this.ctx.globalAlpha = alpha * 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y - point.z);
                this.ctx.lineTo(nextPoint.x, nextPoint.y - nextPoint.z);
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1.0;
        }
    }

    // Draw a rich trajectory: glow underlay, animated dashes, apex marker, ground projection
    drawPrettyTrajectory() {
        const ctx = this.ctx;
        const traj = this.trajectory;
        if (!traj || traj.length < 2) return;

        // Precompute projected points
        const pts = traj.map(p => ({ x: p.x, y: p.y - (p.z || 0), gY: p.y, z: p.z || 0 }));
        const maxZ = traj.reduce((m, p) => Math.max(m, p.z || 0), 0);
        const lofted = (this.trajectoryType || (maxZ > 35 ? 'Lofted' : 'Ground')) === 'Lofted';

        // 1) Glow underlay (stronger, more vibrant)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = this.trajectoryColor;
        ctx.shadowBlur = lofted ? 28 : 22;
        ctx.lineWidth = lofted ? 7.5 : 6;
        for (let i = 0; i < pts.length - 1; i++) {
            const a = i / (pts.length - 1);
            const base = this.trajectoryColor;
            const punch = 0.26 * (1 - a);
            ctx.strokeStyle = this.colorWithAlpha(this.lightenColor(base, 12), punch);
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
            ctx.stroke();
        }
        ctx.restore();

        // 2) Main stroke with animated dash
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = lofted ? 3.2 : 2.6;
        ctx.strokeStyle = this.colorWithAlpha(this.lightenColor(this.trajectoryColor, 8), 1.0);
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const dashSpeed = lofted ? 110 : 95; // px/s
        const dashOffset = -((now - (this.trajectoryStartTime || now)) / 1000) * dashSpeed;
        ctx.setLineDash(lofted ? [12, 7] : [9, 6]);
        ctx.lineDashOffset = dashOffset;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 3) Spark markers along path (slightly brighter)
        ctx.save();
        for (let i = 0; i < pts.length; i += 4) {
            const t = i / (pts.length - 1);
            const r = lofted ? 2.6 : 2.0;
            ctx.fillStyle = this.colorWithAlpha(this.lightenColor(this.trajectoryColor, 15), 0.35 * (1 - t));
            ctx.beginPath();
            ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 4) Apex highlight for lofted shots
        if (lofted && maxZ > 0) {
            const apexIdx = traj.reduce((mi, p, i) => (p.z || 0) > (traj[mi].z || 0) ? i : mi, 0);
            const apex = pts[apexIdx];
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = this.trajectoryColor;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(apex.x, apex.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 5) Ground projection ribbon (helps readability for ground shots)
        ctx.save();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = this.colorWithAlpha('#FFFFFF', lofted ? 0.12 : 0.22);
        ctx.beginPath();
        ctx.moveTo(traj[0].x, traj[0].y);
        for (let i = 1; i < traj.length; i++) ctx.lineTo(traj[i].x, traj[i].y);
        ctx.stroke();
        ctx.restore();

        // 6) Traveling spark(s) to add vibrancy
        const travelDur = Math.max(600, Math.min(1600, this.trajectoryDurationMs || 1000));
        const phases = [0, 0.45];
        for (let k = 0; k < phases.length; k++) {
            const phase = phases[k];
            const tFrac = (((now - (this.trajectoryStartTime || now)) % travelDur) / travelDur + phase) % 1;
            const idx = Math.min(pts.length - 1, Math.floor(tFrac * (pts.length - 1)));
            const p = pts[idx];
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = this.lightenColor(this.trajectoryColor, 20);
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(p.x, p.y, lofted ? 2.6 : 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Utility: color with alpha from hex
    colorWithAlpha(hex, a) {
        const h = (hex || '').replace('#', '');
        const r = parseInt(h.substring(0, 2) || 'ff', 16);
        const g = parseInt(h.substring(2, 4) || 'ff', 16);
        const b = parseInt(h.substring(4, 6) || 'ff', 16);
        return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
    }

    // Utility: lighten hex color by amount (0-100)
    lightenColor(hex, amount = 10) {
        const h = (hex || '').replace('#', '');
        let r = parseInt(h.substring(0, 2) || 'ff', 16);
        let g = parseInt(h.substring(2, 4) || 'ff', 16);
        let b = parseInt(h.substring(4, 6) || 'ff', 16);
        const f = Math.max(0, Math.min(100, amount)) / 100;
        r = Math.min(255, Math.round(r + (255 - r) * f));
        g = Math.min(255, Math.round(g + (255 - g) * f));
        b = Math.min(255, Math.round(b + (255 - b) * f));
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}
