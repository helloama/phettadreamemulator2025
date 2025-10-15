import Component from "../../Component";
import * as THREE from 'three';

/**
 * SceneLinker - Core LSD Dream Emulator collision-based linking system
 * 
 * Implements the core mechanic: any collision → fade-cut → teleport to new scene
 * Handles scene transitions, fade effects, and mood-based scene selection
 */
export default class SceneLinker extends Component {
    constructor() {
        super();
        this.name = 'SceneLinker';
        
        // Scene management
        this.currentScene = null;
        this.sceneHistory = [];
        this.maxHistoryLength = 20;
        
        // Linking state
        this.isLinking = false;
        this.linkCooldown = 1000; // 1 second cooldown between links
        this.lastLinkTime = 0;
        
        // Scene definitions (following LSD spec)
        this.sceneDefinitions = this.InitializeSceneDefinitions();
        
        // References
        this.scene = null;
        this.player = null;
        this.moodGraph = null;
        this.fadeEffect = null;
    }

    Initialize() {
        console.log('[SceneLinker] Initializing LSD-style scene linking system');
        
        // Get references with delayed initialization
        setTimeout(() => {
            this.DelayedInitialize();
        }, 100);
        
        // Listen for events
        this.parent.RegisterEventHandler(this.OnPlayerCollision, 'player.collision');
        this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
        this.parent.RegisterEventHandler(this.OnSessionStart, 'session.start');
        this.parent.RegisterEventHandler(this.OnSessionEnd, 'session.end');
    }

    DelayedInitialize() {
        this.scene = window.scene;
        this.player = this.FindEntity('Player');
        this.moodGraph = this.FindEntity('DreamEnvironment')?.GetComponent('MoodGraph');
        this.fadeEffect = this.FindEntity('DreamManager')?.GetComponent('FadeEffect');
        
        if (!this.scene) {
            console.error('[SceneLinker] Scene not found - retrying...');
            setTimeout(() => {
                this.DelayedInitialize();
            }, 500);
            return;
        }
        
        console.log('[SceneLinker] Initialized successfully');
        
        // Start with initial scene
        this.LoadInitialScene();
    }

    InitializeSceneDefinitions() {
        // Define all scenes following the LSD spec
        return {
            'SquishyFieldHub': {
                id: 'SquishyFieldHub',
                area: 'Hub',
                name: 'Squishy Field Hub',
                description: 'Cosmic womb - default spawn at Graph (0,0)',
                moodDriftPerSecond: { x: 0, y: 0 },
                aestheticWeights: { Normal: 0.6, Scripture: 0.2, Downer: 0.1, Upper: 0.1 },
                spawnPoints: [
                    new THREE.Vector3(0, 2, 0),
                    new THREE.Vector3(5, 2, 5),
                    new THREE.Vector3(-5, 2, -5)
                ],
                npcTable: ['Phetta', 'TVMan'],
                linkExits: [
                    { trigger: 'Any', destPolicy: 'MoodBiased', destCandidates: ['BureauTower', 'KaraokeStarship', 'ArchiveSpire', 'GlitchGrotto', 'InfiniteCorridor'] }
                ]
            },
            'BureauTower': {
                id: 'BureauTower',
                area: 'Bureau',
                name: 'Business Frog City',
                description: 'Downer/Dynamic quadrant - corporate nightmare',
                moodDriftPerSecond: { x: 0, y: -0.2 },
                aestheticWeights: { Normal: 0.3, Scripture: 0.1, Downer: 0.5, Upper: 0.1 },
                spawnPoints: [
                    new THREE.Vector3(0, 2, 0),
                    new THREE.Vector3(10, 2, 0),
                    new THREE.Vector3(-10, 2, 0)
                ],
                npcTable: ['BusinessFrog', 'TVMan'],
                linkExits: [
                    { trigger: 'Any', destPolicy: 'MoodBiased', destCandidates: ['SquishyFieldHub', 'GlitchGrotto', 'InfiniteCorridor'] }
                ]
            },
            'KaraokeStarship': {
                id: 'KaraokeStarship',
                area: 'Karaoke',
                name: 'Yoki\'s Karaoke Starship',
                description: 'Upper/Dynamic - musical NPC loops',
                moodDriftPerSecond: { x: 0.2, y: 0.3 },
                aestheticWeights: { Normal: 0.2, Scripture: 0.1, Downer: 0.1, Upper: 0.6 },
                spawnPoints: [
                    new THREE.Vector3(0, 2, 0),
                    new THREE.Vector3(8, 2, 8),
                    new THREE.Vector3(-8, 2, -8)
                ],
                npcTable: ['YokiKaraokeRobot', 'TVMan'],
                linkExits: [
                    { trigger: 'Any', destPolicy: 'MoodBiased', destCandidates: ['SquishyFieldHub', 'ArchiveSpire', 'InfiniteCorridor'] }
                ]
            },
            'ArchiveSpire': {
                id: 'ArchiveSpire',
                area: 'Archive',
                name: 'Archive Spire',
                description: 'Static/Upper - scripture textures',
                moodDriftPerSecond: { x: 0.3, y: -0.1 },
                aestheticWeights: { Normal: 0.2, Scripture: 0.6, Downer: 0.1, Upper: 0.1 },
                spawnPoints: [
                    new THREE.Vector3(0, 2, 0),
                    new THREE.Vector3(12, 2, 0),
                    new THREE.Vector3(-12, 2, 0)
                ],
                npcTable: ['TVMan', 'Phetta'],
                linkExits: [
                    { trigger: 'Any', destPolicy: 'MoodBiased', destCandidates: ['SquishyFieldHub', 'KaraokeStarship', 'InfiniteCorridor'] }
                ]
            },
            'GlitchGrotto': {
                id: 'GlitchGrotto',
                area: 'Glitch',
                name: 'Glitch Grotto',
                description: 'Static/Downer - low-freq bass, creep props',
                moodDriftPerSecond: { x: -0.2, y: -0.3 },
                aestheticWeights: { Normal: 0.1, Scripture: 0.1, Downer: 0.7, Upper: 0.1 },
                spawnPoints: [
                    new THREE.Vector3(0, 2, 0),
                    new THREE.Vector3(6, 2, 6),
                    new THREE.Vector3(-6, 2, -6)
                ],
                npcTable: ['PinkRat', 'TVMan'],
                linkExits: [
                    { trigger: 'Any', destPolicy: 'MoodBiased', destCandidates: ['SquishyFieldHub', 'BureauTower', 'InfiniteCorridor'] }
                ]
            },
            'InfiniteCorridor': {
                id: 'InfiniteCorridor',
                area: 'Corridor',
                name: 'Infinite Corridor',
                description: 'Neutral link conduit with rare doors',
                moodDriftPerSecond: { x: 0, y: 0.1 },
                aestheticWeights: { Normal: 0.8, Scripture: 0.1, Downer: 0.05, Upper: 0.05 },
                spawnPoints: [
                    new THREE.Vector3(0, 2, 0),
                    new THREE.Vector3(20, 2, 0),
                    new THREE.Vector3(-20, 2, 0)
                ],
                npcTable: ['TVMan'],
                linkExits: [
                    { trigger: 'Any', destPolicy: 'RandomWeighted', destCandidates: ['SquishyFieldHub', 'BureauTower', 'KaraokeStarship', 'ArchiveSpire', 'GlitchGrotto'] }
                ]
            }
        };
    }

    LoadInitialScene() {
        // Determine initial scene based on mood graph
        let initialSceneId = 'SquishyFieldHub'; // Default
        
        if (this.moodGraph) {
            const spawnLocation = this.moodGraph.GetSpawnLocationForMood();
            initialSceneId = spawnLocation;
        }
        
        console.log('[SceneLinker] Loading initial scene:', initialSceneId);
        this.LoadScene(initialSceneId);
    }

    OnPlayerCollision = (msg) => {
        if (this.isLinking) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastLinkTime < this.linkCooldown) return;
        
        console.log('[SceneLinker] Player collision detected:', msg.object);
        
        // Check if collision object has link properties
        const linkTarget = this.GetLinkTarget(msg.object);
        if (linkTarget) {
            this.TriggerLink(linkTarget);
        }
    }

    OnMoodChanged = (msg) => {
        console.log('[SceneLinker] Mood changed, current scene may need updates');
        // Could trigger scene modifications based on mood
        this.UpdateSceneForMood(msg.newMood);
    }

    OnSessionStart = () => {
        console.log('[SceneLinker] Session started');
        this.sceneHistory = [];
        this.LoadInitialScene();
    }

    OnSessionEnd = () => {
        console.log('[SceneLinker] Session ended');
        this.isLinking = false;
    }

    GetLinkTarget(collisionObject) {
        // Check if collision object has link properties
        if (collisionObject.userData && collisionObject.userData.linkTarget) {
            return collisionObject.userData.linkTarget;
        }
        
        // Check for special NPCs or objects
        if (collisionObject.userData && collisionObject.userData.npcType) {
            return this.GetNPCLinkTarget(collisionObject.userData.npcType);
        }
        
        // Default: any collision triggers random link
        if (this.currentScene && this.currentScene.linkExits) {
            return this.SelectRandomLinkTarget();
        }
        
        return null;
    }

    GetNPCLinkTarget(npcType) {
        // Special NPC link behaviors
        switch (npcType) {
            case 'BusinessFrog':
                return 'BureauTower';
            case 'YokiKaraokeRobot':
                return 'KaraokeStarship';
            case 'PinkRat':
                return 'GlitchGrotto';
            case 'TVMan':
                return this.SelectRandomLinkTarget();
            default:
                return this.SelectRandomLinkTarget();
        }
    }

    SelectRandomLinkTarget() {
        if (!this.currentScene || !this.currentScene.linkExits) {
            return 'SquishyFieldHub';
        }
        
        const linkExit = this.currentScene.linkExits[0]; // Use first link exit
        const candidates = linkExit.destCandidates;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    TriggerLink(targetSceneId) {
        if (this.isLinking) return;
        
        console.log('[SceneLinker] Triggering link to:', targetSceneId);
        
        this.isLinking = true;
        this.lastLinkTime = Date.now();
        
        // Add current scene to history
        if (this.currentScene) {
            this.sceneHistory.push({
                sceneId: this.currentScene.id,
                timestamp: Date.now(),
                mood: this.moodGraph ? this.moodGraph.GetMoodData() : null
            });
            
            // Keep history manageable
            if (this.sceneHistory.length > this.maxHistoryLength) {
                this.sceneHistory.shift();
            }
        }
        
        // Start fade out
        this.Broadcast({ topic: 'fade.out', speed: 0.5 });
        
        // Wait for fade to complete, then load new scene
        setTimeout(() => {
            this.LoadScene(targetSceneId);
            this.Broadcast({ topic: 'fade.in', speed: 1.0 });
            this.isLinking = false;
        }, 500);
    }

    LoadScene(sceneId) {
        console.log('[SceneLinker] Loading scene:', sceneId);
        
        const sceneDef = this.sceneDefinitions[sceneId];
        if (!sceneDef) {
            console.error('[SceneLinker] Scene not found:', sceneId);
            return;
        }
        
        // Clear current scene
        this.ClearCurrentScene();
        
        // Load new scene
        this.currentScene = sceneDef;
        this.GenerateSceneGeometry();
        this.SpawnNPCs();
        this.SpawnProps();
        this.SetupSceneLighting();
        this.SetupSceneAudio();
        
        // Update mood drift
        if (this.moodGraph) {
            this.moodGraph.moodDriftPerSecond = sceneDef.moodDriftPerSecond;
        }
        
        // Broadcast scene change
        this.Broadcast({
            topic: 'scene.changed',
            sceneId: sceneId,
            sceneDef: sceneDef
        });
        
        console.log('[SceneLinker] Scene loaded:', sceneId);
    }

    ClearCurrentScene() {
        if (!this.scene) return;
        
        // Remove all scene objects (keep player and essential objects)
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.userData && child.userData.sceneObject) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }

    GenerateSceneGeometry() {
        if (!this.scene || !this.currentScene) return;
        
        // Generate basic scene geometry based on scene type
        const sceneId = this.currentScene.id;
        
        switch (sceneId) {
            case 'SquishyFieldHub':
                this.GenerateHubGeometry();
                break;
            case 'BureauTower':
                this.GenerateBureauGeometry();
                break;
            case 'KaraokeStarship':
                this.GenerateKaraokeGeometry();
                break;
            case 'ArchiveSpire':
                this.GenerateArchiveGeometry();
                break;
            case 'GlitchGrotto':
                this.GenerateGlitchGeometry();
                break;
            case 'InfiniteCorridor':
                this.GenerateCorridorGeometry();
                break;
        }
    }

    GenerateHubGeometry() {
        // Squishy Field Hub - cosmic womb
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshBasicMaterial({ color: 0x8B4513, transparent: true, opacity: 0.8 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.userData = { sceneObject: true, linkTarget: 'SquishyFieldHub' };
        this.scene.add(ground);
        
        // Add some cosmic elements
        for (let i = 0; i < 10; i++) {
            const star = new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 8, 6),
                new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.6 })
            );
            star.position.set(
                (Math.random() - 0.5) * 40,
                Math.random() * 10 + 5,
                (Math.random() - 0.5) * 40
            );
            star.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
            this.scene.add(star);
        }
    }

    GenerateBureauGeometry() {
        // Bureau Tower - corporate nightmare
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 30),
            new THREE.MeshBasicMaterial({ color: 0x2F2F2F })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.userData = { sceneObject: true, linkTarget: 'BureauTower' };
        this.scene.add(ground);
        
        // Add office-like structures
        for (let i = 0; i < 5; i++) {
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(4, 8, 4),
                new THREE.MeshBasicMaterial({ color: 0x1A1A1A })
            );
            building.position.set(
                (Math.random() - 0.5) * 20,
                4,
                (Math.random() - 0.5) * 20
            );
            building.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
            this.scene.add(building);
        }
    }

    GenerateKaraokeGeometry() {
        // Karaoke Starship - musical space
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(25, 25),
            new THREE.MeshBasicMaterial({ color: 0xFF69B4 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.userData = { sceneObject: true, linkTarget: 'KaraokeStarship' };
        this.scene.add(ground);
        
        // Add musical elements
        for (let i = 0; i < 8; i++) {
            const speaker = new THREE.Mesh(
                new THREE.CylinderGeometry(1, 1, 3, 8),
                new THREE.MeshBasicMaterial({ color: 0x00FF00 })
            );
            speaker.position.set(
                (Math.random() - 0.5) * 15,
                1.5,
                (Math.random() - 0.5) * 15
            );
            speaker.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
            this.scene.add(speaker);
        }
    }

    GenerateArchiveGeometry() {
        // Archive Spire - scripture repository
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(35, 35),
            new THREE.MeshBasicMaterial({ color: 0x8B4513 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.userData = { sceneObject: true, linkTarget: 'ArchiveSpire' };
        this.scene.add(ground);
        
        // Add spire structures
        for (let i = 0; i < 3; i++) {
            const spire = new THREE.Mesh(
                new THREE.ConeGeometry(2, 12, 8),
                new THREE.MeshBasicMaterial({ color: 0x4B0082 })
            );
            spire.position.set(
                (Math.random() - 0.5) * 20,
                6,
                (Math.random() - 0.5) * 20
            );
            spire.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
            this.scene.add(spire);
        }
    }

    GenerateGlitchGeometry() {
        // Glitch Grotto - corrupted space
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.userData = { sceneObject: true, linkTarget: 'GlitchGrotto' };
        this.scene.add(ground);
        
        // Add glitch elements
        for (let i = 0; i < 6; i++) {
            const glitch = new THREE.Mesh(
                new THREE.BoxGeometry(2, 2, 2),
                new THREE.MeshBasicMaterial({ 
                    color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
                    transparent: true,
                    opacity: 0.7
                })
            );
            glitch.position.set(
                (Math.random() - 0.5) * 15,
                Math.random() * 5,
                (Math.random() - 0.5) * 15
            );
            glitch.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
            this.scene.add(glitch);
        }
    }

    GenerateCorridorGeometry() {
        // Infinite Corridor - neutral passage
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 10),
            new THREE.MeshBasicMaterial({ color: 0x808080 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.userData = { sceneObject: true, linkTarget: 'InfiniteCorridor' };
        this.scene.add(ground);
        
        // Add corridor walls
        const leftWall = new THREE.Mesh(
            new THREE.BoxGeometry(1, 10, 100),
            new THREE.MeshBasicMaterial({ color: 0x606060 })
        );
        leftWall.position.set(-5, 5, 0);
        leftWall.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.BoxGeometry(1, 10, 100),
            new THREE.MeshBasicMaterial({ color: 0x606060 })
        );
        rightWall.position.set(5, 5, 0);
        rightWall.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
        this.scene.add(rightWall);
    }

    SpawnNPCs() {
        if (!this.currentScene || !this.currentScene.npcTable) return;
        
        // Spawn NPCs based on scene definition
        this.currentScene.npcTable.forEach(npcType => {
            this.SpawnNPC(npcType);
        });
    }

    SpawnNPC(npcType) {
        // Create basic NPC geometry (will be replaced with VRM avatars later)
        let geometry, material, position;
        
        switch (npcType) {
            case 'Phetta':
                geometry = new THREE.SphereGeometry(1, 8, 6);
                material = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
                position = new THREE.Vector3(0, 1, 5);
                break;
            case 'TVMan':
                geometry = new THREE.BoxGeometry(1, 2, 0.5);
                material = new THREE.MeshBasicMaterial({ color: 0x000000 });
                position = new THREE.Vector3(5, 1, 0);
                break;
            case 'BusinessFrog':
                geometry = new THREE.SphereGeometry(1.5, 8, 6);
                material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                position = new THREE.Vector3(0, 1.5, 0);
                break;
            case 'YokiKaraokeRobot':
                geometry = new THREE.CylinderGeometry(1, 1, 2, 8);
                material = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
                position = new THREE.Vector3(0, 1, 0);
                break;
            case 'PinkRat':
                geometry = new THREE.SphereGeometry(0.5, 8, 6);
                material = new THREE.MeshBasicMaterial({ color: 0xFF69B4 });
                position = new THREE.Vector3(0, 0.5, 0);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
                material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
                position = new THREE.Vector3(0, 0.5, 0);
        }
        
        const npc = new THREE.Mesh(geometry, material);
        npc.position.copy(position);
        npc.userData = {
            sceneObject: true,
            npcType: npcType,
            linkTarget: this.GetNPCLinkTarget(npcType)
        };
        
        this.scene.add(npc);
        console.log('[SceneLinker] Spawned NPC:', npcType);
    }

    SpawnProps() {
        // Add scene-specific props
        if (!this.currentScene) return;
        
        // Add some random props for atmosphere
        for (let i = 0; i < 5; i++) {
            const prop = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.5, 0.5),
                new THREE.MeshBasicMaterial({ 
                    color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5)
                })
            );
            prop.position.set(
                (Math.random() - 0.5) * 20,
                0.25,
                (Math.random() - 0.5) * 20
            );
            prop.userData = { sceneObject: true, linkTarget: this.SelectRandomLinkTarget() };
            this.scene.add(prop);
        }
    }

    SetupSceneLighting() {
        // Set up scene-specific lighting
        if (!this.scene) return;
        
        // Clear existing lights (keep ambient)
        const lightsToRemove = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.Light && child.type !== 'AmbientLight') {
                lightsToRemove.push(child);
            }
        });
        lightsToRemove.forEach(light => this.scene.remove(light));
        
        // Add scene-specific lighting
        if (this.currentScene) {
            switch (this.currentScene.id) {
                case 'GlitchGrotto':
                    // Dark, eerie lighting
                    const darkLight = new THREE.DirectionalLight(0x220022, 0.3);
                    darkLight.position.set(10, 10, 5);
                    this.scene.add(darkLight);
                    break;
                case 'KaraokeStarship':
                    // Bright, colorful lighting
                    const brightLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
                    brightLight.position.set(0, 10, 0);
                    this.scene.add(brightLight);
                    break;
                default:
                    // Standard lighting
                    const standardLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
                    standardLight.position.set(5, 10, 5);
                    this.scene.add(standardLight);
            }
        }
    }

    SetupSceneAudio() {
        // Set up scene-specific audio
        if (!this.currentScene) return;
        
        // Broadcast audio change event
        this.Broadcast({
            topic: 'audio.scene_change',
            sceneId: this.currentScene.id,
            audioProfile: this.currentScene.audioProfile || 'Ambient'
        });
    }

    UpdateSceneForMood(mood) {
        // Update scene based on current mood
        if (!this.currentScene) return;
        
        // Could modify scene lighting, colors, or other properties based on mood
        console.log('[SceneLinker] Updating scene for mood:', mood);
    }

    GetCurrentScene() {
        return this.currentScene;
    }

    GetSceneHistory() {
        return this.sceneHistory;
    }
}
