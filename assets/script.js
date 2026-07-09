const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let dataPoints = [];
let attentionBoxes = [];
let time = 0;

// --- PAREIDOLIA ENGINE PARAMETERS ---
const POINT_COUNT = 150;           // Density of the "latent space"
const BOX_SPAWN_RATE = 0.03;       // Chance of a random hallucination per frame
const BOX_LIFESPAN = 120;          // How long the machine stares before giving up
const MOUSE_ATTENTION_RATE = 0.15; // How aggressively it tracks your mouse
// ------------------------------------

let mouse = { x: null, y: null, vx: 0, vy: 0 };
let lastMouse = { x: null, y: null };

// VLM Vocabulary for the hallucinations
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

// The raw, meaningless data substrate
class DataPoint {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.seed = Math.random() * 1000;
        this.speed = Math.random() * 0.2 + 0.1;
    }
    update() {
        this.y -= this.speed;
        this.x += Math.sin(time * 0.01 + this.seed) * 0.3;
        
        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
    }
    draw() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(this.x - 3, this.y);
        ctx.lineTo(this.x + 3, this.y);
        ctx.moveTo(this.x, this.y - 3);
        ctx.lineTo(this.x, this.y + 3);
        ctx.stroke();
    }
}

// The machine trying to classify the meaningless data
class AttentionBox {
    constructor(x, y, isMouse = false) {
        this.x = x;
        this.y = y;
        this.targetW = Math.random() * 100 + 40;
        this.targetH = Math.random() * 80 + 30;
        this.w = 0;
        this.h = 0;
        this.life = BOX_LIFESPAN + (Math.random() * 60 - 30);
        this.maxLife = this.life;
        this.label = LABELS[Math.floor(Math.random() * LABELS.length)];
        this.score = (Math.random() * 0.4 + 0.1).toFixed(3);
        
        // Glitchy offset for the analytical text
        this.offsetX = (Math.random() > 0.5 ? 1 : -1) * (this.targetW / 2 + 10);
        this.offsetY = (Math.random() > 0.5 ? 1 : -1) * (this.targetH / 2 + 10);
    }
    
    update() {
        this.life--;
        // Snap opening animation
        this.w += (this.targetW - this.w) * 0.2;
        this.h += (this.targetH - this.h) * 0.2;
    }

    draw() {
        const alpha = Math.max(0, this.life / this.maxLife);
        const fade = alpha > 0.2 ? 1 : alpha * 5; // Rapid fade out at the end

        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw Bounding Box Corners (Camera Focus Style)
        ctx.strokeStyle = `rgba(200, 200, 225, ${fade * 0.6})`;
        ctx.lineWidth = 1.5;
        const s = 10; // corner size
        const w2 = this.w / 2;
        const h2 = this.h / 2;

        ctx.beginPath();
        // Top Left
        ctx.moveTo(-w2, -h2 + s); ctx.lineTo(-w2, -h2); ctx.lineTo(-w2 + s, -h2);
        // Top Right
        ctx.moveTo(w2 - s, -h2); ctx.lineTo(w2, -h2); ctx.lineTo(w2, -h2 + s);
        // Bottom Right
        ctx.moveTo(w2, h2 - s); ctx.lineTo(w2, h2); ctx.lineTo(w2 - s, h2);
        // Bottom Left
        ctx.moveTo(-w2 + s, h2); ctx.lineTo(-w2, h2); ctx.lineTo(-w2, h2 - s);
        ctx.stroke();

        // Crosshairs
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.15})`;
        ctx.beginPath();
        ctx.moveTo(-w2, 0); ctx.lineTo(w2, 0);
        ctx.moveTo(0, -h2); ctx.lineTo(0, h2);
        ctx.stroke();

        // Technical Labeling (Simulating the VLM's thought process)
        ctx.fillStyle = `rgba(180, 180, 200, ${fade * 0.8})`;
        ctx.font = '10px "IBM Plex Mono", monospace'; // Matches your site's font
        ctx.textAlign = this.offsetX > 0 ? 'left' : 'right';
        
        // Randomly scramble text occasionally to simulate processing
        let displayLabel = this.label;
        if (Math.random() > 0.95) displayLabel = displayLabel.split('').sort(() => 0.5 - Math.random()).join('');

        ctx.fillText(displayLabel, this.offsetX, this.offsetY);
        ctx.fillText(`conf: [${this.score}]`, this.offsetX, this.offsetY + 12);
        
        // Connecting line from box to text
        ctx.strokeStyle = `rgba(180, 180, 200, ${fade * 0.3})`;
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
    
    // 1. Update and draw raw data
    dataPoints.forEach(p => {
        p.update();
        p.draw();
    });

    // 2. Machine spontaneously hallucinates in empty space
    if (Math.random() < BOX_SPAWN_RATE) {
        attentionBoxes.push(new AttentionBox(
            Math.random() * width, 
            Math.random() * height
        ));
    }

    // 3. Machine desperately tries to classify the user's cursor
    if (mouse.x !== null) {
        // Higher chance to spawn if moving the mouse quickly
        const velocity = Math.abs(mouse.vx) + Math.abs(mouse.vy);
        const dynamicRate = MOUSE_ATTENTION_RATE + (velocity * 0.005);
        
        if (Math.random() < dynamicRate && attentionBoxes.length < 15) {
            // Spawn with slight scatter around the mouse
            attentionBoxes.push(new AttentionBox(
                mouse.x + (Math.random() * 60 - 30),
                mouse.y + (Math.random() * 60 - 30),
                true
            ));
        }
    }

    // 4. Update and draw the attention system
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

// Boot up the Engine
init();
