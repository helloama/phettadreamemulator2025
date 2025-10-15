import Component from "../../Component";
import * as THREE from 'three';

export default class DreamEnvironmentModifier extends Component {
    constructor() {
        super();
        this.name = 'DreamEnvironmentModifier';
        
        // Dream state tracking
        this.dreamIntensity = 0.0; // 0 = normal, 1 = fully surreal
        this.currentMood = 'neutral'; // upper, downer, static, dynamic
        this.timeInSession = 0;
        
        // Visual effects
        this.postProcessingEnabled = false;
        this.colorShiftEnabled = false;
        this.geometryDistortionEnabled = false;
        
        // LSD-style effects
        this.textureSwapping = false;
        this.objectScaling = false;
        this.ambientEvents = [];
        
        // Scene references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.originalMaterials = new Map();
        this.originalTextures = new Map();
    }

    Initialize() {
        console.log('[DreamEnvironmentModifier] Initializing LSD-style dream effects');
        
        // Delay initialization to ensure scene is set up
        setTimeout(() => {
            this.DelayedInitialize();
        }, 100);
    }

    DelayedInitialize() {
        // Get scene references - use global references since we're in a Three.js app
        this.scene = window.scene;
        this.camera = window.camera;
        this.renderer = window.renderer;
        
        if (!this.scene) {
            console.error('[DreamEnvironmentModifier] Scene not found - retrying...');
            // Retry after another delay
            setTimeout(() => {
                this.DelayedInitialize();
            }, 500);
            return;
        }

        // Listen for mood changes and session events
        this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
        this.parent.RegisterEventHandler(this.OnSessionProgress, 'session.progress');
        this.parent.RegisterEventHandler(this.OnNewSession, 'session.new');
        
        // Start with subtle effects
        this.ApplyInitialDreamEffects();
    }

    OnMoodChanged = (msg) => {
        this.currentMood = msg.mood;
        console.log('[DreamEnvironmentModifier] Mood changed to:', this.currentMood);
        this.UpdateEnvironmentBasedOnMood();
    }

    OnSessionProgress = (msg) => {
        this.timeInSession = msg.timeElapsed;
        // TODO: Revert to 600 seconds (10 minutes) after testing
        this.dreamIntensity = Math.min(msg.timeElapsed / 60, 1.0); // Temporarily ramp up over 60 seconds (1 minute) for testing
        
        console.log('[DreamEnvironmentModifier] Dream intensity:', this.dreamIntensity.toFixed(2));
        this.UpdateDreamIntensity();
    }

    OnNewSession = () => {
        console.log('[DreamEnvironmentModifier] New session started - resetting effects');
        // Reset dream intensity for new session
        this.dreamIntensity = 0;
        this.timeInSession = 0;
        
        // Restore original materials
        this.RestoreOriginalMaterials();
        
        // Clear any active floating objects
        this.ClearFloatingObjects();
    }

    ApplyInitialDreamEffects() {
        // Start with subtle LSD-style effects
        this.EnableColorShifting();
        this.EnableTextureSwapping();
        this.StartAmbientEvents();
    }

    EnableColorShifting() {
        // Apply subtle color shifts to all materials
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                // Store original material for restoration
                this.originalMaterials.set(child.uuid, child.material.clone());
                
                // Apply initial dream-like color tint
                this.ApplyDreamColorShift(child, this.currentMood);
            }
        });
    }

    ApplyDreamColorShift(mesh, mood) {
        if (!mesh.material) return;
        
        const intensity = this.dreamIntensity * 0.3; // Subtle effect
        
        switch (mood) {
            case 'upper':
                // Bright, warm colors
                mesh.material.color.lerp(new THREE.Color(0xffd700), intensity);
                break;
            case 'downer':
                // Dark, cool colors
                mesh.material.color.lerp(new THREE.Color(0x2c1810), intensity);
                break;
            case 'static':
                // Muted, desaturated colors
                mesh.material.color.lerp(new THREE.Color(0x808080), intensity);
                break;
            case 'dynamic':
                // Vibrant, saturated colors
                mesh.material.color.lerp(new THREE.Color(0xff1493), intensity);
                break;
            default:
                // Subtle psychedelic tint
                mesh.material.color.lerp(new THREE.Color(0x9370db), intensity * 0.5);
        }
    }

    EnableTextureSwapping() {
        // LSD-style random texture swapping on objects
        setInterval(() => {
            if (this.dreamIntensity > 0.1) { // Lower threshold for testing
                this.PerformRandomTextureSwap();
            }
        }, 1000 + Math.random() * 2000); // TODO: Revert to 5000-15000ms after testing - temporarily faster for testing
    }

    PerformRandomTextureSwap() {
        const objects = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material && Math.random() < 0.1) {
                objects.push(child);
            }
        });

        // Swap materials between random objects
        if (objects.length >= 2) {
            const obj1 = objects[Math.floor(Math.random() * objects.length)];
            const obj2 = objects[Math.floor(Math.random() * objects.length)];
            
            if (obj1 !== obj2) {
                const tempMaterial = obj1.material;
                obj1.material = obj2.material;
                obj2.material = tempMaterial;
                
                // Broadcast texture swap event
                this.Broadcast({
                    topic: 'dream.event',
                    type: 'texture_swap',
                    intensity: this.dreamIntensity
                });
                
                // Restore after short time
                setTimeout(() => {
                    obj1.material = this.originalMaterials.get(obj1.uuid) || obj1.material;
                    obj2.material = this.originalMaterials.get(obj2.uuid) || obj2.material;
                }, 2000 + Math.random() * 3000);
            }
        }
    }

    StartAmbientEvents() {
        // LSD-style ambient events
        setInterval(() => {
            if (this.dreamIntensity > 0.1) { // Lower threshold for testing
                this.TriggerAmbientEvent();
            }
        }, 2000 + Math.random() * 3000); // TODO: Revert to 8000-23000ms after testing - temporarily faster for testing
    }

    TriggerAmbientEvent() {
        const events = [
            () => this.ScaleObjectsRandomly(),
            () => this.RotateObjectsUnexpectedly(),
            () => this.ChangeLightingTemporarily(),
            () => this.CreateFloatingObjects()
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
    }

    ScaleObjectsRandomly() {
        const objects = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && Math.random() < 0.15) {
                objects.push(child);
            }
        });

        if (objects.length > 0) {
            // Broadcast object scaling event
            this.Broadcast({
                topic: 'dream.event',
                type: 'object_scaling',
                intensity: this.dreamIntensity,
                objectCount: objects.length
            });
        }

        objects.forEach(obj => {
            const originalScale = obj.scale.clone();
            const randomScale = 0.5 + Math.random() * 2.0;
            obj.scale.setScalar(randomScale);
            
            setTimeout(() => {
                obj.scale.copy(originalScale);
            }, 3000 + Math.random() * 2000);
        });
    }

    RotateObjectsUnexpectedly() {
        const objects = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && Math.random() < 0.1) {
                objects.push(child);
            }
        });

        objects.forEach(obj => {
            const originalRotation = obj.rotation.clone();
            obj.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            setTimeout(() => {
                obj.rotation.copy(originalRotation);
            }, 4000 + Math.random() * 3000);
        });
    }

    ChangeLightingTemporarily() {
        const lights = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.Light) {
                lights.push(child);
            }
        });

        if (lights.length > 0) {
            // Broadcast lighting change event
            this.Broadcast({
                topic: 'dream.event',
                type: 'lighting_change',
                intensity: this.dreamIntensity,
                lightCount: lights.length
            });
        }

        lights.forEach(light => {
            const originalIntensity = light.intensity;
            const originalColor = light.color.clone();
            
            // LSD-style lighting changes
            light.intensity *= (0.3 + Math.random() * 1.4);
            light.color.setHex(Math.random() * 0xffffff);
            
            setTimeout(() => {
                light.intensity = originalIntensity;
                light.color.copy(originalColor);
            }, 5000 + Math.random() * 5000);
        });
    }

    CreateFloatingObjects() {
        // Create temporary floating geometric shapes (LSD-style)
        const geometries = [
            new THREE.BoxGeometry(0.5, 0.5, 0.5),
            new THREE.SphereGeometry(0.3, 8, 6),
            new THREE.ConeGeometry(0.4, 1, 6)
        ];
        
        const materials = [
            new THREE.MeshBasicMaterial({ color: 0xff1493, transparent: true, opacity: 0.7 }),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.7 }),
            new THREE.MeshBasicMaterial({ color: 0x0080ff, transparent: true, opacity: 0.7 })
        ];

        const objectCount = 3 + Math.random() * 3;
        
        // Broadcast floating objects event
        this.Broadcast({
            topic: 'dream.event',
            type: 'floating_objects',
            intensity: this.dreamIntensity,
            objectCount: objectCount
        });

        for (let i = 0; i < objectCount; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = materials[Math.floor(Math.random() * materials.length)];
            const mesh = new THREE.Mesh(geometry, material);
            
            // Position randomly around player
            mesh.position.set(
                (Math.random() - 0.5) * 20,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 20
            );
            
            // Add floating animation
            mesh.userData.floatOffset = Math.random() * Math.PI * 2;
            mesh.userData.floatSpeed = 0.02 + Math.random() * 0.03;
            
            this.scene.add(mesh);
            
            // Remove after time
            setTimeout(() => {
                this.scene.remove(mesh);
                geometry.dispose();
                material.dispose();
            }, 8000 + Math.random() * 12000);
        }
    }

    UpdateEnvironmentBasedOnMood() {
        // Update all materials based on current mood
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                this.ApplyDreamColorShift(child, this.currentMood);
            }
        });
    }

    UpdateDreamIntensity() {
        // Gradually increase surreal effects over time
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
                this.ApplyDreamColorShift(child, this.currentMood);
            }
            
            // Animate floating objects
            if (child.userData.floatOffset !== undefined) {
                child.position.y += Math.sin(Date.now() * child.userData.floatSpeed + child.userData.floatOffset) * 0.01;
            }
        });
    }

    Update(deltaTime) {
        // Update floating animations only if scene is available
        if (this.scene) {
            this.scene.traverse((child) => {
                if (child.userData.floatOffset !== undefined) {
                    child.position.y += Math.sin(Date.now() * child.userData.floatSpeed + child.userData.floatOffset) * 0.01;
                    child.rotation.y += deltaTime * 0.001;
                }
            });
        }
    }
    
    RestoreOriginalMaterials() {
        if (!this.scene) return;
        
        // Restore all materials to their original state
        this.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && this.originalMaterials.has(child.uuid)) {
                child.material = this.originalMaterials.get(child.uuid);
            }
        });
        
        console.log('[DreamEnvironmentModifier] Original materials restored');
    }
    
    ClearFloatingObjects() {
        if (!this.scene) return;
        
        // Remove all floating objects (objects with floatOffset userData)
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.userData.floatOffset !== undefined) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            // Dispose of geometry and material to prevent memory leaks
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        
        if (objectsToRemove.length > 0) {
            console.log('[DreamEnvironmentModifier] Cleared', objectsToRemove.length, 'floating objects');
        }
    }
}
