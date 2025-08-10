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
        this.ctx.strokeStyle = '#D2B48C';
        this.ctx.lineWidth = 4;
        this.stumps.forEach(stump => {
            this.ctx.save();
            this.ctx.translate(stump.x, stump.y);
            this.ctx.rotate(stump.angle);
            const stumpGrad = this.ctx.createLinearGradient(-3, 0, 3, 0);
            stumpGrad.addColorStop(0, '#8B4513');
            stumpGrad.addColorStop(0.5, '#D2B48C');
            stumpGrad.addColorStop(1, '#8B4513');
            this.ctx.fillStyle = stumpGrad;
            this.ctx.fillRect(-3, -this.height, 6, this.height);
            this.ctx.restore();
        });
        this.ctx.strokeStyle = '#A0522D';
        this.ctx.lineWidth = 3;
        this.bails.forEach(bail => {
            this.ctx.save();
            this.ctx.translate(bail.x, bail.y);
            this.ctx.rotate(bail.angle);
            this.ctx.beginPath();
            this.ctx.moveTo(-this.width / 4, 0);
            this.ctx.lineTo(this.width / 4, 0);
            this.ctx.stroke();
            this.ctx.restore();
        });
        this.ctx.restore();
    }
}