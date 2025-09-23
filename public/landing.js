// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load and display global statistics
    loadGlobalStats();
    
    // Add smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Add scroll effects
    setupScrollEffects();
    
    // Animate numbers on scroll
    setupNumberAnimations();
});

// Load global statistics from API
async function loadGlobalStats() {
    try {
        const response = await fetch('/api/stats/global');
        const data = await response.json();
        
        if (data.stats) {
            // Update hero stats
            animateNumber('totalPlayers', data.stats.totalPlayers, 1000);
            animateNumber('totalGames', data.stats.totalGames, 1500);
            animateNumber('activeToday', data.stats.activeToday, 800);
            
            // Update stats section
            setTimeout(() => {
                animateNumber('statTotalPlayers', data.stats.totalPlayers, 1000);
                animateNumber('statTotalGames', data.stats.totalGames, 1500);
                animateNumber('statActiveToday', data.stats.activeToday, 800);
            }, 500);
        }
    } catch (error) {
        console.error('Error loading global stats:', error);
        
        // Fallback to demo numbers if API fails
        const demoStats = {
            totalPlayers: 1247,
            totalGames: 8632,
            activeToday: 23
        };
        
        animateNumber('totalPlayers', demoStats.totalPlayers, 1000);
        animateNumber('totalGames', demoStats.totalGames, 1500);
        animateNumber('activeToday', demoStats.activeToday, 800);
        
        setTimeout(() => {
            animateNumber('statTotalPlayers', demoStats.totalPlayers, 1000);
            animateNumber('statTotalGames', demoStats.totalGames, 1500);
            animateNumber('statActiveToday', demoStats.activeToday, 800);
        }, 500);
    }
}

// Animate numbers from 0 to target value
function animateNumber(elementId, targetValue, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const increment = targetValue / (duration / 16); // 60fps
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        
        // Format large numbers with commas
        const formattedValue = Math.floor(currentValue).toLocaleString('ru-RU');
        element.textContent = formattedValue;
    }, 16);
}

// Setup smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Setup scroll effects
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Add intersection observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe feature cards and stat cards
    document.querySelectorAll('.feature-card, .stat-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
}

// Setup number animations on scroll
function setupNumberAnimations() {
    const statsSection = document.querySelector('.stats-section');
    let statsAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                // Re-animate stats when they come into view
                setTimeout(() => {
                    loadGlobalStats();
                }, 200);
            }
        });
    }, { threshold: 0.3 });
    
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Add button hover effects
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Add card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-card, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll handler
window.addEventListener('scroll', throttle(() => {
    // Scroll-based animations can be added here
}, 16)); // ~60fps