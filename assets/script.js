const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// --- EXPLORE THESE PARAMETERS ---
// Tweak these numbers to change the density and mood of the background
const PARTICLE_COUNT = 100;         // How many nodes on screen
const CONNECTION_DISTANCE = 160;    // How close they must be to draw a line
const MOUSE_REPEL_RADIUS = 150;     // How far away they sense your mouse
const BASE_SPEED = 0.5;             // How fast they drift
// --------------------------------

let mouse = { x: null, y: null };

// Ensure the canvas stretches perfectly across the screen
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

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Random trajectory, normalized speed
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * BASE_SPEED;
        this.vy = Math.sin(angle) * BASE_SPEED;
        
        // Flat 2D vector style geometry
        this.radius = Math.random() * 2 + 1.5; 
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen instead of hard bouncing for a continuous infinite flow
        if (this.x < -50) this.x = width + 50;
        if (this.x > width + 50) this.x = -50;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;

        // Subtle mouse repulsion (simulating data moving out of the way)
        if (mouse.x != null) {
            let dx = this.x - mouse.x;
            let dy = this.y - mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < MOUSE_REPEL_RADIUS) {
                const force = (MOUSE_REPEL_RADIUS - distance) / MOUSE_REPEL_RADIUS;
                this.x += (dx / distance) * force * 3;
                this.y += (dy / distance) * force * 3;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(220, 220, 225, 0.8)';
        ctx.fill();
    }
}

function init() {
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
    animate();
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw connecting lines first so they sit UNDER the nodes
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < CONNECTION_DISTANCE) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                
                // Fade out lines smoothly as nodes pull apart
                let opacity = 1 - (distance / CONNECTION_DISTANCE);
                ctx.strokeStyle = `rgba(200, 200, 220, ${opacity * 0.4})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    // Update and draw the flat circles on top
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animate);
}

// Start the simulation
init();
