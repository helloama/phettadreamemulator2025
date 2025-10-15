import Component from "../../Component";
import * as THREE from 'three';

export default class DreamAudioSystem extends Component {
    constructor() {
        super();
        this.name = 'DreamAudioSystem';
        
        // Audio context and sources
        this.audioContext = null;
        this.listener = null;
        this.sounds = new Map();
        this.activeLoops = new Map();
        
        // Mood-based audio profiles
        this.audioProfiles = {
            upper: {
                baseFreq: 440,      // A4 note
                reverb: 0.3,
                distortion: 0.1,
                tempo: 1.2
            },
            downer: {
                baseFreq: 220,      // A3 note (lower)
                reverb: 0.8,
                distortion: 0.4,
                tempo: 0.7
            },
            static: {
                baseFreq: 330,      // E4 note
                reverb: 0.6,
                distortion: 0.2,
                tempo: 0.9
            },
            dynamic: {
                baseFreq: 550,      // C#5 note (higher)
                reverb: 0.2,
                distortion: 0.3,
                tempo: 1.4
            }
        };
        
        // Current mood state
        this.currentMood = 'neutral';
        this.dreamIntensity = 0.0;
        this.isInitialized = false;
        
        // LSD-style audio effects
        this.audioDistortion = false;
        this.pitchShifting = false;
        this.reverbIntensity = 0.5;
    }

    async Initialize() {
        console.log('[DreamAudioSystem] Initializing LSD-style adaptive audio');
        
        try {
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create 3D audio listener
            this.listener = new THREE.AudioListener();
            
            // Listen for mood changes
            this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
            this.parent.RegisterEventHandler(this.OnSessionProgress, 'session.progress');
            this.parent.RegisterEventHandler(this.OnDreamEvent, 'dream.event');
            
            // Start ambient soundscape
            await this.StartAmbientSoundscape();
            
            this.isInitialized = true;
            console.log('[DreamAudioSystem] Audio system ready');
            
        } catch (error) {
            console.error('[DreamAudioSystem] Failed to initialize audio:', error);
        }
    }

    async StartAmbientSoundscape() {
        if (!this.audioContext) return;
        
        // Create LSD-style ambient drone
        await this.CreateAmbientDrone();
        
        // Create random audio events
        this.StartRandomAudioEvents();
        
        // Start mood-responsive audio
        this.StartMoodResponsiveAudio();
    }

    async CreateAmbientDrone() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        const reverb = this.CreateReverbNode();
        
        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime); // Low A2
        
        // Configure filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Configure gain
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(reverb);
        reverb.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Store for later control
        this.sounds.set('ambientDrone', {
            oscillator,
            gainNode,
            filter,
            reverb
        });
        
        oscillator.start();
        
        // Add subtle frequency modulation (LSD-style)
        this.AddFrequencyModulation(oscillator);
    }

    CreateReverbNode() {
        const convolver = this.audioContext.createConvolver();
        
        // Create impulse response for reverb
        const length = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }

    AddFrequencyModulation(oscillator) {
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime); // Very slow modulation
        
        lfoGain.gain.setValueAtTime(10, this.audioContext.currentTime); // Small frequency deviation
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        lfo.start();
        
        this.sounds.set('lfo', { lfo, lfoGain });
    }

    StartRandomAudioEvents() {
        // LSD-style random audio events
        setInterval(() => {
            if (this.dreamIntensity > 0.1) { // Lower threshold for testing
                this.TriggerRandomAudioEvent();
            }
        }, 2000 + Math.random() * 3000); // TODO: Revert to 8000-20000ms after testing - temporarily faster for testing
    }

    TriggerRandomAudioEvent() {
        const events = [
            () => this.PlayRandomTone(),
            () => this.PlayGlockenspiel(),
            () => this.PlayBell(),
            () => this.PlayWhisper(),
            () => this.PlayDistortionBurst()
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
    }

    PlayRandomTone() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Random frequency in pentatonic scale
        const frequencies = [220, 247, 277, 330, 370]; // A3, B3, C#4, E4, F#4
        const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);
    }

    PlayGlockenspiel() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 1);
    }

    PlayBell() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(440, this.audioContext.currentTime);
        filter.Q.setValueAtTime(30, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 3);
    }

    PlayWhisper() {
        // Create noise-based whisper effect
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        source.loop = true;
        
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start();
        source.stop(this.audioContext.currentTime + 4);
    }

    PlayDistortionBurst() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const distortion = this.CreateDistortionNode();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        
        oscillator.connect(distortion);
        distortion.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    CreateDistortionNode() {
        const distortion = this.audioContext.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + 20) * x * 20 * (Math.PI / 180)) / (Math.PI + Math.abs(x) * 20);
        }
        
        distortion.curve = curve;
        distortion.oversample = '4x';
        
        return distortion;
    }

    StartMoodResponsiveAudio() {
        setInterval(() => {
            this.UpdateMoodBasedAudio();
        }, 100);
    }

    UpdateMoodBasedAudio() {
        if (!this.isInitialized) return;
        
        const profile = this.audioProfiles[this.currentMood] || this.audioProfiles.static;
        
        // Update ambient drone based on mood
        const ambientDrone = this.sounds.get('ambientDrone');
        if (ambientDrone) {
            // Adjust frequency
            ambientDrone.oscillator.frequency.linearRampToValueAtTime(
                profile.baseFreq * (0.8 + this.dreamIntensity * 0.4),
                this.audioContext.currentTime + 0.1
            );
            
            // Adjust gain based on intensity
            ambientDrone.gainNode.gain.linearRampToValueAtTime(
                0.05 + this.dreamIntensity * 0.1,
                this.audioContext.currentTime + 0.1
            );
            
            // Adjust filter
            ambientDrone.filter.frequency.linearRampToValueAtTime(
                200 + this.dreamIntensity * 300,
                this.audioContext.currentTime + 0.1
            );
        }
    }

    OnMoodChanged = (msg) => {
        this.currentMood = msg.mood;
        console.log('[DreamAudioSystem] Mood changed to:', this.currentMood);
        
        // Trigger mood-specific audio event
        this.TriggerMoodAudioEvent(this.currentMood);
    }

    TriggerMoodAudioEvent(mood) {
        switch (mood) {
            case 'upper':
                this.PlayGlockenspiel();
                break;
            case 'downer':
                this.PlayDistortionBurst();
                break;
            case 'static':
                this.PlayBell();
                break;
            case 'dynamic':
                this.PlayRandomTone();
                break;
        }
    }

    OnSessionProgress = (msg) => {
        this.dreamIntensity = Math.min(msg.timeElapsed / 600, 1.0);
    }

    OnDreamEvent = (msg) => {
        // React to specific dream events
        switch (msg.type) {
            case 'texture_swap':
                this.PlayRandomTone();
                break;
            case 'object_scaling':
                this.PlayBell();
                break;
            case 'lighting_change':
                this.PlayGlockenspiel();
                break;
            case 'floating_objects':
                this.PlayWhisper();
                break;
        }
    }

    Update(deltaTime) {
        // Continuous audio updates
        if (this.isInitialized) {
            this.UpdateMoodBasedAudio();
        }
    }
}
