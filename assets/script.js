const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let points = [];
let time = 0;

// --- LATENT GAZE PARAMETERS (Ultra-Subtle) ---
const POINT_COUNT = 300;           // High count, but mostly invisible
const BASE_OPACITY = 0.02;         // Barely perceptible background state
const ACTIVE_OPACITY = 0.20;       // Max opacity when the machine "focuses" here
const ATTENTION_RADIUS = 160;      // How wide the machine's spotlight is
const CONNECTION_DISTANCE = 50;    // Only connect points that are very close
// ---------------------------------------------

let mouse = { x: -1000, y: -1000 };

// The machine's wandering attention heads
let roamers = []; 

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Initialize roamers on resize to ensure they have valid coordinates
    if (roamers.length === 0) {
        roamers = [
            { x: width * 0.3, y: height * 0.3, vx: 0.3, vy: 0.2 },
            { x: width * 0.7, y: height * 0.7, vx: -0.2, vy: 0.4 }
        ];
    }
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

class TokenNode {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.originX = this.x;
        this.originY = this.y;
        this.seed = Math.random() * Math.PI * 2;
        this.attentionWeight = 0; 
    }

    update() {
        // Subtle ambient drifting
        this.originX += Math.sin(time * 0.002 + this.seed) * 0.1;
        this.originY += Math.cos(time * 0.002 + this.seed) * 0.1;

        // Wrap around screen
        if (this.originX < -20) this.originX = width + 20;
        if (this.originX > width + 20) this.originX = -20;
        if (this.originY < -20) this.originY = height + 20;
        if (this.originY > height + 20) this.originY = -20;

        this.x = this.originX;
        this.y = this.originY;
        this.attentionWeight = 0; // Reset every frame

        // Calculate influence from roaming attention heads
        roamers.forEach(r => {
            let dx = this.x - r.x;
            let dy = this.y - r.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ATTENTION_RADIUS) {
                let weight = 1 - (dist / ATTENTION_RADIUS);
                this.attentionWeight = Math.max(this.attentionWeight, weight);
                // The machine gently pulls data points together as it analyzes them
                this.x -= dx * weight * 0.15;
                this.y -= dy * weight * 0.15;
            }
        });

        // Calculate influence from user mouse
        let dxMouse = this.x - mouse.x;
        let dyMouse = this.y - mouse.y;
        let distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < ATTENTION_RADIUS) {
            let weight = 1 - (distMouse / ATTENTION_RADIUS);
            this.attentionWeight = Math.max(this.attentionWeight, weight);
            this.x -= dxMouse * weight * 0.15;
            this.y -= dyMouse * weight * 0.15;
        }
    }

    draw() {
        let currentOpacity = BASE_OPACITY + (this.attentionWeight * ACTIVE_OPACITY);
        
        ctx.fillStyle = `rgba(220, 220, 235, ${currentOpacity})`;
        ctx.beginPath();
        // Draw tiny 1px dots
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    resize();
    points = [];
    for (let i = 0; i < POINT_COUNT; i++) {
        points.push(new TokenNode());
    }
    animate();
}

function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);
    
    // Move the autonomous attention roamers
    roamers.forEach(r => {
        r.x += r.vx;
        r.y += r.vy;
        // Bounce off walls gently
        if (r.x < 0 || r.x > width) r.vx *= -1;
        if (r.y < 0 || r.y > height) r.vy *= -1;
    });
    
    // Update all points first
    points.forEach(p => p.update());

    // Draw spontaneous "hallucinated" connections
    // Only draw lines if BOTH points are currently under heavy attention
    for (let i = 0; i < points.length; i++) {
        if (points[i].attentionWeight < 0.2) continue; // Skip un-attended points to save rendering power

        for (let j = i + 1; j < points.length; j++) {
            if (points[j].attentionWeight < 0.2) continue;

            let dx = points[i].x - points[j].x;
            let dy = points[i].y - points[j].y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < CONNECTION_DISTANCE) {
                // The more the machine focuses, the stronger the connection appears
                let combinedAttention = (points[i].attentionWeight + points[j].attentionWeight) / 2;
                let opacity = combinedAttention * 0.4 * (1 - dist / CONNECTION_DISTANCE);
                
                ctx.strokeStyle = `rgba(200, 200, 230, ${opacity})`;
                ctx.lineWidth = 0.5; // Razor-thin lines
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }
        }
    }

    // Draw the dots on top of the lines
    points.forEach(p => p.draw());
    
    requestAnimationFrame(animate);
}

// Boot up the Latent Gaze
init();
