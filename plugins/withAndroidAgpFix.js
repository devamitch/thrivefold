const { withDangerousMod, withAndroidManifest, AndroidConfig } = require("expo/config-plugins")
const fs = require("fs")
const path = require("path")

/**
 * Android build fixes:
 * 1. Ensures AGP 9 / Gradle 9 intermediate directory exists so DexMergingTask
 *    does not fail with missing directory error.
 * 2. Removes conflicting uses-permission-sdk-23 location permissions from rxandroidble/react-native-ble-plx
 *    using tools:node="remove", resolving Google Play rejection:
 *    "Duplicate declarations of <uses-permission> element 'android.permission.ACCESS_COARSE_LOCATION' in manifest with different maxSdkVersions".
 */
const withAndroidAgpFix = (config) => {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const targetDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/build/intermediates/external_file_lib_dex_archives/debug/desugarDebugFileDependencies"
      )
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      return config
    },
  ])

  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest
    AndroidConfig.Manifest.ensureToolsAvailable(config.modResults)

    if (!Array.isArray(manifest["uses-permission-sdk-23"])) {
      manifest["uses-permission-sdk-23"] = []
    }

    // Filter out any existing location entries from uses-permission-sdk-23
    manifest["uses-permission-sdk-23"] = manifest["uses-permission-sdk-23"].filter(
      (item) =>
        item.$["android:name"] !== "android.permission.ACCESS_COARSE_LOCATION" &&
        item.$["android:name"] !== "android.permission.ACCESS_FINE_LOCATION"
    )

    // Explicitly add tools:node="remove" so rxandroidble library manifest does not inject them
    manifest["uses-permission-sdk-23"].push(
      {
        $: {
          "android:name": "android.permission.ACCESS_COARSE_LOCATION",
          "tools:node": "remove",
        },
      },
      {
        $: {
          "android:name": "android.permission.ACCESS_FINE_LOCATION",
          "tools:node": "remove",
        },
      }
    )

    return config
  })

  return config
}

module.exports = withAndroidAgpFix
