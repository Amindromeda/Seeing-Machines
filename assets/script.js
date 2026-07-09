const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let dataPoints = [];
let attentionBoxes = [];
let time = 0;

// --- ACADEMIC PAREIDOLIA PARAMETERS ---
const POINT_COUNT = 120;           // Enough for a substrate, not enough to clutter
const BOX_SPAWN_RATE = 0.008;      // Slow, deliberate hallucination rate
const BOX_LIFESPAN = 300;          // Long, smooth fade in and out
const MAX_CONCURRENT_BOXES = 4;    // Caps the visual noise
const MOUSE_ATTENTION_RATE = 0.015;// Subtle tracking of the user's cursor
const MOUSE_REPEL_RADIUS = 120;    // Gentle parting of the data points
// --------------------------------------

let mouse = { x: null, y: null, vx: 0, vy: 0 };
let lastMouse = { x: null, y: null };

// VLM Vocabulary - Custom tuned to your exact thesis queries
const LABELS = [
    'query: "asphalt"', 'class: "tree"', 'feature: "galaxy"',
    'label: "bicycle"', 'query: "frog"', 'match: "spider_web"',
    'class: "circuit_board"', 'feature: "human_face"', 'query: "lightning"',
    'label: "melting_ice"', 'match: "storm_clouds"', 'query: "fabric"',
    'conf: [0.12]', 'resemblance: abstract', 'class: unknown'
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

// The Data Substrate (Ultra-faint)
class DataPoint {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.seed = Math.random() * 1000;
        this.speed = Math.random() * 0.1 + 0.05;
    }
    update() {
        this.y -= this.speed;
        this.x += Math.sin(time * 0.003 + this.seed) * 0.15;
        
        if (this.y < -10) this.y = height + 10;
        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;

        // Gentle mouse repel
        if (mouse.x !== null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_REPEL_RADIUS) {
                let force = (MOUSE_REPEL_RADIUS - dist) / MOUSE_REPEL_RADIUS;
                this.x += (dx / dist) * force * 1.5;
                this.y += (dy / dist) * force * 1.5;
            }
        }
    }
    draw() {
        // Rendered as tiny, 1px faint dots instead of crosses for elegance
        ctx.fillStyle = 'rgba(230, 230, 240, 0.06)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// The Hallucination Engine
class AttentionBox {
    constructor(x, y, isMouse = false) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.1; // Incredibly slow drift
        this.vy = (Math.random() - 0.5) * 0.1;
        
        this.targetW = Math.random() * 120 + 60;
        this.targetH = Math.random() * 80 + 40;
        this.w = 0;
        this.h = 0;
        
        this.maxLife = BOX_LIFESPAN + (Math.random() * 60 - 30);
        this.life = 0;
        
        this.label = LABELS[Math.floor(Math.random() * LABELS.length)];
        this.score = (Math.random() * 0.3 + 0.05).toFixed(3);
        
        this.offsetX = (Math.random() > 0.5 ? 1 : -1) * (this.targetW / 2 + 15);
        this.offsetY = (Math.random() > 0.5 ? 1 : -1) * (this.targetH / 2 + 15);
    }
    
    update() {
        this.life++;
        this.x += this.vx;
        this.y += this.vy;
        
        this.w += (this.targetW - this.w) * 0.03; // Buttery smooth expansion
        this.h += (this.targetH - this.h) * 0.03;
    }

    draw() {
        // Sine wave fade for a perfect, organic appearance and disappearance
        const progress = this.life / this.maxLife;
        const fade = Math.sin(progress * Math.PI); 

        ctx.save();
        ctx.translate(this.x, this.y);

        // Watermark-level opacity for the boxes
        ctx.strokeStyle = `rgba(220, 220, 235, ${fade * 0.12})`;
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

        // Crosshairs
        ctx.strokeStyle = `rgba(240, 240, 255, ${fade * 0.04})`;
        ctx.beginPath();
        ctx.moveTo(-w2, 0); ctx.lineTo(w2, 0);
        ctx.moveTo(0, -h2); ctx.lineTo(0, h2);
        ctx.stroke();

        // Monospaced text, dialed back so it doesn't fight the HTML prose
        ctx.fillStyle = `rgba(190, 190, 210, ${fade * 0.25})`;
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.textAlign = this.offsetX > 0 ? 'left' : 'right';
        
        let displayLabel = this.label;
        if (Math.random() > 0.99) displayLabel = displayLabel.split('').sort(() => 0.5 - Math.random()).join('');

        ctx.fillText(displayLabel, this.offsetX, this.offsetY);
        ctx.fillText(`[${this.score}]`, this.offsetX, this.offsetY + 14);
        
        ctx.strokeStyle = `rgba(220, 220, 240, ${fade * 0.08})`;
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
    attentionBoxes = [];
    animate();
}

function animate() {
    time++;
    ctx.clearRect(0, 0, width, height);
    
    // Draw substrate
    dataPoints.forEach(p => {
        p.update();
        p.draw();
    });

    // Spontaneous hallucination
    if (Math.random() < BOX_SPAWN_RATE && attentionBoxes.length < MAX_CONCURRENT_BOXES) {
        attentionBoxes.push(new AttentionBox(
            Math.random() * width, 
            Math.random() * height
        ));
    }

    // Mouse attention
    if (mouse.x !== null) {
        const velocity = Math.abs(mouse.vx) + Math.abs(mouse.vy);
        const dynamicRate = MOUSE_ATTENTION_RATE + (velocity * 0.002);
        
        if (Math.random() < dynamicRate && attentionBoxes.length < MAX_CONCURRENT_BOXES) {
            attentionBoxes.push(new AttentionBox(
                mouse.x + (Math.random() * 100 - 50),
                mouse.y + (Math.random() * 100 - 50),
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
