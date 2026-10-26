package expo.modules.localai

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import android.os.Environment
import android.os.StatFs
import java.io.File
import kotlin.math.min

data class MemoryStats(
  val totalRamBytes: Long,
  val availableRamBytes: Long,
  val thresholdBytes: Long,
  val isLowMemory: Boolean
)

data class MemorySafetyResult(
  val isSafe: Boolean,
  val availableRamBytes: Long,
  val requiredBytes: Long,
  val warningMessage: String? = null
)

object LlmMemoryGuard {

  fun getMemoryStats(context: Context): MemoryStats {
    val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager
    val memInfo = ActivityManager.MemoryInfo()
    activityManager?.getMemoryInfo(memInfo)

    return MemoryStats(
      totalRamBytes = memInfo.totalMem,
      availableRamBytes = memInfo.availMem,
      thresholdBytes = memInfo.threshold,
      isLowMemory = memInfo.lowMemory
    )
  }

  /**
   * Evaluates whether device RAM can safely accommodate loading model weights of size [modelSizeBytes].
   * An additional buffer (default 250MB) is preserved for OS and app graphics headroom.
   */
  fun checkMemorySafety(
    context: Context,
    modelSizeBytes: Long,
    safetyBufferBytes: Long = 250L * 1024L * 1024L
  ): MemorySafetyResult {
    val stats = getMemoryStats(context)

    // LLaMA native runtime allocates working context (KV cache) on top of mapped weights
    val estimatedAllocation = modelSizeBytes + (64L * 1024L * 1024L)
    val effectiveAvailable = stats.availableRamBytes - stats.thresholdBytes

    if (stats.isLowMemory) {
      return MemorySafetyResult(
        isSafe = false,
        availableRamBytes = stats.availableRamBytes,
        requiredBytes = estimatedAllocation,
        warningMessage = "Device is currently under critical system low-memory pressure."
      )
    }

    if (estimatedAllocation + safetyBufferBytes > effectiveAvailable) {
      val availMb = stats.availableRamBytes / (1024 * 1024)
      val reqMb = (estimatedAllocation + safetyBufferBytes) / (1024 * 1024)
      return MemorySafetyResult(
        isSafe = false,
        availableRamBytes = stats.availableRamBytes,
        requiredBytes = estimatedAllocation,
        warningMessage = "Insufficient RAM to safely load model. Available: ${availMb}MB, Required with headroom: ${reqMb}MB."
      )
    }

    return MemorySafetyResult(
      isSafe = true,
      availableRamBytes = stats.availableRamBytes,
      requiredBytes = estimatedAllocation
    )
  }

  /**
   * Inspects free storage space on the internal data partition for post-install model downloads.
   */
  fun getAvailableStorageBytes(context: Context): Long {
    val stat = StatFs(context.filesDir.absolutePath)
    return stat.availableBlocksLong * stat.blockSizeLong
  }

  /**
   * Calculates optimal CPU thread count for responsive on-device mobile inference without thermal throttling.
   */
  fun getOptimalThreadCount(): Int {
    val cores = Runtime.getRuntime().availableProcessors()
    return when {
      cores >= 8 -> 4 // Typical big.LITTLE 8-core CPU: 4 performance threads
      cores >= 6 -> 4
      cores >= 4 -> 3
      cores >= 2 -> 2
      else -> 1
    }
  }

  fun getRecommendedContextLength(availableRamBytes: Long): Int {
    val ramGb = availableRamBytes / (1024L * 1024L * 1024L)
    return when {
      ramGb >= 6 -> 4096
      ramGb >= 3 -> 2048
      ramGb >= 2 -> 1024
      else -> 512
    }
  }

  /**
   * Returns comprehensive device capability telemetry for hardware-aware model selection.
   */
  fun getDeviceCapabilities(context: Context): Map<String, Any> {
    val stats = getMemoryStats(context)
    val storageBytes = getAvailableStorageBytes(context)
    val cores = Runtime.getRuntime().availableProcessors()
    val abis = Build.SUPPORTED_ABIS.toList()
    val isArm64 = abis.any { it.contains("arm64", ignoreCase = true) }

    // Safe model size ceiling: at most 45% of available RAM or 2.5GB, whichever is lower
    val safeModelCeilingBytes = min(
      (stats.availableRamBytes * 0.45).toLong(),
      2500L * 1024L * 1024L
    )

    return mapOf(
      "totalRamBytes" to stats.totalRamBytes,
      "totalRamMb" to (stats.totalRamBytes / (1024 * 1024)),
      "availableRamBytes" to stats.availableRamBytes,
      "availableRamMb" to (stats.availableRamBytes / (1024 * 1024)),
      "thresholdBytes" to stats.thresholdBytes,
      "isLowMemory" to stats.isLowMemory,
      "availableStorageBytes" to storageBytes,
      "availableStorageMb" to (storageBytes / (1024 * 1024)),
      "cpuCores" to cores,
      "optimalThreads" to getOptimalThreadCount(),
      "recommendedContextLength" to getRecommendedContextLength(stats.availableRamBytes),
      "safeModelCeilingBytes" to safeModelCeilingBytes,
      "safeModelCeilingMb" to (safeModelCeilingBytes / (1024 * 1024)),
      "supportedAbis" to abis,
      "isArm64" to isArm64,
      "deviceModel" to "${Build.MANUFACTURER} ${Build.MODEL}",
      "androidSdk" to Build.VERSION.SDK_INT
    )
  }
}
