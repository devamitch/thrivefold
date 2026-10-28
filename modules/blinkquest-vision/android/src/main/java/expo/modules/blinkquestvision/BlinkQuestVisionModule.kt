package expo.modules.blinkquestvision

import android.app.Activity
import android.app.ActivityManager
import android.app.PictureInPictureParams
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.BatteryManager
import android.os.Build
import android.os.PowerManager
import android.util.Rational
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class BlinkQuestVisionModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("BlinkQuestVision")
    Events("onVisionStatus", "onEyeLandmarks", "onPictureInPictureChange")

    OnCreate {
      BlinkQuestVisionPluginRegistration.register()
      BlinkQuestVisionRuntime.attach { eventName, payload -> sendEvent(eventName, payload) }
    }

    OnDestroy {
      BlinkQuestVisionRuntime.stop()
      BlinkQuestVisionRuntime.detach()
    }

    AsyncFunction("initializeFaceLandmarker") {
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("Android application context is unavailable")
      BlinkQuestVisionRuntime.initialize(context)
    }

    AsyncFunction("stopFaceLandmarker") {
      BlinkQuestVisionRuntime.stop()
      appContext.currentActivity?.let { applyPipParams(it, null, null) }
    }

    AsyncFunction("getRuntimeStats") {
      BlinkQuestVisionRuntime.getRuntimeStats()
    }

    // Front-camera optics for screen-distance estimation (Camera2 characteristics).
    AsyncFunction("getFrontCameraIntrinsics") {
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("Android application context is unavailable")
      collectFrontCameraIntrinsics(context)
    }

    AsyncFunction("getDeviceTelemetry") {
      val context = appContext.reactContext?.applicationContext
        ?: throw IllegalStateException("Android application context is unavailable")
      collectDeviceTelemetry(context)
    }

    AsyncFunction("isPictureInPictureSupported") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val activity = appContext.currentActivity ?: return@AsyncFunction false
        activity.packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
      } else {
        false
      }
    }

    AsyncFunction("isInPictureInPictureMode") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val activity = appContext.currentActivity ?: return@AsyncFunction false
        activity.isInPictureInPictureMode
      } else {
        false
      }
    }

    // Enables or disables entering system PiP when the user leaves the app.
    // JS enables it only while a scan is actively running.
    AsyncFunction("setAutoPictureInPicture") { enabled: Boolean, width: Double?, height: Double? ->
      BlinkQuestVisionRuntime.autoPipEnabled = enabled
      val activity = appContext.currentActivity ?: return@AsyncFunction false
      applyPipParams(activity, width, height)
    }

    // Where the camera sits on screen (window px). Android animates exactly this
    // rectangle into the PiP window instead of shrinking the whole app UI.
    AsyncFunction("setPipSourceRect") { x: Double, y: Double, width: Double, height: Double ->
      pipSourceRect =
        if (width > 0 && height > 0) {
          android.graphics.Rect(x.toInt(), y.toInt(), (x + width).toInt(), (y + height).toInt())
        } else {
          null
        }
      val activity = appContext.currentActivity ?: return@AsyncFunction false
      applyPipParams(activity, lastAspectW, lastAspectH)
    }

    // Kept for compatibility with older JS; respects the current auto-PiP flag.
    AsyncFunction("setPictureInPictureParams") { width: Double?, height: Double? ->
      val activity = appContext.currentActivity ?: return@AsyncFunction false
      applyPipParams(activity, width, height)
    }

    AsyncFunction("enterPictureInPicture") { width: Double?, height: Double? ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return@AsyncFunction false
      val activity = appContext.currentActivity
        ?: throw IllegalStateException("Activity is unavailable")
      val params = buildPipParams(width, height) ?: return@AsyncFunction false
      var entered = false
      val latch = java.util.concurrent.CountDownLatch(1)
      activity.runOnUiThread {
        try {
          activity.setPictureInPictureParams(params)
          entered = activity.enterPictureInPictureMode(params)
        } catch (_: Exception) {
          entered = false
        } finally {
          latch.countDown()
        }
      }
      latch.await(1000, java.util.concurrent.TimeUnit.MILLISECONDS)
      entered
    }
  }

  @Volatile private var pipSourceRect: android.graphics.Rect? = null
  @Volatile private var lastAspectW: Double? = null
  @Volatile private var lastAspectH: Double? = null

  private fun buildPipParams(width: Double?, height: Double?): PictureInPictureParams? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return null
    if (width != null && height != null) {
      lastAspectW = width
      lastAspectH = height
    }
    val builder = PictureInPictureParams.Builder()
    pipSourceRect?.let { builder.setSourceRectHint(it) }
    if (width != null && height != null && width > 0 && height > 0) {
      val aspect = Rational(width.toInt().coerceIn(1, 10000), height.toInt().coerceIn(1, 10000))
      // Android rejects aspect ratios outside roughly 1:2.39 .. 2.39:1.
      if (aspect.toFloat() in 0.41841f..2.39f) builder.setAspectRatio(aspect)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      builder.setAutoEnterEnabled(BlinkQuestVisionRuntime.autoPipEnabled)
      builder.setSeamlessResizeEnabled(false)
    }
    return builder.build()
  }

  private fun applyPipParams(activity: Activity, width: Double?, height: Double?): Boolean {
    val params = buildPipParams(width, height) ?: return false
    activity.runOnUiThread {
      try {
        activity.setPictureInPictureParams(params)
      } catch (_: Exception) {
        // Activity may not declare PiP support on this device; nothing to apply.
      }
    }
    return true
  }

  private fun collectFrontCameraIntrinsics(context: Context): Map<String, Any>? {
    val manager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager ?: return null
    for (id in manager.cameraIdList) {
      val chars = manager.getCameraCharacteristics(id)
      if (chars.get(CameraCharacteristics.LENS_FACING) != CameraCharacteristics.LENS_FACING_FRONT) continue
      val focal = chars.get(CameraCharacteristics.LENS_INFO_AVAILABLE_FOCAL_LENGTHS)?.firstOrNull()
      val physical = chars.get(CameraCharacteristics.SENSOR_INFO_PHYSICAL_SIZE)
      val pixels = chars.get(CameraCharacteristics.SENSOR_INFO_PIXEL_ARRAY_SIZE)
      if (focal == null || physical == null || pixels == null) continue
      return mapOf(
        "cameraId" to id,
        "focalLengthMm" to focal.toDouble(),
        "sensorWidthMm" to physical.width.toDouble(),
        "sensorHeightMm" to physical.height.toDouble(),
        "pixelArrayWidth" to pixels.width.toDouble(),
        "pixelArrayHeight" to pixels.height.toDouble(),
      )
    }
    return null
  }

  private fun collectDeviceTelemetry(context: Context): Map<String, Any> {
    val result = mutableMapOf<String, Any>(
      "manufacturer" to Build.MANUFACTURER,
      "model" to Build.MODEL,
      "androidRelease" to Build.VERSION.RELEASE,
      "sdkInt" to Build.VERSION.SDK_INT.toDouble(),
    )

    (context.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager)?.let { battery ->
      val capacity = battery.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
      // getIntProperty returns Integer.MIN_VALUE when unsupported.
      if (capacity in 0..100) result["batteryPercent"] = capacity.toDouble()
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) result["isCharging"] = battery.isCharging
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      (context.getSystemService(Context.POWER_SERVICE) as? PowerManager)?.let { power ->
        result["thermalStatus"] = power.currentThermalStatus.toDouble()
      }
    }

    (context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager)?.let { activityManager ->
      val info = ActivityManager.MemoryInfo()
      activityManager.getMemoryInfo(info)
      result["memoryAvailableBytes"] = info.availMem.toDouble()
      result["memoryTotalBytes"] = info.totalMem.toDouble()
      result["memoryLow"] = info.lowMemory
    }

    val runtime = Runtime.getRuntime()
    result["appHeapUsedBytes"] = (runtime.totalMemory() - runtime.freeMemory()).toDouble()
    result["appHeapMaxBytes"] = runtime.maxMemory().toDouble()

    try {
      @Suppress("DEPRECATION")
      val info = context.packageManager.getPackageInfo(context.packageName, 0)
      result["appVersion"] = info.versionName ?: ""
      result["appBuild"] = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        info.longVersionCode.toDouble()
      } else {
        @Suppress("DEPRECATION")
        info.versionCode.toDouble()
      }
    } catch (_: Exception) {
      // Package info is always available for our own package; ignore if not.
    }

    return result
  }
}
