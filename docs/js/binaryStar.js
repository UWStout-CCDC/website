// Configurable parameters
const STAR_COUNT = 6;
const TRAIL_LENGTH = 80; // More spread out trail
// Set star and trail colors based on theme
function getStarColors() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    if (theme === 'dark') {
        return {
            //STAR_COLOR: 'rgba(0, 200, 255, 1)',
            STAR_COLOR: 'rgba(0, 200, 255, 0)',
            TRAIL_COLOR: 'rgba(0, 200, 255, 0.6)'
        };
    } else {
        return {
            //STAR_COLOR: 'rgba(0, 120, 200, 1)',
            STAR_COLOR: 'rgba(0, 120, 200, 0)',
            TRAIL_COLOR: 'rgba(0, 120, 200, 0.5)'
        };
    }
}
let { STAR_COLOR, TRAIL_COLOR } = getStarColors();

// Update colors on theme change
document.getElementById('theme-toggle').addEventListener('click', () => {
    setTimeout(() => {
        ({ STAR_COLOR, TRAIL_COLOR } = getStarColors());
    }, 0);
});
const STAR_RADIUS = 2;
const STAR_MIN_SPEED = 1; // Slower min speed
const STAR_MAX_SPEED = 10; // Slower max speed
const STAR_MIN_LENGTH = 80;
const STAR_MAX_LENGTH = 130;
const STAR_MIN_ANGLE = Math.PI / 6; // More spread
const STAR_MAX_ANGLE = Math.PI / 2.2;
const STAR_FADE_RATE = 0.0015; // Slower fade
const STAR_FONT = '12px monospace';
const STAR_TIME = 0; // Not used directly, but can be used for timing logic if needed

const canvas = document.getElementById('shootingStars');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Shooting star object
class ShootingStar {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = -20;
        this.len = Math.random() * (STAR_MAX_LENGTH - STAR_MIN_LENGTH) + STAR_MIN_LENGTH;
        this.speed = Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED) + STAR_MIN_SPEED;
        this.angle = Math.random() * (STAR_MAX_ANGLE - STAR_MIN_ANGLE) + STAR_MIN_ANGLE;
        this.opacity = 1;
        this.trail = [];
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= STAR_FADE_RATE;

        // Add trail positions
        this.trail.push({ x: this.x, y: this.y, opacity: 1, digit: Math.random() > 0.5 ? '1' : '0' });
        if (this.trail.length > TRAIL_LENGTH) this.trail.shift();

        if (this.opacity <= 0 || this.x > width + 100 || this.y > height + 100) {
            this.reset();
        }
    }

    draw() {
        // Draw trail digits
        this.trail.forEach((t, i) => {
            //ctx.globalAlpha = t.opacity * (1 - i / this.trail.length);
            ctx.globalAlpha = t.opacity * (i / this.trail.length);
            ctx.fillStyle = TRAIL_COLOR;
            ctx.font = STAR_FONT;
            ctx.fillText(t.digit, t.x, t.y);
        });

        // Draw star head
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, STAR_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = STAR_COLOR;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

const stars = Array.from({ length: STAR_COUNT }, () => new ShootingStar());

function animate() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    requestAnimationFrame(animate);
}

animate();
