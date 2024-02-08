const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const isMobile = window.innerWidth <= 800;  // You can adjust this value based on your needs
let selectedImage = null;
let lightmode = false;

let generalOpaqueness = .5;

const screenWidth = screen.width;
const screenHeight = screen.height;

// Reference resolution
const REF_WIDTH = 1920;
const REF_HEIGHT = 1080;

const isLargeScreen = window.innerWidth > 1200;

const BASE_SPEED = isLargeScreen? 0.0040 : 0.009;
const SPEED_MULTIPLIER = .6;

let speedScaleFactor = 1;  // Initial value
// Calculate the speed scale factor based on the current window size
speedScaleFactor = SPEED_MULTIPLIER * Math.sqrt((window.innerWidth * window.innerHeight) / (REF_WIDTH * REF_HEIGHT));


const REF_DOT_RADIUS = isLargeScreen ? 2 : 3;  // Dot radius at reference resolution
const REF_SPACING = isLargeScreen ? 21 : 18;   // Spacing between dots at reference resolution

const INIT_DOT_RADIUS = REF_DOT_RADIUS;
const INIT_SPACING = REF_SPACING;

// Calculate scaling factor
const scaleFactor = 1.2; // window.innerWidth / REF_WIDTH;
const windowFactor = screen.innerWidth / REF_WIDTH;


//const spacingX = canvas.width / grid_size;
//const spacingY = canvas.height / grid_size;

const DOT_RADIUS = REF_DOT_RADIUS * scaleFactor;


const MIN_SPACING = 15;

// Adjust grid size to maintain consistent spacing
const spacingX = Math.max(MIN_SPACING, REF_SPACING * scaleFactor);
const spacingY = Math.max(MIN_SPACING, REF_SPACING * scaleFactor);
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
let MAX_DOTS = (REF_DOT_COUNT_X * REF_DOT_COUNT_Y); // DOT Cap to prevent slowdowns

let CENTER_X = canvas.width / 2;
let CENTER_Y = canvas.height / 2;

const dots = [];
const dotSpeed = .8;  // Adjust this for faster/slower movement

let dotter = 0; //tracks new dots created by clicking on images
let dotCount = 0;

for (let x = 0; x < canvas.width; x += spacingX) {
    for (let y = 0; y < canvas.height; y += spacingY) {
        if (dotCount >= MAX_DOTS) {
            break;
        }
        dots.push({ x, y, vx: 0, vy: 0, originalX: x, originalY: y, speed: dotSpeed, size: DOT_RADIUS});
        dotCount++;
    }
    if (dotCount >= MAX_DOTS) {
        break;
    }
}

let lastFrameTime = Date.now();
const performanceThreshold = 1000 / 60; // 60 FPS

function adjustDotsPerformance() {
    const currentFrameTime = Date.now();
    const deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;

    if (deltaTime > performanceThreshold) {
        // Performance is below threshold, reduce the number of dots
        MAX_DOTS = Math.max(MAX_DOTS - 10, 10); // Adjust the decrement value as needed
    } else {
        // Performance is acceptable, we can try adding more dots
        MAX_DOTS = Math.min(MAX_DOTS + 10, REF_DOT_COUNT_X * REF_DOT_COUNT_Y); // Adjust the increment value as needed
    }
}

const BUBBLE_OFFSET = 35;

const FLOATAMP = 5; //10 is original
const FLOATSP = 0.03; //0.06 is original

const images = [
    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye1/pic1.png', angle: 0, id: 'eye1', bubbleText: 'The Elmyr de Hory Exhibit',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: false,

    floatAmplitude: FLOATAMP,  // The maximum distance the image will float up or down
    floatSpeed: FLOATSP,    // The speed of the floating effect
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
    reverseDirection: false,
    isOpaque: false,
    opacity: generalOpaqueness,
    timeoutId: null,
    isHovered: false,
    },

    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eye2/eye2editSMALL.png', angle: 0, id: 'eye2', bubbleText: 'Room 4-308-D',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: false,

    floatAmplitude: FLOATAMP,  // The maximum distance the image will float up or down
    floatSpeed: FLOATSP,    // The speed of the floating effect
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
    reverseDirection: false,
    isOpaque: generalOpaqueness,
    opacity: .5,
    timeoutId: null,
    isHovered: false,
    },

    { x: 100, y: 100, vx: 1, vy: 1, src: 'img/eyexedit.jpg', angle: 0, id: 'eyex', bubbleText: '???',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: false,

    floatAmplitude: FLOATAMP,  // The maximum distance the image will float up or down
    floatSpeed: FLOATSP,    // The speed of the floating effect
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
    reverseDirection: true,
    isOpaque: false,
    opacity: generalOpaqueness,
    timeoutId: null,
    isHovered: false,
    },

    { x: 100, y: 100, vx: -1, vy: -1, src: 'img/meninas.gif', angle: 0, id: 'meninas', bubbleText: '???',
    isDragging: false, momentumX: 0, momentumY: 0, element: null, isReturning: false, targetX: null, targetY: null, isGif: true,

    floatAmplitude: FLOATAMP,  // The maximum distance the image will float up or down
    floatSpeed: FLOATSP,    // The speed of the floating effect
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
    reverseDirection: true,
    isOpaque: false,
    opacity: 1,
    timeoutId: null,
    isHovered: false,
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


//const centerImage = new Image(); 
//centerImage.src = lightmode ? 'img/wikibittransparent2.png' : 'img/wikibittransparent.png';  // Wikilogo
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
    ctx.fillStyle = lightmode ? "black" : "white";  // Adjust for desired text color
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
    ctx.fillStyle = lightmode ? "black" : "#b4aeae";  // Adjust for desired text color
    ctx.fillText(text, xPos, yPos);
}

function drawBottomLeftText1() {
    const textBeforeNumber = "There are currently ";
    const number = "2";
    const textAfterNumber = " revealed wikipedia eyes.";

    const xPos = 10;  // Adjust for desired x position
    const yPos = canvas.height - 40; // Adjust for desired y position (taking into account the font size)

    // Calculate the width of the text before the number to position the number correctly
    const textBeforeNumberWidth = ctx.measureText(textBeforeNumber).width;
    const textNumberWidth = ctx.measureText(number).width;

    const textHeight = parseInt(ctx.font, 10);
    // Calculate the width of the text before the number to position the number correctly
    const textAfterNumberWidth = ctx.measureText(textAfterNumber).width;

    ctx.font = "13px PixelOperatorMono";  // Adjust for desired font size and font family
    if(lightmode)
    {
        ctx.fillStyle = "#e6e6e8";
        ctx.fillRect(xPos - 2, yPos - 11 , textBeforeNumberWidth + textAfterNumberWidth + number + 2, textHeight);
    }

    // Draw the text before the number
    ctx.fillStyle = lightmode ? "black" : "#b4aeae";  // Adjust for desired text color
    ctx.fillText(textBeforeNumber, xPos, yPos);

    // Draw the number in red
    ctx.fillStyle = "red";
    ctx.fillText(number, xPos + textBeforeNumberWidth, yPos);

    // Calculate the width of the number to position the text after the number correctly
    const numberWidth = ctx.measureText(number).width;

    // Draw the text after the number
    ctx.fillStyle = lightmode ? "black" : "#b4aeae";  // Adjust for desired text color
    ctx.fillText(textAfterNumber, xPos + textBeforeNumberWidth + numberWidth, yPos);
}

function drawBottomLeftText2() {
    const textBefore = "For more info ";
    const coloredText = "click on an eye (and its title)";
    const xPos = 10;  // Adjust for desired x position
    const yPos = canvas.height - 20;  // Adjust for desired y position (taking into account the font size)

    ctx.font = "13px PixelOperatorMono";  // Adjust for desired font size and font family
    const padding = 2;  // Adjust for desired padding around the text, for background rectangle

    // Calculate the width of the text before the colored part to position the colored text correctly
    const textBeforeWidth = ctx.measureText(textBefore).width;
    const textBeforeHeight = parseInt(ctx.font, 10);

    if(lightmode)
    {
        ctx.fillStyle = "#e6e6e8";
        ctx.fillRect(xPos - 2, yPos - 11 , textBeforeWidth + 2 * padding, textBeforeHeight);
    }

    // Draw the text before the colored part
    ctx.fillStyle = lightmode ? "black" : "#b4aeae";  // Adjust for desired text color
    ctx.fillText(textBefore, xPos, yPos);

     // Calculate the width and height of the coloredText for the background rectangle
    const coloredTextWidth = ctx.measureText(coloredText).width;
    const coloredTextHeight = parseInt(ctx.font, 10);  // Extract font size from font string
    
     // Draw the background for the colored text
    ctx.fillStyle = lightmode ? "#cfcccc" : "#343232";  // Adjust for desired background color
    ctx.fillRect(xPos + textBeforeWidth - padding, yPos - coloredTextHeight + padding, coloredTextWidth + 2 * padding, coloredTextHeight);
    

    // Draw the colored text in a not-too-bright yellow
    ctx.fillStyle = lightmode ? "#4a47ed" : "#dcd15a";  // This is a muted yellow color, adjust if needed
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
        let opacity = 1;
        let lightOpacity = 1;

        if(lightmode){
            // Calculate distance to the nearest corner
            let distanceToCorner = Math.min(
                dot.x, canvas.width - dot.x, 
                dot.y, canvas.height - dot.y
            );

            // Adjust for mobile screens
            if (!isMobile) {
                distanceToCorner *= .7; // Adjust the scale for mobile
            }

            // Adjust opacity based on distance
            const maxDistance = Math.sqrt(Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2));
            lightOpacity = Math.pow(distanceToCorner / maxDistance, 2); // Quadratic scale
            // Ensure opacity never goes below 40%
            lightOpacity = 0.3 + 0.6 * lightOpacity; // 40% + 60% of the calculated opacity
        }

        opacity = lightmode ? lightOpacity : 1;

        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        let colorfill = `114, 108, 113` //default dark-mode colorfill  74, 72, 72
        if (isMobile) {
            colorfill = lightmode ? `11, 11, 11` : `114, 108, 113`;

        }

        else {
            colorfill = lightmode ? `11, 11, 11` : `114, 108, 113`;
        }
        ctx.fillStyle = lightmode ? `rgba(${colorfill}, ${opacity})` : `rgba(${colorfill}, ${opacity})`;  // Updated color (original: #3a3939)
        ctx.fill();
    }
}


// new version, sparsity maintained
function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    CENTER_X = canvas.width / 2;
    CENTER_Y = canvas.height / 2;
    // Recalculate scaling factor based on the original reference width
    const scaleFactor = Math.min(window.innerWidth / REF_WIDTH, window.innerHeight / REF_HEIGHT);

    // Adjust dot radius and spacing based on scaling factor
    const DOT_RADIUS = REF_DOT_RADIUS * scaleFactor;
    //const spacingX = Math.max(MIN_SPACING, INIT_SPACING * scaleFactor);
    //const spacingY = Math.max(MIN_SPACING, INIT_SPACING * scaleFactor);

    const spacingX = Math.max(MIN_SPACING, INIT_SPACING);
    const spacingY = Math.max(MIN_SPACING, INIT_SPACING);   

    // Recalculate the maximum number of dots
    const REF_DOT_COUNT_X = Math.ceil(canvas.width / spacingX);
    const REF_DOT_COUNT_Y = Math.ceil(canvas.height / spacingY);
    MAX_DOTS = (REF_DOT_COUNT_X * REF_DOT_COUNT_Y);

    // Calculate the speed scale factor
    speedScaleFactor = SPEED_MULTIPLIER * Math.sqrt((canvas.width * canvas.height) / (REF_WIDTH * REF_HEIGHT));

    // Reinitialize the dots
    dots.length = 0;
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

    // Redraw the dots
    drawDots();
}



// Attach the resize event listener
window.addEventListener('resize', handleResize);

let lastPulseTime = Date.now();

function drawSpeechBubble(x, y, width, height, text) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const padding = 10;  // Adjust for desired padding from screen edges

    const pulseFrequency = 2000; // Pulse every x000 miliseconds
    const currentTime = Date.now();

    // Make the bubble bigger on mobile
    if (isMobile) {
        width += 10;  // Adjust as needed
        height += 5; // Adjust as needed
    }

        // Breathing effect
    //const breathSize = Math.sin(currentTime / 400) * 1.8; // Adjust numbers for desired effect
    const breathSize = 0;
    width += breathSize;
    height += breathSize;

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

    // Glow effect on hover
    ctx.shadowColor = 'rgba(206, 255, 254, 0.8)';
    ctx.shadowBlur = 10;

    if (currentTime - lastPulseTime < 300) { // Adjust 500 to control the duration of the flickering
        ctx.shadowColor = 'rgba(206, 255, 254, 0.8)';
        ctx.shadowBlur = Math.random() * (30 - 15) + 15; // Flickering effect 
    } else if (currentTime - lastPulseTime > pulseFrequency) {
        lastPulseTime = currentTime;
    }

    
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

    // Reset shadow for other drawings
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

        // Quick pulse-glow every 4 seconds
    if (currentTime - lastPulseTime < 10) { // Adjust 500 to control the duration of the flickering
        const flicker = Math.random() > 0.5 ? 0 : (Math.random() * 90); // Adjust 20 to control the intensity of the flickering
        ctx.shadowBlur = flicker;
        ctx.shadowColor = `rgba(245, 255, 70, 0.8, ${flicker * 20})`; // Sync the color intensity with the blur
    } else if (currentTime - lastPulseTime > pulseFrequency) {
        lastPulseTime = currentTime;
    }

    // Adjust font size for breathing effect
    let fontSize = 12; // Base font size
    if (isMobile) {
        fontSize = 14; // Base font size for mobile
    }

    fontSize += breathSize/6; // Adjust font size based on breathing effect

    ctx.fillStyle = 'black';
    ctx.font = `${fontSize}px PixelOperatorMono`; // Set font size dynamically
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
        document.getElementById('manifesto-content').style.display = 'block';
        document.getElementById('manifesto-content').style.zIndex = '999999';

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
            document.getElementById('closeManifesto').style.zIndex = '9999999';
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
            
            //de-render manifestopanel
            document.getElementById('manifesto-content').style.display = 'none';
            // Hide the return text
            document.getElementById('closeManifesto').style.display = 'none';
        }

        // Toggle the value of manifestoIsUp
        manifestoIsUp = !manifestoIsUp;
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var manifestoButton = document.getElementById('manifestoButton');
    var lightButton = document.getElementById('lightButton');

    // Function to position the lightButton relative to the manifestoButton
    function positionLightButton() {
        var manifestoRect = manifestoButton.getBoundingClientRect();
        lightButton.style.left = (manifestoRect.right + 10) + 'px'; // 10px gap from the manifestoButton
        lightButton.style.bottom = manifestoButton.style.bottom;
    }

    // Position the lightButton on load
    positionLightButton();
});

document.getElementById('lightButton').addEventListener('click', function()  {

    lightmode = !lightmode;
    // Function to position the lightButton relative to the manifestoButton
    function positionLightButton() {
        var manifestoRect = manifestoButton.getBoundingClientRect();
        lightButton.style.left = (manifestoRect.right + 10) + 'px'; // 10px gap from the manifestoButton
        lightButton.style.bottom = manifestoButton.style.bottom;
    }
    
    // Position the lightButton on load
    positionLightButton();
    document.body.classList.toggle('light-mode');
    
    var panel = document.getElementById('panel');
    var manifestoContent = document.getElementById('manifesto-content');
    var manifesto = document.getElementById('manifesto.html');
    var dynamicContent = document.getElementById('dynamic-content');
    var maniButton = document.getElementById('manifestoButton');
    
    for(i = 0; i > images.length; i++)
    {
        var contentURL = 'panels/' + img[i].id + '.html';
        var content = document.getElementById(contentURL + '.html');
        content.body.classList.toggle('light-mode');
    }
    
    if(document.body.classList.contains('light-mode')) {
        canvas.style.transition = '0.3s ease-in-out';
        canvas.style.background = 'radial-gradient(ellipse 65% 65% at center, #d3d3d3 0%, #ffffff 55%, #d3d3d3 66%, #ffffff 110%)';
        // else { canvas.style.background = 'radial-gradient(ellipse 70% 80% at center, #ffffff 0%, #d3d3d3 39%, #ffffff 95%)'; }
        panel.style.backgroundColor = 'rgba(240, 240, 240, .7)';
        lightButton.style.color = 'grey';
        //panel.style.opacity = '70%';
        manifestoContent.style.color = 'black';
        maniButton.style.backgroundColor = 'rgba(0, 0, 0, 0.678)';

    } else {
        canvas.style.transition = '0.3s ease-in-out';
        canvas.style.background = 'radial-gradient(ellipse 65% 65% at center, #000000 0%, #2e2e2e 55%, #000000 100%, #2e2e2e 110%)';
        // else { canvas.style.background = 'radial-gradient(ellipse at center, #000000 0%, #2e2e2e 70%, #2c2c2c 100%)'; }
        //panel.style.backgroundColor = 'black';
        manifestoContent.style.color = 'white';
        panel.style.backgroundColor = 'rgba(0, 0, 0, .5)';
        lightButton.style.color = 'white';
        maniButton.style.backgroundColor = 'rgba(126, 126, 126, 0.678)';
    } 

    manifesto.body.classList.toggle('light-mode');
    dynamicContent.body.classList.toggle('light-mode');
});

document.getElementById('closeManifesto').addEventListener('click', function() {
    // Use anime.js to slide the manifesto-content div down
    anime({
        targets: '#manifesto-content',
        bottom: '-100%',
        duration: 1500,
        easing: 'easeOutExpo'
    });

    //de-render manifestopanel
    document.getElementById('manifesto-content').style.display = 'none';

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
        const bubbleLeft = img.x + img.bubbleX;
        const bubbleRight = bubbleLeft + ctx.measureText(img.bubbleText).width + 40;  // 20 is the padding
        const bubbleTop = img.y - 30;
        const bubbleBottom = bubbleTop + 28;

        if (img.showBubble && clickedX >= bubbleLeft && clickedX <= bubbleRight && clickedY >= bubbleTop && clickedY <= bubbleBottom) {
            transitioning = true;
            img.showBubble = false;
            clickedOnBubble = true;

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
            document.getElementById('panel').style.display = 'block';
            anime({
                targets: '#panel',
                right: '0%',
                easing: 'easeOutExpo',
                duration: 1000
            });
        }
                // Show the return text
            document.getElementById('returnText').style.display = 'block';
            document.getElementById('returnText').style.zIndex = '9999999';
        }
    }

    // If not clicked on a bubble, check if clicked inside an image
    if (!clickedOnBubble) {
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
                    contentContainer.style.zIndex = '999999';
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
            if(!img.isOpaque)
            {
                img.isOpaque = !img.isOpaque; // Toggle the opacity state of the clicked image
            }

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

            img.isHovered = mouseX > img.x && mouseX < img.x + imgWidth && mouseY > img.y && mouseY < img.y + imgHeight;

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


canvas.addEventListener('dblclick', (e) => { 
    const clickedX = e.clientX;
    const clickedY = e.clientY;

    for (const img of images) {
        // Check if the double-click was within the bounds of an image
        if (clickedX >= img.x && clickedX <= img.x + imgWidth && clickedY >= img.y && clickedY <= img.y + imgHeight) {
            // Simulate the actions as if the bubble was clicked
            img.showBubble = false; // Assuming you want to hide the bubble
            transitioning = true;

            // Animate the clicked image to the center of the remaining space
            anime({
                targets: img,
                x: (canvas.width * 0.25) - (imgWidth / 2),  // Center of the remaining 50% space
                y: canvas.height / 2 - (imgHeight / 2),  // Vertical center
                easing: 'easeOutExpo',
                duration: 1000
            });

            // Rest of the logic for showing the panel and return text
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
                document.getElementById('panel').style.display = 'block';
                anime({
                    targets: '#panel',
                    right: '0%',
                    easing: 'easeOutExpo',
                    duration: 1000
                });
            }
                    // Show the return text
                document.getElementById('returnText').style.display = 'block';
                document.getElementById('returnText').style.zIndex = '9999999';

            break; // Exit the loop after handling the double-clicked image
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
                    img.isOpaque = true;
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
    const contentContainer = document.getElementById('dynamic-content');
    const scrollDuration = 1000;
    const scrollStep = -contentContainer.scrollTop / (scrollDuration / 15),
          scrollInterval = setInterval(() => {
              if (contentContainer.scrollTop !== 0) {
                  contentContainer.scrollBy(0, scrollStep);
              } else {
                  clearInterval(scrollInterval);
              }
          }, 15);
}

function correctScrollPosition() {
    if (window.scrollY > 0) {
        window.scrollTo(0, 0);
    }
}

document.getElementById('returnText').addEventListener('click', function() {
    scrollToTop();
    window.addEventListener('scroll', correctScrollPosition);
    if (selectedImage) {
        selectedImage.x = selectedImage.initialX;
        selectedImage.y = selectedImage.initialY;
        selectedImage.angle = selectedImage.initialAngle;
        selectedImage = null;  // Deselect the image
    }

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

    //de-render panel
    document.getElementById('panel').style.display = 'none';
    // Hide the return text
    document.getElementById('returnText').style.display = 'none';
    // To remove the event listener when it's not needed
    window.removeEventListener('scroll', correctScrollPosition);
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

    if(lightmode)
    {
        manifestoElement.style.color = 'black';
    }

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

// Image emanating dot class
class ImageDot { //best totalLifespan setting is 9000
    constructor(x, y, size, velocity, totalLifespan = 2800) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.velocity = velocity;
        this.lifespan = totalLifespan; // Adjust as needed for how long the dot should last
        this.totalLifespan = totalLifespan;
        this.life = true;
        this.staticOpacity = this.normalRandomInRange(0, 1); // Initialize with a random opacity
        this.verticalVelocityFactor = Math.random() * (0.5 - 0.3) + 0.3; // Random value between 0.3 and 0.5
        this.horizontalVelocityFactor = Math.random() * (0.9 - 0.7) + 0.7; // Random value between 0.7 and 0.9
    }

    update() {
        // Update the position based on the velocity
        this.x += this.velocity.x * this.horizontalVelocityFactor;
        this.y += this.velocity.y * this.verticalVelocityFactor;
        //this.y += (this.velocity.y > 0) ? this.velocity.y * downwardVelocityFactor : this.velocity.y;

        // Gradually decrease the size
        const sizeDecreaseRate = isLargeScreen ? .03 : .07; // Represents x% decrease

        // Decrease the size by the specified rate
        this.size *= (1 - sizeDecreaseRate / 100);


        // Reduce the lifespan
        this.lifespan--;

        if (this.lifespan == 0)
        {
            this.life = false;
        }
    }

    draw(ctx) {
        // Draw the dot on the canvas
        // Random chance for twinkle (full opacity and white color)
        const randomChance = Math.random();
        const threshold = lightmode ? 0.009 :  0.00045; // Adjust this value for frequency
        let twinkle = true;
        let opacity = this.staticOpacity;
        let color = lightmode ? `rgba(0, 0, 0, ${opacity})`: `rgba(217, 217, 217, ${opacity})`; // Default color
        let size = this.size

        // Calculate opacity
        if (this.lifespan < this.totalLifespan / 4) {
            opacity = this.lifespan / (this.totalLifespan / 4);
        }

        // Check if the dot should twinkle
        if (randomChance < threshold && !lightmode) {
            if(twinkle){
                opacity = 1;
                color = `rgba(255, 255, 255, ${opacity})`; // Full white
                size *= lightmode ? 1 : 1.27;
            }
            else {
                opacity = .7;
                color = `rgba(0, 0, 0, ${opacity})`; // Full black
                size *= lightmode ? 1 : 1.27; 
            }
            twinkle = !twinkle;

        }
        if (randomChance < threshold && lightmode) {        
            if(lightmode){
                opacity = .8;
                color = `(13, 5, 255, ${opacity})` ;
                size *=  1.27;
            }

        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, 2 * Math.PI);
        ctx.fillStyle = color; // Dot color
        ctx.fill();
    }

    alive() {
        return this.life;
    }

    // Helper function to generate normally distributed random numbers
    normalRandomInRange(min, max) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        // Scale to a specific range
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = this.normalRandomInRange(min, max); // resample between 0 and 1 if out of range
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }

}


// Array to hold the dots
let imageDots = [];

let frameCounter = 0;
let firstCall = true;

function createImageDotsAroundImage(img) {
    // Create new dots every N frames
    const createInterval = 7; // Adjust this value as needed
    const radiusShrinkPercentage = isLargeScreen ? 100: 90; // Adjust this value as needed

    if (firstCall || frameCounter % createInterval === 0 ) {
        const imgCenterX = img.x + imgWidth / 2;
        const imgCenterY = img.y + imgHeight / 2;

        // Set radius to half the length of the smaller side of the image
        let radius = Math.min(imgWidth, imgHeight) / 2;
        // Apply the shrink percentage to the radius
        radius *= (1 - radiusShrinkPercentage / 100);

        dotsPerFrame = isLargeScreen ? 3 : 3;
        for (let i = 0; i < dotsPerFrame; i++) { // Create fewer dots at a time
            
            // Random angle in radians
            const angle = Math.random() * Math.PI * 2;

            // Convert polar coordinates (radius, angle) to Cartesian coordinates (x, y)
            const x = imgCenterX + radius * Math.cos(angle);
            const y = imgCenterY + radius * Math.sin(angle);            

            //const angle = Math.random() * Math.PI * 2;
            const initEspeed = isLargeScreen ? .3: .2;
            let espeedMultiplier = Math.random() * (2 - 0.5) + 0.5;
            const espeed = initEspeed * espeedMultiplier;
            const velocity = { x: Math.cos(angle) * espeed, y: Math.sin(angle) * espeed };
            const size = isLargeScreen ? 2.1 : 1.8; // Initial size
            const newDot = new ImageDot(x, y, size, velocity);
            imageDots.push(newDot);

            dotter++;
        }
        firstCall = false;
    }
}


function updateDots() {
    for (let i = imageDots.length - 1; i >= 0; i--) {
        const imgdot = imageDots[i];
        imgdot.update();
        if (!imgdot.life) { // Update and check if the dot is dead
            imageDots.splice(i, 1); // Remove dead dot
        }
    }
}

function DrawImageDots(ctx) {

    for (const imgdot of imageDots) {
        imgdot.draw(ctx); // Draw each dot
    }
}

// Function to simulate lightButton clicks with a delay
function simulateButtonClicks() {
    setTimeout(() => {
        const lightButton = document.getElementById('lightButton');
        let count = 0;
        const maxToggles = 2; // Number of times to simulate the click
        const intervalTime = 150; // Time between simulated clicks in milliseconds 

        // Initial sequence: Toggle every second for a total of maxToggles times
        const clickInterval = setInterval(() => {
            lightButton.click(); // Simulate the click
            count++;
            if (count >= maxToggles) {
                clearInterval(clickInterval); // Stop the initial sequence after reaching the max count

                // Start toggling once per minute after the initial sequence
                setInterval(() => {
                    lightButton.click(); // Simulate the click for the per-minute toggling
                }, 40000); // 60000 milliseconds = 1 minute
            }
        }, intervalTime);
    }, 3000); // x seconds delay before starting the sequence
}

// Call the simulateButtonClicks function when the page loads
document.addEventListener('DOMContentLoaded', simulateButtonClicks);

let hitbox = {};

// curvature effect parameters
const EFFECT_RADIUS = 400; // Radius of the effect area
const MIN_DOT_SIZE = 0.5; // Minimum size of the dot in the effect area
const EFFECT_RADIUS2 = 500; // Radius of the effect area
const EFFECT_RADIUS3 = 500; // Radius of the effect area
const DENSITY_RADIUS = 30; // Adjust this value as needed

function animate() {
    frameCounter++;
    adjustDotsPerformance();
    // 1. Move dots upwards
    /*
    for (const dot of dots) {
        dot.y -= dot.speed;
        dot.originalY -= dot.speed;

        // Wrap around when out of canvas
        if (dot.y < 0) {
            dot.y += canvas.height;
            dot.originalY += canvas.height;
        }
    } */

    // 1. Move dots upwards and apply size effect
    for (const dot of dots) {
        dot.y -= dot.speed;
        dot.originalY -= dot.speed;
    
        // Calculate distance from the center
        const distance = Math.sqrt(Math.pow(dot.x - CENTER_X, 2) + Math.pow(dot.y - CENTER_Y, 2));
    
        // Adjust the size based on the distance
        let sizeFactor = Math.max(0, 1 - Math.pow(distance / EFFECT_RADIUS, 2)); // More pronounced effect
        // Adjust the size based on the distance

        let sizeFactor2 = Math.max(0, 1 - Math.pow(distance / EFFECT_RADIUS2, 2)); // More pronounced effect
            // Adjust for mobile screens
        if (isMobile) {
            //sizeFactor *= 15; // Adjust the scale for mobile
            sizeFactor2 *= 1.5; // Adjust the scale for mobile
        }

        // Adjust the size based on the distance
        //const sizeFactor3 = Math.max(0, 1 - Math.pow(distance * EFFECT_RADIUS3, 2)); // More pronounced effect

        if (distance > EFFECT_RADIUS3)
        {
            // Outside the larger radius
            const sizeFactor3 = (distance - EFFECT_RADIUS3) / (Math.max(canvas.width, canvas.height) / 2 - EFFECT_RADIUS3);
                        

            dot.size = MIN_DOT_SIZE + Math.min(3, Math.max(0, 1 - sizeFactor3) * (DOT_RADIUS - MIN_DOT_SIZE) );
        }
        else
        {
            dot.size = MIN_DOT_SIZE + sizeFactor * (DOT_RADIUS - MIN_DOT_SIZE);
            dot.size = MIN_DOT_SIZE + Math.max(0, 1 - sizeFactor2) * (DOT_RADIUS - MIN_DOT_SIZE);
        }

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


                    // emanating dot logic

                    updateDots();
                    DrawImageDots(ctx);
                    
                                // emanating dot logic end
    // 2.5. Center image handling
    const centerImage = new Image(); 
    centerImage.src = lightmode ? 'img/wikibittransparent2.png' : 'img/wikibittransparent.png';  // Wikilogo
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
        ctx.shadowColor = lightmode ? "black" : "white"; // Adjust to your desired glow color
        ctx.drawImage(centerImage, centerX, centerY - 10, scaledWidth, scaledHeight);  // Raise the image a bit
            // Reset shadow properties after drawing
        ctx.shadowBlur = 0;
    } else {
        
        ctx.shadowColor = lightmode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = lightmode ? 7 : 10;
        ctx.shadowOffsetX = lightmode ? -8 : 0;
        ctx.shadowOffsetY = lightmode ? -9 : 0;
        ctx.globalAlpha = lightmode ? 1 : 0.5;
        ctx.drawImage(centerImage, centerX, centerY, scaledWidth, scaledHeight);
    }
    
    ctx.globalAlpha = 1;  // Reset the opacity

    // 3. Handle the images' behavior

    generalOpaqueness = lightmode ? .9 : .5;
    for (const img of images) {
        if (img.element) {
            
            const aspectRatio = img.naturalWidth / img.naturalHeight;
                    // Adjust imgHeight for mobile
            let mobileScaleFactor = 1;
            let mobileScaleFactorH = 1;
            if (isMobile) {
                mobileScaleFactor = window.innerWidth / REF_WIDTH; 
                mobileScaleFactor = Math.max(0.7, mobileScaleFactor); // Ensure it doesn't get too small. Adjust as needed.

                mobileScaleFactorH = window.innerHeight / REF_HEIGHT; 
                mobileScaleFactorH = Math.max(0.7, mobileScaleFactor); // Ensure it doesn't get too small. Adjust as needed.
            }
            const adjustedImgHeight = imgHeight * mobileScaleFactorH;
            
            const drawWidth = imgWidth * mobileScaleFactor;

            ctx.shadowColor = lightmode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = lightmode ? 3 : 5;
            ctx.shadowOffsetX = lightmode ? -6 : 4;
            ctx.shadowOffsetY = lightmode ? -7 : 5;

            
            // Before drawing the image, ensure global alpha is appropriate
            if (img.isOpaque) {
                img.opacity += (1 - img.opacity) * 0.1; // Smooth transition to 100% opacity
            } else {
                img.opacity += (generalOpaqueness - img.opacity) * 0.1; // Smooth transition to 80% opacity
            }


            ctx.globalAlpha = img.opacity;



            ctx.globalAlpha = img.opacity;
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

            ctx.globalAlpha = 1; // Reset the opacity to default after drawing
        }

        if (img === selectedImage) {
            img.floatTime = (img.floatTime + 0.02) % (2 * Math.PI);  // This will keep floatTime always between 0 and 2*PI
        } else if (img.isFloating) {
            isAnyImageHovering = true;

            createImageDotsAroundImage(img);

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
            if (img.floatTime > Math.PI * 35) {  // 10 seconds, assuming floatSpeed is 0.02
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
                img.isOpaque = false; // Reset opacity after inactivity

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
    matrixContainer.style.color = lightmode ? 'black' : 'grey'; 
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
        matrixContainer.style.color = lightmode ? 'black' : 'grey'; 
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
