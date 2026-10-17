import { withAndroidManifest, type ConfigPlugin } from "expo/config-plugins"

/**
 * Declares android:supportsPictureInPicture on MainActivity. Expo's android
 * config has no built-in field for this, and hand-editing the generated
 * AndroidManifest.xml is wiped on every `expo prebuild`, so without this
 * plugin PiP silently stops working after any clean prebuild.
 *
 * Also strips android.permission.SYSTEM_ALERT_WINDOW, which expo-dev-client
 * injects unconditionally for its own dev-overlay UI. BlinkQuest never calls
 * any overlay/draw-over-apps API (it uses native system PiP instead per the
 * product contract), and this permission requires a separate "special app
 * access" declaration in Play Console review — keep it out of shipped builds.
 */
const withAndroidPictureInPicture: ConfigPlugin = (config) =>
  withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0]
    if (application) {
      application.$["android:appCategory"] = "productivity"
      application.$["android:isGame"] = "false"

      // Disable expo-dev-launcher's floating "Tools" gear button in dev builds
      application["meta-data"] = application["meta-data"] || []
      const existingFabMeta = application["meta-data"].find(
        (m: any) => m.$?.["android:name"] === "EXDevMenuShowFloatingActionButton",
      )
      if (existingFabMeta) {
        existingFabMeta.$["android:value"] = "false"
      } else {
        application["meta-data"].push({
          $: {
            "android:name": "EXDevMenuShowFloatingActionButton",
            "android:value": "false",
          },
        } as any)
      }
    }
    const mainActivity = application?.activity?.find(
      (activity) => activity.$["android:name"] === ".MainActivity",
    )
    if (mainActivity) {
      mainActivity.$["android:supportsPictureInPicture"] = "true"
    }

    // Android 11+ package visibility: lets Linking.canOpenURL("setu://") detect
    // the Setu app on the Connections screen. Scoped to that one scheme.
    const manifest = config.modResults.manifest as any
    manifest.queries = manifest.queries || [{}]
    const queries = manifest.queries[0]
    queries.intent = queries.intent || []
    const hasSetu = queries.intent.some((intent: any) =>
      intent.data?.some((d: any) => d.$?.["android:scheme"] === "setu"),
    )
    if (!hasSetu) {
      queries.intent.push({
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        data: [{ $: { "android:scheme": "setu" } }],
      })
    }

    const permissions = config.modResults.manifest["uses-permission"]
    if (permissions) {
      config.modResults.manifest["uses-permission"] = permissions.filter(
        (permission) => permission.$["android:name"] !== "android.permission.SYSTEM_ALERT_WINDOW",
      )
    }

    return config
  })

export default withAndroidPictureInPicture
