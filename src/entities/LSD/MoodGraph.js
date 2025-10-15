import Component from "../../Component";

/**
 * MoodGraph - Core LSD Dream Emulator mood tracking system
 * 
 * Implements the 2D mood vector system: Upper/Downer × Static/Dynamic
 * Range: [-9..+9] each axis with wraparound
 * Controls dream navigation and scene selection
 */
export default class MoodGraph extends Component {
    constructor() {
        super();
        this.name = 'MoodGraph';
        
        // 2D mood vector: [x, y] where x = Upper/Downer, y = Static/Dynamic
        this.mood = { x: 0, y: 0 }; // Start at neutral (0,0)
        this.maxMood = 9;
        this.minMood = -9;
        
        // Mood history for tracking changes
        this.moodHistory = [];
        this.maxHistoryLength = 100;
        
        // Current session tracking
        this.sessionStartMood = { x: 0, y: 0 };
        this.sessionMoodChanges = [];
        
        // Mood drift tracking
        this.moodDriftPerSecond = { x: 0, y: 0 };
        this.lastUpdateTime = Date.now();
    }

    Initialize() {
        console.log('[MoodGraph] Initializing LSD-style mood tracking system');
        
        // Listen for mood-affecting events
        this.parent.RegisterEventHandler(this.OnAreaEnter, 'area.enter');
        this.parent.RegisterEventHandler(this.OnAreaExit, 'area.exit');
        this.parent.RegisterEventHandler(this.OnNPCTouch, 'npc.touch');
        this.parent.RegisterEventHandler(this.OnEventTrigger, 'event.trigger');
        this.parent.RegisterEventHandler(this.OnSessionStart, 'session.start');
        this.parent.RegisterEventHandler(this.OnSessionEnd, 'session.end');
        
        // Initialize with neutral mood
        this.ResetMood();
    }

    OnSessionStart = () => {
        console.log('[MoodGraph] Session started - resetting mood');
        this.sessionStartMood = { x: this.mood.x, y: this.mood.y };
        this.sessionMoodChanges = [];
        this.RecordMoodChange('session_start');
    }

    OnSessionEnd = () => {
        console.log('[MoodGraph] Session ended - final mood:', this.mood);
        this.RecordMoodChange('session_end');
        
        // Broadcast final mood for next session spawn selection
        this.Broadcast({
            topic: 'mood.final',
            mood: { x: this.mood.x, y: this.mood.y },
            quadrant: this.GetMoodQuadrant(),
            magnitude: this.GetMoodMagnitude()
        });
    }

    OnAreaEnter = (msg) => {
        console.log('[MoodGraph] Entered area:', msg.area);
        if (msg.moodDrift) {
            this.moodDriftPerSecond = msg.moodDrift;
            console.log('[MoodGraph] Area mood drift:', this.moodDriftPerSecond);
        }
    }

    OnAreaExit = (msg) => {
        console.log('[MoodGraph] Exited area:', msg.area);
        // Stop area-based mood drift
        this.moodDriftPerSecond = { x: 0, y: 0 };
    }

    OnNPCTouch = (msg) => {
        console.log('[MoodGraph] Touched NPC:', msg.npcType);
        if (msg.moodDelta) {
            this.ApplyMoodDelta(msg.moodDelta);
            this.RecordMoodChange(`npc_touch_${msg.npcType}`, msg.moodDelta);
        }
    }

    OnEventTrigger = (msg) => {
        console.log('[MoodGraph] Event triggered:', msg.eventType);
        if (msg.moodDelta) {
            this.ApplyMoodDelta(msg.moodDelta);
            this.RecordMoodChange(`event_${msg.eventType}`, msg.moodDelta);
        }
    }

    Update(deltaTime) {
        // Apply continuous mood drift from current area
        if (this.moodDriftPerSecond.x !== 0 || this.moodDriftPerSecond.y !== 0) {
            const driftDelta = {
                x: this.moodDriftPerSecond.x * deltaTime,
                y: this.moodDriftPerSecond.y * deltaTime
            };
            this.ApplyMoodDelta(driftDelta);
        }
    }

    ApplyMoodDelta(delta) {
        const oldMood = { x: this.mood.x, y: this.mood.y };
        
        // Apply delta with wraparound
        this.mood.x = this.WrapMoodValue(this.mood.x + delta.x);
        this.mood.y = this.WrapMoodValue(this.mood.y + delta.y);
        
        // Check for significant mood changes
        const moodChange = {
            x: this.mood.x - oldMood.x,
            y: this.mood.y - oldMood.y
        };
        
        if (Math.abs(moodChange.x) > 0.1 || Math.abs(moodChange.y) > 0.1) {
            this.BroadcastMoodChange(oldMood, this.mood, delta);
        }
    }

    WrapMoodValue(value) {
        // Wraparound: -9 to +9 range
        if (value > this.maxMood) {
            return this.minMood + (value - this.maxMood - 1);
        } else if (value < this.minMood) {
            return this.maxMood + (value - this.minMood + 1);
        }
        return value;
    }

    BroadcastMoodChange(oldMood, newMood, delta) {
        console.log('[MoodGraph] Mood changed:', oldMood, '->', newMood, 'delta:', delta);
        
        // Broadcast mood change to other systems
        this.Broadcast({
            topic: 'mood.changed',
            oldMood: oldMood,
            newMood: newMood,
            delta: delta,
            quadrant: this.GetMoodQuadrant(),
            magnitude: this.GetMoodMagnitude()
        });
    }

    RecordMoodChange(reason, delta = null) {
        const moodChange = {
            timestamp: Date.now(),
            reason: reason,
            mood: { x: this.mood.x, y: this.mood.y },
            delta: delta
        };
        
        this.moodHistory.push(moodChange);
        this.sessionMoodChanges.push(moodChange);
        
        // Keep history manageable
        if (this.moodHistory.length > this.maxHistoryLength) {
            this.moodHistory.shift();
        }
    }

    GetMoodQuadrant() {
        // Determine which quadrant the mood is in
        if (this.mood.x >= 0 && this.mood.y >= 0) return 'Upper/Dynamic';
        if (this.mood.x >= 0 && this.mood.y < 0) return 'Upper/Static';
        if (this.mood.x < 0 && this.mood.y >= 0) return 'Downer/Dynamic';
        if (this.mood.x < 0 && this.mood.y < 0) return 'Downer/Static';
        return 'Neutral';
    }

    GetMoodMagnitude() {
        // Calculate magnitude from center (0,0)
        return Math.sqrt(this.mood.x * this.mood.x + this.mood.y * this.mood.y);
    }

    GetMoodForSpawnSelection() {
        // Return mood data for next session spawn selection
        return {
            quadrant: this.GetMoodQuadrant(),
            magnitude: this.GetMoodMagnitude(),
            x: this.mood.x,
            y: this.mood.y
        };
    }

    ResetMood() {
        this.mood = { x: 0, y: 0 };
        this.moodDriftPerSecond = { x: 0, y: 0 };
        this.RecordMoodChange('reset');
        console.log('[MoodGraph] Mood reset to neutral');
    }

    SetMood(x, y) {
        const oldMood = { x: this.mood.x, y: this.mood.y };
        this.mood.x = this.WrapMoodValue(x);
        this.mood.y = this.WrapMoodValue(y);
        this.RecordMoodChange('manual_set');
        this.BroadcastMoodChange(oldMood, this.mood, { x: this.mood.x - oldMood.x, y: this.mood.y - oldMood.y });
    }

    // Get mood data for UI display
    GetMoodData() {
        return {
            current: { x: this.mood.x, y: this.mood.y },
            quadrant: this.GetMoodQuadrant(),
            magnitude: this.GetMoodMagnitude(),
            history: this.moodHistory.slice(-10), // Last 10 changes
            sessionChanges: this.sessionMoodChanges
        };
    }

    // Get spawn location based on mood (LSD-style)
    GetSpawnLocationForMood() {
        const quadrant = this.GetMoodQuadrant();
        const magnitude = this.GetMoodMagnitude();
        
        // Map mood to spawn locations (following LSD spec)
        if (magnitude < 2) {
            return 'SquishyFieldHub'; // Near zero -> Hub
        }
        
        switch (quadrant) {
            case 'Upper/Dynamic':
                return magnitude > 6 ? 'KaraokeStarship' : 'SquishyFieldHub';
            case 'Upper/Static':
                return magnitude > 6 ? 'ArchiveSpire' : 'SquishyFieldHub';
            case 'Downer/Dynamic':
                return magnitude > 6 ? 'BureauTower' : 'SquishyFieldHub';
            case 'Downer/Static':
                return magnitude > 6 ? 'GlitchGrotto' : 'SquishyFieldHub';
            default:
                return 'SquishyFieldHub';
        }
    }
}
