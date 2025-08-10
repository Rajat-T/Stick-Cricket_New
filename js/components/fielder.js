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
        if (ball.isHit && ball.vel.z > 30) {
            const dist = Math.hypot(this.x - ball.pos.x, this.y - ball.pos.y);
            if (dist < 80) {
                this.x += (ball.pos.x - this.x) * 0.05;
                this.y += (ball.pos.y - this.y) * 0.05;
                if (dist < 15 && ball.pos.z < 20 && ball.vel.z < 0) {
                    this.isCatching = true;
                    ball.vel.x *= 0.2;
                    ball.vel.y *= 0.2;
                    ball.vel.z = 0;
                    ball.isActive = false;
                    if (typeof game !== 'undefined') {
                        if (typeof game.handleWicket === 'function' && game.gameState === 'playing') {
                            game.handleWicket('Caught!', 0);
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
        if (this.isCatching) {
            this.ctx.save();
            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(-Math.PI / 4);
            this.drawStick('#01FF70');
            this.ctx.restore();
        } else {
            this.drawStick('#e74c3c');
        }
    }
}