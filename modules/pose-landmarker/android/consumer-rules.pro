# MediaPipe tasks call into Java from native code and read protobuf messages by reflection.
-keep class expo.modules.poselandmarker.** { *; }
-keep class com.google.mediapipe.** { *; }
-keep class com.google.protobuf.** { *; }
-dontwarn com.google.mediapipe.**
-dontwarn com.google.protobuf.**
