import { withMainActivity, type ConfigPlugin } from "expo/config-plugins"

const MARKER = "// @blinkquest-pip-callback"
const LEAVE_HINT_MARKER = "// @blinkquest-pip-leave-hint"

const IMPORTS = [
  "import android.app.PictureInPictureParams",
  "import android.content.res.Configuration",
  "import expo.modules.blinkquestvision.BlinkQuestVisionRuntime",
]

const OVERRIDE_BLOCK = `
  ${MARKER}
  override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean, newConfig: Configuration) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
    BlinkQuestVisionRuntime.onPictureInPictureModeChanged(isInPictureInPictureMode)
  }

  ${MARKER}
  override fun onPictureInPictureModeChanged(isInPictureInPictureMode: Boolean) {
    super.onPictureInPictureModeChanged(isInPictureInPictureMode)
    BlinkQuestVisionRuntime.onPictureInPictureModeChanged(isInPictureInPictureMode)
  }
`

// Android 8–11 have no auto-enter flag; enter PiP on Home only while JS has
// marked a scan as actively running (cleared on pause/stop). Android 12+ uses
// PictureInPictureParams.setAutoEnterEnabled from the vision module instead.
const LEAVE_HINT_BLOCK = `
  ${LEAVE_HINT_MARKER}
  override fun onUserLeaveHint() {
    super.onUserLeaveHint()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
      Build.VERSION.SDK_INT < Build.VERSION_CODES.S &&
      BlinkQuestVisionRuntime.autoPipEnabled
    ) {
      try {
        enterPictureInPictureMode(PictureInPictureParams.Builder().build())
      } catch (_: Exception) {
        // PiP unavailable on this device; the session pauses via the JS watchdog.
      }
    }
  }
`

function appendBeforeLastBrace(contents: string, block: string) {
  const lastBraceIndex = contents.lastIndexOf("}")
  return `${contents.slice(0, lastBraceIndex)}${block}${contents.slice(lastBraceIndex)}`
}

/**
 * Forwards Android's Activity-level PiP callbacks into BlinkQuestVisionRuntime
 * (so the JS onPictureInPictureChange event fires) and adds the pre-Android-12
 * onUserLeaveHint PiP entry. Expo has no config field for either; hand-edits
 * to the generated MainActivity.kt are discarded by `expo prebuild`, so this
 * plugin makes them durable. Each block is guarded by its own marker so it is
 * added exactly once, including to projects prebuilt by older plugin versions.
 */
const withPictureInPictureActivity: ConfigPlugin = (config) =>
  withMainActivity(config, (config) => {
    if (config.modResults.language !== "kt") {
      return config
    }

    let contents = config.modResults.contents
    for (const importLine of IMPORTS) {
      if (!contents.includes(importLine)) {
        contents = contents.replace(/^(import .+\n)/m, `$1${importLine}\n`)
      }
    }
    if (!contents.includes("import android.os.Build")) {
      contents = contents.replace(/^(import .+\n)/m, "$1import android.os.Build\n")
    }
    if (!contents.includes(MARKER)) contents = appendBeforeLastBrace(contents, OVERRIDE_BLOCK)
    if (!contents.includes(LEAVE_HINT_MARKER))
      contents = appendBeforeLastBrace(contents, LEAVE_HINT_BLOCK)

    config.modResults.contents = contents
    return config
  })

export default withPictureInPictureActivity
