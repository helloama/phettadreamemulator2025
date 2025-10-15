import Component from '../../Component'

/**
 * DreamSession Component
 * 
 * Manages the dream session timer and end conditions.
 * - 10 minute (600 second) countdown
 * - Broadcasts 'dream.end' event when session ends
 * - Detects premature end conditions (falls, timeouts)
 */
export default class DreamSession extends Component {
    constructor() {
        super();
        this.name = 'DreamSession';
        
        // Session configuration
        // TODO: Revert maxDuration to 600 seconds (10 minutes) after testing
        this.maxDuration = 60; // Temporarily set to 60 seconds (1 minute) for testing purposes
        this.timeRemaining = this.maxDuration;
        this.isActive = true;
        this.sessionEndDelay = 3.0; // Delay before restarting
        this.sessionEndTimer = 0;
        this.hasEnded = false;
        
        // Death/fall detection
        this.deathThreshold = -10.0; // Y position below which player "dies"
    }
    
    Initialize() {
        console.log('[DreamSession] Session started - Duration:', this.maxDuration, 'seconds');
        
        // Listen for external end triggers
        this.parent.RegisterEventHandler(this.OnFatalCondition, 'dream.fatal');
        this.parent.RegisterEventHandler(this.OnPlayerDeath, 'player.died');
        
        // Listen for fade completion to properly coordinate restart
        this.parent.RegisterEventHandler(this.OnFadeComplete, 'fade.complete');
        
        // Get reference to player for death detection
        this.playerEntity = this.FindEntity('Player');
        
        // Broadcast new session start to reset player health
        this.parent.Broadcast({topic: 'session.new'});
    }
    
    OnFatalCondition = (msg) => {
        console.log('[DreamSession] Fatal condition triggered:', msg.reason);
        this.TriggerEnd('fatal', msg.reason);
    }
    
    OnPlayerDeath = (msg) => {
        console.log('[DreamSession] Player died from:', msg.cause);
        this.TriggerEnd('death', `Player died from ${msg.cause}`);
    }
    
    OnFadeComplete = (msg) => {
        console.log('[DreamSession] Fade complete:', msg.type);
        
        // Only restart if we're in the ended state and fade out just completed
        if (this.hasEnded && msg.type === 'out') {
            console.log('[DreamSession] Fade out complete - starting restart sequence');
            // Small delay before restart to let the fade settle
            setTimeout(() => {
                this.RestartSession();
            }, 500);
        }
    }
    
    Update(timeElapsed) {
        if (!this.isActive) {
            // Session ended, restart is now handled by fade completion
            // No need for timer-based restart anymore
            return;
        }
        
        // Countdown timer
        this.timeRemaining -= timeElapsed;
        
        // Update UI
        this.UpdateTimerDisplay();
        
        // Check for timeout
        if (this.timeRemaining <= 0) {
            this.TriggerEnd('timeout', 'Session time expired');
            return;
        }
        
        // Check for death condition (falling off world)
        if (this.playerEntity && this.playerEntity.Position.y < this.deathThreshold) {
            this.TriggerEnd('death', 'Fell into the void');
            return;
        }
    }
    
    UpdateTimerDisplay() {
        const uiManager = this.FindEntity('UIManager');
        if (uiManager && uiManager.GetComponent('UIManager')) {
            const mins = Math.floor(this.timeRemaining / 60);
            const secs = Math.floor(this.timeRemaining % 60);
            uiManager.GetComponent('UIManager').SetTimer(mins, secs);
        }
    }
    
    TriggerEnd(type, reason) {
        if (this.hasEnded) return; // Prevent multiple triggers
        
        console.log('[DreamSession] Session ending -', type, ':', reason);
        
        this.isActive = false;
        this.hasEnded = true;
        this.sessionEndTimer = 0;
        
        // Broadcast end event to other components
        this.Broadcast({
            topic: 'dream.end',
            endType: type,
            reason: reason,
            timeRemaining: this.timeRemaining,
            timeElapsed: this.maxDuration - this.timeRemaining
        });
    }
    
    RestartSession() {
        console.log('[DreamSession] Restarting session after death/timeout');
        
        // Reset session state
        this.isActive = true;
        this.hasEnded = false;
        this.sessionEndTimer = 0;
        this.timeRemaining = this.maxDuration;
        
        // Reset player health and position
        this.Broadcast({topic: 'session.new'});
        
        // Fade back in
        this.Broadcast({topic: 'fade.in', speed: 1.0});
        
        // Hide any death overlays
        this.HideDeathOverlay();
        
        console.log('[DreamSession] Session restarted - new session beginning');
    }
    
    HideDeathOverlay() {
        // Remove death overlay if it exists
        const deathOverlay = document.getElementById('death_overlay');
        if (deathOverlay) {
            deathOverlay.remove();
        }
    }
}

