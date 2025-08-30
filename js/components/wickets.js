class Wickets {
    constructor(ctx) {
        this.ctx = ctx;
        this.reset();
    }
    reset() {
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height * 0.92;
        this.width = 25;
        this.height = 40;
        this.isHit = false;
        this.stumps = [{
            x: -this.width / 2,
            y: 0,
            angle: 0,
            vel: {
                x: 0,
                y: 0
            },
            angleVel: 0
        },
        {
            x: 0,
            y: 0,
            angle: 0,
            vel: {
                x: 0,
                y: 0
            },
            angleVel: 0
        },
        {
            x: this.width / 2,
            y: 0,
            angle: 0,
            vel: {
                x: 0,
                y: 0
            },
            angleVel: 0
        }
        ];
        this.bails = [{
            x: -this.width / 4,
            y: -this.height,
            angle: 0,
            vel: {
                x: 0,
                y: 0
            },
            angleVel: 0
        },
        {
            x: this.width / 4,
            y: -this.height,
            angle: 0,
            vel: {
                x: 0,
                y: 0
            },
            angleVel: 0
        }
        ];
    }
    hit(ballVelocity = null, bowlerStyle = null) {
        if (this.isHit) return;
        this.isHit = true;
        
        // Enhanced wicket physics based on ball velocity and bowler type
        const ballSpeed = ballVelocity ? Math.hypot(ballVelocity.x, ballVelocity.y, ballVelocity.z) : 200;
        const impactForce = Math.min(ballSpeed / 100, 4); // Scale impact force
        
        // Determine wicket falling pattern based on bowler style
        let forceMultiplier = 1.0;
        let spreadFactor = 1.0;
        
        if (bowlerStyle === 'Fast') {
            // Fast bowlers create explosive wicket destruction
            forceMultiplier = 1.8;
            spreadFactor = 1.5;
        } else if (bowlerStyle === 'Fast Medium') {
            // Moderate but decisive wicket falling
            forceMultiplier = 1.3;
            spreadFactor = 1.2;
        } else if (bowlerStyle === 'Spin') {
            // Spin bowlers cause more gentle but precise wicket fall
            forceMultiplier = 0.9;
            spreadFactor = 0.8;
        }
        
        // Apply physics to stumps with enhanced realism
        this.stumps.forEach((stump, index) => {
            const baseForce = 150 * impactForce * forceMultiplier;
            const lateralSpread = 100 * spreadFactor;
            
            stump.vel = {
                x: (Math.random() - 0.5) * lateralSpread + (index - 1) * 50,
                y: (Math.random() - 0.5) * baseForce * 0.3 - 30
            };
            stump.angleVel = (Math.random() - 0.5) * 15 * forceMultiplier;
        });
        
        // Apply enhanced physics to bails
        this.bails.forEach((bail, index) => {
            const bailForce = 200 * impactForce * forceMultiplier;
            const bailSpread = 120 * spreadFactor;
            
            bail.vel = {
                x: (Math.random() - 0.5) * bailSpread + (index === 0 ? -40 : 40),
                y: (Math.random() - 0.5) * bailForce * 0.5 - 80
            };
            bail.angleVel = (Math.random() - 0.5) * 25 * forceMultiplier;
        });
    }
    update(dt) {
        if (!this.isHit) return;
        
        // Enhanced physics with gravity and friction
        const gravity = 980; // Gravity acceleration
        const friction = 0.85; // Ground friction coefficient
        const bounceDamping = 0.6; // Energy loss on bounce
        
        this.stumps.forEach(stump => {
            // Apply gravity to vertical velocity
            stump.vel.y += gravity * dt;
            
            // Update position
            stump.x += stump.vel.x * dt;
            stump.y += stump.vel.y * dt;
            stump.angle += stump.angleVel * dt;
            
            // Ground collision with realistic physics
            if (stump.y > 0) {
                stump.y = 0;
                stump.vel.y = -stump.vel.y * bounceDamping; // Bounce with energy loss
                stump.vel.x *= friction; // Apply friction
                stump.angleVel *= friction; // Reduce rotation
            }
        });
        
        this.bails.forEach(bail => {
            // Apply gravity
            bail.vel.y += gravity * dt;
            
            // Update position
            bail.x += bail.vel.x * dt;
            bail.y += bail.vel.y * dt;
            bail.angle += bail.angleVel * dt;
            
            // Ground collision
            if (bail.y > 0) {
                bail.y = 0;
                bail.vel.y = -bail.vel.y * bounceDamping;
                bail.vel.x *= friction;
                bail.angleVel *= friction;
            }
        });
    }
    checkCollision(ball) {
        if (this.isHit) return false;
        
        // Enhanced collision detection with 3D ball position
        const ballRadius = 5;
        const wicketDepth = 8; // Account for wicket depth
        
        // Check if ball is at ground level and within wicket bounds
        const isAtGroundLevel = ball.pos.z <= ballRadius + 2; // Small tolerance for ground contact
        const isInHorizontalRange = ball.pos.x > this.x - this.width / 2 - ballRadius && 
                                   ball.pos.x < this.x + this.width / 2 + ballRadius;
        const isInDepthRange = ball.pos.y > this.y - ballRadius - wicketDepth && 
                              ball.pos.y < this.y + ballRadius;
        
        // Ball must be moving towards or past the wickets
        const isMovingTowardsWickets = !ball.isHit && ball.vel.y > 0;
        
        return isAtGroundLevel && isInHorizontalRange && isInDepthRange && isMovingTowardsWickets;
    }
    draw() {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        
        // Draw pitch line under wickets
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.width, 0);
        this.ctx.lineTo(this.width, 0);
        this.ctx.stroke();
        
        // Enhanced stumps with better 3D effect and realistic wood texture
        this.stumps.forEach(stump => {
            this.ctx.save();
            this.ctx.translate(stump.x, stump.y);
            this.ctx.rotate(stump.angle);
            
            // Create more realistic wood texture for stumps
            const stumpGrad = this.ctx.createLinearGradient(-4, -this.height, 4, 0);
            stumpGrad.addColorStop(0, '#5D2906');    // Dark wood
            stumpGrad.addColorStop(0.3, '#8B4513');  // Medium wood
            stumpGrad.addColorStop(0.7, '#A0522D');  // Light wood
            stumpGrad.addColorStop(1, '#5D2906');    // Dark wood
            
            this.ctx.fillStyle = stumpGrad;
            this.ctx.strokeStyle = '#3E1C04'; // Dark outline
            this.ctx.lineWidth = 1;
            
            // Draw stump with rounded top for realism
            this.ctx.beginPath();
            this.ctx.moveTo(-3, -this.height);
            this.ctx.lineTo(-3, 0);
            this.ctx.lineTo(3, 0);
            this.ctx.lineTo(3, -this.height);
            this.ctx.arc(0, -this.height - 3, 3, 0, Math.PI, true);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.restore();
        });
        
        // Enhanced bails with better 3D effect
        this.bails.forEach(bail => {
            this.ctx.save();
            this.ctx.translate(bail.x, bail.y);
            this.ctx.rotate(bail.angle);
            
            // Create metallic look for bails
            const bailGrad = this.ctx.createLinearGradient(-this.width / 4, -2, this.width / 4, 2);
            bailGrad.addColorStop(0, '#C0C0C0');  // Silver
            bailGrad.addColorStop(0.5, '#FFFFFF'); // Bright center
            bailGrad.addColorStop(1, '#C0C0C0');  // Silver
            
            this.ctx.strokeStyle = bailGrad;
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(-this.width / 4, 0);
            this.ctx.lineTo(this.width / 4, 0);
            this.ctx.stroke();
            
            // Add highlight to bails
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(-this.width / 4 + 2, -1);
            this.ctx.lineTo(this.width / 4 - 2, -1);
            this.ctx.stroke();
            
            this.ctx.restore();
        });
        
        // Add subtle shadow under wickets
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 5, this.width, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}