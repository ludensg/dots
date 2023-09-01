const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const grid_size = 30;
const spacingX = canvas.width / grid_size;
const spacingY = canvas.height / grid_size;

let spring_constant = 0.05;
let damping = 0.95;
let click_strength = 0.5;
let click_decay = 0.9;

const dots = [];
for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y });
    }
}

const click_positions = [];

function apply_force(dot, click_position, strength) {
    const dx = dot.x - click_position[0];
    const dy = dot.y - click_position[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    const force = strength * Math.exp(-0.2 * distance * distance);
    const angle = Math.atan2(dy, dx);
    return {
        fx: force * Math.cos(angle),
        fy: force * Math.sin(angle)
    };
}

function update() {
    for (const dot of dots) {
        let fx = -spring_constant * (dot.x - dot.originalX);
        let fy = -spring_constant * (dot.y - dot.originalY);

        for (const [click_position, strength] of click_positions) {
            const force = apply_force(dot, click_position, strength);
            fx += force.fx;
            fy += force.fy;
        }

        dot.vx = damping * (dot.vx + fx);
        dot.vy = damping * (dot.vy + fy);

        dot.x += dot.vx;
        dot.y += dot.vy;
    }

    click_positions.forEach((item, index) => {
        item[1] *= click_decay;
        if (item[1] < 0.01) {
            click_positions.splice(index, 1);
        }
    });

    drawDots();
    requestAnimationFrame(update);
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fill();

        const shadowX = dot.originalX - (dot.x - dot.originalX);
        const shadowY = dot.originalY - (dot.y - dot.originalY);
        ctx.beginPath();
        ctx.arc(shadowX, shadowY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
        ctx.fill();
        ctx.fillStyle = 'black';
    }
}

canvas.addEventListener('click', (e) => {
    click_positions.push([[e.clientX, e.clientY], click_strength]);
});

update();
