const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let dataPoints = [];
let attentionBoxes = [];
let time = 0;

// --- CALM PAREIDOLIA ENGINE PARAMETERS ---
const POINT_COUNT = 75;            // Halved density for a cleaner canvas
const BOX_SPAWN_RATE = 0.003;      // Extremely rare random spawns
const BOX_LIFESPAN = 240;          // Lingers much longer, fades beautifully
const MOUSE_ATTENTION_RATE = 0.02; // Very gentle mouse tracking
const MAX_CONCURRENT_BOXES = 3;    // Strict limit to prevent visual clutter
// ------------------------------------

let mouse = { x: null, y: null, vx: 0, vy: 0 };
let lastMouse = { x: null, y: null };

const LABELS = [
    'null_space', 'artifact_detected', 'latent_structure', 
    'noise_cluster', 'confidence: 0.12', 'ambiguous_edge', 
    'attention_head_04', 'ghost_data', 'class: unknown', 
    'resemblance_score: low'
];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    lastMouse.x = mouse.x;
    lastMouse.y = mouse.y;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.vx = mouse.x - lastMouse.x;
    mouse.vy = mouse.y - lastMouse.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class DataPoint {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.seed = Math.random() * 1000;
        this.speed = Math.random() * 0.1 + 0.05; // Slowed down to a gentle drift
    }
    update() {
        this.y -= this.speed;
        this.x += Math.sin(time * 0.005 + this.seed) * 0.15; // Softer horizontal sway
        
        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
    }
    draw() {
        // Ultra-faint 2D crosses
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x - 2, this.y);
        ctx.lineTo(this.x + 2, this.y);
        ctx.moveTo(this.x, this.y - 2);
        ctx.lineTo(this.x, this.y + 2);
        ctx.stroke();
    }
}

class AttentionBox {
    constructor(x, y, isMouse = false) {
        this.x = x;
        this.y = y;
        this.targetW = Math.random() * 120 + 60;
        this.targetH = Math.random() * 90 + 40;
        this.w = 0;
        this.h = 0;
        this.life = BOX_LIFESPAN + (Math.random() * 60 - 30);
        this.maxLife = this.life;
        this.label = LABELS[Math.floor(Math.random() * LABELS.length)];
        this.score = (Math.random() * 0.4 + 0.1).toFixed(3);
        
        this.offsetX = (Math.random() > 0.5 ? 1 : -1) * (this.targetW / 2 + 15);
        this.offsetY = (Math.random() > 0.5 ? 1 : -1) * (this.targetH / 2 + 15);
    }
    
    update() {
        this.life--;
        // Smoother, slower opening animation
        this.w += (this.targetW - this.w) * 0.08;
        this.h += (this.targetH - this.h) * 0.08;
    }

    draw() {
        const alpha = Math.max(0, this.life / this.maxLife);
        // Extremely gentle fade in and out curve
        const fade = Math.sin(alpha * Math.PI); 

        ctx.save();
        ctx.translate(this.x, this.y);

        // Faint, ghostly bounding boxes
        ctx.strokeStyle = `rgba(200, 200, 225, ${fade * 0.2})`;
        ctx.lineWidth = 1;
        const s = 8;
        const w2 = this.w / 2;
        const h2 = this.h / 2;

        ctx.beginPath();
        ctx.moveTo(-w2, -h2 + s); ctx.lineTo(-w2, -h2); ctx.lineTo(-w2 + s, -h2);
        ctx.moveTo(w2 - s, -h2); ctx.lineTo(w2, -h2); ctx.lineTo(w2, -h2 + s);
        ctx.moveTo(w2, h2 - s); ctx.lineTo(w2, h2); ctx.lineTo(w2 - s, h2);
        ctx.moveTo(-w2 + s, h2); ctx.lineTo(-w2, h2); ctx.lineTo(-w2, h2 - s);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(-w2, 0); ctx.lineTo(w2, 0);
        ctx.moveTo(0, -h2); ctx.lineTo(0, h2);
        ctx.stroke();

        // Muted text
        ctx.fillStyle = `rgba(180, 180, 200, ${fade * 0.4})`;
        ctx.font = '10px "IBM Plex Mono", monospace'; 
        ctx.textAlign = this.offsetX > 0 ? 'left' : 'right';
        
        let displayLabel = this.label;
        if (Math.random() > 0.98) displayLabel = displayLabel.split('').sort(() => 0.5 - Math.random()).join('');

        ctx.fillText(displayLabel, this.offsetX, this.offsetY);
        ctx.fillText(`conf: [${this.score}]`, this.offsetX, this.offsetY + 14);
        
        ctx.strokeStyle = `rgba(180, 180, 200, ${fade * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(this.offsetX > 0 ? w2 : -w2, this.offsetY > 0 ? h2 : -h2);
        ctx.lineTo(this.offsetX, this.offsetY - 5);
        ctx.stroke();

        ctx.restore();
    }
}

function init() {
    resize();
    dataPoints = [];
    for (let i = 0; i < POINT_COUNT; i++) {
        dataPoints.push(new DataPoint());
    }
    animate();
}

function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);
    
    dataPoints.forEach(p => {
        p.update();
        p.draw();
    });

    if (Math.random() < BOX_SPAWN_RATE && attentionBoxes.length < MAX_CONCURRENT_BOXES) {
        attentionBoxes.push(new AttentionBox(
            Math.random() * width, 
            Math.random() * height
        ));
    }

    if (mouse.x !== null) {
        const velocity = Math.abs(mouse.vx) + Math.abs(mouse.vy);
        const dynamicRate = MOUSE_ATTENTION_RATE + (velocity * 0.001);
        
        if (Math.random() < dynamicRate && attentionBoxes.length < MAX_CONCURRENT_BOXES) {
            attentionBoxes.push(new AttentionBox(
                mouse.x + (Math.random() * 80 - 40),
                mouse.y + (Math.random() * 80 - 40),
                true
            ));
        }
    }

    for (let i = attentionBoxes.length - 1; i >= 0; i--) {
        let box = attentionBoxes[i];
        box.update();
        box.draw();
        
        if (box.life <= 0) {
            attentionBoxes.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

init();
