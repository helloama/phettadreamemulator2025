# Phettaverse Dream Emulator - Testing Guide

## Quick Start

### 1. Start Development Server
```bash
npm start
```

The server will start at: **http://localhost:8080/**

### 2. Open Browser
Navigate to http://localhost:8080/ in your browser

### 3. Open DevTools
Press `F12` or `Cmd+Option+I` (Mac) to open DevTools
- **Console Tab**: See system logs
- **Application Tab**: Check localStorage

---

## Test Checklist

### ✅ Basic Functionality

1. **Menu Screen**
   - [ ] "Shooter Game Demo" title visible
   - [ ] "NEW GAME" button visible
   - [ ] Black background

2. **Game Start**
   - [ ] Click "NEW GAME" button
   - [ ] Screen fades in from black (2 seconds)
   - [ ] Timer appears at top center: "10:00"
   - [ ] Existing FPS level loads (for now)
   - [ ] Crosshair visible
   - [ ] Can move with WASD
   - [ ] Can look around with mouse

3. **Timer Countdown**
   - [ ] Timer counts down: "9:59", "9:58", etc.
   - [ ] Timer updates every second
   - [ ] Timer stays centered at top of screen

4. **Death Detection**
   - [ ] Walk to edge of level
   - [ ] Fall off into void
   - [ ] Screen quickly fades to black (0.3 seconds)
   - [ ] After 3 seconds, timer resets to "10:00"

### ✅ Console Logs

**Expected logs on game start:**
```
[SessionState] Session #1
[SessionState] Seed: [random number]
[SessionState] Previous mood: none
[DreamSession] Session started - Duration: 600 seconds
[FadeEffect] Initialized
[FadeEffect] Fading in over 2 seconds
[FadeEffect] Fade in complete
```

**Expected logs on death:**
```
[DreamSession] Session ending - death : Fell into the void
[FadeEffect] Dream ended: death
[FadeEffect] Fading out over 0.3 seconds
[SessionState] Session ended, waiting for mood classification...
[FadeEffect] Fade out complete
[DreamSession] Restarting session...
[FadeEffect] Dream restarting
[FadeEffect] Fading in over 2 seconds
```

### ✅ localStorage Persistence

**Check in DevTools → Application → Local Storage → http://localhost:8080:**

Expected keys:
- `phetta_dream_session_count`: Should increment with each game
- `phetta_dream_last_seed`: Current session seed
- `phetta_dream_session_history`: JSON array of last 10 sessions
- `phetta_dream_last_mood`: Will be `null` until MoodTracker is implemented

**Test persistence:**
1. Play game (start → die)
2. Check `session_count` value (should be 1)
3. Refresh page
4. Click NEW GAME again
5. Check `session_count` value (should be 2)

### ✅ Seed Generation

**Test deterministic randomness:**
1. Open Console
2. Type: `window._APP.entityManager.Get('DreamManager').GetComponent('SessionState').GetSeededRandom(0, 100)`
3. Press Enter multiple times
4. Numbers should be pseudo-random but deterministic

---

## Advanced Tests

### Test Timeout (Quick)

**Edit**: `src/entities/DreamSession/DreamSession.js`
```javascript
// Line 16, change from:
this.maxDuration = 600; // 10 minutes

// To:
this.maxDuration = 10; // 10 seconds
```

**Expected**:
- Timer shows "0:10"
- Counts down faster
- After 10 seconds, slow fade to black (1.5s)
- Console: `[DreamSession] Session ending - timeout : Session time expired`

### Test Fade Speeds

**Death fade**: 0.3 seconds (quick cut)
**Timeout fade**: 1.5 seconds (slow fade)
**Start fade**: 2.0 seconds (smooth entrance)

### Test Multiple Sessions

1. Play 5+ games in a row
2. Check localStorage `session_history`
3. Should see array with 5 entries
4. Each entry has: session number, timestamp, mood (null for now), duration

---

## Known Behavior

### Current State
- ✅ Timer works
- ✅ Death detection works
- ✅ Fades work
- ✅ Persistence works
- ⚠️ Scene doesn't reload on restart (just timer resets)
- ⚠️ Mood is always `null` (MoodTracker not implemented yet)
- ⚠️ Still shows FPS game elements (ammo, health, enemies)

### Temporary Elements (Will Remove)
- Weapon/gun
- Ammo counter
- Health bar
- Mutant enemies
- Ammo boxes
- Crosshair

### Permanent Elements (Keep)
- Player movement (WASD)
- Mouse look
- Timer
- Fade overlay

---

## Debugging

### If timer doesn't appear:
1. Check browser console for errors
2. Verify `#dream_timer` element exists in DOM
3. Check if UIManager is initialized

### If fade doesn't work:
1. Check browser console for errors
2. Verify `#fade_overlay` element exists
3. Check if FadeEffect component is added to DreamManager

### If session doesn't end on death:
1. Check player Y position in console: `window._APP.entityManager.Get('Player').Position.y`
2. Should trigger when Y < -10

### If localStorage doesn't save:
1. Check if browser allows localStorage
2. Check browser privacy settings
3. Try incognito mode to test

---

## Performance Metrics

**Target FPS**: 60 FPS
**Timer Update**: Every frame (60Hz)
**Fade Update**: Every frame during transition
**localStorage Write**: Only on session end

**Check FPS**:
- Stats.js widget in top-left corner
- Should show ~60 FPS on modern hardware

---

## Next Phase Preview

**Phase 3 will add:**
- Zone system (procedural geometry)
- Zone transitions (on object touch)
- Multiple zone types
- Seed-based zone generation

**Then you'll test:**
- Touching objects triggers zone changes
- Each zone looks different
- Same seed generates same zones

---

## Common Issues

### Issue: Webpack OpenSSL Error
**Solution**: Use `npm start` instead of `npm run build`

### Issue: Screen is black after fade in
**Check**: FadeEffect opacity should be 0 after fade in
**Solution**: Check console for fade complete event

### Issue: Timer shows "NaN:NaN"
**Check**: DreamSession.timeRemaining value
**Solution**: Verify DreamSession component is initialized

### Issue: Can't move player
**Check**: Pointer lock is active (click on screen)
**Solution**: Click in game window to lock pointer

---

## Success Criteria

✅ Phase 1 & 2 are successful if:
1. Timer counts down from 10:00
2. Player can move and look around
3. Falling off world triggers death and restart
4. Fades are smooth
5. Session count increments in localStorage
6. No console errors
7. FPS stays at 60

**If all above pass → Ready for Phase 3! 🎉**


