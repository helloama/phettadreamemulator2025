# Phettaverse Dream Emulator - Development Gameplan

## Project Overview
A playable dream simulator inspired by LSD: Dream Emulator, built on the three-fps framework.
Player wanders surreal realms, triggers transitions through interaction, and influences future dreams through behavior tracking.

---

## Phase 1: Foundation & Setup ✅ COMPLETE

### I-1: Environment Verification ✅
- [x] Fork three-fps and set up development environment
- [x] Verify npm install works
- [x] Verify npm start works
- [x] Test build runs locally (has OpenSSL issue but dev server works)
- [x] Review existing FPS controller

**Outputs**: Working dev environment, understanding of codebase structure

### I-2: Core Architecture Planning ✅
- [x] Map out three-fps entry points (entry.js lines 331-356 - main loop)
- [x] Identify where to inject dream logic hooks
- [x] Plan Entity/Component structure for dream systems
- [x] Document existing systems we'll modify vs. new systems

**Outputs**: `ARCHITECTURE.md`, hook point locations documented

---

## Phase 2: Minimal Dream Session (MVP) ✅ COMPLETE

### DS-1: Basic Dream Timer ✅
- [x] Create `DreamSession.js` component
- [x] Add 10-minute countdown timer
- [x] Display timer in UI (modified UIManager.js)
- [x] Trigger session end event when timer expires
- [x] Add fade-out effect on end (via FadeEffect.js)
- [x] Add death detection (falling below Y = -10)

**Dependencies**: I-2
**Outputs**: `src/entities/DreamSession/DreamSession.js`

### DS-2: Session State Management ✅
- [x] Create seed generation function (LCG with Date.now())
- [x] Store session number/count in localStorage
- [x] Initialize session with seed
- [x] Add session restart capability
- [x] Track session history (last 10 sessions)
- [x] Mood-based zone selection logic

**Dependencies**: DS-1
**Outputs**: `src/entities/DreamSession/SessionState.js`

### DS-3: Fade Effect Component ✅
- [x] Create `FadeEffect.js` component
- [x] Screen fade to black on session end
- [x] Screen fade from black on session start
- [x] Variable fade speed based on end type
- [x] DOM overlay integration

**Outputs**: `src/entities/DreamSession/FadeEffect.js`

---

## Phase 2.5: UI Shell (Menu + Dream Chart) ✅ COMPLETE

### UI-1: Start Menu Overlay ✅
- [x] Minimal LSD-style menu with day counter (`Day 00X`)
- [x] Options: Start, Graph
- [x] Shows on boot and after dreams

### UI-2: Dream Chart Screen ✅
- [x] Two-axis chart: Upper/Downer × Static/Dynamic
- [x] Plots last mood point (placeholder until MoodTracker)
- [x] Return button to menu

### UI-3: Flow Wiring ✅
- [x] Menu → Start → Session → End → Chart → Menu
- [x] `DreamSession` stops auto-restart; UI manages flow

**Outputs**: `src/entities/UI/MenuUI.js`, `src/entities/UI/DreamChartUI.js`, updated `src/index.html`

---

## Phase 2.6: FPS + Dream Integration (Current)

### Hybrid-1: FPS Base with Dream Overlay ✅
- [x] Restore original FPS level with collision detection
- [x] Keep dream session timer running over FPS gameplay
- [x] Maintain dream chart and menu system
- [x] E key to access dream chart during FPS gameplay
- [x] On-screen button for mobile accessibility

### Hybrid-2: Test Integrated Experience ✅
- [x] Test 10-minute dream sessions in FPS environment
- [x] Verify dream chart updates after sessions
- [x] Test death detection (falling off FPS map)
- [x] Ensure localStorage persistence works with FPS gameplay
- [x] Change dream chart key from D to E (D is used for walking)
- [x] Implement player death sequence with animations

## Phase 4: Seamless Dream FPS Integration ✅ COMPLETE

### Dream-FPS-1: LSD-Style Environment Effects ✅
- [x] Create DreamEnvironmentModifier component
- [x] Apply color shifting based on mood (Upper/Downer/Static/Dynamic)
- [x] Implement texture swapping (LSD-style random material changes)
- [x] Add ambient events (object scaling, rotation, lighting changes)
- [x] Create floating geometric objects
- [x] Progressive dream intensity over session time

### Dream-FPS-2: Mood Tracking in FPS Environment ✅
- [x] Create MoodTracker component with LSD-style axes
- [x] Track movement (Static vs Dynamic)
- [x] Track combat and interactions (Upper vs Downer)
- [x] Track environmental factors (bright/dark zones)
- [x] Classify final mood at session end
- [x] Store mood data for next session influence

### Dream-FPS-3: Seamless Integration ✅
- [x] Remove mode switching - FPS is the dream experience
- [x] Integrate dream effects directly into FPS gameplay
- [x] Mood influences visual effects in real-time
- [x] Session progression increases surreal effects
- [x] Maintain all FPS mechanics (combat, movement, NPCs)

**Outputs**: `src/entities/DreamEnvironment/DreamEnvironmentModifier.js`, `src/entities/MoodTracker/MoodTracker.js`

## Phase 5: Audio-Visual Enhancements ✅ COMPLETE

### Audio-Visual-1: Adaptive Audio System ✅
- [x] Create DreamAudioSystem component with Web Audio API
- [x] LSD-style ambient drone with frequency modulation
- [x] Mood-responsive audio profiles (Upper/Downer/Static/Dynamic)
- [x] Random audio events (tones, glockenspiel, bells, whispers, distortion)
- [x] Real-time audio adaptation based on mood and session progress
- [x] Event-driven audio responses to dream environment changes

### Audio-Visual-2: Visual Effects System ✅
- [x] Create DreamVisualEffects component with custom shaders
- [x] Post-processing pipeline with render targets
- [x] LSD-style effects: chromatic aberration, vignette, noise, distortion
- [x] Mood-based color grading and visual feedback
- [x] Event-driven visual effects (color shifts, bloom, warping)
- [x] Progressive intensity increase over session time

### Audio-Visual-3: Integrated Event System ✅
- [x] Connect dream environment events to audio/visual systems
- [x] Texture swaps trigger chromatic aberration and random tones
- [x] Object scaling triggers distortion effects and bells
- [x] Lighting changes trigger color shifts and glockenspiel
- [x] Floating objects trigger bloom effects and whispers
- [x] Real-time synchronization between all systems

**Outputs**: `src/entities/Audio/DreamAudioSystem.js`, `src/entities/VisualEffects/DreamVisualEffects.js`

## Phase 3: First Dream Zone ✅ COMPLETE

### WZ-1: Single Zone Definition ✅
- [x] Create `ZoneDefinitions.js` with "Void" zone
- [x] Define zone metadata: name, color palette, ambient sound
- [x] Create simple zone schema with procedural objects

**Outputs**: `src/entities/Zones/ZoneDefinitions.js`

### WZ-2: Zone Loader (Minimal) ✅
- [x] Create `ZoneManager.js` component
- [x] Implement loadZone() for single zone
- [x] Clear existing level geometry (keep player & camera)
- [x] Load simple procedural geometry (cubes, spheres, torus)
- [x] Apply zone colors/materials and lighting

**Outputs**: `src/entities/Zones/ZoneManager.js`

### WZ-3: Zone Objects (Interactive) ✅
- [x] Spawn 6-12 simple geometric objects in zone
- [x] Add basic collision detection (reuse ammo.js)
- [x] Make objects different colors from palette
- [x] Random placement based on seed
- [x] Add mode switching (FPS ↔ Dream Zones)
- [x] T key and purple button for mode toggle

**Outputs**: Procedural object spawning system, mode switching

**Dependencies**: Phase 2, UI Shell
**Outputs**: Working hybrid FPS + Dream experience

---

## Phase 3: First Dream Zone (Future)

### WZ-1: Single Zone Definition
- [ ] Create `ZoneDefinitions.js` with one test zone (e.g., "Void")
- [ ] Define zone metadata: name, color palette, ambient sound
- [ ] Create simple zone schema (just basic parameters for now)

**Dependencies**: None
**Outputs**: `src/entities/Zones/ZoneDefinitions.js`

### WZ-2: Zone Loader (Minimal)
- [ ] Create `ZoneManager.js` component
- [ ] Implement loadZone() for single zone
- [ ] Clear existing level geometry (keep player & camera)
- [ ] Load simple procedural geometry (cubes, spheres)
- [ ] Apply zone colors/materials

**Dependencies**: WZ-1, DS-2
**Outputs**: `src/entities/Zones/ZoneManager.js`

### WZ-3: Zone Objects (Interactive)
- [ ] Spawn 5-10 simple geometric objects in zone
- [ ] Add basic collision detection (reuse ammo.js)
- [ ] Make objects different colors
- [ ] Random placement based on seed

**Dependencies**: WZ-2
**Outputs**: Procedural object spawning system

---

## Phase 4: Basic Interaction & Linking

### IL-1: Touch Detection
- [ ] Listen for player collision with zone objects
- [ ] Log collision events to console
- [ ] Add visual feedback (object color change on touch)
- [ ] Play simple sound on touch (reuse audio system)

**Dependencies**: WZ-3
**Outputs**: Collision event system for interactive objects

### IL-2: Zone Linking (Simple)
- [ ] Create second zone definition (e.g., "Garden")
- [ ] On object touch, trigger zone transition
- [ ] Fade screen to black
- [ ] Load new zone
- [ ] Fade screen back in
- [ ] Random zone selection (50/50 between two zones)

**Dependencies**: IL-1, WZ-1
**Outputs**: Two-zone linking system

### IL-3: Respawn Player
- [ ] Store player position before transition
- [ ] Respawn at random valid location in new zone
- [ ] Ensure player doesn't spawn inside objects
- [ ] Maintain player camera orientation

**Dependencies**: IL-2
**Outputs**: Player repositioning logic

---

## Phase 5: Mood Tracking (Basic)

### MS-1: Mood Axis Definition
- [ ] Create `MoodTracker.js` component
- [ ] Define two axes: Upper/Downer, Static/Dynamic
- [ ] Initialize counters at zero each session
- [ ] Define what increments each counter (placeholder logic)

**Dependencies**: DS-1
**Outputs**: `src/entities/MoodTracker/MoodTracker.js`

### MS-2: Mood Counter Updates
- [ ] Increment "Dynamic" when player moves
- [ ] Increment "Static" when player stands still
- [ ] Increment "Upper" in bright zones
- [ ] Increment "Downer" in dark zones
- [ ] Log mood values each second

**Dependencies**: MS-1, WZ-2
**Outputs**: Active mood tracking during play

### MS-3: Mood Classification
- [ ] At session end, classify final mood (4 categories)
- [ ] Display mood result in console
- [ ] Store mood result to localStorage
- [ ] Show simple mood text on end screen

**Dependencies**: MS-2, DS-1
**Outputs**: Mood classification algorithm

### MS-4: Mood → Next Session
- [ ] Read previous mood from localStorage
- [ ] Bias seed generation based on prior mood
- [ ] Bias starting zone selection
- [ ] Test: "Downer" → darker starting zone

**Dependencies**: MS-3, DS-2
**Outputs**: Mood-influenced session generation

---

## Phase 6: Premature Endings

### EC-1: Fatal Conditions
- [ ] Detect player falling below Y threshold (e.g., y < -10)
- [ ] Add void/kill zones to zone definitions
- [ ] Trigger immediate session end on fall
- [ ] Play death sound/effect

**Dependencies**: WZ-2
**Outputs**: Death detection system

### EC-2: End Sequence
- [ ] Consolidate timeout and fatal endings into one handler
- [ ] Add different fade effects (fast cut vs slow fade)
- [ ] Display "Dream Over" message
- [ ] Wait 3 seconds then restart new session

**Dependencies**: EC-1, DS-3
**Outputs**: Unified ending system

---

## Phase 7: Visual/Audio Foundation

### VFX-1: Post-Processing Setup
- [ ] Add EffectComposer to renderer
- [ ] Test basic bloom pass
- [ ] Test chromatic aberration
- [ ] Test vignette effect
- [ ] Make effects toggle-able by zone

**Dependencies**: WZ-2
**Outputs**: Post-processing pipeline

### VFX-2: Zone Atmosphere
- [ ] Add fog per zone (color, density)
- [ ] Ambient lighting per zone
- [ ] Simple skybox/background color per zone
- [ ] Audio: ambient loop per zone

**Dependencies**: VFX-1, WZ-1
**Outputs**: Atmospheric rendering per zone

### VFX-3: Transition Effects
- [ ] Screen flash on zone transition
- [ ] Optional: texture distortion during fade
- [ ] Whoosh/warp sound effect
- [ ] Variable transition speed based on seed

**Dependencies**: IL-2, VFX-1
**Outputs**: Polished zone transitions

---

## Phase 8: Expand Zones (Content)

### Content-1: More Zone Types
- [ ] Add 3-5 more zone definitions
- [ ] Each with unique color palette
- [ ] Each with unique geometry type (spheres, cubes, pyramids, etc.)
- [ ] Each with unique sound

**Dependencies**: WZ-1
**Outputs**: 5-7 total zones

### Content-2: Zone Variants
- [ ] Add texture variations within same zone
- [ ] Add object density variations
- [ ] Add scale variations (small/large versions)
- [ ] Seed-based variation selection

**Dependencies**: Content-1, DS-2
**Outputs**: Increased zone variety

---

## Phase 9: Advanced Features

### Advanced-1: Rare Events
- [ ] Define "rare event" list (hallucinations, entities)
- [ ] Random spawn chance (1-5% per minute)
- [ ] Visual effects: floating eyes, geometry distortion
- [ ] Audio cues for rare events
- [ ] Events unlock after N sessions

**Dependencies**: MS-4, VFX-2
**Outputs**: Special event system

### Advanced-2: Texture Evolution
- [ ] Track total session count
- [ ] After 10+ sessions, allow distorted textures
- [ ] After 20+ sessions, allow glitch effects
- [ ] Store texture evolution state in localStorage

**Dependencies**: DS-2, VFX-1
**Outputs**: Progression system

---

## Phase 10: Narrative Integration

### Narrative-1: TV Man Intro
- [ ] Create TV Man model (simple geometric head with screen)
- [ ] Add intro sequence (first-time player only)
- [ ] TV Man dialogue system (text on screen)
- [ ] Skip intro after first play

**Dependencies**: Content-1
**Outputs**: Intro experience, TV Man asset

### Narrative-2: Phettaverse Hub
- [ ] Create "home base" zone (squishy fields)
- [ ] Player can return here between dreams
- [ ] TV Man present in hub
- [ ] Hub unlocks after 5 sessions

**Dependencies**: Narrative-1, MS-4
**Outputs**: Hub zone, return mechanic

---

## Asset Checklist (3D Models & Assets Needed)

### Immediate (Phase 3-4):
- **None!** Use procedural geometry (THREE.BoxGeometry, SphereGeometry, etc.)
- Simple color materials (no textures initially)

### Short-term (Phase 7-8):
- [ ] **Skybox textures** (6 images per zone type, or equirectangular)
  - Void: black/dark gradient
  - Garden: pastel sky
  - City: abstract geometric patterns
  - Temple: warm glows
  - (5-7 total zone skyboxes)
  
- [ ] **Sound assets**:
  - [ ] 5-7 ambient loops (one per zone) - ~30-60 seconds each
  - [ ] Whoosh/warp transition sound
  - [ ] Touch/interact sound
  - [ ] Death/fall sound
  - [ ] Rare event sounds (whispers, drones, glitches)

### Medium-term (Phase 9-10):
- [ ] **TV Man model** (.glb)
  - Retro TV as head
  - Simple geometric body
  - Screen displays static or simple face
  
- [ ] **Interactive objects** (.glb) - 10-15 unique models:
  - Abstract shapes (totems, arches, crystals)
  - Geometric animals (low-poly)
  - Floating platforms
  - Doorway frames
  - Surreal plants
  - (All low-poly, dreamlike aesthetic)

- [ ] **Optional textures**:
  - Distorted/glitch textures for late-game
  - Psychedelic patterns
  - Gradient/noise maps

### Long-term (Polish):
- [ ] **Particle effects** (can use Three.js particles):
  - Floating dust/motes
  - Warp particles
  - Dream fog
  
- [ ] **Music**:
  - Main ambient drone/loop
  - Ending music variations
  - Rare event stingers

---

## Current Status
**Active Phase**: Phase 7: LSD Dream Emulator + FPS Hybrid + VRM Avatars
**Completed Phases**: Phase 1 ✅, Phase 2 ✅, UI Shell ✅, FPS Restoration ✅, Phase 3 ✅, Phase 4 ✅, Phase 5 ✅, Phase 6 ✅
**Next Task**: Implement core LSD mechanics with FPS elements and VRM avatar support
**Blockers**: None

**⚠️ TESTING MODE ACTIVE**: Dream timers shortened for testing (see TESTING_TIMERS.md)
- Session duration: 60 seconds (was 600)
- Effect intervals: 1-5 seconds (was 5-23 seconds)
- Effect thresholds: Lowered for faster triggering

**Recent Achievements**:
- ✅ Dream Session timer system working
- ✅ localStorage persistence implemented
- ✅ Seed generation with deterministic RNG
- ✅ Fade transitions on session start/end
- ✅ Death detection (falling off world)
- ✅ UI integration complete (Menu, Dream Chart, ESC key)
- ✅ FPS mode restored with full collision detection
- ✅ NPCs, weapons, ammo system working
- ✅ All duplicate import errors resolved
- ✅ **LSD Revamped-inspired Dream Logic System implemented**
- ✅ **Non-Euclidean spaces and gravity manipulation**
- ✅ **Reality distortion system with 8 distortion types**
- ✅ **Advanced time manipulation and physics violations**
- ✅ **Core LSD Dream Emulator mechanics implemented**
- ✅ **2D Mood Graph system (Upper/Downer × Static/Dynamic)**
- ✅ **Collision-based scene linking system**
- ✅ **VRM Avatar system for Phettaverse characters**
- ✅ **Hindu-inspired lore system (Phetta, TV Man, Pink Rat)**

**Dev Server**: Running at http://localhost:8080/

---

## Notes
- **Current Approach**: Hybrid FPS + Dream system - LSD-style dream sessions overlaid on functional FPS gameplay
- **Benefits**: Full collision detection, NPCs, weapons while maintaining dream session mechanics
- **Future**: Can still implement pure dream zones later while keeping FPS as option
- Focus on procedural generation before adding custom 3D assets
- Keep art style abstract/minimal to avoid overwhelming scope
- LSD: Dream Emulator used simple PS1-era graphics - we can match or exceed that with basic geometries
- Audio is more important than complex visuals for dream atmosphere
- Test each phase before moving to next

---

## References
- LSD: Dream Emulator (1998) - gameplay mechanics
- Three.js docs - post-processing, procedural geometry
- Existing three-fps codebase - Entity/Component pattern, physics

