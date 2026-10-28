# MediaPipe Model Assets

This directory should contain MediaPipe model files (.task) for the SETU Beta Camera Lab.

## Required Models

Download from https://developers.google.com/edge/mediapipe/solutions/vision

### Vision Models
- `face_landmarker.task` - Face Landmarker v2 (~40MB)
  - Download: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker
  - Place in: android/src/main/assets/face_landmarker.task

- `pose_landmarker.task` - Pose Landmarker (~40MB)
  - Download: https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
  - Place in: android/src/main/assets/pose_landmarker.task

- `hand_landmarker.task` - Hand Landmarker (~20MB)
  - Download: https://developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker
  - Place in: android/src/main/assets/hand_landmarker.task

- `gesture_recognizer.task` - Gesture Recognizer (~20MB)
  - Download: https://developers.google.com/edge/mediapipe/solutions/vision/gesture_recognizer
  - Place in: android/src/main/assets/gesture_recognizer.task

- `image_segmenter.task` - Image Segmenter (Selfie/Hair) (~20MB)
  - Download: https://developers.google.com/edge/mediapipe/solutions/vision/image_segmenter
  - Place in: android/src/main/assets/image_segmenter.task

## Implementation Status

All required vision models and segmenters have been downloaded and placed in:
- `android/src/main/assets/` (root asset path)
- `android/src/main/assets/models/` (nested model registry path)

### Placed Models:
- `face_landmarker.task` (MediaPipe Face Landmarker v2)
- `pose_landmarker.task` (MediaPipe Pose Landmarker)
- `hand_landmarker.task` (MediaPipe Hand Landmarker)
- `gesture_recognizer.task` (MediaPipe Gesture Recognizer)
- `image_segmenter.task` / `selfie_multiclass_256x256.tflite` (MediaPipe Multiclass Segmenter)

## License

MediaPipe models are released under the Apache 2.0 License. Refer to the Google MediaPipe documentation for specific licensing terms for each model.
