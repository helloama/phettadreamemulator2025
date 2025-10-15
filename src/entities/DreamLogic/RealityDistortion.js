import Component from "../../Component";
import * as THREE from 'three';

/**
 * RealityDistortion - Inspired by LSD Revamped's reality-breaking effects
 * 
 * Creates impossible spaces, dimensional shifts, and physics violations
 * that make the dream world feel truly surreal and otherworldly.
 */
export default class RealityDistortion extends Component {
    constructor() {
        super();
        this.name = 'RealityDistortion';
        
        // Distortion state
        this.distortionIntensity = 0;
        this.activeDistortions = new Set();
        this.distortionHistory = [];
        
        // References
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Distortion types
        this.distortionTypes = [
            'perspective_shift',
            'dimensional_fold',
            'recursive_space',
            'impossible_geometry',
            'gravity_inversion',
            'temporal_loop',
            'matter_phasing',
            'scale_paradox'
        ];
        
        // Distortion parameters
        this.maxConcurrentDistortions = 3;
        this.distortionCooldown = 5000; // 5 seconds between distortions
        this.lastDistortionTime = 0;
    }

    Initialize() {
        console.log('[RealityDistortion] Initializing LSD-style reality distortion system');
        
        // Delayed initialization
        setTimeout(() => {
            this.DelayedInitialize();
        }, 100);
        
        // Listen for events
        this.parent.RegisterEventHandler(this.OnDreamIntensityChange, 'dream.intensity');
        this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
        this.parent.RegisterEventHandler(this.OnSessionStart, 'dream.start');
        this.parent.RegisterEventHandler(this.OnSessionEnd, 'dream.end');
    }

    DelayedInitialize() {
        this.scene = window.scene;
        this.camera = window.camera;
        this.renderer = window.renderer;
        
        if (!this.scene || !this.camera) {
            console.error('[RealityDistortion] Missing scene/camera - retrying...');
            setTimeout(() => {
                this.DelayedInitialize();
            }, 500);
            return;
        }
        
        console.log('[RealityDistortion] Initialized successfully');
    }

    OnDreamIntensityChange = (msg) => {
        this.distortionIntensity = msg.intensity;
        this.UpdateDistortionFrequency();
    }

    OnMoodChanged = (msg) => {
        this.currentMood = msg.mood;
        this.AdjustDistortionsForMood();
    }

    OnSessionStart = () => {
        console.log('[RealityDistortion] Dream session started');
        this.StartRealityDistortions();
    }

    OnSessionEnd = () => {
        console.log('[RealityDistortion] Dream session ended');
        this.StopAllDistortions();
    }

    UpdateDistortionFrequency() {
        // Adjust distortion frequency based on intensity
        const baseInterval = 10000; // 10 seconds base
        const intensityFactor = 1 - this.distortionIntensity; // Higher intensity = more frequent
        const adjustedInterval = baseInterval * intensityFactor;
        
        // TODO: Revert to longer intervals after testing
        const testingInterval = Math.max(2000, adjustedInterval * 0.1); // Much faster for testing
        
        // Clear existing interval and set new one
        if (this.distortionInterval) {
            clearInterval(this.distortionInterval);
        }
        
        this.distortionInterval = setInterval(() => {
            if (this.activeDistortions.size < this.maxConcurrentDistortions) {
                this.TriggerRandomDistortion();
            }
        }, testingInterval);
    }

    StartRealityDistortions() {
        console.log('[RealityDistortion] Starting reality distortion system');
        this.UpdateDistortionFrequency();
    }

    StopAllDistortions() {
        console.log('[RealityDistortion] Stopping all reality distortions');
        
        if (this.distortionInterval) {
            clearInterval(this.distortionInterval);
        }
        
        // Clear all active distortions
        this.activeDistortions.forEach(distortionType => {
            this.EndDistortion(distortionType);
        });
        
        this.activeDistortions.clear();
    }

    TriggerRandomDistortion() {
        const currentTime = Date.now();
        
        // Check cooldown
        if (currentTime - this.lastDistortionTime < this.distortionCooldown) {
            return;
        }
        
        // Select random distortion type
        const availableDistortions = this.distortionTypes.filter(type => 
            !this.activeDistortions.has(type)
        );
        
        if (availableDistortions.length === 0) {
            return;
        }
        
        const distortionType = availableDistortions[
            Math.floor(Math.random() * availableDistortions.length)
        ];
        
        console.log('[RealityDistortion] Triggering distortion:', distortionType);
        
        this.StartDistortion(distortionType);
        this.lastDistortionTime = currentTime;
        
        // Record in history
        this.distortionHistory.push({
            type: distortionType,
            timestamp: currentTime,
            intensity: this.distortionIntensity,
            mood: this.currentMood
        });
        
        // Keep only last 20 distortions
        if (this.distortionHistory.length > 20) {
            this.distortionHistory.shift();
        }
    }

    StartDistortion(distortionType) {
        this.activeDistortions.add(distortionType);
        
        switch (distortionType) {
            case 'perspective_shift':
                this.StartPerspectiveShift();
                break;
            case 'dimensional_fold':
                this.StartDimensionalFold();
                break;
            case 'recursive_space':
                this.StartRecursiveSpace();
                break;
            case 'impossible_geometry':
                this.StartImpossibleGeometry();
                break;
            case 'gravity_inversion':
                this.StartGravityInversion();
                break;
            case 'temporal_loop':
                this.StartTemporalLoop();
                break;
            case 'matter_phasing':
                this.StartMatterPhasing();
                break;
            case 'scale_paradox':
                this.StartScaleParadox();
                break;
        }
        
        // Broadcast distortion event
        this.Broadcast({
            topic: 'dream.event',
            type: 'reality_distortion',
            distortionType: distortionType,
            intensity: this.distortionIntensity,
            mood: this.currentMood
        });
    }

    EndDistortion(distortionType) {
        console.log('[RealityDistortion] Ending distortion:', distortionType);
        
        switch (distortionType) {
            case 'perspective_shift':
                this.EndPerspectiveShift();
                break;
            case 'dimensional_fold':
                this.EndDimensionalFold();
                break;
            case 'recursive_space':
                this.EndRecursiveSpace();
                break;
            case 'impossible_geometry':
                this.EndImpossibleGeometry();
                break;
            case 'gravity_inversion':
                this.EndGravityInversion();
                break;
            case 'temporal_loop':
                this.EndTemporalLoop();
                break;
            case 'matter_phasing':
                this.EndMatterPhasing();
                break;
            case 'scale_paradoX':
                this.EndScaleParadox();
                break;
        }
    }

    StartPerspectiveShift() {
        // Temporarily change camera FOV and perspective
        const originalFOV = this.camera.fov;
        const shiftIntensity = 0.3 + this.distortionIntensity * 0.7;
        
        // Apply perspective distortion
        this.camera.fov = originalFOV + (Math.random() - 0.5) * 40 * shiftIntensity;
        this.camera.updateProjectionMatrix();
        
        // Add slight camera rotation
        this.camera.rotation.z += (Math.random() - 0.5) * 0.1 * shiftIntensity;
        
        // Store original values for restoration
        this.perspectiveShiftData = {
            originalFOV: originalFOV,
            originalRotation: this.camera.rotation.z,
            duration: 3000 + Math.random() * 4000
        };
        
        // Auto-end after duration
        setTimeout(() => {
            this.EndDistortion('perspective_shift');
        }, this.perspectiveShiftData.duration);
    }

    EndPerspectiveShift() {
        if (this.perspectiveShiftData) {
            this.camera.fov = this.perspectiveShiftData.originalFOV;
            this.camera.rotation.z = this.perspectiveShiftData.originalRotation;
            this.camera.updateProjectionMatrix();
            delete this.perspectiveShiftData;
        }
        
        this.activeDistortions.delete('perspective_shift');
    }

    StartDimensionalFold() {
        // Create objects that appear to fold through space
        const foldGeometry = new THREE.PlaneGeometry(10, 10);
        const foldMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const dimensionalFold = new THREE.Mesh(foldGeometry, foldMaterial);
        
        // Position near camera
        const cameraPos = this.camera.position;
        dimensionalFold.position.set(
            cameraPos.x + (Math.random() - 0.5) * 5,
            cameraPos.y + (Math.random() - 0.5) * 5,
            cameraPos.z + (Math.random() - 0.5) * 5
        );
        
        // Mark as dimensional fold
        dimensionalFold.userData.isDimensionalFold = true;
        dimensionalFold.userData.foldDuration = 4000 + Math.random() * 6000;
        dimensionalFold.userData.foldSpeed = 0.02 + Math.random() * 0.03;
        
        this.scene.add(dimensionalFold);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.EndDistortion('dimensional_fold');
        }, dimensionalFold.userData.foldDuration);
        
        this.dimensionalFold = dimensionalFold;
    }

    EndDimensionalFold() {
        if (this.dimensionalFold) {
            this.scene.remove(this.dimensionalFold);
            this.dimensionalFold.geometry.dispose();
            this.dimensionalFold.material.dispose();
            this.dimensionalFold = null;
        }
        
        this.activeDistortions.delete('dimensional_fold');
    }

    StartRecursiveSpace() {
        // Create recursive/mirror-like spaces
        const recursiveGeometry = new THREE.BoxGeometry(1, 1, 1);
        const recursiveMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });
        
        const recursiveSpace = new THREE.Group();
        
        // Create multiple nested boxes
        for (let i = 0; i < 5; i++) {
            const box = new THREE.Mesh(recursiveGeometry, recursiveMaterial);
            const scale = 1 - (i * 0.15);
            box.scale.setScalar(scale);
            box.userData.recursiveIndex = i;
            box.userData.recursiveSpeed = 0.01 + Math.random() * 0.02;
            recursiveSpace.add(box);
        }
        
        // Position near player
        const playerPos = this.FindEntity('Player')?.Position || new THREE.Vector3(0, 0, 0);
        recursiveSpace.position.set(
            playerPos.x + (Math.random() - 0.5) * 8,
            playerPos.y + Math.random() * 3,
            playerPos.z + (Math.random() - 0.5) * 8
        );
        
        recursiveSpace.userData.isRecursiveSpace = true;
        recursiveSpace.userData.recursiveDuration = 5000 + Math.random() * 7000;
        
        this.scene.add(recursiveSpace);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.EndDistortion('recursive_space');
        }, recursiveSpace.userData.recursiveDuration);
        
        this.recursiveSpace = recursiveSpace;
    }

    EndRecursiveSpace() {
        if (this.recursiveSpace) {
            this.scene.remove(this.recursiveSpace);
            this.recursiveSpace.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
            this.recursiveSpace = null;
        }
        
        this.activeDistortions.delete('recursive_space');
    }

    StartImpossibleGeometry() {
        // Create Penrose triangle or other impossible shapes
        const impossibleGeometry = new THREE.ConeGeometry(1, 2, 8);
        const impossibleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
            transparent: true,
            opacity: 0.8
        });
        
        const impossibleObject = new THREE.Mesh(impossibleGeometry, impossibleMaterial);
        
        // Position near player
        const playerPos = this.FindEntity('Player')?.Position || new THREE.Vector3(0, 0, 0);
        impossibleObject.position.set(
            playerPos.x + (Math.random() - 0.5) * 6,
            playerPos.y + Math.random() * 2,
            playerPos.z + (Math.random() - 0.5) * 6
        );
        
        // Add impossible transformations
        impossibleObject.userData.isImpossible = true;
        impossibleObject.userData.impossibleDuration = 6000 + Math.random() * 8000;
        impossibleObject.userData.impossibleRotation = {
            x: 0.01 + Math.random() * 0.02,
            y: 0.01 + Math.random() * 0.02,
            z: 0.01 + Math.random() * 0.02
        };
        
        this.scene.add(impossibleObject);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.EndDistortion('impossible_geometry');
        }, impossibleObject.userData.impossibleDuration);
        
        this.impossibleObject = impossibleObject;
    }

    EndImpossibleGeometry() {
        if (this.impossibleObject) {
            this.scene.remove(this.impossibleObject);
            this.impossibleObject.geometry.dispose();
            this.impossibleObject.material.dispose();
            this.impossibleObject = null;
        }
        
        this.activeDistortions.delete('impossible_geometry');
    }

    StartGravityInversion() {
        // Temporarily invert gravity for all objects
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isDimensionalFold) {
                child.userData.gravityInverted = true;
                child.userData.originalPosition = child.position.clone();
            }
        });
        
        // Auto-end after duration
        const duration = 4000 + Math.random() * 6000;
        setTimeout(() => {
            this.EndDistortion('gravity_inversion');
        }, duration);
        
        this.gravityInversionDuration = duration;
    }

    EndGravityInversion() {
        this.scene.traverse((child) => {
            if (child.userData.gravityInverted) {
                delete child.userData.gravityInverted;
                if (child.userData.originalPosition) {
                    child.position.copy(child.userData.originalPosition);
                    delete child.userData.originalPosition;
                }
            }
        });
        
        delete this.gravityInversionDuration;
        this.activeDistortions.delete('gravity_inversion');
    }

    StartTemporalLoop() {
        // Create objects that appear to loop through time
        const loopGeometry = new THREE.SphereGeometry(0.5, 8, 6);
        const loopMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.7
        });
        
        const temporalLoop = new THREE.Mesh(loopGeometry, loopMaterial);
        
        // Position near player
        const playerPos = this.FindEntity('Player')?.Position || new THREE.Vector3(0, 0, 0);
        temporalLoop.position.set(
            playerPos.x + (Math.random() - 0.5) * 4,
            playerPos.y + Math.random() * 2,
            playerPos.z + (Math.random() - 0.5) * 4
        );
        
        temporalLoop.userData.isTemporalLoop = true;
        temporalLoop.userData.loopDuration = 8000 + Math.random() * 10000;
        temporalLoop.userData.loopSpeed = 0.03 + Math.random() * 0.04;
        temporalLoop.userData.loopPhase = 0;
        
        this.scene.add(temporalLoop);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.EndDistortion('temporal_loop');
        }, temporalLoop.userData.loopDuration);
        
        this.temporalLoop = temporalLoop;
    }

    EndTemporalLoop() {
        if (this.temporalLoop) {
            this.scene.remove(this.temporalLoop);
            this.temporalLoop.geometry.dispose();
            this.temporalLoop.material.dispose();
            this.temporalLoop = null;
        }
        
        this.activeDistortions.delete('temporal_loop');
    }

    StartMatterPhasing() {
        // Make objects phase in and out of existence
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && !child.userData.isDimensionalFold) {
                child.userData.matterPhasing = true;
                child.userData.originalOpacity = child.material.opacity || 1;
                child.userData.phaseSpeed = 0.02 + Math.random() * 0.03;
                child.userData.phaseOffset = Math.random() * Math.PI * 2;
            }
        });
        
        // Auto-end after duration
        const duration = 5000 + Math.random() * 7000;
        setTimeout(() => {
            this.EndDistortion('matter_phasing');
        }, duration);
        
        this.matterPhasingDuration = duration;
    }

    EndMatterPhasing() {
        this.scene.traverse((child) => {
            if (child.userData.matterPhasing) {
                if (child.material && child.userData.originalOpacity !== undefined) {
                    child.material.opacity = child.userData.originalOpacity;
                    child.material.transparent = false;
                }
                delete child.userData.matterPhasing;
                delete child.userData.originalOpacity;
                delete child.userData.phaseSpeed;
                delete child.userData.phaseOffset;
            }
        });
        
        delete this.matterPhasingDuration;
        this.activeDistortions.delete('matter_phasing');
    }

    StartScaleParadox() {
        // Create objects that scale impossibly
        const paradoxGeometry = new THREE.BoxGeometry(1, 1, 1);
        const paradoxMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.6
        });
        
        const scaleParadox = new THREE.Mesh(paradoxGeometry, paradoxMaterial);
        
        // Position near player
        const playerPos = this.FindEntity('Player')?.Position || new THREE.Vector3(0, 0, 0);
        scaleParadox.position.set(
            playerPos.x + (Math.random() - 0.5) * 5,
            playerPos.y + Math.random() * 2,
            playerPos.z + (Math.random() - 0.5) * 5
        );
        
        scaleParadox.userData.isScaleParadox = true;
        scaleParadox.userData.paradoxDuration = 6000 + Math.random() * 8000;
        scaleParadox.userData.paradoxSpeed = 0.02 + Math.random() * 0.03;
        scaleParadox.userData.paradoxPhase = 0;
        scaleParadox.userData.originalScale = scaleParadox.scale.clone();
        
        this.scene.add(scaleParadox);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.EndDistortion('scale_paradoX');
        }, scaleParadox.userData.paradoxDuration);
        
        this.scaleParadox = scaleParadox;
    }

    EndScaleParadox() {
        if (this.scaleParadox) {
            this.scene.remove(this.scaleParadox);
            this.scaleParadox.geometry.dispose();
            this.scaleParadox.material.dispose();
            this.scaleParadox = null;
        }
        
        this.activeDistortions.delete('scale_paradoX');
    }

    AdjustDistortionsForMood() {
        // Adjust distortion behavior based on current mood
        switch (this.currentMood) {
            case 'Upper':
                // More colorful, uplifting distortions
                this.maxConcurrentDistortions = 4;
                break;
            case 'Downer':
                // Darker, more unsettling distortions
                this.maxConcurrentDistortions = 2;
                break;
            case 'Dynamic':
                // Faster, more chaotic distortions
                this.distortionCooldown = 3000;
                break;
            case 'Static':
                // Slower, more stable distortions
                this.distortionCooldown = 8000;
                break;
        }
    }

    Update(deltaTime) {
        // Update active distortions
        if (this.dimensionalFold) {
            // Animate dimensional fold
            this.dimensionalFold.rotation.x += this.dimensionalFold.userData.foldSpeed;
            this.dimensionalFold.rotation.y += this.dimensionalFold.userData.foldSpeed * 0.7;
            this.dimensionalFold.position.y += Math.sin(Date.now() * 0.001) * 0.01;
        }
        
        if (this.recursiveSpace) {
            // Animate recursive space
            this.recursiveSpace.children.forEach((box, index) => {
                box.rotation.x += box.userData.recursiveSpeed;
                box.rotation.y += box.userData.recursiveSpeed * 0.5;
                const scale = 1 - (index * 0.15) + Math.sin(Date.now() * 0.002 + index) * 0.1;
                box.scale.setScalar(scale);
            });
        }
        
        if (this.impossibleObject) {
            // Animate impossible geometry
            this.impossibleObject.rotation.x += this.impossibleObject.userData.impossibleRotation.x;
            this.impossibleObject.rotation.y += this.impossibleObject.userData.impossibleRotation.y;
            this.impossibleObject.rotation.z += this.impossibleObject.userData.impossibleRotation.z;
        }
        
        if (this.temporalLoop) {
            // Animate temporal loop
            this.temporalLoop.userData.loopPhase += this.temporalLoop.userData.loopSpeed;
            this.temporalLoop.position.y += Math.sin(this.temporalLoop.userData.loopPhase) * 0.02;
            this.temporalLoop.scale.setScalar(1 + Math.sin(this.temporalLoop.userData.loopPhase * 2) * 0.3);
        }
        
        if (this.scaleParadox) {
            // Animate scale paradox
            this.scaleParadox.userData.paradoxPhase += this.scaleParadox.userData.paradoxSpeed;
            const scale = 1 + Math.sin(this.scaleParadox.userData.paradoxPhase) * 2;
            this.scaleParadox.scale.setScalar(Math.abs(scale));
        }
        
        // Update gravity inversion
        if (this.gravityInversionDuration) {
            this.scene.traverse((child) => {
                if (child.userData.gravityInverted) {
                    child.position.y -= 0.02; // Objects fall upward
                }
            });
        }
        
        // Update matter phasing
        if (this.matterPhasingDuration) {
            this.scene.traverse((child) => {
                if (child.userData.matterPhasing && child.material) {
                    const phase = Date.now() * child.userData.phaseSpeed + child.userData.phaseOffset;
                    child.material.opacity = Math.abs(Math.sin(phase)) * child.userData.originalOpacity;
                    child.material.transparent = true;
                }
            });
        }
    }
}
