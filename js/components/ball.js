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
        this.seam = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.spinRate = 0;
        this.dragCoeff = this.AIR_DRAG;
        
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
        this.seam = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        this.spinRate = 0;
        this.spinDrift = 0;
        this.dragCoeff = this.AIR_DRAG;
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
                if (this.surpriseDelivery && Math.random() < 0.3) {
                    this.type = 'medium'; // Slower ball variation
                } else {
                    this.type = 'fast';
                }
            } else if (bowlingStyle === 'Fast Medium') {
                if (this.surpriseDelivery && Math.random() < 0.4) {
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
        
        if (r < 0.15) pitchY = H * (0.72 + difficultyPitchFactor);
        else if (r < 0.8) pitchY = H * (0.80 + difficultyPitchFactor);
        else pitchY = H * (0.88 + difficultyPitchFactor);
        
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
        let baseTimingWindow = 22;
        
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
        
        // Check for edge catches based on timing and direction
        let isEdged = false;
        if (!directionOK || timingScore === 0) {
            const edgeChance = this.edgeRisk * (directionOK ? 1 : 2) * (timingScore === 0 ? 3 : 1);
            if (Math.random() < edgeChance) {
                isEdged = true;
                return { timing: "EDGED!", runs: 0, color: "#FF4136", timingScore: 0, dismissal: "Caught" };
            }
        }
        
        // Check for LBW based on proper cricket rules
        if (!isEdged && this.lbwRisk > 0) {
            // LBW conditions:
            // 1. Ball must hit body first (simulated by poor timing or missing the shot)
            // 2. Must be playing a shot that misses the ball
            // 3. Ball must be going on to hit stumps (already calculated in lbwRisk)
            
            let lbwChance = 0;
            
            // Much more conservative LBW chances
            // Increase LBW chance if:
            // - Very poor timing (ball hits pad instead of bat)
            // - Wrong shot selection for ball line
            if (timingScore === 0) {
                lbwChance = this.lbwRisk * 2.5; // Reduced from 4
            } else if (!directionOK && timingScore === 1) {
                lbwChance = this.lbwRisk * 1.2; // Reduced from 2
            }
            
            // Very small chance of LBW even with decent timing if ball is very straight
            if (timingScore >= 2 && this.lbwRisk > 0.05) {
                lbwChance = this.lbwRisk * 0.2; // Reduced from 0.5
            }
            
            if (Math.random() < lbwChance) {
                return { timing: "LBW!", runs: 0, color: "#FF4136", timingScore: 0, dismissal: "LBW" };
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
        const batSpeed = 400 * power; // Increased base bat speed
        const batVel = {
            x: Math.cos(angle) * batSpeed,
            y: Math.sin(angle) * batSpeed
        };
        
        const loftBase = 75 * power * (shotType === "defensive" ? 0.3 : 1);
        batVel.z = loftBase + Math.max(0, -0.18 * batVel.y);
        
        const e = 0.58; // Slightly higher restitution for more realistic ball speeds
        this.vel.x = (1 + e) * batVel.x - e * incomingVec.x;
        this.vel.y = (1 + e) * batVel.y - e * incomingVec.y;
        this.vel.z = Math.max(0, (1 + e) * batVel.z - e * incomingVec.z);
        
        // Enhanced run calculation with more realistic thresholds
        let runs = 0;
        const postSpeed = Math.hypot(this.vel.x, this.vel.y);
        
        if (shotType === "defensive") {
            runs = Math.random() < 0.15 ? 1 : 0;
        } else if (postSpeed > 500 && timingScore >= 2) {
            runs = 6;
        } else if (postSpeed > 380 && timingScore >= 2) {
            runs = 4;
        } else if (postSpeed > 250) {
            runs = (Math.random() < 0.7) ? 2 : 1;
        } else if (postSpeed > 150) {
            runs = Math.random() < 0.6 ? 1 : 0;
        } else {
            runs = 0;
        }
        
        // Bonus runs for perfect timing
        if (timing === "PERFECT!" && runs > 0) {
            runs = Math.min(6, runs + (Math.random() < 0.3 ? 1 : 0));
        }
        
        return { timing, runs, color, timingScore };
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
        if (!this.isActive) return;
        const W = this.ctx.canvas.width;
        const H = this.ctx.canvas.height;
        const scale = 0.5 + (this.pos.y / H);
        const shadowRadius = 5 * scale;
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.ellipse(this.pos.x, this.pos.y + 10, shadowRadius, shadowRadius / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        const ballGradient = this.ctx.createRadialGradient(this.pos.x, this.pos.y - this.pos.z, 0, this.pos.x, this.pos.y - this.pos.z, 5 * scale);
        ballGradient.addColorStop(0, '#ffffff');
        ballGradient.addColorStop(1, '#aaaaaa');
        this.ctx.beginPath();
        this.ctx.fillStyle = ballGradient;
        this.ctx.arc(this.pos.x, this.pos.y - this.pos.z, 5 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.ellipse(this.pos.x, this.pos.y - this.pos.z, 4 * scale, 2 * scale, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.stroke();
    }
}