const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let time = 0;

// --- ORGANIC FLOW PARAMETERS ---
const PARTICLE_COUNT = 85;          // Slightly fewer for a cleaner look
const CONNECTION_DISTANCE = 180;    // Reach for connections
const MOUSE_REPEL_RADIUS = 200;     // Interaction radius
const FLOW_SPEED = 0.0005;          // How fast the "current" shifts
// --------------------------------

let mouse = { x: null, y: null };

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class OrganicNode {
    constructor(index) {
        this.index = index;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Seed values to give each node a unique offset in the flow field
        this.seedX = Math.random() * 1000;
        this.seedY = Math.random() * 1000;
        this.radius = Math.random() * 1.5 + 1; // Flat 2D circles
    }

    update() {
        // Pseudo-noise fluid movement using overlapping sine waves
        let noiseX = Math.sin((this.y * 0.005) + time + this.seedX) * 0.8;
        let noiseY = Math.cos((this.x * 0.005) + time + this.seedY) * 0.8;
        
        this.x += noiseX;
        this.y += noiseY;

        // Wrap around smoothly
        if (this.x < -100) this.x = width + 100;
        if (this.x > width + 100) this.x = -100;
        if (this.y < -100) this.y = height + 100;
        if (this.y > height + 100) this.y = -100;

        // Soft, viscous mouse repulsion
        if (mouse.x != null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < MOUSE_REPEL_RADIUS) {
                const force = Math.pow((MOUSE_REPEL_RADIUS - distance) / MOUSE_REPEL_RADIUS, 2);
                this.x += (dx / distance) * force * 2.5;
                this.y += (dy / distance) * force * 2.5;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230, 230, 235, 0.9)';
        ctx.fill();
    }
}

function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new OrganicNode(i));
    }
    animate();
}

function animate() {
    time += FLOW_SPEED;
    ctx.clearRect(0, 0, width, height);
    
    // Draw organic connections underneath the nodes
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONNECTION_DISTANCE) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                
                // Calculate an organic curve control point
                // This makes the lines bend gently like fluid strands rather than rigid lasers
                let midX = (particles[i].x + particles[j].x) / 2;
                let midY = (particles[i].y + particles[j].y) / 2;
                
                let curveOffsetX = Math.sin(time * 2 + i) * 20;
                let curveOffsetY = Math.cos(time * 2 + j) * 20;

                ctx.quadraticCurveTo(midX + curveOffsetX, midY + curveOffsetY, particles[j].x, particles[j].y);
                
                let opacity = Math.pow(1 - (distance / CONNECTION_DISTANCE), 1.5);
                ctx.strokeStyle = `rgba(200, 200, 220, ${opacity * 0.35})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    // Draw the nodes
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animate);
}

// Boot up the visualizer
init();
