class Fielder extends Character {
    constructor(ctx, relativeX, relativeY) {
        const W = ctx.canvas.width;
        const H = ctx.canvas.height;
        super(ctx, W * relativeX, H * relativeY, 30, 50);
        this.isCatching = false;
        this.originalX = W * relativeX;
        this.originalY = H * relativeY;
    }
    update(dt, ball) {
        // The fielder only considers moving when the ball has been hit and
        // is travelling upward fast enough, indicating a potential catch.
        if (ball.isHit && ball.vel.z > 30) {
            const dist = Math.hypot(this.x - ball.pos.x, this.y - ball.pos.y);
            // Once the ball is within 80 pixels, the fielder moves toward it.
            if (dist < 80) {
                this.x += (ball.pos.x - this.x) * 0.05;
                this.y += (ball.pos.y - this.y) * 0.05;
                // A catch is detected when very close to the ball and it is
                // descending near ground level (dist < 15 and z < 20).
                if (dist < 15 && ball.pos.z < 20 && ball.vel.z < 0) {
                    this.isCatching = true;
                    ball.vel.x *= 0.2;
                    ball.vel.y *= 0.2;
                    ball.vel.z = 0;
                    ball.isActive = false;
                    if (typeof game !== 'undefined') {
                        // Inform the game of a successful catch during play.
                        if (typeof game.handleWicket === 'function' && game.gameState === 'playing') {
                            game.handleWicket('Caught!', 0);
                        // Otherwise, just show visual feedback of the catch.
                        } else if (typeof game.showFeedback === 'function') {
                            game.showFeedback('Catch!', '#FF4136');
                        }
                    }
                }
            }
        } else {
            this.x += (this.originalX - this.x) * 0.05;
            this.y += (this.originalY - this.y) * 0.05;
            this.isCatching = false;
        }
    }
    draw() {
        const W = this.ctx.canvas.width;
        const H = this.ctx.canvas.height;
        const scale = 0.6 + (this.y / H) * 0.4;
        this.w = 30 * scale;
        this.h = 50 * scale;
        
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        
        // Enhanced fielder with better proportions and colors
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
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.7);
        this.ctx.lineTo(0, -this.h * 0.3);
        this.ctx.stroke();
        
        // Arms
        this.ctx.strokeStyle = '#f1c40f';
        this.ctx.lineWidth = 2;
        
        // Left arm
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.6);
        this.ctx.lineTo(-this.w * 0.3, -this.h * 0.5);
        this.ctx.stroke();
        
        // Right arm
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.6);
        this.ctx.lineTo(this.w * 0.3, -this.h * 0.5);
        this.ctx.stroke();
        
        // Legs
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        
        // Left leg
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.3);
        this.ctx.lineTo(-this.w * 0.15, this.h * 0.1);
        this.ctx.stroke();
        
        // Right leg
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.h * 0.3);
        this.ctx.lineTo(this.w * 0.15, this.h * 0.1);
        this.ctx.stroke();
        
        // Enhanced catching animation
        if (this.isCatching) {
            // Rotate body for diving catch
            this.ctx.rotate(-Math.PI / 6);
            
            // Add catch effect - glowing hands
            this.ctx.fillStyle = 'rgba(1, 255, 112, 0.7)';
            this.ctx.beginPath();
            this.ctx.arc(-this.w * 0.3, -this.h * 0.5, 5, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(this.w * 0.3, -this.h * 0.5, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add "CATCH!" text above fielder
            this.ctx.fillStyle = '#01FF70';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('CATCH!', 0, -this.h - 20);
        }
        
        this.ctx.restore();
    }
}