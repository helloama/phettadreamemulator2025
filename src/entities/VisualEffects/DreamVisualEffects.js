import Component from "../../Component";
import * as THREE from 'three';

export default class DreamVisualEffects extends Component {
    constructor() {
        super();
        this.name = 'DreamVisualEffects';
        
        // Post-processing setup
        this.composer = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        // Effect parameters
        this.dreamIntensity = 0.0;
        this.currentMood = 'neutral';
        
        // LSD-style visual effects
        this.chromaticAberration = 0.0;
        this.vignette = 0.0;
        this.noise = 0.0;
        this.distortion = 0.0;
        this.colorShift = 0.0;
        this.bloom = 0.0;
        
        // Animation values
        this.time = 0;
        this.pulseIntensity = 0;
        this.warpIntensity = 0;
        
        // Shader uniforms
        this.uniforms = {
            time: { value: 0 },
            intensity: { value: 0 },
            mood: { value: 0 },
            chromaticAberration: { value: 0 },
            vignette: { value: 0 },
            noise: { value: 0 },
            distortion: { value: 0 },
            colorShift: { value: 0 },
            bloom: { value: 0 }
        };
        
        this.isInitialized = false;
    }

    Initialize() {
        console.log('[DreamVisualEffects] Initializing LSD-style visual effects');
        
        // Delay initialization to ensure scene is set up
        setTimeout(() => {
            this.DelayedInitialize();
        }, 100);
    }

    DelayedInitialize() {
        try {
            // Get renderer and scene references - use global references
            this.renderer = window.renderer;
            this.scene = window.scene;
            this.camera = window.camera;
            
            if (!this.renderer || !this.scene || !this.camera) {
                console.error('[DreamVisualEffects] Missing renderer, scene, or camera - retrying...');
                // Retry after another delay
                setTimeout(() => {
                    this.DelayedInitialize();
                }, 500);
                return;
            }

            // Create post-processing pipeline
            this.SetupPostProcessing();
            
            // Listen for mood and session events
            this.parent.RegisterEventHandler(this.OnMoodChanged, 'mood.changed');
            this.parent.RegisterEventHandler(this.OnSessionProgress, 'session.progress');
            this.parent.RegisterEventHandler(this.OnDreamEvent, 'dream.event');
            
            this.isInitialized = true;
            console.log('[DreamVisualEffects] Visual effects system ready');
            
        } catch (error) {
            console.error('[DreamVisualEffects] Failed to initialize:', error);
        }
    }

    SetupPostProcessing() {
        // Create render target
        this.renderTarget = new THREE.WebGLRenderTarget(
            window.innerWidth,
            window.innerHeight,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat
            }
        );

        // Create fullscreen quad for post-processing
        this.postProcessGeometry = new THREE.PlaneGeometry(2, 2);
        this.postProcessMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.GetVertexShader(),
            fragmentShader: this.GetFragmentShader(),
            transparent: true
        });
        
        this.postProcessMesh = new THREE.Mesh(this.postProcessGeometry, this.postProcessMaterial);
        this.postProcessScene = new THREE.Scene();
        this.postProcessScene.add(this.postProcessMesh);
        this.postProcessCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    GetVertexShader() {
        return `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    GetFragmentShader() {
        return `
            uniform float time;
            uniform float intensity;
            uniform float mood;
            uniform float chromaticAberration;
            uniform float vignette;
            uniform float noise;
            uniform float distortion;
            uniform float colorShift;
            uniform float bloom;
            
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
            
            // Noise function
            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }
            
            // LSD-style color shifting
            vec3 shiftColor(vec3 color, float shift) {
                return vec3(
                    color.r + sin(shift + time * 0.5) * 0.1,
                    color.g + sin(shift + time * 0.7 + 2.0) * 0.1,
                    color.b + sin(shift + time * 0.3 + 4.0) * 0.1
                );
            }
            
            void main() {
                vec2 uv = vUv;
                
                // Chromatic aberration
                if (chromaticAberration > 0.0) {
                    float aberration = chromaticAberration * 0.01;
                    float r = texture2D(tDiffuse, uv + vec2(aberration, 0.0)).r;
                    float g = texture2D(tDiffuse, uv).g;
                    float b = texture2D(tDiffuse, uv - vec2(aberration, 0.0)).b;
                    gl_FragColor = vec4(r, g, b, 1.0);
                } else {
                    gl_FragColor = texture2D(tDiffuse, uv);
                }
                
                // Vignette effect
                if (vignette > 0.0) {
                    float dist = distance(uv, vec2(0.5, 0.5));
                    float vignetteEffect = 1.0 - smoothstep(0.3, 0.8, dist);
                    gl_FragColor.rgb *= mix(1.0, vignetteEffect, vignette);
                }
                
                // Noise overlay
                if (noise > 0.0) {
                    float noiseValue = random(uv + time) * noise * 0.1;
                    gl_FragColor.rgb += noiseValue;
                }
                
                // Distortion (LSD-style warping)
                if (distortion > 0.0) {
                    vec2 distortionOffset = vec2(
                        sin(uv.y * 10.0 + time * 2.0) * distortion * 0.01,
                        cos(uv.x * 8.0 + time * 1.5) * distortion * 0.01
                    );
                    gl_FragColor = mix(
                        gl_FragColor,
                        texture2D(tDiffuse, uv + distortionOffset),
                        distortion * 0.3
                    );
                }
                
                // Color shifting
                if (colorShift > 0.0) {
                    gl_FragColor.rgb = shiftColor(gl_FragColor.rgb, colorShift);
                }
                
                // Bloom effect
                if (bloom > 0.0) {
                    vec3 bloomColor = gl_FragColor.rgb;
                    float brightness = dot(bloomColor, vec3(0.299, 0.587, 0.114));
                    if (brightness > 0.8) {
                        gl_FragColor.rgb += bloomColor * bloom * 0.5;
                    }
                }
                
                // Mood-based color grading
                if (mood > 0.0) {
                    // Upper mood - bright, warm
                    if (mood < 0.25) {
                        gl_FragColor.rgb += vec3(0.1, 0.05, 0.0) * intensity;
                    }
                    // Downer mood - dark, cool
                    else if (mood < 0.5) {
                        gl_FragColor.rgb *= vec3(0.8, 0.9, 1.0) * (1.0 + intensity * 0.2);
                    }
                    // Static mood - desaturated
                    else if (mood < 0.75) {
                        float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                        gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(gray), intensity * 0.3);
                    }
                    // Dynamic mood - saturated, vibrant
                    else {
                        gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 - intensity * 0.1));
                    }
                }
            }
        `;
    }

    OnMoodChanged = (msg) => {
        this.currentMood = msg.mood;
        this.UpdateMoodBasedEffects();
    }

    OnSessionProgress = (msg) => {
        this.dreamIntensity = Math.min(msg.timeElapsed / 600, 1.0);
        this.UpdateIntensityBasedEffects();
    }

    OnDreamEvent = (msg) => {
        // React to specific dream events with visual effects
        switch (msg.type) {
            case 'texture_swap':
                this.TriggerChromaticAberration();
                break;
            case 'object_scaling':
                this.TriggerDistortion();
                break;
            case 'lighting_change':
                this.TriggerColorShift();
                break;
            case 'floating_objects':
                this.TriggerBloom();
                break;
        }
    }

    UpdateMoodBasedEffects() {
        switch (this.currentMood) {
            case 'upper':
                this.uniforms.mood.value = 0.125; // Upper mood range
                break;
            case 'downer':
                this.uniforms.mood.value = 0.375; // Downer mood range
                break;
            case 'static':
                this.uniforms.mood.value = 0.625; // Static mood range
                break;
            case 'dynamic':
                this.uniforms.mood.value = 0.875; // Dynamic mood range
                break;
            default:
                this.uniforms.mood.value = 0.5; // Neutral
        }
    }

    UpdateIntensityBasedEffects() {
        // Gradually increase visual effects over time
        this.chromaticAberration = this.dreamIntensity * 0.5;
        this.vignette = this.dreamIntensity * 0.3;
        this.noise = this.dreamIntensity * 0.4;
        this.distortion = this.dreamIntensity * 0.6;
        this.colorShift = this.dreamIntensity * 0.7;
        this.bloom = this.dreamIntensity * 0.3;
        
        // Update uniforms
        this.uniforms.intensity.value = this.dreamIntensity;
        this.uniforms.chromaticAberration.value = this.chromaticAberration;
        this.uniforms.vignette.value = this.vignette;
        this.uniforms.noise.value = this.noise;
        this.uniforms.distortion.value = this.distortion;
        this.uniforms.colorShift.value = this.colorShift;
        this.uniforms.bloom.value = this.bloom;
    }

    TriggerChromaticAberration() {
        this.chromaticAberration = Math.min(1.0, this.chromaticAberration + 0.3);
        this.uniforms.chromaticAberration.value = this.chromaticAberration;
        
        // Fade back down
        setTimeout(() => {
            this.chromaticAberration = Math.max(0, this.chromaticAberration - 0.3);
            this.uniforms.chromaticAberration.value = this.chromaticAberration;
        }, 1000);
    }

    TriggerDistortion() {
        this.distortion = Math.min(1.0, this.distortion + 0.4);
        this.uniforms.distortion.value = this.distortion;
        
        setTimeout(() => {
            this.distortion = Math.max(0, this.distortion - 0.4);
            this.uniforms.distortion.value = this.distortion;
        }, 1500);
    }

    TriggerColorShift() {
        this.colorShift = Math.min(1.0, this.colorShift + 0.5);
        this.uniforms.colorShift.value = this.colorShift;
        
        setTimeout(() => {
            this.colorShift = Math.max(0, this.colorShift - 0.5);
            this.uniforms.colorShift.value = this.colorShift;
        }, 2000);
    }

    TriggerBloom() {
        this.bloom = Math.min(1.0, this.bloom + 0.6);
        this.uniforms.bloom.value = this.bloom;
        
        setTimeout(() => {
            this.bloom = Math.max(0, this.bloom - 0.6);
            this.uniforms.bloom.value = this.bloom;
        }, 800);
    }

    Render() {
        if (!this.isInitialized || !this.renderer || !this.scene || !this.camera) return;
        
        // Update time uniform
        this.uniforms.time.value = this.time;
        
        // For now, just update uniforms - we'll integrate post-processing later
        // This prevents conflicts with the main render loop
    }

    Update(deltaTime) {
        if (!this.isInitialized) return;
        
        this.time += deltaTime;
        
        // Update intensity-based effects
        this.UpdateIntensityBasedEffects();
        
        // Update uniforms for shader effects (but don't render yet)
        this.uniforms.time.value = this.time;
    }

    Resize(width, height) {
        if (this.renderTarget) {
            this.renderTarget.setSize(width, height);
        }
    }
}
