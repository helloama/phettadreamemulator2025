import Component from "../../Component";
import * as THREE from 'three';

/**
 * VRMAvatarSystem - Three.js VRM avatar support for Phettaverse characters
 * 
 * Handles loading, animating, and managing VRM avatars for:
 * - Phetta (Creator/Preserver)
 * - TV Man (The Witness/Archivist) 
 * - Pink Rat (Liberator/Destroyer/Shakti)
 * - Business Frog, Yoki Karaoke Robot, etc.
 */
export default class VRMAvatarSystem extends Component {
    constructor() {
        super();
        this.name = 'VRMAvatarSystem';
        
        // VRM avatar management
        this.avatars = new Map(); // Store loaded avatars
        this.avatarInstances = new Map(); // Store scene instances
        this.avatarAnimations = new Map(); // Store animation clips
        
        // Character definitions
        this.characterDefinitions = this.InitializeCharacterDefinitions();
        
        // References
        this.scene = null;
        this.mixer = null; // Animation mixer for all avatars
        this.clock = new THREE.Clock();
        
        // VRM loading state
        this.isLoading = false;
        this.loadingQueue = [];
    }

    Initialize() {
        console.log('[VRMAvatarSystem] Initializing VRM avatar system for Phettaverse');
        
        // Set up delayed initialization
        setTimeout(() => {
            this.DelayedInitialize();
        }, 100);
        
        // Listen for events
        this.parent.RegisterEventHandler(this.OnSceneChanged, 'scene.changed');
        this.parent.RegisterEventHandler(this.OnNPCSpawn, 'npc.spawn');
        this.parent.RegisterEventHandler(this.OnNPCTouch, 'npc.touch');
        this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
    }

    DelayedInitialize() {
        this.scene = window.scene;
        
        if (!this.scene) {
            console.error('[VRMAvatarSystem] Scene not found - retrying...');
            setTimeout(() => {
                this.DelayedInitialize();
            }, 500);
            return;
        }
        
        // Initialize animation mixer
        this.mixer = new THREE.AnimationMixer(this.scene);
        
        console.log('[VRMAvatarSystem] Initialized successfully');
        
        // Start loading core avatars
        this.LoadCoreAvatars();
    }

    InitializeCharacterDefinitions() {
        return {
            'Phetta': {
                id: 'Phetta',
                name: 'Phetta',
                role: 'Creator/Preserver',
                description: 'Player avatar/source of local stabilization',
                vrmPath: '/assets/vrm/phetta.vrm', // Placeholder path
                fallbackGeometry: 'SphereGeometry',
                fallbackMaterial: { color: 0xFFD700 },
                animations: ['idle', 'walk', 'create', 'preserve'],
                moodInfluence: { x: 0.1, y: 0.1 }, // Slight positive influence
                spawnConditions: ['always'],
                specialAbilities: ['stabilize', 'create']
            },
            'TVMan': {
                id: 'TVMan',
                name: 'TV Man',
                role: 'The Witness/Archivist',
                description: 'Records dreams; controls Flashback gate',
                vrmPath: '/assets/vrm/tvman.vrm',
                fallbackGeometry: 'BoxGeometry',
                fallbackMaterial: { color: 0x000000 },
                animations: ['idle', 'record', 'broadcast', 'archive'],
                moodInfluence: { x: 0, y: 0.2 }, // Dynamic influence
                spawnConditions: ['always'],
                specialAbilities: ['record', 'broadcast', 'flashback']
            },
            'PinkRat': {
                id: 'PinkRat',
                name: 'Pink Rat',
                role: 'Liberator/Destroyer/Shakti',
                description: 'Resets, dissolves stagnation, erases attachments',
                vrmPath: '/assets/vrm/pinkrat.vrm',
                fallbackGeometry: 'SphereGeometry',
                fallbackMaterial: { color: 0xFF69B4 },
                animations: ['idle', 'liberate', 'destroy', 'reset'],
                moodInfluence: { x: -0.5, y: -0.5 }, // Strong negative influence
                spawnConditions: ['rare', 'downer_mood', 'b_days'],
                specialAbilities: ['liberate', 'destroy', 'reset', 'flashback_lock']
            },
            'BusinessFrog': {
                id: 'BusinessFrog',
                name: 'Business Frog',
                role: 'Corporate Entity',
                description: 'Paces boardroom skybridge; contact → Bureau lift shaft scene',
                vrmPath: '/assets/vrm/businessfrog.vrm',
                fallbackGeometry: 'SphereGeometry',
                fallbackMaterial: { color: 0x00FF00 },
                animations: ['idle', 'pace', 'meeting', 'stress'],
                moodInfluence: { x: 0, y: -0.2 }, // Downer influence
                spawnConditions: ['bureau_scene'],
                specialAbilities: ['corporate_link']
            },
            'YokiKaraokeRobot': {
                id: 'YokiKaraokeRobot',
                name: 'Yoki Karaoke Robot',
                role: 'Musical Performer',
                description: 'Performs; proximity adds Upper/Dynamic; touching mic stand links to stage backroom',
                vrmPath: '/assets/vrm/yoki.vrm',
                fallbackGeometry: 'CylinderGeometry',
                fallbackMaterial: { color: 0xFF00FF },
                animations: ['idle', 'sing', 'dance', 'perform'],
                moodInfluence: { x: 0.2, y: 0.3 }, // Upper/Dynamic influence
                spawnConditions: ['karaoke_scene'],
                specialAbilities: ['musical_influence', 'stage_link']
            }
        };
    }

    LoadCoreAvatars() {
        console.log('[VRMAvatarSystem] Loading core Phettaverse avatars');
        
        // Load essential avatars first
        const coreAvatars = ['Phetta', 'TVMan'];
        
        coreAvatars.forEach(avatarId => {
            this.LoadAvatar(avatarId);
        });
    }

    LoadAvatar(avatarId) {
        if (this.avatars.has(avatarId)) {
            console.log('[VRMAvatarSystem] Avatar already loaded:', avatarId);
            return;
        }
        
        const characterDef = this.characterDefinitions[avatarId];
        if (!characterDef) {
            console.error('[VRMAvatarSystem] Character definition not found:', avatarId);
            return;
        }
        
        console.log('[VRMAvatarSystem] Loading avatar:', avatarId);
        
        // For now, create fallback geometry (will be replaced with actual VRM loading)
        this.CreateFallbackAvatar(avatarId, characterDef);
    }

    CreateFallbackAvatar(avatarId, characterDef) {
        // Create fallback geometry while VRM loading is implemented
        let geometry, material;
        
        switch (characterDef.fallbackGeometry) {
            case 'SphereGeometry':
                geometry = new THREE.SphereGeometry(1, 16, 12);
                break;
            case 'BoxGeometry':
                geometry = new THREE.BoxGeometry(1, 2, 0.5);
                break;
            case 'CylinderGeometry':
                geometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        material = new THREE.MeshBasicMaterial(characterDef.fallbackMaterial);
        const avatar = new THREE.Mesh(geometry, material);
        
        // Store avatar
        this.avatars.set(avatarId, {
            id: avatarId,
            character: characterDef,
            mesh: avatar,
            isVRM: false, // Will be true when VRM is loaded
            animations: new Map()
        });
        
        console.log('[VRMAvatarSystem] Created fallback avatar:', avatarId);
    }

    SpawnAvatar(avatarId, position, sceneId = null) {
        if (!this.avatars.has(avatarId)) {
            console.error('[VRMAvatarSystem] Avatar not loaded:', avatarId);
            return null;
        }
        
        const avatarData = this.avatars.get(avatarId);
        const characterDef = avatarData.character;
        
        // Check spawn conditions
        if (!this.CanSpawnAvatar(avatarId, sceneId)) {
            console.log('[VRMAvatarSystem] Avatar spawn conditions not met:', avatarId);
            return null;
        }
        
        // Clone the avatar mesh
        const avatarInstance = avatarData.mesh.clone();
        avatarInstance.position.copy(position);
        
        // Add avatar data
        avatarInstance.userData = {
            avatarId: avatarId,
            character: characterDef,
            moodInfluence: characterDef.moodInfluence,
            specialAbilities: characterDef.specialAbilities,
            isNPC: true,
            linkTarget: this.GetAvatarLinkTarget(avatarId)
        };
        
        // Add to scene
        this.scene.add(avatarInstance);
        
        // Store instance
        this.avatarInstances.set(avatarInstance.uuid, {
            avatarId: avatarId,
            instance: avatarInstance,
            spawnTime: Date.now(),
            sceneId: sceneId
        });
        
        // Start animations
        this.StartAvatarAnimations(avatarInstance, avatarId);
        
        console.log('[VRMAvatarSystem] Spawned avatar:', avatarId, 'at', position);
        return avatarInstance;
    }

    CanSpawnAvatar(avatarId, sceneId) {
        const characterDef = this.characterDefinitions[avatarId];
        if (!characterDef) return false;
        
        // Check spawn conditions
        if (characterDef.spawnConditions.includes('always')) return true;
        if (characterDef.spawnConditions.includes('rare') && Math.random() < 0.1) return true;
        if (characterDef.spawnConditions.includes('bureau_scene') && sceneId === 'BureauTower') return true;
        if (characterDef.spawnConditions.includes('karaoke_scene') && sceneId === 'KaraokeStarship') return true;
        
        return false;
    }

    GetAvatarLinkTarget(avatarId) {
        const characterDef = this.characterDefinitions[avatarId];
        if (!characterDef) return null;
        
        // Return link target based on character abilities
        switch (avatarId) {
            case 'BusinessFrog':
                return 'BureauTower';
            case 'YokiKaraokeRobot':
                return 'KaraokeStarship';
            case 'PinkRat':
                return 'GlitchGrotto';
            case 'TVMan':
                return null; // Random link
            default:
                return null;
        }
    }

    StartAvatarAnimations(avatarInstance, avatarId) {
        const characterDef = this.characterDefinitions[avatarId];
        if (!characterDef || !characterDef.animations) return;
        
        // For now, just rotate the avatar (will be replaced with proper VRM animations)
        const animate = () => {
            if (avatarInstance.parent) {
                avatarInstance.rotation.y += 0.01;
                requestAnimationFrame(animate);
            }
        };
        animate();
    }

    OnSceneChanged = (msg) => {
        console.log('[VRMAvatarSystem] Scene changed, updating avatars');
        
        // Clear existing avatars
        this.ClearSceneAvatars();
        
        // Spawn scene-appropriate avatars
        this.SpawnSceneAvatars(msg.sceneId);
    }

    OnNPCSpawn = (msg) => {
        console.log('[VRMAvatarSystem] NPC spawn requested:', msg.npcType);
        this.SpawnAvatar(msg.npcType, msg.position, msg.sceneId);
    }

    OnNPCTouch = (msg) => {
        console.log('[VRMAvatarSystem] NPC touched:', msg.npcType);
        
        const avatarInstance = this.FindAvatarByType(msg.npcType);
        if (avatarInstance) {
            this.TriggerAvatarInteraction(avatarInstance, msg);
        }
    }

    OnMoodChanged = (msg) => {
        console.log('[VRMAvatarSystem] Mood changed, updating avatar behaviors');
        
        // Update avatar behaviors based on mood
        this.avatarInstances.forEach((instanceData, uuid) => {
            this.UpdateAvatarForMood(instanceData.instance, msg.newMood);
        });
    }

    SpawnSceneAvatars(sceneId) {
        // Spawn avatars appropriate for the scene
        const sceneAvatars = this.GetAvatarsForScene(sceneId);
        
        sceneAvatars.forEach(avatarId => {
            const position = this.GetRandomSpawnPosition(sceneId);
            this.SpawnAvatar(avatarId, position, sceneId);
        });
    }

    GetAvatarsForScene(sceneId) {
        const avatars = [];
        
        // Always spawn Phetta and TV Man
        avatars.push('Phetta');
        avatars.push('TVMan');
        
        // Scene-specific avatars
        switch (sceneId) {
            case 'BureauTower':
                avatars.push('BusinessFrog');
                break;
            case 'KaraokeStarship':
                avatars.push('YokiKaraokeRobot');
                break;
            case 'GlitchGrotto':
                if (Math.random() < 0.3) { // 30% chance
                    avatars.push('PinkRat');
                }
                break;
        }
        
        return avatars;
    }

    GetRandomSpawnPosition(sceneId) {
        // Get random spawn position based on scene
        const positions = {
            'SquishyFieldHub': [
                new THREE.Vector3(0, 1, 5),
                new THREE.Vector3(5, 1, 0),
                new THREE.Vector3(-5, 1, 0)
            ],
            'BureauTower': [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(10, 1, 0),
                new THREE.Vector3(-10, 1, 0)
            ],
            'KaraokeStarship': [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(8, 1, 8),
                new THREE.Vector3(-8, 1, -8)
            ],
            'ArchiveSpire': [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(12, 1, 0),
                new THREE.Vector3(-12, 1, 0)
            ],
            'GlitchGrotto': [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(6, 1, 6),
                new THREE.Vector3(-6, 1, -6)
            ],
            'InfiniteCorridor': [
                new THREE.Vector3(0, 1, 0),
                new THREE.Vector3(20, 1, 0),
                new THREE.Vector3(-20, 1, 0)
            ]
        };
        
        const scenePositions = positions[sceneId] || positions['SquishyFieldHub'];
        return scenePositions[Math.floor(Math.random() * scenePositions.length)];
    }

    ClearSceneAvatars() {
        // Remove all avatar instances from scene
        this.avatarInstances.forEach((instanceData, uuid) => {
            if (instanceData.instance.parent) {
                instanceData.instance.parent.remove(instanceData.instance);
            }
        });
        this.avatarInstances.clear();
    }

    FindAvatarByType(npcType) {
        for (const [uuid, instanceData] of this.avatarInstances) {
            if (instanceData.avatarId === npcType) {
                return instanceData.instance;
            }
        }
        return null;
    }

    TriggerAvatarInteraction(avatarInstance, msg) {
        const characterDef = avatarInstance.userData.character;
        const moodInfluence = characterDef.moodInfluence;
        
        // Apply mood influence
        if (moodInfluence) {
            this.Broadcast({
                topic: 'mood.delta',
                delta: moodInfluence,
                source: characterDef.name
            });
        }
        
        // Trigger special abilities
        const specialAbilities = characterDef.specialAbilities;
        if (specialAbilities) {
            specialAbilities.forEach(ability => {
                this.TriggerSpecialAbility(ability, avatarInstance, msg);
            });
        }
        
        // Handle linking
        const linkTarget = avatarInstance.userData.linkTarget;
        if (linkTarget) {
            this.Broadcast({
                topic: 'scene.link',
                target: linkTarget,
                source: characterDef.name
            });
        }
    }

    TriggerSpecialAbility(ability, avatarInstance, msg) {
        switch (ability) {
            case 'stabilize':
                console.log('[VRMAvatarSystem] Phetta stabilizes the dream');
                break;
            case 'record':
                console.log('[VRMAvatarSystem] TV Man records the interaction');
                break;
            case 'broadcast':
                console.log('[VRMAvatarSystem] TV Man broadcasts a surge');
                this.Broadcast({ topic: 'tv.broadcast_surge' });
                break;
            case 'liberate':
                console.log('[VRMAvatarSystem] Pink Rat liberates from attachments');
                break;
            case 'destroy':
                console.log('[VRMAvatarSystem] Pink Rat destroys stagnation');
                break;
            case 'reset':
                console.log('[VRMAvatarSystem] Pink Rat resets the dream state');
                break;
            case 'flashback_lock':
                console.log('[VRMAvatarSystem] Pink Rat locks flashback access');
                this.Broadcast({ topic: 'flashback.lock' });
                break;
            case 'musical_influence':
                console.log('[VRMAvatarSystem] Yoki provides musical influence');
                break;
            case 'stage_link':
                console.log('[VRMAvatarSystem] Yoki links to stage backroom');
                break;
        }
    }

    UpdateAvatarForMood(avatarInstance, mood) {
        // Update avatar appearance/behavior based on mood
        const characterDef = avatarInstance.userData.character;
        
        // Could change colors, animations, or other properties based on mood
        if (characterDef.id === 'Phetta') {
            // Phetta becomes more golden in positive moods
            const intensity = Math.max(0, (mood.x + mood.y) / 18); // Normalize to 0-1
            avatarInstance.material.color.setHSL(0.15, 1, 0.3 + intensity * 0.4);
        }
    }

    Update(deltaTime) {
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
        
        // Update avatar instances
        this.avatarInstances.forEach((instanceData, uuid) => {
            this.UpdateAvatarInstance(instanceData, deltaTime);
        });
    }

    UpdateAvatarInstance(instanceData, deltaTime) {
        const avatarInstance = instanceData.instance;
        
        // Update avatar-specific logic
        if (instanceData.avatarId === 'TVMan') {
            // TV Man occasionally broadcasts
            if (Math.random() < 0.001) { // Very rare
                this.TriggerSpecialAbility('broadcast', avatarInstance, {});
            }
        }
    }

    // Public API methods
    GetAvatar(avatarId) {
        return this.avatars.get(avatarId);
    }

    GetAvatarInstances() {
        return Array.from(this.avatarInstances.values());
    }

    RemoveAvatar(uuid) {
        const instanceData = this.avatarInstances.get(uuid);
        if (instanceData) {
            if (instanceData.instance.parent) {
                instanceData.instance.parent.remove(instanceData.instance);
            }
            this.avatarInstances.delete(uuid);
        }
    }
}
