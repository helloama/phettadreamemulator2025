import Component from '../../Component'

/**
 * SessionState Component
 * 
 * Manages session persistence and seed generation.
 * - Generates pseudo-random seeds for dream sessions
 * - Persists session count and mood history to localStorage
 * - Influences future sessions based on past behavior
 */
export default class SessionState extends Component {
    constructor() {
        super();
        this.name = 'SessionState';
        
        // Session data
        this.sessionCount = 0;
        this.currentSeed = 0;
        this.previousMood = null;
        this.sessionHistory = [];
        
        // localStorage keys
        this.STORAGE_PREFIX = 'phetta_dream_';
        this.STORAGE_KEYS = {
            SESSION_COUNT: 'session_count',
            LAST_MOOD: 'last_mood',
            HISTORY: 'session_history',
            LAST_SEED: 'last_seed'
        };
    }
    
    Initialize() {
        // Load persisted data
        this.LoadState();
        
        // Generate seed for this session
        this.GenerateSeed();
        
        // Increment session count
        this.sessionCount++;
        this.SaveSessionCount();
        
        console.log('[SessionState] Session #' + this.sessionCount);
        console.log('[SessionState] Seed:', this.currentSeed);
        console.log('[SessionState] Previous mood:', this.previousMood || 'none');
        
        // Listen for session end to save mood
        this.parent.RegisterEventHandler(this.OnSessionEnd, 'dream.end');
    }
    
    /**
     * Load state from localStorage
     */
    LoadState() {
        try {
            // Session count
            const countStr = localStorage.getItem(
                this.STORAGE_PREFIX + this.STORAGE_KEYS.SESSION_COUNT
            );
            this.sessionCount = countStr ? parseInt(countStr, 10) : 0;
            
            // Last mood
            const moodStr = localStorage.getItem(
                this.STORAGE_PREFIX + this.STORAGE_KEYS.LAST_MOOD
            );
            this.previousMood = moodStr ? JSON.parse(moodStr) : null;
            
            // Session history (last 10 sessions)
            const historyStr = localStorage.getItem(
                this.STORAGE_PREFIX + this.STORAGE_KEYS.HISTORY
            );
            this.sessionHistory = historyStr ? JSON.parse(historyStr) : [];
            
        } catch (error) {
            console.warn('[SessionState] Error loading state:', error);
            this.sessionCount = 0;
            this.previousMood = null;
            this.sessionHistory = [];
        }
    }
    
    /**
     * Generate seed based on session count, previous mood, and randomness
     */
    GenerateSeed() {
        // Base seed from timestamp
        let seed = Date.now();
        
        // Mix in session count
        seed = seed ^ (this.sessionCount * 31337);
        
        // Influence from previous mood
        if (this.previousMood) {
            // Mood axes: upper/downer, static/dynamic
            const moodValue = (this.previousMood.upper || 0) * 1000 + 
                            (this.previousMood.dynamic || 0) * 100;
            seed = seed ^ moodValue;
        }
        
        // Add some randomness
        seed = seed ^ (Math.random() * 0xFFFFFF);
        
        // Ensure positive integer
        this.currentSeed = Math.abs(seed | 0);
        
        // Save seed
        localStorage.setItem(
            this.STORAGE_PREFIX + this.STORAGE_KEYS.LAST_SEED,
            this.currentSeed.toString()
        );
    }
    
    /**
     * Get random number from seed (simple LCG)
     */
    GetSeededRandom(min = 0, max = 1) {
        // Linear Congruential Generator
        this.currentSeed = (this.currentSeed * 1103515245 + 12345) & 0x7fffffff;
        const random = (this.currentSeed / 0x7fffffff);
        return min + random * (max - min);
    }
    
    /**
     * Get random integer from seed
     */
    GetSeededRandomInt(min, max) {
        return Math.floor(this.GetSeededRandom(min, max + 1));
    }
    
    /**
     * Save session count
     */
    SaveSessionCount() {
        localStorage.setItem(
            this.STORAGE_PREFIX + this.STORAGE_KEYS.SESSION_COUNT,
            this.sessionCount.toString()
        );
    }
    
    /**
     * Handle session end - save mood data
     */
    OnSessionEnd = (msg) => {
        console.log('[SessionState] Session ended, waiting for mood classification...');
        
        // Listen for mood classification
        this.parent.RegisterEventHandler(this.OnMoodClassified, 'mood.classified');
    }
    
    /**
     * Save mood classification
     */
    OnMoodClassified = (msg) => {
        const mood = msg.mood;
        
        console.log('[SessionState] Mood classified:', mood);
        
        // Save last mood
        localStorage.setItem(
            this.STORAGE_PREFIX + this.STORAGE_KEYS.LAST_MOOD,
            JSON.stringify(mood)
        );
        
        // Add to history
        this.sessionHistory.push({
            session: this.sessionCount,
            mood: mood,
            timestamp: Date.now(),
            duration: msg.duration || 0
        });
        
        // Keep only last 10 sessions
        if (this.sessionHistory.length > 10) {
            this.sessionHistory = this.sessionHistory.slice(-10);
        }
        
        // Save history
        localStorage.setItem(
            this.STORAGE_PREFIX + this.STORAGE_KEYS.HISTORY,
            JSON.stringify(this.sessionHistory)
        );
    }
    
    /**
     * Get starting zone ID based on previous mood
     */
    GetStartingZone() {
        if (!this.previousMood) {
            return 'void'; // Default starting zone
        }
        
        // Bias zone selection based on mood
        const { upper, downer, static: staticVal, dynamic } = this.previousMood;
        
        // TODO: More sophisticated zone selection
        // For now, simple logic:
        if (downer > upper) {
            return this.GetSeededRandomInt(0, 1) === 0 ? 'void' : 'ruins';
        } else if (upper > downer) {
            return this.GetSeededRandomInt(0, 1) === 0 ? 'garden' : 'temple';
        } else {
            return 'void';
        }
    }
    
    /**
     * Check if rare events should be enabled
     */
    ShouldEnableRareEvents() {
        return this.sessionCount >= 10;
    }
    
    /**
     * Check if texture distortion should be enabled
     */
    ShouldEnableDistortion() {
        return this.sessionCount >= 20;
    }
    
    /**
     * Get session data for debugging
     */
    GetDebugInfo() {
        return {
            sessionCount: this.sessionCount,
            currentSeed: this.currentSeed,
            previousMood: this.previousMood,
            historyLength: this.sessionHistory.length,
            rareEventsEnabled: this.ShouldEnableRareEvents(),
            distortionEnabled: this.ShouldEnableDistortion()
        };
    }
}

