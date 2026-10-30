# Local AI: the module is created by name, and Llamatik's native code calls back into Kotlin
# (stream callbacks) and is looked up with Class.forName, so neither may be renamed or removed.
-keep class expo.modules.localai.** { *; }
-keep class com.llamatik.** { *; }
-keep interface com.llamatik.** { *; }
-dontwarn com.llamatik.**
