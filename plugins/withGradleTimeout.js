const { withDangerousMod } = require("expo/config-plugins")
const fs = require("fs")
const path = require("path")

/**
 * Raises the Gradle wrapper network timeout. A third-party distribution mirror is used only when
 * the developer opts in with BLINKQUEST_GRADLE_MIRROR; the default download source is never rewritten.
 */
const withGradleTimeout = (config) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const wrapperPropsPath = path.join(
        config.modRequest.platformProjectRoot,
        "gradle/wrapper/gradle-wrapper.properties",
      )
      if (!fs.existsSync(wrapperPropsPath)) return config

      let contents = fs.readFileSync(wrapperPropsPath, "utf8")

      const mirror = process.env.BLINKQUEST_GRADLE_MIRROR
      if (mirror) {
        const prefix = mirror.replace(/\/?$/, "/").replace(/:/g, "\\:")
        contents = contents.replace(
          /distributionUrl=https\\:\/\/services\.gradle\.org\/distributions\//,
          `distributionUrl=${prefix}`,
        )
      }

      if (/^networkTimeout=\d+/m.test(contents)) {
        contents = contents.replace(/^networkTimeout=\d+/m, "networkTimeout=120000")
      } else {
        contents = `${contents.replace(/\s*$/, "")}\nnetworkTimeout=120000\n`
      }

      fs.writeFileSync(wrapperPropsPath, contents)
      return config
    },
  ])

module.exports = withGradleTimeout
