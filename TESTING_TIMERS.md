# Testing Timer Modifications

**⚠️ IMPORTANT: These are temporary modifications for testing purposes only!**

## Overview
To facilitate testing of dream effects, the following timers have been temporarily shortened:

## Modified Files and Values

### 1. DreamSession.js
- **Original**: `maxDuration = 600` (10 minutes)
- **Testing**: `maxDuration = 60` (1 minute)
- **Location**: Line 18
- **TODO Comment**: `// TODO: Revert maxDuration to 600 seconds (10 minutes) after testing`

### 2. DreamEnvironmentModifier.js
- **Original**: `dreamIntensity = Math.min(msg.timeElapsed / 600, 1.0)` (10 minutes)
- **Testing**: `dreamIntensity = Math.min(msg.timeElapsed / 60, 1.0)` (1 minute)
- **Location**: Line 73
- **TODO Comment**: `// TODO: Revert to 600 seconds (10 minutes) after testing`

- **Original**: Texture swap interval `5000 + Math.random() * 10000` (5-15 seconds)
- **Testing**: `1000 + Math.random() * 2000` (1-3 seconds)
- **Location**: Line 133
- **TODO Comment**: `// TODO: Revert to 5000-15000ms after testing - temporarily faster for testing`

- **Original**: Ambient events interval `8000 + Math.random() * 15000` (8-23 seconds)
- **Testing**: `2000 + Math.random() * 3000` (2-5 seconds)
- **Location**: Line 176
- **TODO Comment**: `// TODO: Revert to 8000-23000ms after testing - temporarily faster for testing`

### 3. DreamAudioSystem.js
- **Original**: Random audio events interval `8000 + Math.random() * 12000` (8-20 seconds)
- **Testing**: `2000 + Math.random() * 3000` (2-5 seconds)
- **Location**: Line 172
- **TODO Comment**: `// TODO: Revert to 8000-20000ms after testing - temporarily faster for testing`

## Effect Thresholds Lowered
- **Texture Swapping**: Lowered from `dreamIntensity > 0.2` to `dreamIntensity > 0.1`
- **Ambient Events**: Lowered from `dreamIntensity > 0.3` to `dreamIntensity > 0.1`
- **Audio Events**: Lowered from `dreamIntensity > 0.2` to `dreamIntensity > 0.1`

## What to Revert After Testing

1. **Dream Session Duration**: Change back to 600 seconds (10 minutes)
2. **Dream Intensity Ramp**: Change back to 600 seconds (10 minutes)
3. **Texture Swap Intervals**: Change back to 5-15 second intervals
4. **Ambient Event Intervals**: Change back to 8-23 second intervals
5. **Audio Event Intervals**: Change back to 8-20 second intervals
6. **Effect Thresholds**: Change back to original values (0.2, 0.3, 0.2)

## Testing Benefits
- **Faster Feedback**: Effects trigger much more quickly for testing
- **Quick Iteration**: 1-minute sessions instead of 10-minute sessions
- **Immediate Results**: Can see texture swapping and ambient events within seconds
- **Rapid Testing**: Multiple test cycles in a short time

## When to Revert
- ✅ After confirming all dream effects work properly
- ✅ After testing mood tracking and session flow
- ✅ After verifying audio-visual integration
- ✅ Before final release or demo

---

**Created**: $(date)
**Purpose**: Temporary testing modifications for Phettaverse Dream Emulator
**Status**: ACTIVE - Remember to revert before release!
