# MediaPipe tasks call into Java from native code and read protobuf messages by reflection.
-keep class expo.modules.poselandmarker.** { *; }
-keep class com.google.mediapipe.** { *; }
-keep class com.google.protobuf.** { *; }
-dontwarn com.google.mediapipe.**
-dontwarn com.google.protobuf.**
# MediaPipe logs through Google Flogger, which finds its caller by class name on the stack; R8
# renaming breaks it ("no caller found on the stack") and every task fails to start in release.
-keep class com.google.common.flogger.** { *; }
-dontwarn com.google.common.flogger.**
-keep class com.google.android.datatransport.** { *; }
-keepclassmembers class * extends com.google.protobuf.GeneratedMessageLite { *; }
