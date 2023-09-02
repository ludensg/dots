const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


// Reference resolution
const REF_WIDTH = 1920;
const REF_HEIGHT = 1080;

const BASE_SPEED = 0.01;
const SPEED_MULTIPLIER = .6;

let speedScaleFactor = 1;  // Initial value
// Calculate the speed scale factor based on the current window size
speedScaleFactor = SPEED_MULTIPLIER * Math.sqrt((window.innerWidth * window.innerHeight) / (REF_WIDTH * REF_HEIGHT));


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

let isAnyImageHovering = false;


const dots = [];
const dotSpeed = .8;  // Adjust this for faster/slower movement
for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed });
    }
}

const BUBBLE_OFFSET = 35;

const images = [
    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye1/pic1.png', angle: 0, info: 'Wikipedia Eye 1', bubbleText: 'The Elmyr de Hory Exhibit',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null,
    ellipseWidth: 400, ellipseHeight: 260,

    floatAmplitude: 10,  // The maximum distance the image will float up or down
    floatSpeed: 0.06,    // The speed of the floating effect
    floatTime: 0,        // A counter to keep track of the floating time
    isFloating: false,    // A flag to check if the image is currently floating
    returnTimeout: null,
    isAnimatingBack: false,
    ellipseWidth: 400 + getRandomInRange(-50, 50),  // Random variation between 350 and 450
    ellipseHeight: 260 + getRandomInRange(-50, 50),  // Random variation
    angle: getRandomAngle(),
    bubbleTargetX: BUBBLE_OFFSET,
    bubbleX: 0,  // Initial position of the bubble
    bubbleOpacity: 0,  // Initial opacity of the bubble
    showBubble: false  // Flag to determine if the bubble should be shown
    },

    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye2/pic1.png', angle: 0, info: 'Wikipedia Eye 2', bubbleText: 'Student Bedroom',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null,
    ellipseWidth: 400, ellipseHeight: 260,

    floatAmplitude: 10,  // The maximum distance the image will float up or down
    floatSpeed: 0.06,    // The speed of the floating effect
    floatTime: 0,        // A counter to keep track of the floating time
    isFloating: false,    // A flag to check if the image is currently floating
    returnTimeout: null,
    isAnimatingBack: false,
    ellipseWidth: 200 + getRandomInRange(-50, 50),  // Random variation
    ellipseHeight: 260 + getRandomInRange(-50, 50),  // Random variation
    angle: getRandomAngle(),
    bubbleTargetX: BUBBLE_OFFSET,
    bubbleX: 0,  // Initial position of the bubble
    bubbleOpacity: 0,  // Initial opacity of the bubble
    showBubble: false  // Flag to determine if the bubble should be shown
    },
    // ... add more images
];

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomAngle() {
    return Math.random() * 2 * Math.PI;  // Returns a random angle between 0 and 2π
}


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

let waveOffset = 0;  // This will be used to animate the wave

function drawTopLeftText() {
    const text = "www.wikipediaeye.com";  // Replace with your desired text
    const xPos = 10;  // Adjust for desired x position
    const yPos = 30;  // Adjust for desired y position (taking into account the font size)

    ctx.font = "20px PixelOperatorMono";  // Adjust for desired font size and font family
    ctx.fillStyle = "white";  // Adjust for desired text color
    //ctx.fillText(text, xPos, yPos);

        // Iterate over each character
        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            
            // Adjust the y position based on a sine function
            const waveY = yPos + 5 * Math.sin(i * 0.05 + waveOffset);  // Adjust the multiplier for more/less wave amplitude
    
            ctx.fillText(char, xPos + i * 15, waveY);  // Adjust the multiplier for character spacing
        }
    
        waveOffset += 0.05;  // Adjust for faster/slower wave speed
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

    // Calculate the speed scale factor based on the current window size
    speedScaleFactor = SPEED_MULTIPLIER * Math.sqrt((window.innerWidth * window.innerHeight) / (REF_WIDTH * REF_HEIGHT));

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
            img.showBubble = true;  // Set the flag to show the bubble
            img.floatTime = 0;  // Reset the float time

            // Reset bubble properties
            img.showBubble = true;
            img.bubbleX = 0;
            img.bubbleOpacity = 0;

            // Cancel any ongoing animations for the image
            anime.remove(img);

            // Clear any previously scheduled return animations for the image
            if (img.returnTimeout) {
                clearTimeout(img.returnTimeout);
            }

            // Only initiate the return animation if it's not already in progress
            if (!img.isAnimatingBack) {
                img.returnTimeout = setTimeout(() => {
                    img.isFloating = false;
                    img.isAnimatingBack = true;  // Set the flag

                    // Cancel any ongoing animations for the image
                    anime.remove(img);

                    const targetX = canvas.width / 2 + 200 * Math.cos(img.angle);  // Original ellipse width
                    const targetY = canvas.height / 2 + 100 * Math.sin(img.angle);  // Original ellipse height

                    // Smoothly transition the image to the target position
                    anime({
                        targets: img,
                        x: targetX - imgWidth / 2,  // Adjusting for the center of the image
                        y: targetY - imgHeight / 2,
                        duration: 1000,
                        easing: 'easeOutExpo',
                        complete: () => {
                            img.isAnimatingBack = false;  // Reset the flag once the animation is complete
                        }
                    });
                }, 10000);  // 10 seconds
            }
        }
    }
    lastX = null;
    lastY = null;
});


function drawSpeechBubble(x, y, width, height, text) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 2;

    const radius = 10;  // Adjust for desired corner roundness

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius); // top right corner
    ctx.arcTo(x + width, y + height, x, y + height, radius); // bottom right corner
    ctx.arcTo(x, y + height, x, y, radius); // bottom left corner
    ctx.arcTo(x, y, x + width, y, radius); // top left corner
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = '12px PixelOperatorMono';
    ctx.fillText(text, x + (width - ctx.measureText(text).width) / 2, y + height / 2 + 5); // Center the text
}

let transitioning = false;

canvas.addEventListener('click', (e) => {
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    for (const img of images) {
        const bubbleLeft = img.x + img.bubbleX;
        const bubbleRight = bubbleLeft + ctx.measureText(img.bubbleText).width + 20;  // 20 is the padding
        const bubbleTop = img.y - 30;
        const bubbleBottom = bubbleTop + 28;

        if (img.showBubble && clickedX >= bubbleLeft && clickedX <= bubbleRight && clickedY >= bubbleTop && clickedY <= bubbleBottom) {
            transitioning = true;
            img.showBubble = false;

            // Animate the clicked image to the left edge
            anime({
                targets: img,
                x: 10,  // Adjust as needed
                easing: 'easeOutExpo',
                duration: 1000
            });

            // Animate other images out of the screen
            for (const otherImg of images) {
                if (otherImg !== img) {
                    anime({
                        targets: otherImg,
                        x: '-=200',  // Move 200 pixels to the left
                        opacity: 0,
                        easing: 'easeOutExpo',
                        duration: 1000
                    });
                }
            }

            // Animate the panel from the right
            // Assuming you have a panel element defined
            anime({
                targets: '#panel',
                right: '0%',
                easing: 'easeOutExpo',
                duration: 1000
            });
        }
    }
});


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
    drawTopLeftText();

    // 3. Handle the image's behavior
    for (const img of images) {
        if (img.element) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const drawWidth = imgHeight * aspectRatio;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 5;

            
            // Before drawing the image, ensure global alpha is 1
            ctx.globalAlpha = 1;

            ctx.drawImage(img.element, img.x, img.y, drawWidth, imgHeight);

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

        }

        if (img.isFloating) {
            isAnyImageHovering = true;
            if (img.showBubble) {
                const bubbleMoveSpeed = 1;  // Adjust speed as needed
                if (Math.abs(img.bubbleX - img.bubbleTargetX) > bubbleMoveSpeed) {
                    img.bubbleX += (img.bubbleTargetX - img.bubbleX) * 0.05;  // This will smoothly move the bubble towards its target
                }
                
                if (img.isFloating && img.showBubble) {
                    img.bubbleOpacity += 0.05;  // Adjust fade-in speed as needed
                    if (img.bubbleOpacity > .7) img.bubbleOpacity = .7;
                }

                ctx.globalAlpha = img.bubbleOpacity;

                // Measure the text width
                const textWidth = ctx.measureText(img.bubbleText).width;
                const padding = 10;  // Adjust for desired padding on each side of the text
                const bubbleWidth = textWidth + 2 * padding;

                //document.fonts.ready.then(function() {
                    drawSpeechBubble(img.x + img.bubbleX, img.y - 30, bubbleWidth, 28, img.bubbleText);  // Adjust position and size as needed
                    ctx.globalAlpha = 1;  // Reset the globalAlpha after drawing the bubble
               // });

                //ctx.globalAlpha = 1;
            }            
            
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
                isAnyImageHovering = false;
                img.baseY = undefined;  // Reset the baseY for the next floating session
            }
        } else if (img.isDragging) {
            // The 'mousemove' event handles the dragging logic.
        } else {
            // If the image is not being dragged and is not floating, its position is updated based on its angle on the ellipse
            
            if (!img.isReturning) {
                //img.angle += 0.01;
                img.angle += BASE_SPEED * SPEED_MULTIPLIER *  speedScaleFactor;

            }
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            /*
            img.x = centerX + img.ellipseWidth * Math.cos(img.angle) - imgWidth / 2;  // Adjusting for the center of the image
            img.y = centerY + img.ellipseHeight * Math.sin(img.angle) - imgHeight / 2; // Adjusting for the center of the image
            */

            img.x = centerX + img.ellipseWidth * Math.cos(img.angle) - imgWidth / 2;  // Adjusting for the center of the image
            img.y = centerY + img.ellipseHeight * Math.sin(img.angle) - imgHeight / 2; // Adjusting for the center of the image

            //img.angle += 0.01;
            img.angle += BASE_SPEED * SPEED_MULTIPLIER *  speedScaleFactor;

        }
    }

    requestAnimationFrame(animate);
}


animate();