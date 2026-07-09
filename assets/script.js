const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let attentionBoxes = [];

// --- REFINED PAREIDOLIA PARAMETERS ---
const BOX_SPAWN_RATE = 0.01;       // Slower, more deliberate spawns
const BOX_LIFESPAN = 400;          // Lingers for a long, slow fade (~6-7 seconds)
const MAX_CONCURRENT_BOXES = 4;    // Strict limit keeps the page mostly empty
const MOUSE_ATTENTION_RATE = 0.05; // Gentle curiosity around the cursor
// ------------------------------------

let mouse = { x: null, y: null, vx: 0, vy: 0 };
let lastMouse = { x: null, y: null };

// VLM Vocabulary
const LABELS = [
    'null_space_feature', 'latent_artifact', 'phantom_edge', 
    'noise_cluster', 'conf: 0.12', 'ambiguous_topology', 
    'attention_head_04', 'ghost_data', 'class: unseen', 
    'resemblance: abstract'
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

class AttentionBox {
    constructor(x, y, isMouse = false) {
        this.x = x;
        this.y = y;
        // Gives the boxes a very slow, drifting "floating" feeling
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        
        this.targetW = Math.random() * 140 + 60;
        this.targetH = Math.random() * 100 + 40;
        this.w = 0;
        this.h = 0;
        
        this.maxLife = BOX_LIFESPAN + (Math.random() * 100 - 50);
        this.life = 0; // Starts at 0 and counts up for smooth math
        
        this.label = LABELS[Math.floor(Math.random() * LABELS.length)];
        this.score = (Math.random() * 0.3 + 0.05).toFixed(3);
        
        this.offsetX = (Math.random() > 0.5 ? 1 : -1) * (this.targetW / 2 + 20);
        this.offsetY = (Math.random() > 0.5 ? 1 : -1) * (this.targetH / 2 + 20);
    }
    
    update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        
        // Smooth, easing opening animation
        this.w += (this.targetW - this.w) * 0.05;
        this.h += (this.targetH - this.h) * 0.05;
    }

    draw() {
        // Creates a perfect, seamless parabola fade (0 -> 1 -> 0)
        const progress = this.life / this.maxLife;
        const fade = Math.sin(progress * Math.PI); 

        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw Bounding Box Corners (Faint, frosty white)
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.15})`;
        ctx.lineWidth = 1;
        const s = 12; // Corner segment length
        const w2 = this.w / 2;
        const h2 = this.h / 2;

        ctx.beginPath();
        ctx.moveTo(-w2, -h2 + s); ctx.lineTo(-w2, -h2); ctx.lineTo(-w2 + s, -h2);
        ctx.moveTo(w2 - s, -h2); ctx.lineTo(w2, -h2); ctx.lineTo(w2, -h2 + s);
        ctx.moveTo(w2, h2 - s); ctx.lineTo(w2, h2); ctx.lineTo(w2 - s, h2);
        ctx.moveTo(-w2 + s, h2); ctx.lineTo(-w2, h2); ctx.lineTo(-w2, h2 - s);
        ctx.stroke();

        // Ultra-faint Crosshairs
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.03})`;
        ctx.beginPath();
        ctx.moveTo(-w2, 0); ctx.lineTo(w2, 0);
        ctx.moveTo(0, -h2); ctx.lineTo(0, h2);
        ctx.stroke();

        // Monospaced Technical Labeling
        ctx.fillStyle = `rgba(200, 200, 215, ${fade * 0.35})`;
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.textAlign = this.offsetX > 0 ? 'left' : 'right';
        
        // Very rare text scrambling glitch
        let displayLabel = this.label;
        if (Math.random() > 0.99) displayLabel = displayLabel.split('').sort(() => 0.5 - Math.random()).join('');

        ctx.fillText(displayLabel, this.offsetX, this.offsetY);
        ctx.fillText(`[${this.score}]`, this.offsetX, this.offsetY + 14);
        
        // Connecting line
        ctx.strokeStyle = `rgba(255, 255, 255, ${fade * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(this.offsetX > 0 ? w2 : -w2, this.offsetY > 0 ? h2 : -h2);
        ctx.lineTo(this.offsetX, this.offsetY - 5);
        ctx.stroke();

        ctx.restore();
    }
}

function init() {
    resize();
    attentionBoxes = [];
    animate();
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Machine hallucinates in the empty void
    if (Math.random() < BOX_SPAWN_RATE && attentionBoxes.length < MAX_CONCURRENT_BOXES) {
        attentionBoxes.push(new AttentionBox(
            Math.random() * width, 
            Math.random() * height
        ));
    }

    // Machine occasionally tracks the user's cursor
    if (mouse.x !== null) {
        const velocity = Math.abs(mouse.vx) + Math.abs(mouse.vy);
        const dynamicRate = MOUSE_ATTENTION_RATE + (velocity * 0.002);
        
        if (Math.random() < dynamicRate && attentionBoxes.length < MAX_CONCURRENT_BOXES) {
            attentionBoxes.push(new AttentionBox(
                mouse.x + (Math.random() * 120 - 60),
                mouse.y + (Math.random() * 120 - 60),
                true
            ));
        }
    }

    // Update and prune boxes
    for (let i = attentionBoxes.length - 1; i >= 0; i--) {
        let box = attentionBoxes[i];
        box.update();
        box.draw();
        
        if (box.life >= box.maxLife) {
            attentionBoxes.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animate);
}

// Boot up
init();
