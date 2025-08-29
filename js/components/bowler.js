class Bowler extends Character {
    constructor(ctx) {
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;
        super(ctx, W / 2, H * 0.4, 40, 60);
        this.initialY = H * 0.4;
        this.targetY = H * 0.55;
        this.animState = 'idle';
        this.armAngle = 0;
    }
    startDelivery() {
        this.animState = 'runup';
        this.y = this.initialY;
        this.armAngle = 0;
    }
    update(dt) {
        if (this.animState === 'runup') {
            this.y += 100 * dt;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.animState = 'deliver';
            }
        } else if (this.animState === 'deliver') {
            this.armAngle += dt * 10;
            if (this.armAngle > Math.PI) {
                this.animState = 'idle';
            }
        }
    }
    draw() {
        // Enhanced bowler with better proportions and colors
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        
        // Head
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
        
        // Left arm (bowling arm)
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.6);
        this.ctx.lineTo(-this.w * 0.4, -this.h * 0.5);
        this.ctx.stroke();
        
        // Right arm
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.6);
        this.ctx.lineTo(this.w * 0.4, -this.h * 0.5);
        this.ctx.stroke();
        
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
        
        // Enhanced bowling arm animation
        this.ctx.save();
        this.ctx.translate(0, -this.h * 0.6);
        if (this.animState === 'deliver') {
            // More realistic bowling action with arm rotation and follow-through
            const deliveryAngle = Math.min(this.armAngle, Math.PI * 1.2);
            this.ctx.rotate(-deliveryAngle);
        }
        
        // Enhanced bowling arm/hand
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -35); // Longer arm for better proportion
        this.ctx.stroke();
        
        // Hand/grip
        this.ctx.beginPath();
        this.ctx.moveTo(0, -35);
        this.ctx.lineTo(-5, -30);
        this.ctx.stroke();
        
        this.ctx.restore();
        this.ctx.restore();
        
        // Add bowling run-up effect
        if (this.animState === 'runup') {
            // Dust particles from running
            this.ctx.fillStyle = 'rgba(160, 160, 160, 0.6)';
            for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 10;
                this.ctx.beginPath();
                this.ctx.arc(this.x + offsetX, this.y + 5, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}