class Character {
    constructor(ctx, x, y, w, h) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    drawStick(color = '#fff') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        const headGradient = this.ctx.createRadialGradient(this.x, this.y - this.h * 0.8, 0, this.x, this.y - this.h * 0.8, this.h * 0.1);
        headGradient.addColorStop(0, '#f1c40f');
        headGradient.addColorStop(1, '#d3a000');
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y - this.h * 0.8, this.h * 0.1, 0, Math.PI * 2);
        this.ctx.fillStyle = headGradient;
        this.ctx.fill();
        const bodyGradient = this.ctx.createLinearGradient(this.x, this.y - this.h * 0.7, this.x, this.y - this.h * 0.3);
        bodyGradient.addColorStop(0, '#ffffff');
        bodyGradient.addColorStop(1, '#888888');
        this.ctx.strokeStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y - this.h * 0.7);
        this.ctx.lineTo(this.x, this.y - this.h * 0.3);
        this.ctx.stroke();
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x - this.w / 2, this.y - this.h * 0.6);
        this.ctx.lineTo(this.x + this.w / 2, this.y - this.h * 0.6);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
}