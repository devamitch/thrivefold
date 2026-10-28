# Setu Beta Scanner Module

MediaPipe-powered vision and audio features for BlinkQuest.

## Features

- **Reading Ergonomics**: Track screen distance, gaze angle, and reading fatigue
- **Posture Correction**: Monitor forward head posture, rounded shoulders, and pelvic tilt
- **Meditation Biofeedback**: Heart rate, breathing rate, and relaxation depth monitoring
- **Facial Geometry**: Pupillary distance, face shape, and asymmetry analysis

## Architecture

### Native Module (Kotlin)

- `SetuBetaScannerModule.kt` - Main Expo module
- `SetuBetaScannerPackage.kt` - Module registration
- `lifecycle/BetaSessionCoordinator.kt` - Session lifecycle management
- `vision/` - MediaPipe vision engines (Face, Pose)
- `camera/` - Camera frame handling
- `algorithms/` - Mathematical analysis engines

### React Native (TypeScript)

- `SetuBetaScanner.ts` - Native module API
- `SetuBetaScanner.types.ts` - Type definitions
- `SetuBetaScanner.events.ts` - Event types
- `hooks/useBetaScanner.ts` - React hook for session management
- `registry/betaFeatureRegistry.ts` - Feature metadata
- `screens/BetaCameraLabScreen.tsx` - Main UI screen

## Privacy

All processing happens locally on-device. No data leaves the app. No cloud inference.

## Model Requirements

The module requires MediaPipe model files to be bundled with the app:
- `face_landmarker.task` (~40MB)
- `pose_landmarker.task` (~30MB)

These should be placed in `android/app/src/main/assets/` during build.

## Usage

```typescript
import SetuBetaScanner from "setu-beta-scanner"

// Check availability
if (SetuBetaScanner.isAvailable()) {
  // Start a session
  const handle = await SetuBetaScanner.startSession({
    featureId: "reading-ergonomics",
    cameraPosition: "front",
  })

  // Listen to events
  SetuBetaScanner.addListener("onResult", (data) => {
    console.log("Result:", data.result)
  })
}
```

## Implementation Status

- [x] Module structure
- [x] TypeScript types
- [x] Kotlin contracts
- [x] Session lifecycle
- [x] Vision engines (Face, Pose)
- [x] Algorithm engines (Geometry, Face, Posture, Reading, Meditation)
- [x] Filter algorithms (EMA, OneEuro, LowPass)
- [x] React Native hooks
- [x] Feature registry
- [x] Basic UI screen
- [ ] Camera integration (requires VisionCamera setup)
- [ ] Model asset bundling
- [ ] Result emission to JavaScript
- [ ] Feature-specific overlays
- [ ] Comprehensive testing
- [ ] Documentation

## License

MIT
