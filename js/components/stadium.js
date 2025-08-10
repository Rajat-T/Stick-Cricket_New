class Stadium {
    constructor(ctx, stadiumType = 'lords') {
        this.ctx = ctx;
        this.w = ctx.canvas.width;
        this.h = ctx.canvas.height;
        this.stadiumType = stadiumType;
    }
    draw() {
        const W = this.w;
        const H = this.h;
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, H * 0.3);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#e0f7ff');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, W, H * 0.3);
        const grassGradient = this.ctx.createLinearGradient(0, H * 0.3, 0, H);
        grassGradient.addColorStop(0, '#3CB371');
        grassGradient.addColorStop(1, '#006400');
        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, H * 0.3, W, H * 0.7);
        const pitchLeft = this.w * 0.40;
        const pitchWidth = this.w * 0.20;
        const pitchTop = this.h * 0.50;
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(pitchLeft, pitchTop, pitchWidth, this.h * 0.50);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(pitchLeft, this.h * 0.90);
        this.ctx.lineTo(pitchLeft + pitchWidth, this.h * 0.90);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(pitchLeft, this.h * 0.55);
        this.ctx.lineTo(pitchLeft + pitchWidth, this.h * 0.55);
        this.ctx.stroke();
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.w * 0.50, this.h * 0.55);
        this.ctx.lineTo(this.w * 0.50, this.h * 0.90);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.w * 0.5, this.h * 0.5);
        this.ctx.lineTo(this.w * 0.5, this.h);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
        this.ctx.shadowBlur = 10;
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.ellipse(this.w / 2, this.h * 1.15, this.w / 2 - 10, this.h * 0.9, 0, Math.PI, 0, true);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.drawStadiumFeatures();
    }
    drawStadiumFeatures() {
        const W = this.w;
        const H = this.h;
        this.ctx.fillStyle = '#1E3A8A';
        this.ctx.beginPath();
        this.ctx.ellipse(W / 2, H * 1.2, W / 2, H, 0, Math.PI, 0, true);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        let stadiumName;
        switch (this.stadiumType) {
            case 'lords':
                stadiumName = "LORD'S CRICKET GROUND";
                break;
            case 'mcg':
                stadiumName = "MELBOURNE CRICKET GROUND";
                break;
            case 'wankhede':
                stadiumName = "WANKHEDE STADIUM";
                break;
            default:
                stadiumName = "INTERNATIONAL STADIUM";
        }
        this.ctx.fillText(stadiumName, W / 2, H * 1.05);
        if (this.stadiumType === 'lords') {
            this.ctx.fillStyle = '#8B0000';
            this.ctx.beginPath();
            this.ctx.ellipse(W * 0.3, H * 1.25, W * 0.15, H * 0.1, 0, 0, Math.PI * 2);
            this.ctx.fill();
        } else if (this.stadiumType === 'mcg') {
            this.ctx.fillStyle = '#006400';
            this.ctx.beginPath();
            this.ctx.ellipse(W * 0.7, H * 1.25, W * 0.15, H * 0.1, 0, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}