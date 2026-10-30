const { withDangerousMod } = require("expo/config-plugins")
const fs = require("fs")
const path = require("path")

/**
 * Ensures AGP 9 / Gradle 9 intermediate directory exists so DexMergingTask
 * (mergeExtDexDebug) does not fail with "property 'fileDependencyDexDir' specifies directory ... which doesn't exist".
 */
const withAndroidAgpFix = (config) =>
  withDangerousMod(config, [
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

module.exports = withAndroidAgpFix

