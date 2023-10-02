const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const isMobile = window.innerWidth <= 800;  // You can adjust this value based on your needs
let selectedImage = null;


// Reference resolution
const REF_WIDTH = 1920;
const REF_HEIGHT = 1080;

const isLargeScreen = window.innerWidth > 1200;

const BASE_SPEED = 0.01;
const SPEED_MULTIPLIER = .6;

let speedScaleFactor = 1;  // Initial value
// Calculate the speed scale factor based on the current window size
speedScaleFactor = SPEED_MULTIPLIER * Math.sqrt((window.innerWidth * window.innerHeight) / (REF_WIDTH * REF_HEIGHT));


const REF_DOT_RADIUS = isLargeScreen ? 2 : 2;  // Dot radius at reference resolution
const REF_SPACING = isLargeScreen ? 19: 11;   // Spacing between dots at reference resolution

// Calculate scaling factor
const scaleFactor = 1.2; // window.innerWidth / REF_WIDTH;

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
let lastX = 0;
let lastY = 0;

let centerX, centerY, mouseX, mouseY, scaledWidth, scaledHeight;

let isAnyImageHovering = false;

let matrixEffectActive = false;


//DOT GENERATION lOGIC
const REF_DOT_COUNT_X = Math.ceil(REF_WIDTH / spacingX);
const REF_DOT_COUNT_Y = Math.ceil(REF_HEIGHT / spacingY);
const MAX_DOTS = (REF_DOT_COUNT_X * REF_DOT_COUNT_Y); // DOT Cap to prevent slowdowns


const dots = [];
const dotSpeed = .8;  // Adjust this for faster/slower movement

let dotCount = 0;

for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        if (dotCount >= MAX_DOTS) {
            break;
        }
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed });
        dotCount++;
    }
    if (dotCount >= MAX_DOTS) {
        break;
    }
}

const BUBBLE_OFFSET = 35;

const images = [
    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye1/pic1.png', angle: 0, id: 'eye1', bubbleText: 'The Elmyr de Hory Exhibit',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: false,

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
    showBubble: false,  // Flag to determine if the bubble should be shown
    reverseDirection: false
    },

    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye2/eye2editSMALL.png', angle: 0, id: 'eye2', bubbleText: 'Room 4-308-D',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: false,

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
    showBubble: false,  // Flag to determine if the bubble should be shown
    reverseDirection: false
    },

    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eyex.png', angle: 0, id: 'eyex', bubbleText: '???',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: false,

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
    showBubble: false,  // Flag to determine if the bubble should be shown
    reverseDirection: true
    },

    { x: 100, y: 100, vx: -1, vy: -1, src: 'img/meninas.gif', angle: 0, id: 'meninas', bubbleText: '???',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: true,

    floatAmplitude: 10,  // The maximum distance the image will float up or down
    floatSpeed: 0.06,    // The speed of the floating effect
    floatTime: 0,        // A counter to keep track of the floating time
    isFloating: false,    // A flag to check if the image is currently floating
    returnTimeout: null,
    isAnimatingBack: false,
    ellipseWidth: 250 + getRandomInRange(-50, 50),  // Random variation
    ellipseHeight: 268 + getRandomInRange(-50, 50),  // Random variation
    angle: getRandomAngle() * -1,
    bubbleTargetX: BUBBLE_OFFSET,
    bubbleX: 0,  // Initial position of the bubble
    bubbleOpacity: 0,  // Initial opacity of the bubble
    showBubble: false,  // Flag to determine if the bubble should be shown
    reverseDirection: true
    },

    // ... add more images
];


const mobileEllipseWidthCap = window.innerWidth * 0.9; 
if (isMobile) {
    for (const img of images) {
        img.ellipseWidth *= 0.3;  // Reduce ellipse width 
        img.ellipseHeight *= 0.7; // Reduce ellipse height 
        if (isMobile && img.ellipseWidth > mobileEllipseWidthCap) {
            img.ellipseWidth = mobileEllipseWidthCap;
        }
    }
}

const returnIcon = new Image();
returnIcon.src = 'img/arrow-left-circle.png';

let isReturnIconLoaded = false;

returnIcon.onload = function() {
    isReturnIconLoaded = true;
};


const centerImage = new Image(); 
centerImage.src = 'img/wikibittransparent.png';  // Wikilogo
let startTime = Date.now();  // To track the elapsed time for the bobbing effect
const bobbingSpeed = 0.0005;  // Adjust this value to make the bobbing faster or slower
const bobbingAmplitude = 10;  // Adjust this value to make the bobbing more or less pronounced

function getRandomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomAngle() {
    return Math.random() * 2 * Math.PI;  // Returns a random angle between 0 and 2π
}


for (const img of images) {
    img.initialX = img.x;
    img.initialY = img.y;
    img.initialAngle = img.angle;
    
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
    const text = "wikipediaeye.com"; 
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

function drawTopLeftSubtext() {
    const text = "A social sculpture by Ludens Gandelman.";  // Replace with your desired text
    const xPos = 10;  // Adjust for desired x position
    const yPos = 60;  // Adjust for desired y position (taking into account the font size)

    ctx.font = "14px PixelOperatorMono";  // Adjust for desired font size and font family
    ctx.fillStyle = "#b4aeae";  // Adjust for desired text color
    ctx.fillText(text, xPos, yPos);
}

function drawBottomLeftText1() {
    const textBeforeNumber = "There are currently ";
    const number = "2";
    const textAfterNumber = " revealed wikipedia eyes.";

    const xPos = 10;  // Adjust for desired x position
    const yPos = canvas.height - 40; // Adjust for desired y position (taking into account the font size)

    ctx.font = "13px PixelOperatorMono";  // Adjust for desired font size and font family

    // Draw the text before the number
    ctx.fillStyle = "#b4aeae";  // Adjust for desired text color
    ctx.fillText(textBeforeNumber, xPos, yPos);

    // Calculate the width of the text before the number to position the number correctly
    const textBeforeNumberWidth = ctx.measureText(textBeforeNumber).width;

    // Draw the number in red
    ctx.fillStyle = "red";
    ctx.fillText(number, xPos + textBeforeNumberWidth, yPos);

    // Calculate the width of the number to position the text after the number correctly
    const numberWidth = ctx.measureText(number).width;

    // Draw the text after the number
    ctx.fillStyle = "#b4aeae";  // Adjust for desired text color
    ctx.fillText(textAfterNumber, xPos + textBeforeNumberWidth + numberWidth, yPos);
}

function drawBottomLeftText2() {
    const textBefore = "For more info click on ";
    const coloredText = "an eye -> its title";
    const xPos = 10;  // Adjust for desired x position
    const yPos = canvas.height - 20;  // Adjust for desired y position (taking into account the font size)

    ctx.font = "13px PixelOperatorMono";  // Adjust for desired font size and font family

    // Draw the text before the colored part
    ctx.fillStyle = "#b4aeae";  // Adjust for desired text color
    ctx.fillText(textBefore, xPos, yPos);

    // Calculate the width of the text before the colored part to position the colored text correctly
    const textBeforeWidth = ctx.measureText(textBefore).width;

    // Draw the colored text in a not-too-bright yellow
    ctx.fillStyle = "#dcd15a";  // This is a muted yellow color, adjust if needed
    ctx.fillText(coloredText, xPos + textBeforeWidth, yPos);
}


function applyRippleEffect(dot, clickX, clickY) {
    const dx = clickX - dot.originalX;
    const dy = clickY - dot.originalY;

    // Use squared distance to avoid square root calculation
    const distanceSquared = dx * dx + dy * dy;
    const maxDistanceSquared = 350 * 350;  // Adjust for larger/smaller ripple effect

    if (distanceSquared < maxDistanceSquared) {
        const offset = 25;  // Adjust for more/less pronounced effect

        // Since atan2 and trig functions are unavoidable for angle calculation, 
        // we compute them only once here
        const angle = Math.atan2(dy, dx);
        
        // Calculate strength directly using squared distance
        const strength = (1 - Math.sqrt(distanceSquared) / 350) * offset;
        
        const targetX = dot.originalX + Math.cos(angle) * strength;
        const targetY = dot.originalY + Math.sin(angle) * strength;

        anime({
            targets: dot,
            x: [dot.x, targetX],
            y: [dot.y, targetY],
            easing: 'easeOutElastic(1, .8)',
            duration: 20,
            delay: Math.sqrt(distanceSquared) * 2,
            complete: () => {
                anime({
                    targets: dot,
                    x: dot.originalX,
                    y: dot.originalY,
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
        ctx.fillStyle = '#4a4848';  // Updated color (original: #3a3939)
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

function drawSpeechBubble(x, y, width, height, text) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 10;  // Adjust for desired padding from screen edges

    // Adjust x if the bubble goes off the right edge of the screen
    if (x + width > screenWidth) {
        x = screenWidth - width - padding;
    }

    // Adjust y if the bubble goes off the bottom edge of the screen
    if (y + height > screenHeight) {
        y = screenHeight - height - padding;
    }

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

function isPointInsideImage(x, y, img) {
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    const drawWidth = imgHeight * aspectRatio;
    return x >= img.x && x <= img.x + drawWidth && y >= img.y && y <= img.y + imgHeight;
}

let manifestoIsUp = false;

document.getElementById('manifestoButton').addEventListener('click', function() {
    fetch('manifesto.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('manifesto-content').innerHTML = data;
        
        if(!manifestoIsUp)// Use anime.js to slide the manifesto-content div up
        {
            anime({
                targets: '#manifesto-content',
                bottom: '0%',
                duration: 2000,
                easing: 'easeOutExpo'
            }); 
            // Show the return text
            document.getElementById('closeManifesto').style.display = 'block';
        }

        if(manifestoIsUp)
        {
                        // Use anime.js to slide the manifesto-content div down
            anime({
                targets: '#manifesto-content',
                bottom: '-100%',
                duration: 1500,
                easing: 'easeOutExpo'
            });

            // Hide the return text
            document.getElementById('closeManifesto').style.display = 'none';
        }

        // Toggle the value of manifestoIsUp
        manifestoIsUp = !manifestoIsUp;
    });
});

document.getElementById('closeManifesto').addEventListener('click', function() {
    // Use anime.js to slide the manifesto-content div down
    anime({
        targets: '#manifesto-content',
        bottom: '-100%',
        duration: 1500,
        easing: 'easeOutExpo'
    });

    // Hide the return text
    document.getElementById('closeManifesto').style.display = 'none';

    manifestoIsUp = false;
});


canvas.addEventListener('click', (e) => {
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    let clickedOnImage = false;
    let clickedOnBubble = false;

    for (const img of images) {
        if (isPointInsideImage(clickedX, clickedY, img)) {
            const contentURL = 'panels/' + img.id + '.html';
            fetch(contentURL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Content not found');
                }
                return response.text();
            })
            .then(data => {
                matrixEffectActive = false;
                const contentContainer = document.getElementById('dynamic-content');
                contentContainer.innerHTML = data;

            })
            .catch(error => {
                console.error('Error fetching content:', error);
                matrixEffectActive = true;
                generateMatrixEffect();
            });
            clickedOnImage = true;
            break;
        }

        // Check if clicked inside a bubble
        const bubbleLeft = img.x + img.bubbleX;
        const textWidth = ctx.measureText(img.bubbleText).width;
        const padding = 20;  // Adjust for desired padding on each side of the text
        const bubbleWidth = textWidth + 2 * padding;
        const bubbleRight = bubbleLeft + bubbleWidth;
        const bubbleTop = img.y - 30;
        const bubbleBottom = bubbleTop + 28;

        if (clickedX >= bubbleLeft && clickedX <= bubbleRight && clickedY >= bubbleTop && clickedY <= bubbleBottom) {
            clickedOnBubble = true;
            break;
        }
    }

    if (!clickedOnImage && !clickedOnBubble) {
        for (const img of images) {
            img.isFloating = false;
            img.showBubble = false;  // Hide the bubble if it's shown
            img.bubbleOpacity = 0;  // Reset bubble opacity

            // Calculate target position on the ellipse
            const targetX = canvas.width / 2 + img.ellipseWidth * Math.cos(img.angle) - imgWidth / 2;
            const targetY = canvas.height / 2 + img.ellipseHeight * Math.sin(img.angle) - imgHeight / 2;

            // Use anime.js to smoothly transition the image to the target position
            anime({
                targets: img,
                x: targetX,
                y: targetY,
                duration: 1000,
                easing: 'easeOutExpo'
            });
        }
    }

    for (const img of images) {
        const bubbleLeft = img.x + img.bubbleX;
        const bubbleRight = bubbleLeft + ctx.measureText(img.bubbleText).width + 20;  // 20 is the padding
        const bubbleTop = img.y - 30;
        const bubbleBottom = bubbleTop + 28;

        if (img.showBubble && clickedX >= bubbleLeft && clickedX <= bubbleRight && clickedY >= bubbleTop && clickedY <= bubbleBottom) {
            transitioning = true;
            img.showBubble = false;

            // Animate the clicked image to the center of the remaining space
            anime({
                targets: img,
                x: (canvas.width * 0.25) - (imgWidth / 2),  // Center of the remaining 50% space
                y: canvas.height / 2 - (imgHeight / 2),  // Vertical center
                easing: 'easeOutExpo',
                duration: 1000
            });

        // Check if it's a mobile device
        if (isMobile) {  
            // If it's a mobile device, adjust the panel to fill the entire screen
            document.getElementById('panel').style.display = 'block';
            anime({
                targets: '#panel',
                right: '0%',
                width: '100%',  // Make the panel's width 100% of the screen width
                easing: 'easeOutExpo',
                duration: 1000
            });
        } else {
            // If it's not a mobile device, use the original animation
            anime({
                targets: '#panel',
                right: '0%',
                easing: 'easeOutExpo',
                duration: 1000
            });
        }
                // Show the return text
            document.getElementById('returnText').style.display = 'block';
        }
    }

});



canvas.addEventListener('mousedown', (e) => {
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    initialClickX = e.clientX;
    initialClickY = e.clientY;

            const mouseX = e.clientX;
        const mouseY = e.clientY;

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

let isHoveringOverCenterImage = false;

let mousemoveX, mousemoveY;

canvas.addEventListener('mousemove', (e) => {
    if (lastX && lastY) {

        mousemoveX = e.clientX;
        const mouseX = mousemoveX;
        mousemoveY = e.clientY;
        const mouseY = mousemoveY;


        if (mouseX > hitbox.x && mouseX < hitbox.x + hitbox.width && mouseY > hitbox.y && mouseY < hitbox.y + hitbox.height) {
            isHoveringOverCenterImage = true;
        } else {
            isHoveringOverCenterImage = false;
        }        

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




//
// ANIMATE FUNCTION
//


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

document.getElementById('returnText').addEventListener('click', function() {
    if (selectedImage) {
        selectedImage.x = selectedImage.initialX;
        selectedImage.y = selectedImage.initialY;
        selectedImage.angle = selectedImage.initialAngle;
        selectedImage = null;  // Deselect the image
    }

    scrollToTop();

    // Check if it's a mobile device
    if (isMobile) { 
        // If it's a mobile device, adjust the panel to fully recede
        anime({
            targets: '#panel',
            right: '-100%',  // Make the panel fully recede on mobile
            easing: 'easeOutExpo',
            duration: 1000,
            complete: function() {
                // Hide the panel completely after the animation
                document.getElementById('panel').style.display = 'none';
            }
        });
    } else {
        // If it's not a mobile device, use the original animation
        anime({
            targets: '#panel',
            right: '-70%',  // Assuming the panel is x% of the screen width
            easing: 'easeOutExpo',
            duration: 1000
        });
    }
    matrixEffectActive = false;

    clearDynamicContent();

    // Hide the return text
    document.getElementById('returnText').style.display = 'none';
});

// Function to adjust the returnText styling for mobile
function adjustReturnTextForMobile() {
    const returnTextElement = document.getElementById('returnText');

    if (isMobile) {  
        // Adjust the CSS properties for mobile
        returnTextElement.style.whiteSpace = 'nowrap';  // Prevent wrapping
        returnTextElement.style.left = 'auto';  // Reset the left property
        returnTextElement.style.right = '30px';  // Align to the top right with 10px padding
    } else {
        // Reset the properties for non-mobile devices
        returnTextElement.style.whiteSpace = 'normal';
        returnTextElement.style.left = '70%';
        returnTextElement.style.right = 'auto';
    }
}

function clearDynamicContent() {
    const contentContainer = document.getElementById('dynamic-content');
    contentContainer.innerHTML = '';
}

// Call the function initially to set the styles
adjustReturnTextForMobile();

function adjustManifestoForMobile() {
    const closeManifestoElement = document.getElementById('closeManifesto');
    const manifestoElement = document.getElementById('manifesto-content');
    const manifestoButtonElement = document.getElementById('manifestoButton');

    if (isMobile) {  
        // Adjust the CSS properties for mobile
        closeManifestoElement.style.whiteSpace = 'nowrap';  // Prevent wrapping
        closeManifestoElement.style.left = '50%';  // Center horizontally
        //closeManifestoElement.style.transform = 'translateX(-50%)';  // Adjust for true centering
        closeManifestoElement.style.top = '85%';  // Position at the top with 10px padding
        closeManifestoElement.style.right = 'auto';  // Reset the right property

        manifestoElement.style.bottom = '-150%';
        manifestoElement.style.width = '100%';
        manifestoElement.style.height = '89%';
        manifestoButtonElement.style.bottom = '7%';
    } else {
        // Reset the properties for non-mobile devices
        closeManifestoElement.style.whiteSpace = 'normal';
        closeManifestoElement.style.left = '50%';  // Center horizontally
        //closeManifestoElement.style.transform = 'translateX(-50%)';  // Adjust for true centering
        closeManifestoElement.style.top = '85%';  // Position at 85% height
        closeManifestoElement.style.right = 'auto';

        manifestoElement.style.bottom = '-100%';
        manifestoElement.style.width = '70%';
        manifestoElement.style.height = '85%';
        manifestoButtonElement.style.bottom = '60px';
    }
}

adjustManifestoForMobile()

let hitbox = {};

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

    // 2. Draw the dots and text
    drawDots();
    drawTopLeftText();
    drawTopLeftSubtext();
    drawBottomLeftText1();
    drawBottomLeftText2();


    // 2.5. Center image handling
    const elapsedTime = Date.now() - startTime;
    const bobbingOffset = Math.sin(elapsedTime * bobbingSpeed) * bobbingAmplitude;

    scaledWidth = centerImage.width * 0.2;  // Scale to x% of the original width
    scaledHeight = centerImage.height * 0.2;  // Scale to x% of the original height

    centerX = (canvas.width - scaledWidth) / 2;
    centerY = (canvas.height - scaledHeight) / 2 + bobbingOffset;

    //ctx.globalAlpha = 0.5;  // Set the opacity to 50% (adjust as needed)
    //ctx.drawImage(centerImage, centerX, centerY, scaledWidth, scaledHeight);

    hitbox = {
        x: centerX,
        y: centerY,
        width: scaledWidth,
        height: scaledHeight
    };

    if (isHoveringOverCenterImage) {
        ctx.globalAlpha = 0.7;  // Increase opacity when mouse is over
        ctx.shadowBlur = 15; // Adjust to your liking
        ctx.shadowColor = "white"; // Adjust to your desired glow color
        ctx.drawImage(centerImage, centerX, centerY - 10, scaledWidth, scaledHeight);  // Raise the image a bit
            // Reset shadow properties after drawing
        ctx.shadowBlur = 0;
    } else {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(centerImage, centerX, centerY, scaledWidth, scaledHeight);
    }
    
    ctx.globalAlpha = 1;  // Reset the opacity


    // 3. Handle the images' behavior
    for (const img of images) {
        if (img.element) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
                    // Adjust imgHeight for mobile
            let mobileScaleFactor = 1;
            let mobileScaleFactorH = 1;
            if (isMobile) {
                mobileScaleFactor = window.innerWidth / REF_WIDTH; 
                mobileScaleFactor = Math.max(0.5, mobileScaleFactor); // Ensure it doesn't get too small. Adjust as needed.

                mobileScaleFactorH = window.innerHeight / REF_HEIGHT; 
                mobileScaleFactorH = Math.max(0.5, mobileScaleFactor); // Ensure it doesn't get too small. Adjust as needed.
            }
            const adjustedImgHeight = imgHeight * mobileScaleFactorH;
            
            const drawWidth = imgWidth * mobileScaleFactor;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 5;

            
            // Before drawing the image, ensure global alpha is 1
            ctx.globalAlpha = 1;

            ctx.drawImage(img.element, img.x, img.y, drawWidth, adjustedImgHeight);

            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;


            // Update the gif position
            const gifElement = document.getElementById('animatedGif');
            const gifImage = images.find(i => i.src.endsWith('.gif'));
        
            if (img) {
                gifElement.style.left = img.x + 'px';
                gifElement.style.top = img.y + 'px';
                gifElement.style.width = drawWidth + 'px'; 
                gifElement.style.height = adjustedImgHeight + 'px';  
                gifElement.style.display = 'block';
            }


        }

        if (img === selectedImage) {
            img.floatTime = (img.floatTime + 0.02) % (2 * Math.PI);  // This will keep floatTime always between 0 and 2*PI
        } else if (img.isFloating) {
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
                const directionMultiplier = img.reverseDirection ? -1 : 1;
                img.angle += directionMultiplier * BASE_SPEED * SPEED_MULTIPLIER *  speedScaleFactor;

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
            const directionMultiplier = img.reverseDirection ? -1 : 1;
                img.angle += directionMultiplier * BASE_SPEED * SPEED_MULTIPLIER *  speedScaleFactor;

        }
    }

    if (selectedImage) {
        const aspectRatio = selectedImage.naturalWidth / selectedImage.naturalHeight;
        const drawWidth = imgHeight * aspectRatio;
        ctx.drawImage(selectedImage.element, selectedImage.x, selectedImage.y, drawWidth, imgHeight);
    }

    requestAnimationFrame(animate);
}


animate();


function generateMatrixEffect() {
    const paddingTop = 5;
    const paddingLeft = 4;

    const matrixContainer = document.getElementById('matrixContainer');

    matrixContainer.style.fontFamily = 'PixelOperatorMono';
    matrixContainer.style.color = 'grey'; 
    matrixContainer.style.fontSize = '16px';
    matrixContainer.style.whiteSpace = 'pre';

    const fontSize = 16;
    const charWidth = fontSize * 1;
    const charHeight = fontSize;

    let panelWidth, panelHeight;
    
    if (isMobile) {  
        panelWidth = window.outerWidth;
        panelHeight = window.outerHeight;
        //paddingLeft = 7;
    } else {
        panelWidth = window.innerWidth * 1.1;
        panelHeight = window.innerHeight * .9;
    }

    const columns = Math.floor(panelWidth / charWidth);
    const rows = Math.floor(panelHeight / charHeight);

    function getRandomCharacter() {
        const characters = '01';
        return characters.charAt(Math.floor(Math.random() * characters.length));
    }

    function generateRow() {
        let row = '';
        for (let i = 0; i < columns; i++) {
            if(i >= paddingLeft){
                row += getRandomCharacter();
            }
            else row += ' ';
        }
        return row;
    }

    function updateMatrix() {
        let matrix = '';
        if(matrixEffectActive) {
            for (let i = 0; i < paddingTop; i++) {
                matrix += '\n';
            }
        
            for (let i = paddingTop; i < rows; i++) {
                matrix += generateRow() + '\n';
            }
            
            matrixContainer.textContent = matrix;
            matrixContainer.style.display = 'block'; // Show the matrix container
        } else {
            matrixContainer.style.display = 'none'; // Hide the matrix container
        }
    }

    setInterval(updateMatrix, 300);
}
