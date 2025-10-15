import Component from '../../Component'

/**
 * FadeEffect Component
 * 
 * Manages screen fade effects for session transitions.
 * - Fade to black on session end
 * - Fade from black on session start
 * - Controllable fade speed and color
 */
export default class FadeEffect extends Component {
    constructor() {
        super();
        this.name = 'FadeEffect';
        
        // Fade state
        this.isFading = false;
        this.fadeDirection = 0; // -1 = fade out (to black), 1 = fade in (from black)
        this.fadeProgress = 0; // 0 = transparent, 1 = opaque
        this.fadeSpeed = 1.0; // Units per second
        this.targetOpacity = 0;
        
        // DOM element
        this.fadeOverlay = null;
    }
    
    Initialize() {
        // Create or get fade overlay element
        this.fadeOverlay = document.getElementById('fade_overlay');
        
        if (!this.fadeOverlay) {
            // Create overlay if it doesn't exist
            this.fadeOverlay = document.createElement('div');
            this.fadeOverlay.id = 'fade_overlay';
            this.fadeOverlay.style.position = 'absolute';
            this.fadeOverlay.style.top = '0';
            this.fadeOverlay.style.left = '0';
            this.fadeOverlay.style.width = '100%';
            this.fadeOverlay.style.height = '100%';
            this.fadeOverlay.style.backgroundColor = '#000';
            this.fadeOverlay.style.opacity = '0';
            this.fadeOverlay.style.pointerEvents = 'none';
            this.fadeOverlay.style.zIndex = '9999';
            document.body.appendChild(this.fadeOverlay);
        }
        
        // Start with fade in from black
        this.FadeIn(2.0);
        
        // Listen for dream end
        this.parent.RegisterEventHandler(this.OnDreamEnd, 'dream.end');
        
        // Listen for dream restart
        this.parent.RegisterEventHandler(this.OnDreamRestart, 'dream.restart');
        
        // Listen for direct fade commands
        this.parent.RegisterEventHandler(this.OnFadeIn, 'fade.in');
        this.parent.RegisterEventHandler(this.OnFadeOut, 'fade.out');
        
        console.log('[FadeEffect] Initialized');
    }
    
    Update(timeElapsed) {
        if (!this.isFading) return;
        
        // Update fade progress
        if (this.fadeDirection < 0) {
            // Fading out (to black)
            this.fadeProgress += this.fadeSpeed * timeElapsed;
            if (this.fadeProgress >= this.targetOpacity) {
                this.fadeProgress = this.targetOpacity;
                this.isFading = false;
                this.OnFadeComplete();
            }
        } else if (this.fadeDirection > 0) {
            // Fading in (from black)
            this.fadeProgress -= this.fadeSpeed * timeElapsed;
            if (this.fadeProgress <= this.targetOpacity) {
                this.fadeProgress = this.targetOpacity;
                this.isFading = false;
                this.OnFadeComplete();
            }
        }
        
        // Apply opacity
        this.fadeOverlay.style.opacity = this.fadeProgress.toFixed(3);
    }
    
    /**
     * Fade out to black
     */
    FadeOut(duration = 1.0, targetOpacity = 1.0) {
        console.log('[FadeEffect] Fading out over', duration, 'seconds');
        this.isFading = true;
        this.fadeDirection = -1;
        this.fadeSpeed = (targetOpacity - this.fadeProgress) / duration;
        this.targetOpacity = targetOpacity;
    }
    
    /**
     * Fade in from black
     */
    FadeIn(duration = 1.0, targetOpacity = 0.0) {
        console.log('[FadeEffect] Fading in over', duration, 'seconds');
        this.isFading = true;
        this.fadeDirection = 1;
        this.fadeSpeed = (this.fadeProgress - targetOpacity) / duration;
        this.targetOpacity = targetOpacity;
    }
    
    /**
     * Instant set opacity
     */
    SetOpacity(opacity) {
        this.fadeProgress = opacity;
        this.fadeOverlay.style.opacity = opacity.toFixed(3);
        this.isFading = false;
    }
    
    /**
     * Handle dream end event
     */
    OnDreamEnd = (msg) => {
        console.log('[FadeEffect] Dream ended:', msg.endType);
        
        // Fade to black
        if (msg.endType === 'death') {
            // Quick fade for death
            this.FadeOut(0.3);
        } else {
            // Slower fade for timeout
            this.FadeOut(1.5);
        }
    }
    
    /**
     * Handle dream restart event
     */
    OnDreamRestart = (msg) => {
        console.log('[FadeEffect] Dream restarting');
        
        // Fade in from black
        this.SetOpacity(1.0);
        this.FadeIn(2.0);
    }
    
    /**
     * Handle direct fade in command
     */
    OnFadeIn = (msg) => {
        console.log('[FadeEffect] Direct fade in command');
        const speed = msg.speed || 1.0;
        this.FadeIn(speed);
    }
    
    /**
     * Handle direct fade out command
     */
    OnFadeOut = (msg) => {
        console.log('[FadeEffect] Direct fade out command');
        const speed = msg.speed || 1.0;
        this.FadeOut(speed);
    }
    
    /**
     * Called when fade animation completes
     */
    OnFadeComplete() {
        if (this.fadeProgress >= 0.99) {
            console.log('[FadeEffect] Fade out complete');
            // Broadcast that screen is black
            this.Broadcast({
                topic: 'fade.complete',
                type: 'out'
            });
        } else if (this.fadeProgress <= 0.01) {
            console.log('[FadeEffect] Fade in complete');
            // Broadcast that screen is clear
            this.Broadcast({
                topic: 'fade.complete',
                type: 'in'
            });
        }
    }
}

