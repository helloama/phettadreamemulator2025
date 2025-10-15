import Component from "../../Component";
import * as THREE from 'three';

/**
 * DreamLogicEngine - Inspired by LSD Revamped's approach to dream mechanics
 * 
 * Implements non-Euclidean spaces, gravity-defying structures, and dream logic
 * that breaks conventional physics rules.
 */
export default class DreamLogicEngine extends Component {
    constructor() {
        super();
        this.name = 'DreamLogicEngine';
        
        // Dream logic state
        this.dreamIntensity = 0;
        this.currentMood = 'Neutral';
        this.nonEuclideanActive = false;
        this.gravityWarping = false;
        
        // References
        this.scene = null;
        this.player = null;
        this.playerPhysics = null;
        
        // Dream logic parameters
        this.gravityWarpIntensity = 0;
        this.spaceWarpIntensity = 0;
        this.timeWarpIntensity = 0;
        
        // Original physics values (to restore later)
        this.originalGravity = null;
    }

    Initialize() {
        console.log('[DreamLogicEngine] Initializing LSD-style dream logic');
        
        // Get references with delayed initialization
        setTimeout(() => {
            this.DelayedInitialize();
        }, 100);
        
        // Listen for events
        this.parent.RegisterEventHandler(this.OnSessionStart, 'dream.start');
        this.parent.RegisterEventHandler(this.OnSessionEnd, 'dream.end');
        this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
        this.parent.RegisterEventHandler(this.OnDreamIntensityChange, 'dream.intensity');
    }

    DelayedInitialize() {
        this.scene = window.scene;
        this.player = this.FindEntity('Player');
        
        if (this.player) {
            this.playerPhysics = this.player.GetComponent('PlayerPhysics');
        }
        
        if (!this.scene) {
            console.error('[DreamLogicEngine] Scene not found - retrying...');
            setTimeout(() => {
                this.DelayedInitialize();
            }, 500);
            return;
        }
        
        console.log('[DreamLogicEngine] Initialized successfully');
    }

    OnSessionStart = () => {
        console.log('[DreamLogicEngine] Dream session started - activating dream logic');
        this.dreamIntensity = 0;
        this.ActivateDreamLogic();
    }

    OnSessionEnd = () => {
        console.log('[DreamLogicEngine] Dream session ended - deactivating dream logic');
        this.DeactivateDreamLogic();
    }

    OnMoodChanged = (msg) => {
        this.currentMood = msg.mood;
        console.log('[DreamLogicEngine] Mood changed to:', this.currentMood);
        this.UpdateDreamLogicForMood();
    }

    OnDreamIntensityChange = (msg) => {
        this.dreamIntensity = msg.intensity;
        this.UpdateDreamLogicIntensity();
    }

    ActivateDreamLogic() {
        // Start with subtle dream logic effects
        this.StartGravityWarping();
        this.StartNonEuclideanSpaces();
        this.StartTimeWarping();
        this.StartRealityDistortion();
    }

    DeactivateDreamLogic() {
        // Restore normal physics and space
        this.RestoreNormalGravity();
        this.RestoreEuclideanSpace();
        this.RestoreNormalTime();
        this.RestoreNormalReality();
    }

    StartGravityWarping() {
        // LSD-style gravity manipulation
        setInterval(() => {
            if (this.dreamIntensity > 0.3 && Math.random() < 0.1) {
                this.TriggerGravityWarp();
            }
        }, 3000 + Math.random() * 5000); // TODO: Revert to longer intervals after testing
    }

    TriggerGravityWarp() {
        console.log('[DreamLogicEngine] Triggering gravity warp');
        
        // Create temporary gravity wells or anti-gravity zones
        this.CreateGravityWell();
        
        // Apply mood-based gravity effects
        switch (this.currentMood) {
            case 'Upper':
                this.ApplyAntiGravity();
                break;
            case 'Downer':
                this.ApplyHeavyGravity();
                break;
            case 'Dynamic':
                this.ApplyChaoticGravity();
                break;
            case 'Static':
                this.ApplyStabilizedGravity();
                break;
        }
        
        // Broadcast gravity warp event
        this.Broadcast({
            topic: 'dream.event',
            type: 'gravity_warp',
            intensity: this.dreamIntensity,
            mood: this.currentMood
        });
    }

    CreateGravityWell() {
        if (!this.scene) return;
        
        // Create invisible gravity well objects
        const gravityWell = new THREE.Mesh(
            new THREE.SphereGeometry(5, 8, 6),
            new THREE.MeshBasicMaterial({ 
                transparent: true, 
                opacity: 0.1,
                color: 0xff0000 
            })
        );
        
        // Position randomly near player
        const playerPos = this.player?.Position || new THREE.Vector3(0, 0, 0);
        gravityWell.position.set(
            playerPos.x + (Math.random() - 0.5) * 20,
            playerPos.y + Math.random() * 10,
            playerPos.z + (Math.random() - 0.5) * 20
        );
        
        // Mark as gravity well
        gravityWell.userData.isGravityWell = true;
        gravityWell.userData.gravityStrength = 2 + Math.random() * 3;
        gravityWell.userData.gravityDuration = 5000 + Math.random() * 10000;
        
        this.scene.add(gravityWell);
        
        // Remove after duration
        setTimeout(() => {
            this.scene.remove(gravityWell);
            gravityWell.geometry.dispose();
            gravityWell.material.dispose();
        }, gravityWell.userData.gravityDuration);
    }

    ApplyAntiGravity() {
        // Make objects float upward
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isGravityWell) {
                child.userData.antiGravity = true;
                child.userData.originalPosition = child.position.clone();
                
                // Add floating animation
                const floatSpeed = 0.02 + Math.random() * 0.03;
                child.userData.floatSpeed = floatSpeed;
                child.userData.floatOffset = Math.random() * Math.PI * 2;
            }
        });
        
        // Restore after 3-5 seconds
        setTimeout(() => {
            this.RestoreObjectPositions();
        }, 3000 + Math.random() * 2000);
    }

    ApplyHeavyGravity() {
        // Make objects fall faster and compress
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isGravityWell) {
                child.userData.heavyGravity = true;
                child.userData.originalScale = child.scale.clone();
                
                // Compress objects
                child.scale.y *= 0.5;
                child.position.y -= 0.5;
            }
        });
        
        // Restore after 3-5 seconds
        setTimeout(() => {
            this.RestoreObjectScales();
        }, 3000 + Math.random() * 2000);
    }

    ApplyChaoticGravity() {
        // Random gravity directions
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isGravityWell) {
                child.userData.chaoticGravity = true;
                child.userData.gravityDirection = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ).normalize();
            }
        });
        
        // Restore after 2-4 seconds
        setTimeout(() => {
            this.RestoreNormalGravity();
        }, 2000 + Math.random() * 2000);
    }

    ApplyStabilizedGravity() {
        // Lock objects in place
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && !child.userData.isGravityWell) {
                child.userData.stabilized = true;
                child.userData.originalPosition = child.position.clone();
            }
        });
        
        // Restore after 4-6 seconds
        setTimeout(() => {
            this.RestoreObjectPositions();
        }, 4000 + Math.random() * 2000);
    }

    StartNonEuclideanSpaces() {
        // Create impossible spaces and portals
        setInterval(() => {
            if (this.dreamIntensity > 0.5 && Math.random() < 0.05) {
                this.CreateNonEuclideanPortal();
            }
        }, 8000 + Math.random() * 12000); // TODO: Revert to longer intervals after testing
    }

    CreateNonEuclideanPortal() {
        if (!this.scene) return;
        
        console.log('[DreamLogicEngine] Creating non-Euclidean portal');
        
        // Create portal geometry (impossible shapes)
        const portalGeometry = new THREE.TorusKnotGeometry(2, 0.5, 100, 16);
        const portalMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        
        // Position near player
        const playerPos = this.player?.Position || new THREE.Vector3(0, 0, 0);
        portal.position.set(
            playerPos.x + (Math.random() - 0.5) * 15,
            playerPos.y + Math.random() * 5,
            playerPos.z + (Math.random() - 0.5) * 15
        );
        
        // Mark as portal
        portal.userData.isPortal = true;
        portal.userData.portalType = 'nonEuclidean';
        portal.userData.portalDuration = 10000 + Math.random() * 15000;
        
        this.scene.add(portal);
        
        // Animate portal
        portal.userData.rotationSpeed = 0.01 + Math.random() * 0.02;
        
        // Remove after duration
        setTimeout(() => {
            this.scene.remove(portal);
            portal.geometry.dispose();
            portal.material.dispose();
        }, portal.userData.portalDuration);
        
        // Broadcast portal creation
        this.Broadcast({
            topic: 'dream.event',
            type: 'non_euclidean_portal',
            intensity: this.dreamIntensity,
            mood: this.currentMood
        });
    }

    StartTimeWarping() {
        // Manipulate time flow
        setInterval(() => {
            if (this.dreamIntensity > 0.4 && Math.random() < 0.08) {
                this.TriggerTimeWarp();
            }
        }, 5000 + Math.random() * 8000); // TODO: Revert to longer intervals after testing
    }

    TriggerTimeWarp() {
        console.log('[DreamLogicEngine] Triggering time warp');
        
        // Apply mood-based time effects
        switch (this.currentMood) {
            case 'Dynamic':
                this.ApplyTimeAcceleration();
                break;
            case 'Static':
                this.ApplyTimeSlowdown();
                break;
            case 'Upper':
                this.ApplyTimeReversal();
                break;
            case 'Downer':
                this.ApplyTimeStutter();
                break;
        }
        
        // Broadcast time warp event
        this.Broadcast({
            topic: 'dream.event',
            type: 'time_warp',
            intensity: this.dreamIntensity,
            mood: this.currentMood
        });
    }

    ApplyTimeAcceleration() {
        // Speed up all animations
        this.scene.traverse((child) => {
            if (child.userData.floatSpeed) {
                child.userData.floatSpeed *= 3;
            }
            if (child.userData.rotationSpeed) {
                child.userData.rotationSpeed *= 3;
            }
        });
        
        // Restore after 2-4 seconds
        setTimeout(() => {
            this.RestoreNormalTime();
        }, 2000 + Math.random() * 2000);
    }

    ApplyTimeSlowdown() {
        // Slow down all animations
        this.scene.traverse((child) => {
            if (child.userData.floatSpeed) {
                child.userData.floatSpeed *= 0.3;
            }
            if (child.userData.rotationSpeed) {
                child.userData.rotationSpeed *= 0.3;
            }
        });
        
        // Restore after 3-5 seconds
        setTimeout(() => {
            this.RestoreNormalTime();
        }, 3000 + Math.random() * 2000);
    }

    ApplyTimeReversal() {
        // Reverse animation directions
        this.scene.traverse((child) => {
            if (child.userData.floatSpeed) {
                child.userData.floatSpeed *= -1;
            }
            if (child.userData.rotationSpeed) {
                child.userData.rotationSpeed *= -1;
            }
        });
        
        // Restore after 2-3 seconds
        setTimeout(() => {
            this.RestoreNormalTime();
        }, 2000 + Math.random() * 1000);
    }

    ApplyTimeStutter() {
        // Randomly pause/resume animations
        const stutterInterval = setInterval(() => {
            this.scene.traverse((child) => {
                if (child.userData.floatSpeed) {
                    child.userData.floatSpeed *= Math.random() > 0.5 ? 0 : 1;
                }
            });
        }, 100 + Math.random() * 200);
        
        // Stop stuttering after 2-4 seconds
        setTimeout(() => {
            clearInterval(stutterInterval);
            this.RestoreNormalTime();
        }, 2000 + Math.random() * 2000);
    }

    StartRealityDistortion() {
        // Create impossible geometry and physics violations
        setInterval(() => {
            if (this.dreamIntensity > 0.6 && Math.random() < 0.03) {
                this.TriggerRealityDistortion();
            }
        }, 10000 + Math.random() * 15000); // TODO: Revert to longer intervals after testing
    }

    TriggerRealityDistortion() {
        console.log('[DreamLogicEngine] Triggering reality distortion');
        
        // Create impossible objects
        this.CreateImpossibleGeometry();
        
        // Apply dimensional shifts
        this.ApplyDimensionalShift();
        
        // Broadcast reality distortion
        this.Broadcast({
            topic: 'dream.event',
            type: 'reality_distortion',
            intensity: this.dreamIntensity,
            mood: this.currentMood
        });
    }

    CreateImpossibleGeometry() {
        if (!this.scene) return;
        
        // Create Penrose triangle or other impossible shapes
        const impossibleGeometry = new THREE.BoxGeometry(2, 2, 2);
        const impossibleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
            transparent: true,
            opacity: 0.8,
            wireframe: true
        });
        
        const impossibleObject = new THREE.Mesh(impossibleGeometry, impossibleMaterial);
        
        // Position near player
        const playerPos = this.player?.Position || new THREE.Vector3(0, 0, 0);
        impossibleObject.position.set(
            playerPos.x + (Math.random() - 0.5) * 10,
            playerPos.y + Math.random() * 5,
            playerPos.z + (Math.random() - 0.5) * 10
        );
        
        // Mark as impossible object
        impossibleObject.userData.isImpossible = true;
        impossibleObject.userData.impossibleDuration = 8000 + Math.random() * 12000;
        
        // Add impossible rotation
        impossibleObject.userData.impossibleRotation = {
            x: 0.01 + Math.random() * 0.02,
            y: 0.01 + Math.random() * 0.02,
            z: 0.01 + Math.random() * 0.02
        };
        
        this.scene.add(impossibleObject);
        
        // Remove after duration
        setTimeout(() => {
            this.scene.remove(impossibleObject);
            impossibleObject.geometry.dispose();
            impossibleObject.material.dispose();
        }, impossibleObject.userData.impossibleDuration);
    }

    ApplyDimensionalShift() {
        // Temporarily change camera perspective or object dimensions
        const camera = this.player?.GetComponent('PlayerControls')?.camera;
        if (camera) {
            // Slight perspective shift
            camera.fov = 75 + (Math.random() - 0.5) * 20;
            camera.updateProjectionMatrix();
            
            // Restore after 2-3 seconds
            setTimeout(() => {
                camera.fov = 75;
                camera.updateProjectionMatrix();
            }, 2000 + Math.random() * 1000);
        }
    }

    UpdateDreamLogicIntensity() {
        // Update dream logic based on current intensity
        this.gravityWarpIntensity = this.dreamIntensity * 0.8;
        this.spaceWarpIntensity = this.dreamIntensity * 0.6;
        this.timeWarpIntensity = this.dreamIntensity * 0.4;
    }

    UpdateDreamLogicForMood() {
        // Adjust dream logic parameters based on mood
        switch (this.currentMood) {
            case 'Upper':
                this.gravityWarpIntensity *= 1.2;
                this.spaceWarpIntensity *= 0.8;
                break;
            case 'Downer':
                this.gravityWarpIntensity *= 1.5;
                this.timeWarpIntensity *= 1.3;
                break;
            case 'Dynamic':
                this.spaceWarpIntensity *= 1.3;
                this.timeWarpIntensity *= 1.2;
                break;
            case 'Static':
                this.gravityWarpIntensity *= 0.7;
                this.spaceWarpIntensity *= 0.6;
                this.timeWarpIntensity *= 1.4;
                break;
        }
    }

    Update(deltaTime) {
        // Update dream logic animations
        if (this.scene) {
            this.scene.traverse((child) => {
                // Update floating objects
                if (child.userData.antiGravity && child.userData.floatSpeed) {
                    child.position.y += child.userData.floatSpeed;
                    child.rotation.y += child.userData.floatOffset * deltaTime;
                }
                
                // Update portals
                if (child.userData.isPortal && child.userData.rotationSpeed) {
                    child.rotation.x += child.userData.rotationSpeed;
                    child.rotation.y += child.userData.rotationSpeed * 0.7;
                    child.rotation.z += child.userData.rotationSpeed * 0.3;
                }
                
                // Update impossible objects
                if (child.userData.isImpossible && child.userData.impossibleRotation) {
                    child.rotation.x += child.userData.impossibleRotation.x;
                    child.rotation.y += child.userData.impossibleRotation.y;
                    child.rotation.z += child.userData.impossibleRotation.z;
                }
            });
        }
    }

    // Restoration methods
    RestoreNormalGravity() {
        this.scene?.traverse((child) => {
            delete child.userData.chaoticGravity;
            delete child.userData.heavyGravity;
            delete child.userData.antiGravity;
            delete child.userData.stabilized;
        });
    }

    RestoreObjectPositions() {
        this.scene?.traverse((child) => {
            if (child.userData.originalPosition) {
                child.position.copy(child.userData.originalPosition);
                delete child.userData.originalPosition;
            }
        });
    }

    RestoreObjectScales() {
        this.scene?.traverse((child) => {
            if (child.userData.originalScale) {
                child.scale.copy(child.userData.originalScale);
                delete child.userData.originalScale;
            }
        });
    }

    RestoreNormalTime() {
        this.scene?.traverse((child) => {
            if (child.userData.floatSpeed && Math.abs(child.userData.floatSpeed) !== 0.02) {
                child.userData.floatSpeed = child.userData.floatSpeed > 0 ? 0.02 : -0.02;
            }
            if (child.userData.rotationSpeed && Math.abs(child.userData.rotationSpeed) !== 0.01) {
                child.userData.rotationSpeed = child.userData.rotationSpeed > 0 ? 0.01 : -0.01;
            }
        });
    }

    RestoreEuclideanSpace() {
        // Remove all non-Euclidean objects
        const objectsToRemove = [];
        this.scene?.traverse((child) => {
            if (child.userData.isPortal || child.userData.isImpossible) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }

    RestoreNormalReality() {
        // Reset any reality distortions
        const camera = this.player?.GetComponent('PlayerControls')?.camera;
        if (camera) {
            camera.fov = 75;
            camera.updateProjectionMatrix();
        }
    }
}
