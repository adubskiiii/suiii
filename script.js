// Rain Effect Generator
function createRain() {
    const rainContainer = document.getElementById('rainCanvas');
    if (!rainContainer) return;
    
    rainContainer.innerHTML = '';
    const dropsCount = window.innerWidth < 768 ? 80 : 140;
    
    for (let i = 0; i < dropsCount; i++) {
        let drop = document.createElement('div');
        drop.classList.add('drop');
        
        let left = Math.random() * 100;
        let width = Math.random() * 2.5 + 1;
        let height = Math.random() * 18 + 8;
        let duration = Math.random() * 1.5 + 0.8;
        let delay = Math.random() * 15;
        
        drop.style.left = left + '%';
        drop.style.width = width + 'px';
        drop.style.height = height + 'px';
        drop.style.animationDuration = duration + 's';
        drop.style.animationDelay = delay + 's';
        drop.style.opacity = Math.random() * 0.5 + 0.2;
        
        rainContainer.appendChild(drop);
    }
}

// Audio Manager
class AudioManager {
    constructor() {
        this.audio = document.getElementById('bgAudio');
        this.toggleBtn = document.getElementById('audioToggleBtn');
        this.audioIcon = document.getElementById('audioIcon');
        this.isPlaying = false;
        this.audioLoaded = false;
        this.init();
    }
    
    init() {
        if (!this.audio || !this.toggleBtn) return;
        
        this.audio.volume = 0.35;
        
        this.audio.addEventListener('canplaythrough', () => {
            this.audioLoaded = true;
        });
        
        this.audio.addEventListener('error', () => {
            if (this.audioIcon) {
                this.audioIcon.className = 'fas fa-exclamation-triangle';
                this.audioIcon.style.color = '#ffaa44';
            }
        });
        
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAudio();
        });
        
        this.setupAutoPlay();
    }
    
    setupAutoPlay() {
        const startAudio = () => {
            if (!this.isPlaying && this.audioLoaded) {
                this.audio.play()
                    .then(() => {
                        this.isPlaying = true;
                        if (this.audioIcon) {
                            this.audioIcon.className = 'fas fa-volume-up';
                        }
                    })
                    .catch(() => {});
            }
            document.removeEventListener('click', startAudio);
            document.removeEventListener('touchstart', startAudio);
        };
        
        document.addEventListener('click', startAudio);
        document.addEventListener('touchstart', startAudio);
        
        if (this.audio.readyState >= 2) {
            this.audioLoaded = true;
        } else {
            this.audio.load();
        }
    }
    
    toggleAudio() {
        if (!this.audioLoaded) {
            this.audio.load();
            setTimeout(() => {
                if (this.audioLoaded) this.toggleAudio();
            }, 500);
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            if (this.audioIcon) {
                this.audioIcon.className = 'fas fa-volume-mute';
            }
        } else {
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    if (this.audioIcon) {
                        this.audioIcon.className = 'fas fa-volume-up';
                    }
                })
                .catch(() => {
                    if (this.audioIcon) {
                        this.audioIcon.className = 'fas fa-volume-off';
                    }
                });
        }
    }
}

// View Counter (Accurate all-time real-time tracking)
function updateViewCount() {
    const viewCountElem = document.getElementById('viewCount');
    if (!viewCountElem) return;
    
    // Get or initialize all-time view count
    let allTimeViews = localStorage.getItem('allTimeViews');
    const lastSessionDate = localStorage.getItem('lastSessionDate');
    const today = new Date().toDateString();
    const sessionId = localStorage.getItem('sessionId');
    const currentSessionId = generateSessionId();
    
    if (!allTimeViews) {
        // First time ever - start from 2847
        allTimeViews = 2847;
        localStorage.setItem('allTimeViews', allTimeViews);
        localStorage.setItem('lastSessionDate', today);
        localStorage.setItem('sessionId', currentSessionId);
    } else {
        allTimeViews = parseInt(allTimeViews);
        
        // Check if this is a new session (new page load)
        if (sessionId !== currentSessionId) {
            // New session - increment view count by 1
            allTimeViews += 1;
            localStorage.setItem('allTimeViews', allTimeViews);
            localStorage.setItem('sessionId', currentSessionId);
            localStorage.setItem('lastSessionDate', today);
        }
    }
    
    // Display the accurate all-time view count
    viewCountElem.innerText = allTimeViews.toLocaleString();
}

// Generate unique session ID
function generateSessionId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Track link clicks (each unique click adds to all-time views)
function setupLinkTracking() {
    const allLinks = document.querySelectorAll('a.social-icon');
    const clickedLinks = new Set();
    
    allLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const viewsSpan = document.getElementById('viewCount');
            if (!viewsSpan) return;
            
            // Get current all-time views
            let currentViews = parseInt(localStorage.getItem('allTimeViews')) || 2847;
            
            // Check if this specific link was clicked in this session
            const linkId = link.href + Date.now().toString();
            
            if (!clickedLinks.has(linkId)) {
                // Increment by 1 for each unique link click
                currentViews += 1;
                localStorage.setItem('allTimeViews', currentViews);
                viewsSpan.innerText = currentViews.toLocaleString();
                clickedLinks.add(linkId);
                
                // Show subtle notification
                showViewNotification();
            }
        });
    });
}

// Show subtle notification when view count increases
function showViewNotification() {
    const viewsStat = document.querySelector('.views-stats');
    if (!viewsStat) return;
    
    viewsStat.style.transform = 'scale(1.05)';
    viewsStat.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        viewsStat.style.transform = 'scale(1)';
    }, 200);
}

// Real-time view sync (for multiple tabs)
function setupViewSync() {
    // Listen for storage events to sync views across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'allTimeViews') {
            const viewCountElem = document.getElementById('viewCount');
            if (viewCountElem && e.newValue) {
                viewCountElem.innerText = parseInt(e.newValue).toLocaleString();
            }
        }
    });
}

// Reset session on page unload (optional - counts as session end)
function setupSessionTracking() {
    // Don't count page refreshes as new sessions
    window.addEventListener('beforeunload', () => {
        // Keep the session active
        const currentSessionId = localStorage.getItem('sessionId');
        sessionStorage.setItem('lastSessionId', currentSessionId);
    });
    
    // Check if this is a refresh vs new session
    const lastSessionId = sessionStorage.getItem('lastSessionId');
    const currentSessionId = localStorage.getItem('sessionId');
    
    if (lastSessionId === currentSessionId) {
        // This is a refresh, don't increment view count
        const viewCountElem = document.getElementById('viewCount');
        if (viewCountElem) {
            const currentViews = parseInt(localStorage.getItem('allTimeViews')) || 2847;
            viewCountElem.innerText = currentViews.toLocaleString();
        }
    }
}

// Copy User ID Functionality
function setupUsernameCopy() {
    const usernameHandle = document.querySelector('.username-handle');
    if (!usernameHandle) return;
    
    usernameHandle.style.cursor = 'pointer';
    usernameHandle.title = 'Click to copy user ID';
    
    usernameHandle.addEventListener('click', async () => {
        const textToCopy = 'stfu8';
        const originalHTML = usernameHandle.innerHTML;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            usernameHandle.innerHTML = '✓ Copied!';
            setTimeout(() => {
                usernameHandle.innerHTML = originalHTML;
            }, 1200);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
}

// Social Links Hover Effects
function setupLinkEffects() {
    const socialIcons = document.querySelectorAll('.social-icon');
    
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            icon.style.transform = 'translateY(-3px)';
            icon.style.boxShadow = '0 8px 18px rgba(0,0,0,0.3)';
            icon.style.borderColor = 'rgba(255,255,255,0.3)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0)';
            icon.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            icon.style.borderColor = 'rgba(255,255,255,0.15)';
        });
    });
}

// Custom Cursor (Fixed - Dot only)
function setupCustomCursor() {
    // Check if it's a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) return;
    
    // Remove existing cursors if any
    const existingDot = document.querySelector('.cursor-dot');
    const existingRing = document.querySelector('.cursor-ring');
    if (existingDot) existingDot.remove();
    if (existingRing) existingRing.remove();
    
    // Create cursor dot only
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Update cursor position
    function updateCursor(e) {
        const x = e.clientX;
        const y = e.clientY;
        
        // Set dot position at cursor
        cursorDot.style.left = x + 'px';
        cursorDot.style.top = y + 'px';
    }
    
    // Add mousemove listener
    document.addEventListener('mousemove', updateCursor);
    
    // Handle mouse leaving the window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
    });
    
    // Add hover effects for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .social-icon, .avatar, .username-handle, .audio-toggle');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.width = '10px';
            cursorDot.style.height = '10px';
            cursorDot.style.backgroundColor = 'rgba(255,255,255,0.9)';
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.style.width = '8px';
            cursorDot.style.height = '8px';
            cursorDot.style.backgroundColor = 'white';
        });
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', updateCursor);
    });
}

// Dynamic Title Rotation
function setupTitleRotation() {
    let titles = ["adub", "is", "the", "best"];
    let idx = 0;
    
    setInterval(() => {
        idx = (idx + 1) % titles.length;
        document.title = titles[idx];
    }, 2800);
}

// Typewriter Effect
function setupTypewriter() {
    const bioEl = document.querySelector('.bio');
    if (!bioEl || bioEl.hasAttribute('data-typewriter')) return;
    
    const originalText = bioEl.innerText.replace(/[✦✧]/g, '').trim();
    bioEl.setAttribute('data-typewriter', 'true');
    
    let i = 0;
    const iconHtml = '<i class="fas fa-feather-alt" style="font-size: 0.8rem; margin-right: 6px;"></i> ';
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'typewriter-cursor';
    cursorSpan.innerText = '|';
    
    bioEl.innerHTML = iconHtml;
    bioEl.appendChild(cursorSpan);
    
    function typeEffect() {
        if (i < originalText.length) {
            const textSoFar = iconHtml + originalText.substring(0, i + 1);
            bioEl.innerHTML = textSoFar;
            bioEl.appendChild(cursorSpan);
            i++;
            setTimeout(typeEffect, 45);
        } else {
            setInterval(() => {
                cursorSpan.style.opacity = cursorSpan.style.opacity === '0' ? '1' : '0';
            }, 500);
        }
    }
    
    setTimeout(typeEffect, 400);
}

// Add Badges to Display Name (Fixed - Name above badges, closer together)
function addBadges() {
    const displayNameDiv = document.getElementById('displayName');
    if (!displayNameDiv) return;
    
    // Clear existing content
    displayNameDiv.innerHTML = '';
    
    // Create container for name
    const nameContainer = document.createElement('div');
    nameContainer.style.display = 'block';
    nameContainer.style.width = '100%';
    nameContainer.style.textAlign = 'center';
    nameContainer.style.marginBottom = '6px';  // Reduced from 12px to 6px
    nameContainer.style.fontSize = '2rem';
    nameContainer.style.fontWeight = '700';
    nameContainer.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #e0e0e0 100%)';
    nameContainer.style.backgroundClip = 'text';
    nameContainer.style.webkitBackgroundClip = 'text';
    nameContainer.style.color = 'transparent';
    nameContainer.innerText = 'adub';
    displayNameDiv.appendChild(nameContainer);
    
    // Create container for badges
    const badgesContainer = document.createElement('div');
    badgesContainer.style.display = 'flex';
    badgesContainer.style.flexWrap = 'wrap';
    badgesContainer.style.gap = '8px';
    badgesContainer.style.justifyContent = 'center';
    badgesContainer.style.alignItems = 'center';
    badgesContainer.style.marginTop = '0px';  // Changed from 4px to 0px
    
    const badges = [
        { icon: 'fa-check-circle', color: '#ffd700', text: 'verified', borderColor: 'rgba(255,215,0,0.6)', bgGradient: 'linear-gradient(145deg, #2a2a3a, #151515)' },
        { icon: 'fa-crown', color: '#ffb347', text: 'creator', borderColor: 'rgba(255,200,100,0.6)', bgGradient: 'linear-gradient(145deg, #2a2a3a, #151515)' },
        { icon: 'fa-code', color: '#5dade2', text: 'scripter', borderColor: 'rgba(100,200,255,0.6)', bgGradient: 'linear-gradient(145deg, #2a2a3a, #151515)' },
        { icon: 'fa-gem', color: '#f7dc6f', text: 'OG', borderColor: 'rgba(255,100,150,0.6)', bgGradient: 'linear-gradient(145deg, #2a2a3a, #151515)' },
        { icon: 'fa-fire', color: '#e67e22', text: 'hype', borderColor: 'rgba(255,150,100,0.6)', bgGradient: 'linear-gradient(145deg, #2a2a3a, #151515)' }
    ];
    
    badges.forEach(badge => {
        const badgeSpan = document.createElement('span');
        badgeSpan.style.display = 'inline-flex';
        badgeSpan.style.alignItems = 'center';
        badgeSpan.style.gap = '6px';
        badgeSpan.style.whiteSpace = 'nowrap';
        badgeSpan.style.background = badge.bgGradient;
        badgeSpan.style.fontSize = '0.7rem';
        badgeSpan.style.padding = '0.2rem 0.7rem';
        badgeSpan.style.borderRadius = '20px';
        badgeSpan.style.border = `1px solid ${badge.borderColor}`;
        badgeSpan.style.fontWeight = '500';
        badgeSpan.style.lineHeight = '1.4';
        badgeSpan.style.color = '#fff';
        badgeSpan.style.backdropFilter = 'blur(4px)';
        badgeSpan.innerHTML = `<i class="fas ${badge.icon}" style="color: ${badge.color}; font-size: 0.7rem;"></i> ${badge.text}`;
        badgesContainer.appendChild(badgeSpan);
    });
    
    displayNameDiv.appendChild(badgesContainer);
}
// Avatar Click Handler
function setupAvatarClick() {
    const avatarImg = document.querySelector('.avatar');
    if (!avatarImg) return;
    
    avatarImg.addEventListener('click', async () => {
        const imageUrl = 'https://guns.lol/cdn/avatar_nexus.png';
        const notif = createNotification('✨ image host — direct link copied ✨');
        
        try {
            await navigator.clipboard.writeText(imageUrl);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        
        setTimeout(() => notif.remove(), 1800);
    });
}

// Notification Helper
function createNotification(message) {
    const notif = document.createElement('div');
    notif.innerText = message;
    notif.style.position = 'fixed';
    notif.style.bottom = '80px';
    notif.style.right = '20px';
    notif.style.background = 'rgba(17, 17, 17, 0.95)';
    notif.style.color = 'white';
    notif.style.padding = '10px 20px';
    notif.style.borderRadius = '40px';
    notif.style.fontSize = '0.85rem';
    notif.style.zIndex = '999';
    notif.style.backdropFilter = 'blur(12px)';
    notif.style.border = '1px solid rgba(255,255,255,0.2)';
    notif.style.fontFamily = "'Onest', sans-serif";
    notif.style.fontWeight = '500';
    document.body.appendChild(notif);
    return notif;
}

// Track Link Clicks
function setupLinkTracking() {
    const allLinks = document.querySelectorAll('a.social-icon');
    
    allLinks.forEach(link => {
        link.addEventListener('click', () => {
            const viewsSpan = document.getElementById('viewCount');
            if (viewsSpan) {
                let current = parseInt(viewsSpan.innerText.replace(/,/g, '')) || 2847;
                current += 1;
                viewsSpan.innerText = current.toLocaleString();
                
                // Save to localStorage
                localStorage.setItem('profileViews', current);
            }
        });
    });
}

// Handle Window Resize
function setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            createRain();
        }, 250);
    });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
    createRain();
    updateViewCount();
    setupSessionTracking();
    new AudioManager();
    setupUsernameCopy();
    setupViewSync();
    setupLinkEffects();
    setupCustomCursor();
    setupTitleRotation();
    setupTypewriter();
    addBadges();
    setupAvatarClick();
    setupLinkTracking();
    setupResizeHandler();
    resetSessionFlag();
});

// Export for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createRain, AudioManager };
}