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
        this.drawStick('#c0392b');
        this.ctx.save();
        this.ctx.translate(this.x, this.y - this.h * 0.6);
        if (this.animState === 'deliver') {
            this.ctx.rotate(-this.armAngle);
        }
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -30);
        this.ctx.stroke();
        this.ctx.restore();
    }
}