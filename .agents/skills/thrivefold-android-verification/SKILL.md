---
name: thrivefold-android-verification
description: How to build, install and look at Thrivefold on an Android emulator or phone, take screenshots, read crashes and ANRs, and avoid the Metro/parallel-agent traps. Use whenever a change must be seen working, and always for icons, splash, fonts or startup.
---

# Android verification

## Pick the build

- **Release** (`assembleRelease`) embeds the JS bundle: use it for startup, splash, icons,
  fonts and anything you'll claim works. No Metro involved.
- **Debug** loads JS from Metro on :8081; good for quick UI iteration only. If another
  session's Metro owns :8081, the app may hang on a blank/black screen — use release.
- Native or asset changes (app.json plugins, icons, splash, fonts) need
  `CI=1 pnpm exec expo prebuild --platform android --no-install` + rebuild.

```sh
pgrep -fl GradleWrapperMain            # never start a second build in parallel
cd android && ./gradlew --no-daemon :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
adb devices -l                          # emulator-5554 / physical serial
adb -s <serial> install -r android/app/build/outputs/apk/release/app-release.apk
adb -s <serial> shell pm clear com.amit.thrivefold   # fresh-install state (wipes app data)
adb -s <serial> shell am start -n com.amit.thrivefold/.MainActivity
```

## Look at it

```sh
adb -s <serial> exec-out screencap -p > shot.png        # then open the image
adb -s <serial> exec-out uiautomator dump /dev/tty | grep -o 'text="[^"]*"'
adb -s <serial> shell input tap X Y                      # pixels of the real screen size
for i in $(seq 1 12); do adb -s <serial> exec-out screencap -p > f_$i.png; done   # animation frames
```

## When it breaks

- Crash: `adb logcat -d | grep -E "FATAL EXCEPTION|ReactNativeJS"`.
- `ANR … failed to complete startup` with high `/proc/pressure/cpu` = host overloaded
  (other agents/builds), not necessarily your code; tap Wait and re-test on a quieter host.
- App vanished: check `logcat | grep "Package removed"` — another tool may have
  uninstalled it. Coordinate before reinstalling.
- Android 12+ masks the splash icon to a circle: keep the splash mark inside the centre
  ~60% of the image or it gets cropped.
