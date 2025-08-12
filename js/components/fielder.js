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