const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const dots = [];
const spacing = 20;

for (let x = 0; x < canvas.width; x += spacing) {
    for (let y = 0; y < canvas.height; y += spacing) {
        dots.push({ x, y, offsetX: 0, offsetY: 0 });
    }
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x + dot.offsetX, dot.y + dot.offsetY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

canvas.addEventListener('click', (e) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    for (const dot of dots) {
        const dx = dot.x - clickX;
        const dy = dot.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = 10 / (dist * dist);
        const angle = Math.atan2(dy, dx);
        dot.offsetX = Math.cos(angle) * force * 100;
        dot.offsetY = Math.sin(angle) * force * 100;
    }

    drawDots();
});

drawDots();
