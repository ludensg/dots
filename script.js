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


let initialClickX = null;
let initialClickY = null;


const dots = [];
const dotSpeed = .8;  // Adjust this for faster/slower movement
for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed });
    }
}

const images = [
    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye1/pic1.png', angle: 0, info: 'Wikipedia Eye 1', 
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null,
    ellipseWidth: 400, ellipseHeight: 260,

    floatAmplitude: 10,  // The maximum distance the image will float up or down
    floatSpeed: 0.06,    // The speed of the floating effect
    floatTime: 0,        // A counter to keep track of the floating time
    isFloating: false    // A flag to check if the image is currently floating
    },
    // ... add more images
];


for (const img of images) {
    const imageElement = new Image();
    imageElement.src = img.src;
    imageElement.onload = function() {
        img.element = imageElement;
        img.naturalWidth = imageElement.naturalWidth;
        img.naturalHeight = imageElement.naturalHeight;
    };
}



const imgWidth = 100;  // Adjust as needed
const imgHeight = 100; // Adjust as needed

function calculateAngleFromCenter(x, y) {
    const dx = x - canvas.width / 2;
    const dy = y - canvas.height / 2;
    return Math.atan2(dy, dx);
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
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    initialClickX = e.clientX;
    initialClickY = e.clientY;

    for (const dot of dots) {
        applyRippleEffect(dot, clickedX, clickedY);
    }

    for (const img of images) {
        if (clickedX > img.x && clickedX < img.x + imgWidth && clickedY > img.y && clickedY < img.y + imgHeight) {
            img.isDragging = true;
            lastX = clickedX;
            lastY = clickedY;

            // If the image is floating when it's dragged, stop the floating effect
            if (img.isFloating) {
                img.isFloating = false;
                img.baseY = undefined;  // Reset the baseY
            }
            break;
        }
    }

    lastX = mouseX;
    lastY = mouseY;
});


canvas.addEventListener('mousemove', (e) => {
    if (lastX && lastY) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        for (const img of images) {
            if (img.isDragging) {
                const dx = mouseX - lastX;
                const dy = mouseY - lastY;

                img.x += dx;
                img.y += dy;

                img.momentumX = dx * 0.7; // Adjust the multiplier to control momentum strength
                img.momentumY = dy * 0.7;

                // Check boundaries and adjust position if needed
                if (img.x < 0) {
                    img.x = 0;
                    img.momentumX = 0;  // Stop any momentum
                }
                if (img.x + imgWidth > canvas.width) {
                    img.x = canvas.width - imgWidth;
                    img.momentumX = 0;  // Stop any momentum
                }
                if (img.y < 0) {
                    img.y = 0;
                    img.momentumY = 0;  // Stop any momentum
                }
                if (img.y + imgHeight > canvas.height) {
                    img.y = canvas.height - imgHeight;
                    img.momentumY = 0;  // Stop any momentum
                }


                lastX = mouseX;
                lastY = mouseY;
                break;
            }
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    const releaseX = e.clientX;
    const releaseY = e.clientY;
    const distanceMoved = Math.sqrt((releaseX - initialClickX) ** 2 + (releaseY - initialClickY) ** 2);

    if (distanceMoved > 5) {  // Adjust this threshold as needed
        for (const dot of dots) {
            applyRippleEffect(dot, releaseX, releaseY);
        }
    }

    for (const img of images) {
        if (img.isDragging) {
            img.isDragging = false;
            img.isFloating = true;
            img.floatTime = 0;  // Reset the float time

            setTimeout(() => {
                img.isFloating = false;
                const targetX = canvas.width / 2 + 200 * Math.cos(img.angle);  // Original ellipse width
                const targetY = canvas.height / 2 + 100 * Math.sin(img.angle);  // Original ellipse height

                // Smoothly transition the image to the target position
                anime({
                    targets: img,
                    x: targetX - imgWidth / 2,  // Adjusting for the center of the image
                    y: targetY - imgHeight / 2,
                    duration: 1000,
                    easing: 'easeOutExpo'
                });
            }, 10000);  // 10 seconds

        }
    }
    lastX = null;
    lastY = null;
});


canvas.addEventListener('dblclick', (e) => {
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    for (const img of images) {
        if (clickedX > img.x && clickedX < img.x + imgWidth && clickedY > img.y && clickedY < imgHeight) {
            flipImage(img);
            break;
        }
    }
});


function flipImage(img) {
    anime({
        targets: img,
        angle: img.flipped ? 0 : 180,
        x: canvas.width / 2 - imgWidth / 2,
        y: canvas.height / 2 - imgHeight / 2,
        duration: 1000,
        easing: 'easeOutExpo',
        update: function() {
            // Redraw everything to reflect changes
            drawDots();
        },
        complete: function() {
            img.flipped = !img.flipped;
            if (img.flipped) {
                // Display the information on the back of the image
                ctx.fillText(img.info, img.x, img.y + imgHeight + 20);
            }
        }
    });
}


function animate() {
    // 1. Move dots upwards
    for (const dot of dots) {
        dot.y -= dot.speed;
        dot.originalY -= dot.speed;

        // Wrap around when out of canvas
        if (dot.y < 0) {
            dot.y += canvas.height;
            dot.originalY += canvas.height;
        }
    }

    // 2. Draw the dots
    drawDots();

    // 3. Handle the image's behavior
    for (const img of images) {
        if (img.element) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const drawWidth = imgHeight * aspectRatio;
            ctx.drawImage(img.element, img.x, img.y, drawWidth, imgHeight);
        }

        if (img.isFloating) {
            img.floatTime += img.floatSpeed;
            
            // If the baseY position isn't set, set it to the current y position
            if (img.baseY === undefined) {
                img.baseY = img.y;
            }

            // Adjust the y position around the baseY using the sine function
            img.y = img.baseY + img.floatAmplitude * Math.sin(img.floatTime);
            
            // If the image has been floating for more than 10 seconds, stop the floating effect
            if (img.floatTime > Math.PI * 10) {  // 10 seconds, assuming floatSpeed is 0.02
                img.isFloating = false;
                img.baseY = undefined;  // Reset the baseY for the next floating session
            }
        } else if (img.isDragging) {
            // The 'mousemove' event handles the dragging logic.
        } else {
            // If the image is not being dragged and is not floating, its position is updated based on its angle on the ellipse
            
            if (!img.isReturning) {
                img.angle += 0.01;
            }
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            img.x = centerX + img.ellipseWidth * Math.cos(img.angle) - imgWidth / 2;  // Adjusting for the center of the image
            img.y = centerY + img.ellipseHeight * Math.sin(img.angle) - imgHeight / 2; // Adjusting for the center of the image

            img.angle += 0.01;
        }
    }

    requestAnimationFrame(animate);
}


animate();