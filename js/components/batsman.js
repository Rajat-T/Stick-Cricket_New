class Batsman extends Character {
    constructor(ctx) {
        const H = ctx.canvas.height;
        const W = ctx.canvas.width;
        super(ctx, W / 2, H * 0.9, 40, 60);
        this.swingState = 0;
        this.swingDirection = 'none';
        this.isSwinging = false;
    }
    update(dt) {
        if (this.swingState > 0) {
            this.swingState -= dt * 5;
        } else {
            this.isSwinging = false;
        }
    }
    swing(direction) {
        if (this.swingState <= 0) {
            this.swingState = 1;
            this.swingDirection = direction;
            this.isSwinging = true;
        }
    }
    draw() {
        this.x = this.ctx.canvas.width / 2;
        this.y = this.ctx.canvas.height * 0.9;
        this.drawStick('#3498db');
        this.ctx.save();
        this.ctx.translate(this.x, this.y - this.h * 0.5);
        if (this.swingState > 0) {
            let angle;
            const swingAmount = Math.sin(this.swingState * Math.PI);
            switch (this.swingDirection) {
                case 'left':
                    angle = -swingAmount * Math.PI / 2.5;
                    break;
                case 'right':
                    angle = swingAmount * Math.PI / 2.5;
                    break;
                case 'up':
                    angle = -swingAmount * Math.PI / 4;
                    break;
                case 'down':
                    angle = swingAmount * Math.PI / 8;
                    break;
                default:
                    angle = 0;
            }
            this.ctx.rotate(angle);
        }
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(0, 40);
        this.ctx.stroke();
        this.ctx.restore();
    }
}