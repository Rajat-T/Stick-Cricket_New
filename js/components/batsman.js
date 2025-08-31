class Batsman extends Character {
    constructor(ctx) {
        const H = ctx.canvas.height;
        const W = ctx.canvas.width;
        super(ctx, W / 2, H * 0.9, 40, 60);
        this.swingState = 0;
        this.swingDirection = 'none';
        this.isSwinging = false;
        this.celebrationState = 0;
        this.celebrationType = 'none'; // 'fifty', 'century', 'none'
        this.celebrationTimer = 0;
    }
    update(dt) {
        if (this.swingState > 0) {
            this.swingState -= dt * 5;
        } else {
            this.isSwinging = false;
        }
        
        // Update celebration animation with smooth transitions
        if (this.celebrationState > 0) {
            this.celebrationTimer += dt;
            // Use eased decay for smoother animation
            const easedDecay = 1 - Math.pow(1 - 0.4, dt * 60); // 60fps normalized
            this.celebrationState = Math.max(0, this.celebrationState - dt * easedDecay);
        }
        
        // Clean reset when celebration ends
        if (this.celebrationState <= 0 && this.celebrationTimer > 0) {
            this.celebrationType = 'none';
            this.celebrationTimer = 0;
        }
    }
    swing(direction) {
        if (this.swingState <= 0) {
            this.swingState = 1;
            this.swingDirection = direction;
            this.isSwinging = true;
        }
    }
    
    celebrate(milestone) {
        this.celebrationState = 1;
        this.celebrationType = milestone; // 'fifty' or 'century'
        this.celebrationTimer = 0;
    }
    draw() {
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height * 0.9;
        
        // Enhanced batsman with better proportions and colors
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        
        // Head with team color
        const headRadius = this.h * 0.1;
        const headGradient = this.ctx.createRadialGradient(0, -this.h * 0.8, 0, 0, -this.h * 0.8, headRadius);
        headGradient.addColorStop(0, '#f1c40f');
        headGradient.addColorStop(1, '#d3a000');
        this.ctx.beginPath();
        this.ctx.arc(0, -this.h * 0.8, headRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = headGradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Body with cricket jersey
        const bodyGradient = this.ctx.createLinearGradient(0, -this.h * 0.7, 0, -this.h * 0.3);
        bodyGradient.addColorStop(0, '#ffffff');
        bodyGradient.addColorStop(1, '#888888');
        this.ctx.strokeStyle = bodyGradient;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.7);
        this.ctx.lineTo(0, -this.h * 0.3);
        this.ctx.stroke();
        
        // Arms
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 3;
        
        // Celebration animations
        if (this.celebrationState > 0) {
            // Enhanced smooth animation with multiple oscillations and easing
            const timePhase = this.celebrationTimer * 3; // Slower animation frequency
            const easedIntensity = this.celebrationState * this.celebrationState; // Quadratic easing
            
            // Multi-layered wave motion for smoother effect
            const primaryWave = Math.sin(timePhase) * easedIntensity;
            const secondaryWave = Math.sin(timePhase * 1.5) * easedIntensity * 0.3;
            const smoothIntensity = primaryWave + secondaryWave;
            
            // Progressive arm raise based on celebration type
            const baseArmRaise = this.celebrationType === 'century' ? 1.8 : 1.2;
            const armRaise = baseArmRaise * easedIntensity;
            
            // Enhanced raised arms celebration with natural motion
            this.ctx.beginPath();
            this.ctx.moveTo(0, -this.h * 0.6);
            this.ctx.lineTo(
                -this.w * 0.5 * armRaise, 
                -this.h * (0.8 + smoothIntensity * 0.08)
            );
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -this.h * 0.6);
            this.ctx.lineTo(
                this.w * 0.5 * armRaise, 
                -this.h * (0.8 + smoothIntensity * 0.08)
            );
            this.ctx.stroke();
            
            // Enhanced jump animation for century with natural physics
            if (this.celebrationType === 'century') {
                // Use a combination of sine waves for realistic jump motion
                const jumpPhase = this.celebrationTimer * 2.5;
                const jumpEasing = Math.sin(jumpPhase) * Math.sin(jumpPhase * 0.5);
                const jumpHeight = jumpEasing * -12 * easedIntensity;
                this.ctx.translate(0, jumpHeight);
                
                // Add slight horizontal sway for more dynamic movement
                const swayPhase = this.celebrationTimer * 4;
                const sway = Math.sin(swayPhase) * 2 * easedIntensity;
                this.ctx.translate(sway, 0);
            } else {
                // Subtle bounce for fifty celebration
                const bouncePhase = this.celebrationTimer * 4;
                const bounce = Math.abs(Math.sin(bouncePhase)) * -3 * easedIntensity;
                this.ctx.translate(0, bounce);
            }
        } else {
            // Normal arms
            this.ctx.beginPath();
            this.ctx.moveTo(0, -this.h * 0.6);
            this.ctx.lineTo(-this.w * 0.4, -this.h * 0.5);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -this.h * 0.6);
            this.ctx.lineTo(this.w * 0.4, -this.h * 0.5);
            this.ctx.stroke();
        }
        
        // Legs
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 4;
        
        // Left leg
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.3);
        this.ctx.lineTo(-this.w * 0.2, this.h * 0.1);
        this.ctx.stroke();
        
        // Right leg
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.3);
        this.ctx.lineTo(this.w * 0.2, this.h * 0.1);
        this.ctx.stroke();
        
        // Bat with enhanced visualization
        this.ctx.save();
        this.ctx.translate(0, -this.h * 0.5);
        
        if (this.swingState > 0) {
            let angle;
            const swingAmount = Math.sin(this.swingState * Math.PI);
            switch (this.swingDirection) {
                case 'left':
                    angle = -swingAmount * Math.PI / 2.2;
                    break;
                case 'right':
                    angle = swingAmount * Math.PI / 2.2;
                    break;
                case 'up':
                    angle = -swingAmount * Math.PI / 3.5;
                    break;
                case 'down':
                    angle = swingAmount * Math.PI / 6;
                    break;
                default:
                    angle = 0;
            }
            this.ctx.rotate(angle);
        }
        
        // Enhanced cricket bat with better 3D effect
        this.ctx.fillStyle = '#8B4513'; // Wood color
        this.ctx.strokeStyle = '#5D2906'; // Darker wood outline
        this.ctx.lineWidth = 1;
        
        // Bat blade
        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(0, -50);
        this.ctx.lineTo(8, -50);
        this.ctx.lineTo(8, -10);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Bat handle
        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(0, 20);
        this.ctx.lineTo(4, 20);
        this.ctx.lineTo(4, -10);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Bat tape/kashmir
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -35);
        this.ctx.lineTo(0, -30);
        this.ctx.lineTo(8, -30);
        this.ctx.lineTo(8, -35);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
        this.ctx.restore();
    }
}