# Phettaverse Dream Emulator - Architecture Documentation

## Overview
This project builds on the **three-fps** codebase, which uses an Entity-Component System (ECS) pattern with Three.js for rendering and Ammo.js for physics.

---

## Core Architecture (Existing three-fps)

### Entity-Component System

**Entity** (`src/Entity.js`)
- Container for components
- Holds position, rotation, name
- Broadcasts messages between components
- Update lifecycle: `PhysicsUpdate(world, timeStep)` → `Update(timeElapsed)`

**Component** (`src/Component.js`)
- Base class for all functionality
- Lifecycle methods:
  - `Initialize()` - called after all entities are added
  - `Update(timeElapsed)` - called every frame
  - `PhysicsUpdate(world, timeStep)` - called during physics tick
- Can access other components via `this.GetComponent(name)`
- Can find other entities via `this.FindEntity(name)`

**EntityManager** (`src/EntityManager.js`)
- Manages all entities
- Calls `EndSetup()` to initialize all components
- Drives update loops for physics and rendering

### Main Loop

**Location**: `src/entry.js` lines 331-356

```javascript
OnAnimationFrameHandler = (t) => {
    // Calculate delta time
    const delta = t - this.lastFrameTime;
    let timeElapsed = Math.min(1.0 / 30.0, delta * 0.001);
    
    this.Step(timeElapsed);  // ← Hook Point A
    this.lastFrameTime = t;
    
    window.requestAnimationFrame(this.OnAnimationFrameHandler);
}

Step(elapsedTime) {
    this.physicsWorld.stepSimulation(elapsedTime, 10);
    // ↓ Hook Point B (physics callbacks happen here)
    
    this.entityManager.Update(elapsedTime);  // ← Hook Point C
    
    this.renderer.render(this.scene, this.camera);
    this.stats.update();
}
```

**Hook Points for Dream Logic:**
- **Hook A**: Before physics/render - good for pre-frame setup
- **Hook B**: During physics step - `PhysicsUpdate()` callbacks fire here
- **Hook C**: After physics, before render - `Update()` callbacks fire here
  - **This is where we inject DreamSession logic**

### Player Controller

**PlayerControls** (`src/entities/Player/PlayerControls.js`)
- First-person camera control (mouse look)
- Movement input (WASD)
- Pointer lock
- Updates: lines 101-133 in `Update(t)` method

**PlayerPhysics** (`src/entities/Player/PlayerPhysics.js`)
- Capsule rigidbody (radius 0.3, height 1.3, mass 5)
- Jump detection via collision manifolds
- Controlled via `body.setLinearVelocity()`

**Key Properties:**
- Player position: `camera.position` (synced with physics body)
- Player rotation: `this.angles` (pitch/yaw Euler angles)
- Movement speed: `this.speed` (Vector3, max 7.0 units/s)

---

## Dream Emulator Systems (New)

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FPSGameApp                           │
│  ┌────────────────────────────────────────────────┐    │
│  │         EntityManager.Update(t)                │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │  DreamSession (Component)                │  │    │
│  │  │  - Session timer (600s)                  │  │    │
│  │  │  - End detection                         │  │    │
│  │  │  - Triggers fade & restart               │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │  SessionState (Component)                │  │    │
│  │  │  - Seed generation                       │  │    │
│  │  │  - localStorage persistence              │  │    │
│  │  │  - Session count                         │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │  MoodTracker (Component)                 │  │    │
│  │  │  - Upper/Downer counter                  │  │    │
│  │  │  - Static/Dynamic counter                │  │    │
│  │  │  - Classification                        │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────┐  │    │
│  │  │  ZoneManager (Component)                 │  │    │
│  │  │  - Load/unload zones                     │  │    │
│  │  │  - Spawn objects                         │  │    │
│  │  │  - Handle transitions                    │  │    │
│  │  └──────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

**Session Start:**
1. `SessionState.Initialize()` reads localStorage for previous mood
2. Generates seed based on: `sessionCount + previousMood + Date.now()`
3. `DreamSession.Initialize()` starts timer at 600 seconds
4. `ZoneManager.Initialize()` loads starting zone based on seed

**During Play:**
1. Player moves/interacts (existing PlayerControls)
2. `MoodTracker.Update(t)` increments counters based on behavior
3. `ZoneManager.Update(t)` detects collisions, triggers transitions
4. `DreamSession.Update(t)` counts down timer

**Session End:**
1. `DreamSession` detects timeout or fatal condition
2. Broadcasts `{ topic: 'dream.end' }` message
3. `FadeEffect` shows overlay
4. `MoodTracker` classifies final mood
5. `SessionState` saves mood to localStorage
6. After 3 seconds, restart (`FPSGameApp.StartGame()`)

### File Structure (New)

```
src/
├── entities/
│   ├── DreamSession/
│   │   ├── DreamSession.js       ← Timer, end detection
│   │   ├── SessionState.js       ← Seed, persistence
│   │   └── FadeEffect.js         ← Screen fade overlay
│   ├── MoodTracker/
│   │   └── MoodTracker.js        ← Behavior → mood
│   └── Zones/
│       ├── ZoneDefinitions.js    ← Zone metadata
│       ├── ZoneManager.js        ← Load/unload zones
│       └── ZoneObject.js         ← Interactive objects
```

---

## Modifications to Existing Code

### `src/entry.js`

**Add to imports:**
```javascript
import DreamSession from './entities/DreamSession/DreamSession'
import SessionState from './entities/DreamSession/SessionState'
import FadeEffect from './entities/DreamSession/FadeEffect'
```

**Modify `EntitySetup()` (after line 290):**
```javascript
// Dream System
const dreamEntity = new Entity();
dreamEntity.SetName('DreamManager');
dreamEntity.AddComponent(new SessionState());
dreamEntity.AddComponent(new DreamSession());
dreamEntity.AddComponent(new FadeEffect());
this.entityManager.Add(dreamEntity);
```

### `src/entities/UI/UIManager.js`

**Add method:**
```javascript
SetTimer(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    document.getElementById("dream_timer").innerText = 
        `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

### `src/index.html`

**Add to HUD (after line with health/ammo):**
```html
<div id="dream_timer" style="position:absolute; top:10px; left:50%; 
     transform:translateX(-50%); color:#fff; font-size:20px;">
    10:00
</div>
<div id="fade_overlay" style="position:absolute; top:0; left:0; 
     width:100%; height:100%; background:#000; opacity:0; 
     pointer-events:none; transition:opacity 0.5s;">
</div>
```

---

## Integration Strategy

### Phase 1: Minimal Changes
- Create new Entity with DreamSession components
- Don't modify player/level initially
- Use existing scene/physics as-is
- Add UI elements for timer

### Phase 2: Remove FPS Combat
- Remove weapon system
- Remove NPCs/enemies
- Remove ammo boxes
- Simplify UI (just timer)

### Phase 3: Zone System
- Replace Level entity with ZoneManager
- Procedural geometry instead of GLB
- Dynamic loading/unloading

### Phase 4: Interaction
- Collision detection on zone objects
- Trigger zone transitions
- Player repositioning

---

## Notes

**Why Entity-Component?**
- Matches existing three-fps pattern
- Easy to add/remove features
- Clean separation of concerns
- Each component is independently testable

**Alternative Considered:**
- Modifying entry.js directly → rejected (messy, hard to maintain)
- Creating parallel system → rejected (duplicate code)
- ✅ Using ECS → clean, modular, extensible

**Performance Considerations:**
- DreamSession.Update() runs 60fps → keep logic minimal
- Timer check: simple subtraction
- Mood tracking: increment counters (fast)
- Zone transitions: async loading with fade (smooth)


