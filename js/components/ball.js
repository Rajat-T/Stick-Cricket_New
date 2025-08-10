class Ball {
    constructor(ctx, difficulty, onMiss) {
        this.ctx = ctx;
        this.difficulty = difficulty;
        this.onMiss = onMiss;
        this.G = 980 * 0.10;
        this.AIR_DRAG = 0.12;
        this.BOUNCE_FAST = 0.45;
        this.BOUNCE_MED = 0.52;
        this.BOUNCE_SPIN = 0.58;
        this.GROUND_FRICTION = 0.10;
        this.SWING_BASE = 85;
        this.SWING_DECAY = 2.2;
        this.SPIN_AFTER_BOUNCE = 2.4;
        this.reset();
    }
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
    }
    bowl(type, side) {
        this.reset();
        this.isActive = true;
        this.type = type;
        const W = this.ctx.canvas.width;
        const H = this.ctx.canvas.height;
        this.pos.x = W / 2 + (Math.random() - 0.5) * 20;
        this.pos.y = H * 0.55;
        this.pos.z = 22;
        const r = Math.random();
        let pitchY;
        if (r < 0.2) pitchY = H * 0.72;
        else if (r < 0.85) pitchY = H * 0.80;
        else pitchY = H * 0.88;
        const lineOffset = (side === 'off' ? -24 : 24) + (Math.random() - 0.5) * 18;
        const targetXAtStumps = W / 2 + lineOffset;
        const speedScale = this.difficulty?.ballSpeed ?? 1.0;
        let vyBase;
        if (type === 'fast') vyBase = 320 * speedScale;
        else if (type === 'medium') vyBase = 250 * speedScale;
        else vyBase = 200 * speedScale;
        this.vel.y = vyBase;
        const tToStumps = (H * 0.90 - this.pos.y) / this.vel.y;
        this.vel.x = ((targetXAtStumps - this.pos.x) / Math.max(tToStumps, 0.001));
        const tToPitch = Math.max((pitchY - this.pos.y) / this.vel.y, 0.05);
        this.vel.z = (0.5 * this.G * tToPitch - this.pos.z / tToPitch);
        this.swingSign = (Math.random() < 0.5 ? -1 : 1) * (side === 'off' ? -1 : 1);
        const swingScale = (this.difficulty?.swing ?? 60) / 100;
        const baseSwing = this.SWING_BASE * swingScale;
        if (type === 'fast') this.swingAccel = baseSwing * 0.9 * this.swingSign;
        else if (type === 'medium') this.swingAccel = baseSwing * 1.0 * this.swingSign;
        else this.swingAccel = baseSwing * 1.2 * this.swingSign;
        this.hasBounced = false;
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
        const timingWindow = 22 * (this.difficulty?.timingWindow ?? 1.0);
        let timing, color, power, timingScore;
        if (Math.abs(timingDiff) < timingWindow * 0.25) {
            timing = "PERFECT!"; color = "#01FF70"; power = 1.55; timingScore = 3;
        } else if (Math.abs(timingDiff) < timingWindow * 0.7) {
            timing = "GOOD"; color = "#FFDC00"; power = 1.05; timingScore = 2;
        } else if (timingDiff < 0) {
            timing = "EARLY"; color = "#7FDBFF"; power = 0.65; timingScore = 1;
        } else {
            timing = "LATE"; color = "#FF851B"; power = 0.45; timingScore = 1;
        }
        const intendedSide = (this.pos.x < W / 2) ? "left" : "right";
        const directionOK = (swingDirection === intendedSide) || (swingDirection === "up") || (swingDirection === "down");
        if (!directionOK) power *= 0.55;
        let shotType = "normal";
        if (swingDirection == "up") { shotType = "straight"; power *= 1.2; }
        else if (swingDirection == "down") { shotType = "defensive"; power *= 0.35; }
        this.isHit = true;
        let angle;
        if (shotType === "straight") angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.18;
        else if (shotType === "defensive") angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.08;
        else angle = (swingDirection === "left" ? Math.PI * 1.25 : Math.PI * 1.75) + (Math.random() - 0.5) * 0.35;
        const incoming = Math.hypot(this.vel.x, this.vel.y);
        const batBase = 380 * power;
        const exitSpeed = batBase + Math.max(0, 0.25 * incoming * (timingScore / 3));
        this.vel.x = Math.cos(angle) * exitSpeed;
        this.vel.y = Math.sin(angle) * exitSpeed;
        const loftBase = 62 * power * (shotType === "defensive" ? 0.4 : 1);
        this.vel.z = loftBase + Math.max(0, -0.15 * this.vel.y);
        let runs = 0;
        const hitMag = Math.hypot(this.vel.x, this.vel.y);
        if (shotType === "defensive") {
            runs = 0;
        } else if (hitMag > 470 && timingScore > 1) {
            runs = 6;
        } else if (hitMag > 360 && timingScore > 1) {
            runs = 4;
        } else if (hitMag > 220) {
            runs = (Math.random() < 0.65) ? 2 : 1;
        } else if (hitMag > 140) {
            runs = 1;
        } else {
            runs = 0;
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
                this.swingAccel += this.vel.x * 0.02;
                if (this.type === "spin") this.swingAccel *= this.SPIN_AFTER_BOUNCE;
                this.hasBounced = true;
            }
            if (this.pos.y > this.ctx.canvas.height + 10) {
                this.isActive = false;
                this.onMiss && this.onMiss();
            }
        } else {
            this.vel.z -= this.G * dt;
            this.vel.x -= this.AIR_DRAG * this.vel.x * dt;
            this.vel.y -= this.AIR_DRAG * this.vel.y * dt;
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
                this.swingAccel += this.vel.x * 0.02;
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