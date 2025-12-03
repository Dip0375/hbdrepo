// Auto-load photos from slideshow folder
// Supported formats: jpg, jpeg, png, gif, webp
// Now supports up to 20 images!
const slideshowImageNames = [
    '1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg',
    '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg', '17.jpg', '18.jpg', '19.jpg', '20.jpg',
    '1.jpeg', '2.jpeg', '3.jpeg', '4.jpeg', '5.jpeg', '6.jpeg', '7.jpeg', '8.jpeg', '9.jpeg', '10.jpeg',
    '11.jpeg', '12.jpeg', '13.jpeg', '14.jpeg', '15.jpeg', '16.jpeg', '17.jpeg', '18.jpeg', '19.jpeg', '20.jpeg',
    '1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png',
    '11.png', '12.png', '13.png', '14.png', '15.png', '16.png', '17.png', '18.png', '19.png', '20.png',
    '1.gif', '2.gif', '3.gif', '4.gif', '5.gif', '6.gif', '7.gif', '8.gif', '9.gif', '10.gif',
    '1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp', '7.webp', '8.webp', '9.webp', '10.webp'
];

let photos = [];
let photosLoaded = false;

// Function to load photos from slideshow folder
async function loadPhotosFromFolder() {
    const loadedPhotos = [];
    
    // Try to load each possible image
    for (const imageName of slideshowImageNames) {
        const imagePath = `slideshow/${imageName}`;
        
        try {
            // Check if image exists by trying to load it
            const exists = await checkImageExists(imagePath);
            if (exists) {
                loadedPhotos.push({
                    src: imagePath,
                    caption: `📸 Memory ${loadedPhotos.length + 1}`,
                    emoji: '📷'
                });
            }
        } catch (error) {
            // Image doesn't exist, continue
        }
    }
    
    // Add the birthday wish slide at the end
    loadedPhotos.push({ src: '', caption: '', emoji: '', isWishSlide: true });
    
    photos = loadedPhotos;
    photosLoaded = true;
    
    console.log(`✅ Loaded ${loadedPhotos.length - 1} photos from slideshow folder`);
    return photos;
}

// Check if image exists
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Background Music
let backgroundMusic = null;
let musicPlaying = false;

// Side Frame Photos Configuration
const leftFramePhotos = [
    { src: 'photos/left1.jpg', caption: 'Beautiful Memories', emoji: '📷' },
    { src: 'photos/left2.jpg', caption: 'Cherished Moments', emoji: '🌸' },
    { src: 'photos/left3.jpg', caption: 'Special Times', emoji: '✨' }
];

const rightFramePhotos = [
    { src: 'photos/right1.jpg', caption: 'Joyful Days', emoji: '🎈' },
    { src: 'photos/right2.jpg', caption: 'Precious Gifts', emoji: '💝' },
    { src: 'photos/right3.jpg', caption: 'Bright Future', emoji: '🌟' }
];

// Canvas Animation - Floating Hearts Background
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

class FloatingHeart {
    constructor() {
        this.x = Math.random() * cw;
        this.y = ch + Math.random() * 100;
        this.size = 15 + Math.random() * 25;
        this.speed = 0.3 + Math.random() * 0.7;
        this.opacity = 0.3 + Math.random() * 0.4;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02 + Math.random() * 0.03;
        this.color = ['#ff00ff', '#ff0080', '#ff6b9d', '#00ffff', '#ffff00'][Math.floor(Math.random() * 5)];
    }

    update() {
        this.y -= this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 0.5;
        
        if (this.y < -this.size) {
            this.y = ch + this.size;
            this.x = Math.random() * cw;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        
        // Draw heart shape
        ctx.beginPath();
        const size = this.size;
        ctx.moveTo(0, size / 4);
        ctx.bezierCurveTo(-size / 2, -size / 4, -size, size / 8, 0, size);
        ctx.bezierCurveTo(size, size / 8, size / 2, -size / 4, 0, size / 4);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

let hearts = [];
for (let i = 0; i < 20; i++) {
    hearts.push(new FloatingHeart());
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, cw, ch);
    
    hearts.forEach(heart => {
        heart.update();
        heart.draw();
    });
}

// OLED TV Slideshow
let currentSlide = 0;
let slideInterval;
let slideshowStarted = false;
let slideshowPaused = false;

async function createSlideshow() {
    const slideshow = document.getElementById('slideshow');
    
    // Load photos from folder if not already loaded
    if (!photosLoaded) {
        await loadPhotosFromFolder();
    }
    
    // If no photos found, show a message
    if (photos.length === 1) { // Only the wish slide
        const messageSlide = document.createElement('div');
        messageSlide.className = 'slide active';
        messageSlide.innerHTML = `
            <div class="slide-placeholder">📁</div>
            <div class="slide-caption">
                Add photos to the "slideshow" folder!<br>
                Supported: jpg, jpeg, png, gif, webp<br>
                Name them: 1.jpg, 2.jpg, 3.jpg, etc.
            </div>
        `;
        slideshow.appendChild(messageSlide);
    }
    
    photos.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide';
        if (index === 0 && photos.length > 1) slide.classList.add('active');
        
        // Check if this is the special birthday wish slide
        if (photo.isWishSlide) {
            slide.classList.add('wish-slide');
            slide.innerHTML = `
                <div class="birthday-wish-content">
                    <h1 class="wish-title">Happy Birthday</h1>
                    <h2 class="wish-name">NISHI</h2>
                    <div class="wish-emojis">🎂🎉🎈🎊✨</div>
                    <p class="wish-message">May all your dreams come true!</p>
                </div>
            `;
        } else {
            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = photo.caption;
            
            img.onerror = function() {
                // If image fails to load, show emoji placeholder
                slide.innerHTML = `<div class="slide-placeholder">${photo.emoji}</div>`;
                const caption = document.createElement('div');
                caption.className = 'slide-caption';
                caption.textContent = photo.caption;
                slide.appendChild(caption);
            };
            
            img.onload = function() {
                const caption = document.createElement('div');
                caption.className = 'slide-caption';
                caption.textContent = photo.caption;
                slide.appendChild(caption);
            };
            
            slide.appendChild(img);
        }
        
        slideshow.appendChild(slide);
    });
    
    // Setup play button
    setupPlayButton();
}

// Setup Play Button
function setupPlayButton() {
    const playButton = document.getElementById('playButton');
    const pauseResumeButton = document.getElementById('pauseResumeButton');
    const rightSection = document.querySelector('.right-section');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    playButton.addEventListener('click', () => {
        if (!slideshowStarted) {
            // Hide play button
            playButton.style.opacity = '0';
            playButton.style.pointerEvents = 'none';
            
            // Show pause/resume button
            setTimeout(() => {
                playButton.style.display = 'none';
                pauseResumeButton.style.display = 'flex';
            }, 500);
            
            // Start slideshow
            slideshowStarted = true;
            startSlideshow();
            
            // Start music when play button is clicked
            initBackgroundMusic();
            
            // Show the cake with animation
            rightSection.style.display = 'flex';
            setTimeout(() => {
                rightSection.classList.add('show');
            }, 100);
            
            // Show scroll indicator
            scrollIndicator.style.display = 'block';
            setTimeout(() => {
                scrollIndicator.classList.add('show');
            }, 1500);
            
            // Add more floating hearts
            for (let i = 0; i < 10; i++) {
                hearts.push(new FloatingHeart());
            }
        }
    });
    
    // Setup pause/resume button
    setupPauseResumeButton();
}

// Setup Pause/Resume Button
function setupPauseResumeButton() {
    const pauseResumeButton = document.getElementById('pauseResumeButton');
    const pauseIcon = document.getElementById('pauseIcon');
    const resumeIcon = document.getElementById('resumeIcon');
    
    pauseResumeButton.addEventListener('click', () => {
        if (!slideshowPaused) {
            // Pause slideshow
            pauseSlideshow();
            slideshowPaused = true;
            
            // Switch to resume icon
            pauseIcon.style.display = 'none';
            resumeIcon.style.display = 'block';
        } else {
            // Resume slideshow
            resumeSlideshow();
            slideshowPaused = false;
            
            // Switch to pause icon
            pauseIcon.style.display = 'block';
            resumeIcon.style.display = 'none';
        }
    });
}

function pauseSlideshow() {
    stopSlideshow();
}

function resumeSlideshow() {
    startSlideshow();
}

// Initialize and play background music
function initBackgroundMusic() {
    // Create audio only if it doesn't exist
    if (!backgroundMusic) {
        backgroundMusic = new Audio('birthday-music.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.5;
    }
    
    // Try to play music
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicPlaying = true;
            console.log('🎵 Background music is now playing!');
        }).catch((error) => {
            console.log('Music autoplay blocked:', error);
            console.log('Showing music control button...');
            // Add a music control button if autoplay fails
            addMusicControl();
        });
    }
}

function startSlideshow() {
    slideInterval = setInterval(() => {
        const slides = document.querySelectorAll('.slide');
        slides[currentSlide].classList.remove('active');
        
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 3000); // Change slide every 3 seconds
}

function stopSlideshow() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// Removed side frames functionality

// Add music control button
function addMusicControl() {
    // Check if button already exists
    if (document.getElementById('musicControl')) {
        return;
    }
    
    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicControl';
    musicBtn.innerHTML = '🎵 Click to Play Music';
    musicBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        padding: 15px 25px;
        background: rgba(255, 0, 255, 0.9);
        border: 2px solid #00ffff;
        border-radius: 50px;
        color: white;
        font-size: 1.1rem;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
        transition: all 0.3s ease;
        animation: musicButtonPulse 2s ease-in-out infinite;
    `;
    
    // Add pulse animation
    const pulseStyle = document.createElement('style');
    pulseStyle.textContent = `
        @keyframes musicButtonPulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 0 40px rgba(255, 0, 255, 1);
            }
        }
    `;
    document.head.appendChild(pulseStyle);
    
    musicBtn.addEventListener('click', () => {
        if (!musicPlaying) {
            backgroundMusic.play().then(() => {
                musicPlaying = true;
                musicBtn.innerHTML = '🔊 Music Playing';
                musicBtn.style.background = 'rgba(0, 255, 255, 0.9)';
                musicBtn.style.animation = 'none';
                console.log('🎵 Music started via button!');
            }).catch((error) => {
                console.error('Failed to play music:', error);
                musicBtn.innerHTML = '❌ Music Error';
            });
        } else {
            backgroundMusic.pause();
            musicPlaying = false;
            musicBtn.innerHTML = '🎵 Click to Play Music';
            musicBtn.style.background = 'rgba(255, 0, 255, 0.9)';
            musicBtn.style.animation = 'musicButtonPulse 2s ease-in-out infinite';
        }
    });
    
    document.body.appendChild(musicBtn);
}

// Start Screen Click Handler
const startScreen = document.getElementById('startScreen');
const mainContent = document.getElementById('mainContent');

startScreen.addEventListener('click', () => {
    startScreen.classList.add('fade-out');
    
    setTimeout(() => {
        startScreen.style.display = 'none';
        mainContent.classList.remove('hidden');
        createSlideshow(); // Create slideshow with play button
        setupCandleAnimations(); // Setup enhanced candle animations
    }, 500);
});

// Enhanced Candle Blow Out Effect with Balloons and Glitter
let candlesBlown = 0;
let totalCandles = 3;

function setupCandleAnimations() {
    const candles = document.querySelectorAll('.candle');
    
    candles.forEach((candle) => {
        candle.addEventListener('click', () => {
            if (!candle.classList.contains('blown-out')) {
                candle.classList.add('blown-out');
                candlesBlown++;
                
                // Create smoke effect
                createSmoke(candle);
                
                // Create balloons and glitter for each candle
                createBalloonsAndGlitter(candle);
                
                // Shake the cake
                shakeCake();
                
                // Check if all candles are blown
                if (candlesBlown === totalCandles) {
                    setTimeout(() => {
                        showGrandCelebration();
                    }, 500);
                }
            }
        });
    });
}

function createSmoke(candle) {
    const smoke = document.createElement('div');
    smoke.style.position = 'absolute';
    smoke.style.top = '-30px';
    smoke.style.left = '50%';
    smoke.style.transform = 'translateX(-50%)';
    smoke.style.fontSize = '1.5rem';
    smoke.textContent = '💨';
    smoke.style.animation = 'smokeRise 1s ease-out forwards';
    candle.appendChild(smoke);
    
    setTimeout(() => {
        smoke.remove();
    }, 1000);
}

function createBalloonsAndGlitter(candle) {
    const cakeContainer = document.querySelector('.cake-container');
    const rect = candle.getBoundingClientRect();
    const containerRect = cakeContainer.getBoundingClientRect();
    
    // Create balloons
    const balloonEmojis = ['🎈', '🎈', '🎈'];
    balloonEmojis.forEach((emoji, index) => {
        const balloon = document.createElement('div');
        balloon.className = 'balloon-rise';
        balloon.textContent = emoji;
        balloon.style.position = 'absolute';
        balloon.style.left = `${rect.left - containerRect.left + (index - 1) * 30}px`;
        balloon.style.top = `${rect.top - containerRect.top}px`;
        balloon.style.fontSize = '2rem';
        balloon.style.animation = `balloonFloat ${2 + index * 0.3}s ease-out forwards`;
        balloon.style.animationDelay = `${index * 0.1}s`;
        cakeContainer.appendChild(balloon);
        
        setTimeout(() => balloon.remove(), 3000);
    });
    
    // Create glitter particles
    for (let i = 0; i < 15; i++) {
        const glitter = document.createElement('div');
        glitter.className = 'glitter-particle';
        glitter.textContent = '✨';
        glitter.style.position = 'absolute';
        glitter.style.left = `${rect.left - containerRect.left}px`;
        glitter.style.top = `${rect.top - containerRect.top}px`;
        glitter.style.fontSize = '1.5rem';
        
        const angle = (Math.random() * 120 - 60) * Math.PI / 180;
        const distance = 100 + Math.random() * 100;
        const endX = Math.cos(angle) * distance;
        const endY = -Math.abs(Math.sin(angle) * distance);
        
        glitter.style.setProperty('--end-x', `${endX}px`);
        glitter.style.setProperty('--end-y', `${endY}px`);
        glitter.style.animation = `glitterBurst ${1 + Math.random()}s ease-out forwards`;
        glitter.style.animationDelay = `${Math.random() * 0.2}s`;
        
        cakeContainer.appendChild(glitter);
        
        setTimeout(() => glitter.remove(), 2000);
    }
    
    // Add extra floating hearts
    for (let i = 0; i < 5; i++) {
        hearts.push(new FloatingHeart());
    }
}

function shakeCake() {
    const cake = document.getElementById('birthdayCake');
    cake.style.animation = 'none';
    setTimeout(() => {
        cake.style.animation = 'cakeShake 0.5s ease';
    }, 10);
}

function showGrandCelebration() {
    const instruction = document.querySelector('.blow-instruction');
    instruction.textContent = '🎉🎊 Yay! Make a wish, Nishi! 🎊🎉';
    instruction.style.fontSize = '2rem';
    instruction.style.color = '#ffff00';
    instruction.style.textShadow = '0 0 20px #ffff00';
    
    // Add many more floating hearts
    for (let i = 0; i < 30; i++) {
        hearts.push(new FloatingHeart());
    }
    
    // Create celebration balloons around the cake
    const cakeContainer = document.querySelector('.cake-container');
    const celebrationEmojis = ['🎈', '🎈', '🎈', '🎊', '🎉', '✨', '🌟', '💫', '🎂', '🎁'];
    
    celebrationEmojis.forEach((emoji, index) => {
        const celebration = document.createElement('div');
        celebration.textContent = emoji;
        celebration.style.position = 'absolute';
        celebration.style.fontSize = '3rem';
        celebration.style.left = `${Math.random() * 100}%`;
        celebration.style.top = '100%';
        celebration.style.animation = `celebrationRise ${3 + Math.random() * 2}s ease-out forwards`;
        celebration.style.animationDelay = `${index * 0.15}s`;
        cakeContainer.appendChild(celebration);
        
        setTimeout(() => celebration.remove(), 6000);
    });
}

// Add dynamic animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes smokeRise {
        0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-50px);
        }
    }
    
    @keyframes balloonFloat {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translateY(-300px) rotate(20deg);
        }
    }
    
    @keyframes glitterBurst {
        0% {
            opacity: 1;
            transform: translate(0, 0) scale(1) rotate(0deg);
        }
        100% {
            opacity: 0;
            transform: translate(var(--end-x), var(--end-y)) scale(0.3) rotate(360deg);
        }
    }
    
    @keyframes cakeShake {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        25% { transform: translateX(-5px) rotate(-2deg); }
        75% { transform: translateX(5px) rotate(2deg); }
    }
    
    @keyframes celebrationRise {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(0.5);
        }
        50% {
            opacity: 1;
            transform: translateY(-200px) rotate(180deg) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-400px) rotate(360deg) scale(0.5);
        }
    }
`;
document.head.appendChild(style);

// Handle window resize
window.addEventListener('resize', () => {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
});

// Initialize
animate();
