const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Reference resolution
const REF_WIDTH = 1920;
const REF_HEIGHT = 1080;
const REF_DOT_RADIUS = 2;  // Dot radius at reference resolution
const REF_SPACING = 11;   // Spacing between dots at reference resolution

// Calculate scaling factor
const scaleFactor = 1; // window.innerWidth / REF_WIDTH;

//const spacingX = canvas.width / grid_size;
//const spacingY = canvas.height / grid_size;

const DOT_RADIUS = REF_DOT_RADIUS * scaleFactor;

// Adjust grid size to maintain consistent spacing
const spacingX = REF_SPACING * scaleFactor;
const spacingY = REF_SPACING * scaleFactor;
const grid_size_x = spacingX;
const grid_size_y = spacingY;


const dots = [];
const dotSpeed = .8;  // Adjust this for faster/slower movement
for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed });
    }
}



function applyRippleEffect(dot, clickX, clickY) {
    const dx = clickX - dot.originalX;
    const dy = clickY - dot.originalY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 350;  // Adjust for larger/smaller ripple effect
    const offset = 25;  // Adjust for more/less pronounced effect
    //const movementDuringRipple = dot.speed * (800 / 60);  // Assuming 60fps and 800ms duration


    if (distance < maxDistance) {
        const angle = Math.atan2(dy, dx);
        const strength = (1 - distance / maxDistance) * offset;
        const targetX = dot.originalX + Math.cos(angle) * strength;
        const targetY = dot.originalY + Math.sin(angle) * strength; // - dot.speed * (800 / 60);  // Adjust for the upward movement during the ripple

        
        anime({
            targets: dot,
            x: [dot.x, targetX],
            y: [dot.y, targetY],
            easing: 'easeOutElastic(1, .8)',
            duration: 20, //1000 + distance * 5,  // Adjust the multiplier for faster/slower ripples
            delay: distance * 2,  // Adjust the multiplier for faster/slower ripples
            complete: () => {
                anime({
                    targets: dot,
                    x: dot.originalX,
                    y: dot.originalY,       //- dot.speed * (1200 / 60),
                    easing: 'easeOutElastic(1, .8)',
                    duration: 1000
                });
            }
        });
    }
}

function drawDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const dot of dots) {
        ctx.beginPath();
        const radius = DOT_RADIUS;
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#3a3939';  // Updated color
        ctx.fill();
    }
}

// Function to reinitialize and redraw dots
function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Recalculate scaling factor
    const scaleFactor = window.innerWidth / window.innerWidth; // REF_WIDTH;

    // Adjust dot radius based on scaling factor
    const DOT_RADIUS = REF_DOT_RADIUS * scaleFactor;  
    
    // Adjust grid size to maintain consistent spacing
    const spacingX = REF_SPACING * scaleFactor;
    const spacingY = REF_SPACING * scaleFactor;

    // Reinitialize the dots based on new canvas dimensions
    dots.length = 0;  // Clear the existing dots
    for (let x = 0; x < canvas.width; x += spacingX) {
        for (let y = 0; y < canvas.height; y += spacingY) {
            dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed });
        }
    }

    // Redraw the dots
    drawDots();
}

// Attach the resize event listener
window.addEventListener('resize', handleResize);


canvas.addEventListener('mousedown', (e) => {
    for (const dot of dots) {
        applyRippleEffect(dot, e.clientX, e.clientY);
    }
});

function animate() { 
    
    /*
    // Move dots to the right
    for (const dot of dots) {
        dot.x += dot.speed;
        dot.originalX += dot.speed;

        // Wrap around when out of canvas
        if (dot.x > canvas.width) {
            dot.x -= canvas.width;
            dot.originalX -= canvas.width;
        }
    } */

    // Move dots upwards
    for (const dot of dots) {
        dot.y -= dot.speed;
        // Update the original position
        //dot.originalY = dot.y;        
        dot.originalY -= dot.speed;

        // Wrap around when out of canvas
        if (dot.y < 0) {
            dot.y += canvas.height;
            dot.originalY += canvas.height;
            //dot.originalY = dot.y;
        }
    }
    

    drawDots();
    requestAnimationFrame(animate);
}
animate();
