class Stadium {
    constructor(ctx, stadiumType = 'lords', isNightGame = false) {
        this.ctx = ctx;
        this.w = ctx.canvas.width;
        this.h = ctx.canvas.height;
        this.stadiumType = stadiumType;
        this.isNightGame = isNightGame;
    }
    draw() {
        const W = this.w;
        const H = this.h;
        
        if (this.isNightGame) {
            // Night sky
            const nightSkyGradient = this.ctx.createLinearGradient(0, 0, 0, H * 0.4);
            nightSkyGradient.addColorStop(0, '#0a1128');
            nightSkyGradient.addColorStop(1, '#1c2747');
            this.ctx.fillStyle = nightSkyGradient;
            this.ctx.fillRect(0, 0, W, H * 0.4);
            
            // Stars for night sky
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 100; i++) {
                const starX = Math.random() * W;
                const starY = Math.random() * H * 0.4;
                const starSize = Math.random() * 2;
                this.ctx.beginPath();
                this.ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Moon
            this.ctx.fillStyle = 'rgba(255, 255, 220, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(W * 0.8, H * 0.15, 25, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add floodlights for night matches
            this.drawFloodlights();
            
            // Enhanced grass with darker texture for night
            const nightGrassGradient = this.ctx.createLinearGradient(0, H * 0.3, 0, H);
            nightGrassGradient.addColorStop(0, '#2a5c2a');
            nightGrassGradient.addColorStop(1, '#1a3d1a');
            this.ctx.fillStyle = nightGrassGradient;
            this.ctx.fillRect(0, H * 0.3, W, H * 0.7);
            
            // Add grass texture details for night
            this.ctx.fillStyle = 'rgba(0, 40, 0, 0.3)';
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * W;
                const y = H * 0.3 + Math.random() * H * 0.7;
                this.ctx.fillRect(x, y, 2, 1);
            }
            
            // Enhanced cricket pitch with night markings
            const pitchLeft = this.w * 0.40;
            const pitchWidth = this.w * 0.20;
            const pitchTop = this.h * 0.50;
            
            // Draw pitch with darker texture for night
            const nightPitchGradient = this.ctx.createLinearGradient(pitchLeft, 0, pitchLeft + pitchWidth, 0);
            nightPitchGradient.addColorStop(0, '#8B7355');
            nightPitchGradient.addColorStop(0.5, '#A08A66');
            nightPitchGradient.addColorStop(1, '#8B7355');
            this.ctx.fillStyle = nightPitchGradient;
            this.ctx.fillRect(pitchLeft, pitchTop, pitchWidth, this.h * 0.50);
            
            // Add pitch texture lines for night
            this.ctx.strokeStyle = 'rgba(120, 120, 120, 0.4)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                const y = pitchTop + (i * (this.h * 0.50) / 20);
                this.ctx.beginPath();
                this.ctx.moveTo(pitchLeft, y);
                this.ctx.lineTo(pitchLeft + pitchWidth, y);
                this.ctx.stroke();
            }
            
            // Bowling crease (brighter for visibility)
            this.ctx.strokeStyle = '#FFFF99';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(pitchLeft, this.h * 0.90);
            this.ctx.lineTo(pitchLeft + pitchWidth, this.h * 0.90);
            this.ctx.stroke();
            
            // Popping crease (brighter for visibility)
            this.ctx.beginPath();
            this.ctx.moveTo(pitchLeft, this.h * 0.55);
            this.ctx.lineTo(pitchLeft + pitchWidth, this.h * 0.55);
            this.ctx.stroke();
            
            // Central line (dashed, brighter for visibility)
            this.ctx.setLineDash([8, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.w * 0.50, this.h * 0.55);
            this.ctx.lineTo(this.w * 0.50, this.h * 0.90);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Return crease (brighter for visibility)
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.w * 0.5, this.h * 0.5);
            this.ctx.lineTo(this.w * 0.5, this.h);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Enhanced stadium boundary with glow effect for night
            this.ctx.strokeStyle = '#FFFF99';
            this.ctx.shadowColor = 'rgba(255, 255, 153, 0.6)';
            this.ctx.shadowBlur = 12;
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.ellipse(this.w / 2, this.h * 1.15, this.w / 2 - 10, this.h * 0.9, 0, Math.PI, 0, true);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        } else {
            // Enhanced sky with gradient and clouds (day)
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, H * 0.4);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#e0f7ff');
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, W, H * 0.4);
            
            // Add clouds for more realistic sky
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 5; i++) {
                const cloudX = (i * W / 4) + (Math.sin(Date.now() / 10000 + i) * 20);
                const cloudY = H * 0.1 + (i % 2) * 30;
                this.ctx.beginPath();
                this.ctx.arc(cloudX, cloudY, 20, 0, Math.PI * 2);
                this.ctx.arc(cloudX + 15, cloudY - 10, 15, 0, Math.PI * 2);
                this.ctx.arc(cloudX + 30, cloudY, 20, 0, Math.PI * 2);
                this.ctx.arc(cloudX + 15, cloudY + 10, 15, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Enhanced grass with texture (day)
            const grassGradient = this.ctx.createLinearGradient(0, H * 0.3, 0, H);
            grassGradient.addColorStop(0, '#3CB371');
            grassGradient.addColorStop(1, '#006400');
            this.ctx.fillStyle = grassGradient;
            this.ctx.fillRect(0, H * 0.3, W, H * 0.7);
            
            // Add grass texture details (day)
            this.ctx.fillStyle = 'rgba(0, 80, 0, 0.3)';
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * W;
                const y = H * 0.3 + Math.random() * H * 0.7;
                this.ctx.fillRect(x, y, 2, 1);
            }
            
            // Enhanced cricket pitch with better markings (day)
            const pitchLeft = this.w * 0.40;
            const pitchWidth = this.w * 0.20;
            const pitchTop = this.h * 0.50;
            
            // Draw pitch with texture (day)
            const pitchGradient = this.ctx.createLinearGradient(pitchLeft, 0, pitchLeft + pitchWidth, 0);
            pitchGradient.addColorStop(0, '#D2B48C');
            pitchGradient.addColorStop(0.5, '#DEB887');
            pitchGradient.addColorStop(1, '#D2B48C');
            this.ctx.fillStyle = pitchGradient;
            this.ctx.fillRect(pitchLeft, pitchTop, pitchWidth, this.h * 0.50);
            
            // Add pitch texture lines (day)
            this.ctx.strokeStyle = 'rgba(160, 160, 160, 0.3)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                const y = pitchTop + (i * (this.h * 0.50) / 20);
                this.ctx.beginPath();
                this.ctx.moveTo(pitchLeft, y);
                this.ctx.lineTo(pitchLeft + pitchWidth, y);
                this.ctx.stroke();
            }
            
            // Bowling crease (day)
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(pitchLeft, this.h * 0.90);
            this.ctx.lineTo(pitchLeft + pitchWidth, this.h * 0.90);
            this.ctx.stroke();
            
            // Popping crease (day)
            this.ctx.beginPath();
            this.ctx.moveTo(pitchLeft, this.h * 0.55);
            this.ctx.lineTo(pitchLeft + pitchWidth, this.h * 0.55);
            this.ctx.stroke();
            
            // Central line (dashed, day)
            this.ctx.setLineDash([8, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.w * 0.50, this.h * 0.55);
            this.ctx.lineTo(this.w * 0.50, this.h * 0.90);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Return crease (day)
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.w * 0.5, this.h * 0.5);
            this.ctx.lineTo(this.w * 0.5, this.h);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Enhanced stadium boundary with glow effect (day)
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            this.ctx.shadowBlur = 15;
            this.ctx.lineWidth = 5;
            this.ctx.beginPath();
            this.ctx.ellipse(this.w / 2, this.h * 1.15, this.w / 2 - 10, this.h * 0.9, 0, Math.PI, 0, true);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
        
        this.drawStadiumFeatures();
    }
    
    // Method to draw floodlights for night matches
    drawFloodlights() {
        const W = this.w;
        const H = this.h;
        
        // Draw floodlight towers
        const floodlightPositions = [
            { x: W * 0.15, y: H * 0.25 },
            { x: W * 0.85, y: H * 0.25 },
            { x: W * 0.35, y: H * 0.2 },
            { x: W * 0.65, y: H * 0.2 }
        ];
        
        floodlightPositions.forEach(pos => {
            // Floodlight tower
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(pos.x - 2, pos.y, 4, H * 0.15);
            
            // Floodlight fixture
            this.ctx.fillStyle = '#666666';
            this.ctx.fillRect(pos.x - 6, pos.y - 5, 12, 8);
            
            // Light beam effect
            const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, W * 0.4);
            gradient.addColorStop(0, 'rgba(255, 255, 240, 0.3)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 240, 0.15)');
            gradient.addColorStop(1, 'rgba(255, 255, 240, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, W * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bright light source
            this.ctx.fillStyle = 'rgba(255, 255, 240, 0.9)';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y - 2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Additional ground lighting effect
        const pitchLightGradient = this.ctx.createRadialGradient(W / 2, H * 0.7, 0, W / 2, H * 0.7, W * 0.6);
        pitchLightGradient.addColorStop(0, 'rgba(255, 255, 240, 0.2)');
        pitchLightGradient.addColorStop(0.5, 'rgba(255, 255, 240, 0.1)');
        pitchLightGradient.addColorStop(1, 'rgba(255, 255, 240, 0)');
        
        this.ctx.fillStyle = pitchLightGradient;
        this.ctx.fillRect(0, H * 0.3, W, H * 0.7);
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