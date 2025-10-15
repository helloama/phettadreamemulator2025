import * as THREE from 'three'
import Component from '../../Component'
import { ZoneDefinitions, ZoneIds } from './ZoneDefinitions'

export default class ZoneManager extends Component{
    constructor(scene){
        super();
        this.name = 'ZoneManager';
        this.scene = scene;
        this.activeGroup = null;
        this.sessionState = null;
        this.currentZoneId = ZoneIds.VOID;
    }

    Initialize(){
        this.sessionState = this.FindEntity('DreamManager').GetComponent('SessionState');
        this.LoadZone(this.sessionState?.GetStartingZone?.() || this.currentZoneId);
    }

    Clear(){
        if(!this.activeGroup){ return; }
        this.scene.remove(this.activeGroup);
        this.activeGroup.traverse(obj => {
            if(obj.geometry) obj.geometry.dispose();
            if(obj.material) obj.material.dispose?.();
        });
        this.activeGroup = null;
    }

    LoadZone(zoneId){
        this.Clear();
        this.currentZoneId = zoneId;
        const def = ZoneDefinitions[zoneId];
        if(!def){ return; }

        // Scene atmospherics
        this.scene.background = new THREE.Color(def.skyColor);
        this.scene.fog = new THREE.FogExp2(def.fog.color, def.fog.density);

        const group = new THREE.Group();

        // Ground plane
        const g = new THREE.PlaneGeometry(def.ground.size, def.ground.size, 1, 1);
        const m = new THREE.MeshStandardMaterial({ color: def.ground.color });
        const ground = new THREE.Mesh(g, m);
        ground.rotation.x = -Math.PI/2;
        ground.receiveShadow = true;
        group.add(ground);

        // Seeded rng
        const rng = () => this.sessionState.GetSeededRandom(0,1);
        const rngInt = (a,b) => this.sessionState.GetSeededRandomInt(a,b);

        // Objects
        const [minC, maxC] = def.objects.count;
        const count = rngInt(minC, maxC);
        for(let i=0;i<count;i++){
            const type = def.objects.geometries[rngInt(0, def.objects.geometries.length-1)];
            let geom;
            if(type==='box') geom = new THREE.BoxGeometry(1,1,1);
            else if(type==='sphere') geom = new THREE.SphereGeometry(0.7, 16, 12);
            else geom = new THREE.TorusGeometry(0.6, 0.2, 8, 16);

            const color = def.objects.palette[rngInt(0, def.objects.palette.length-1)];
            const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.6 });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.position.set(
                (rng()-0.5) * (def.ground.size*0.8),
                0.5 + rng()*1.5,
                (rng()-0.5) * (def.ground.size*0.8)
            );
            mesh.rotation.y = rng()*Math.PI*2;
            mesh.scale.setScalar(0.5 + rng()*2.0);
            group.add(mesh);
        }

        // Lighting
        const hemi = new THREE.HemisphereLight(0xffffff, def.ground.color, 0.5);
        group.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.7);
        dir.position.set(5,10,5);
        dir.castShadow = true;
        group.add(dir);

        this.scene.add(group);
        this.activeGroup = group;
    }

    // Method to switch between FPS level and dream zones
    SwitchToDreamMode() {
        console.log('[ZoneManager] Switching to dream mode');
        
        // Hide FPS level and objects
        this.HideFPSObjects();
        
        // Load dream zone
        this.LoadZone(this.currentZoneId);
    }

    SwitchToFPSMode() {
        console.log('[ZoneManager] Switching to FPS mode');
        
        // Show FPS level and objects
        this.ShowFPSObjects();
        
        // Clear dream zone
        this.Clear();
    }

    HideFPSObjects() {
        // Hide FPS level
        const fpsLevel = this.scene.getObjectByName('level');
        if (fpsLevel) {
            fpsLevel.visible = false;
        }
        
        // Hide ammo boxes
        this.scene.traverse((child) => {
            if (child.name && child.name.includes('ammobox')) {
                child.visible = false;
            }
        });
        
        // Hide NPCs
        this.scene.traverse((child) => {
            if (child.name && child.name.includes('mutant')) {
                child.visible = false;
            }
        });
    }

    ShowFPSObjects() {
        // Show FPS level
        const fpsLevel = this.scene.getObjectByName('level');
        if (fpsLevel) {
            fpsLevel.visible = true;
        }
        
        // Show ammo boxes
        this.scene.traverse((child) => {
            if (child.name && child.name.includes('ammobox')) {
                child.visible = true;
            }
        });
        
        // Show NPCs
        this.scene.traverse((child) => {
            if (child.name && child.name.includes('mutant')) {
                child.visible = true;
            }
        });
    }
}
