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
    hit() {
        if (this.isHit) return;
        this.isHit = true;
        this.stumps.forEach(stump => {
            stump.vel = {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 100 - 50
            };
            stump.angleVel = (Math.random() - 0.5) * 10;
        });
        this.bails.forEach(bail => {
            bail.vel = {
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 200 - 100
            };
            bail.angleVel = (Math.random() - 0.5) * 20;
        });
    }
    update(dt) {
        if (!this.isHit) return;
        this.stumps.forEach(stump => {
            stump.x += stump.vel.x * dt;
            stump.y += stump.vel.y * dt;
            stump.angle += stump.angleVel * dt;
        });
        this.bails.forEach(bail => {
            bail.x += bail.vel.x * dt;
            bail.y += bail.vel.y * dt;
            bail.angle += bail.angleVel * dt;
        });
    }
    checkCollision(ball) {
        if (this.isHit) return false;
        const ballRadius = 5;
        return (
            !ball.isHit &&
            ball.pos.z <= 5 &&
            ball.pos.x > this.x - this.width / 2 - ballRadius &&
            ball.pos.x < this.x + this.width / 2 + ballRadius &&
            ball.pos.y > this.y - ballRadius
        );
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