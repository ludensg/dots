const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const isMobile = window.innerWidth <= 800;  // You can adjust this value based on your needs
let selectedImage = null;

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
let lastX = 0;
let lastY = 0;

let isAnyImageHovering = false;

let matrixEffectActive = false;



const dots = [];
const dotSpeed = .8;  // Adjust this for faster/slower movement
for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed });
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

    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye2/pic1.png', angle: 0, id: 'eye2', bubbleText: 'Room 4-308-D',
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

function updateGifPosition() {
    const gifElement = document.getElementById('animatedGif');
    const img = images.find(i => i.src.endsWith('.gif'));

    if (img) {
        gifElement.style.left = img.x + 'px';
        gifElement.style.top = img.y + 'px';
        gifElement.style.width = imgWidth + 'px';  // Assuming you have imgWidth defined
        gifElement.style.height = imgHeight + 'px';  // Assuming you have imgHeight defined
        gifElement.style.display = 'block';

        const hitbox = document.createElement('div');
        hitbox.style.position = 'absolute';
        hitbox.style.width = `${imgWidth}px`;  // Assuming you have imgWidth defined
        hitbox.style.height = `${imgHeight}px`;  // Assuming you have imgHeight defined
        hitbox.style.left = `${img.x}px`;
        hitbox.style.top = `${img.y}px`;
        hitbox.style.backgroundColor = 'transparent';
        hitbox.dataset.id = img.id;  // Store the image ID for reference
        document.body.appendChild(hitbox); 
    }

    gifElement.addEventListener('click', handleGifClick);
}

function handleGifClick(e) {
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    const img = images.find(i => i.src.endsWith('.gif'));

    if (img) {
        // Apply ripple effect
        for (const dot of dots) {
            applyRippleEffect(dot, clickedX, clickedY);
        }

        // Fetch content for the GIF
        const contentURL = 'panels/' + img.id + '.html';
        fetch(contentURL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Content not found');
            }
            return response.text();
        })
        .then(data => {
            const contentContainer = document.getElementById('dynamic-content');
            contentContainer.innerHTML = data;
        })
        .catch(error => {
            console.error('Error fetching content:', error);
            generateMatrixEffect();
        });

        // Show the bubble
        img.showBubble = true;
    }
}


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
    const textAfterNumber = " revealed wikipedia eyes in circulation.";

    const xPos = 10;  // Adjust for desired x position
    const yPos = canvas.height - 40; // Adjust for desired y position (taking into account the font size)

    ctx.font = "12px PixelOperatorMono";  // Adjust for desired font size and font family

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
    const coloredText = "eye -> title";
    const xPos = 10;  // Adjust for desired x position
    const yPos = canvas.height - 20;  // Adjust for desired y position (taking into account the font size)

    ctx.font = "12px PixelOperatorMono";  // Adjust for desired font size and font family

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
    // Calculate the angle (radian) and distance (radius) from the dot to the click point
    const angle = Math.atan2(clickY - dot.originalY, clickX - dot.originalX);
    const distance = Math.sqrt((clickX - dot.originalX) ** 2 + (clickY - dot.originalY) ** 2);
    
    const maxDistance = 350;  // Adjust for larger/smaller ripple effect
    const offset = 25;  // Adjust for more/less pronounced effect

    if (distance < maxDistance) {
        // Calculate the strength of the ripple effect based on the distance
        const strength = (1 - distance / maxDistance) * offset;
        
        // Calculate the target X and Y using the angle and strength
        const targetX = dot.originalX + Math.cos(angle) * strength;
        const targetY = dot.originalY + Math.sin(angle) * strength;

        anime({
            targets: dot,
            x: [dot.x, targetX],
            y: [dot.y, targetY],
            easing: 'easeOutElastic(1, .8)',
            duration: 20,
            delay: distance * 2,
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
            right: '-50%',  // Assuming the panel is 50% of the screen width
            easing: 'easeOutExpo',
            duration: 1000
        });
    }
    matrixEffectActive = false;
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

// Call the function initially to set the styles
adjustReturnTextForMobile();


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

    const scaledWidth = centerImage.width * 0.2;  // Scale to x% of the original width
    const scaledHeight = centerImage.height * 0.2;  // Scale to x% of the original height

    const centerX = (canvas.width - scaledWidth) / 2;
    const centerY = (canvas.height - scaledHeight) / 2 + bobbingOffset;

    ctx.globalAlpha = 0.5;  // Set the opacity to 50% (adjust as needed)
    ctx.drawImage(centerImage, centerX, centerY, scaledWidth, scaledHeight);
    ctx.globalAlpha = 1;  // Reset the opacity


    // 3. Handle the image's behavior
    for (const img of images) {
        if (img.element) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
                    // Adjust imgHeight for mobile
            let mobileScaleFactor = 1;
            if (isMobile) {
                mobileScaleFactor = window.innerWidth / 1920; // Assuming 1920 is the standard desktop width. Adjust as needed.
                mobileScaleFactor = Math.max(0.5, mobileScaleFactor); // Ensure it doesn't get too small. Adjust as needed.
            }
            const adjustedImgHeight = imgHeight * mobileScaleFactor;
            const drawWidth = adjustedImgHeight * aspectRatio;

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
                gifElement.style.width = imgWidth + 'px'; 
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

    const paddingTop = 3;  // Adjust this value as needed

    const contentContainer = document.getElementById('dynamic-content');
    contentContainer.style.fontFamily = 'PixelOperatorMono';
    contentContainer.style.color = 'grey'; 
    contentContainer.style.fontSize = '16px'; // Adjust as needed
    contentContainer.style.whiteSpace = 'pre'; // To maintain formatting

    const fontSize = 16; // This should match the font size set above
    const charWidth = fontSize * 1; // This is an estimate. Adjust based on your font's characteristics
    const charHeight = fontSize;

    let panelWidth, panelHeight;

    if (isMobile) {  
        panelWidth = window.outerWidth * 1.5;
        panelHeight = window.outerHeight;
    } else {
        panelWidth = window.innerWidth/1.05;
        panelHeight = window.innerHeight/1.1;
    }
      

    const columns = Math.floor(panelWidth / charWidth);
    const rows = Math.floor(panelHeight / charHeight);

    function getRandomCharacter() {
        //const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const characters = '01';
        return characters.charAt(Math.floor(Math.random() * characters.length));
    }

    function generateRow() {
        let row = '';
        for (let i = 0; i < columns; i++) {
            row += getRandomCharacter();
        }
        return row;
    }

    function updateMatrix() {
        let matrix = '';
        if(matrixEffectActive)
        {
            // Add blank rows
            for (let i = 0; i < paddingTop; i++) {
                matrix += '\n';
            }
        
            // Generate the matrix rows
            for (let i = paddingTop; i < rows; i++) {
                matrix += generateRow() + '\n';
            }
            
            contentContainer.textContent = matrix;
        }
    }

    setInterval(updateMatrix, 100); // Update every 100ms, adjust as needed
}


