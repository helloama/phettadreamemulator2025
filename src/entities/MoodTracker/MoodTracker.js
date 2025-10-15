import Component from "../../Component";
import * as THREE from 'three';

export default class MoodTracker extends Component {
    constructor() {
        super();
        this.name = 'MoodTracker';
        
        // Mood axes (LSD: Dream Emulator style)
        this.upper = 0;    // Positive, uplifting experiences
        this.downer = 0;   // Negative, depressing experiences
        this.static = 0;   // Still, peaceful experiences
        this.dynamic = 0;  // Active, energetic experiences
        
        // Tracking variables
        this.lastPlayerPosition = new THREE.Vector3();
        this.movementThreshold = 0.1;
        this.timeInCurrentZone = 0;
        this.interactionCount = 0;
        this.combatCount = 0;
        this.deathCount = 0;
        
        // Zone-based tracking
        this.zonesVisited = [];
        this.timeInBrightZones = 0;
        this.timeInDarkZones = 0;
        
        // Session tracking
        this.sessionStartTime = Date.now();
        this.lastUpdateTime = Date.now();
    }

    Initialize() {
        console.log('[MoodTracker] Initializing LSD-style mood tracking');
        
        // Get player reference
        this.player = this.FindEntity('Player');
        if (!this.player) {
            console.error('[MoodTracker] Player entity not found');
            return;
        }

        // Listen for game events
        this.parent.RegisterEventHandler(this.OnPlayerMove, 'player.moved');
        this.parent.RegisterEventHandler(this.OnPlayerInteract, 'player.interact');
        this.parent.RegisterEventHandler(this.OnPlayerCombat, 'player.combat');
        this.parent.RegisterEventHandler(this.OnPlayerDeath, 'player.died');
        this.parent.RegisterEventHandler(this.OnZoneChange, 'zone.changed');
        this.parent.RegisterEventHandler(this.OnSessionEnd, 'session.end');
        
        // Initialize position tracking
        const playerPhysics = this.player.GetComponent('PlayerPhysics');
        if (playerPhysics && playerPhysics.body) {
            const pos = playerPhysics.body.getWorldTransform().getOrigin();
            this.lastPlayerPosition.set(pos.x(), pos.y(), pos.z());
        }
    }

    Update(deltaTime) {
        const currentTime = Date.now();
        const timeDelta = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        // Track movement (Static vs Dynamic)
        this.TrackMovement();
        
        // Track time-based mood influences
        this.UpdateTimeBasedMood(timeDelta);
        
        // Track environmental mood
        this.UpdateEnvironmentalMood();
    }

    TrackMovement() {
        const playerPhysics = this.player.GetComponent('PlayerPhysics');
        if (!playerPhysics || !playerPhysics.body) return;

        const currentPos = playerPhysics.body.getWorldTransform().getOrigin();
        const currentPosVector = new THREE.Vector3(currentPos.x(), currentPos.y(), currentPos.z());
        const movement = currentPosVector.distanceTo(this.lastPlayerPosition);
        
        if (movement > this.movementThreshold) {
            // Player is moving - increase dynamic mood
            this.dynamic += movement * 0.1;
            this.static = Math.max(0, this.static - movement * 0.05);
        } else {
            // Player is still - increase static mood
            this.static += 0.02;
            this.dynamic = Math.max(0, this.dynamic - 0.01);
        }
        
        this.lastPlayerPosition.copy(currentPosVector);
    }

    UpdateTimeBasedMood(timeDelta) {
        // Time spent in session influences mood
        const sessionTime = (Date.now() - this.sessionStartTime) / 1000;
        
        // Long sessions tend toward downer mood (fatigue)
        if (sessionTime > 300) { // After 5 minutes
            this.downer += timeDelta * 0.01;
        }
        
        // Very long sessions (8+ minutes) increase downer significantly
        if (sessionTime > 480) {
            this.downer += timeDelta * 0.02;
        }
    }

    UpdateEnvironmentalMood() {
        // Track lighting/brightness of current area
        // This would need to be implemented based on scene analysis
        // For now, we'll use a simple heuristic
        
        const playerControls = this.player.GetComponent('PlayerControls');
        if (playerControls) {
            // Bright areas (looking up, open sky) -> Upper mood
            if (playerControls.camera.rotation.x < -0.5) {
                this.upper += 0.01;
                this.timeInBrightZones += 0.016; // ~60fps
            }
            // Dark areas (looking down, enclosed) -> Downer mood
            else if (playerControls.camera.rotation.x > 0.3) {
                this.downer += 0.01;
                this.timeInDarkZones += 0.016;
            }
        }
    }

    OnPlayerMove = (msg) => {
        // Additional movement tracking from events
        if (msg.distance > 0.5) {
            this.dynamic += 0.1;
        }
    }

    OnPlayerInteract = (msg) => {
        this.interactionCount++;
        
        // Interactions can be upper or downer depending on context
        if (msg.type === 'positive') {
            this.upper += 0.2;
        } else if (msg.type === 'negative') {
            this.downer += 0.2;
        } else {
            // Neutral interactions slightly increase dynamic
            this.dynamic += 0.05;
        }
        
        console.log('[MoodTracker] Interaction:', msg.type, 'Upper:', this.upper.toFixed(2), 'Downer:', this.downer.toFixed(2));
    }

    OnPlayerCombat = (msg) => {
        this.combatCount++;
        
        if (msg.result === 'victory') {
            this.upper += 0.3;
            this.dynamic += 0.2;
        } else if (msg.result === 'defeat') {
            this.downer += 0.4;
        } else {
            // Ongoing combat increases dynamic mood
            this.dynamic += 0.1;
        }
        
        console.log('[MoodTracker] Combat:', msg.result, 'Dynamic:', this.dynamic.toFixed(2));
    }

    OnPlayerDeath = (msg) => {
        this.deathCount++;
        this.downer += 1.0; // Death significantly increases downer mood
        
        console.log('[MoodTracker] Player died - Downer mood increased');
    }

    OnZoneChange = (msg) => {
        this.zonesVisited.push({
            zone: msg.zoneId,
            timeSpent: this.timeInCurrentZone,
            timestamp: Date.now()
        });
        
        this.timeInCurrentZone = 0;
        
        // Zone changes increase dynamic mood
        this.dynamic += 0.1;
        
        console.log('[MoodTracker] Zone changed to:', msg.zoneId);
    }

    OnSessionEnd = (msg) => {
        this.ClassifyAndStoreMood();
    }

    ClassifyAndStoreMood() {
        // Normalize mood values
        const totalMood = this.upper + this.downer + this.static + this.dynamic;
        
        if (totalMood === 0) {
            // Default neutral mood
            this.finalMood = {
                primary: 'static',
                secondary: 'neutral',
                confidence: 0.5,
                values: { upper: 0, downer: 0, static: 1, dynamic: 0 }
            };
        } else {
            const normalizedMood = {
                upper: this.upper / totalMood,
                downer: this.downer / totalMood,
                static: this.static / totalMood,
                dynamic: this.dynamic / totalMood
            };
            
            // Find dominant mood axes
            const primaryAxis = normalizedMood.upper > normalizedMood.downer ? 'upper' : 'downer';
            const secondaryAxis = normalizedMood.static > normalizedMood.dynamic ? 'static' : 'dynamic';
            
            this.finalMood = {
                primary: primaryAxis,
                secondary: secondaryAxis,
                confidence: Math.max(normalizedMood[primaryAxis], normalizedMood[secondaryAxis]),
                values: normalizedMood
            };
        }
        
        console.log('[MoodTracker] Final mood classification:', this.finalMood);
        
        // Broadcast mood result
        this.Broadcast({
            topic: 'mood.classified',
            mood: this.finalMood,
            sessionData: {
                interactions: this.interactionCount,
                combat: this.combatCount,
                deaths: this.deathCount,
                zonesVisited: this.zonesVisited.length,
                timeInBrightZones: this.timeInBrightZones,
                timeInDarkZones: this.timeInDarkZones
            }
        });
        
        // Store for next session influence
        this.StoreMoodForNextSession();
    }

    StoreMoodForNextSession() {
        try {
            const moodData = {
                lastMood: this.finalMood,
                sessionCount: (JSON.parse(localStorage.getItem('phettaverse_session_count') || '0') + 1),
                timestamp: Date.now(),
                rawValues: {
                    upper: this.upper,
                    downer: this.downer,
                    static: this.static,
                    dynamic: this.dynamic
                }
            };
            
            localStorage.setItem('phettaverse_last_mood', JSON.stringify(moodData));
            console.log('[MoodTracker] Mood data stored for next session');
        } catch (error) {
            console.error('[MoodTracker] Failed to store mood data:', error);
        }
    }

    GetCurrentMood() {
        return {
            upper: this.upper,
            downer: this.downer,
            static: this.static,
            dynamic: this.dynamic
        };
    }

    GetMoodSummary() {
        const total = this.upper + this.downer + this.static + this.dynamic;
        if (total === 0) return { primary: 'neutral', secondary: 'neutral' };
        
        const primary = this.upper > this.downer ? 'upper' : 'downer';
        const secondary = this.static > this.dynamic ? 'static' : 'dynamic';
        
        return { primary, secondary };
    }
}
