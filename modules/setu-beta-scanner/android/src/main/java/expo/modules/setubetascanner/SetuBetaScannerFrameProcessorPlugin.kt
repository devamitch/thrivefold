package expo.modules.setubetascanner

import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import expo.modules.setubetascanner.lifecycle.BetaSessionCoordinator
import java.util.concurrent.atomic.AtomicBoolean

class SetuBetaScannerFrameProcessorPlugin(
  private val coordinatorProvider: () -> BetaSessionCoordinator?
) : FrameProcessorPlugin() {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    val coordinator = coordinatorProvider() ?: return null
    coordinator.processVisionCameraFrame(frame)
    return null
  }
}

object SetuBetaScannerPluginRegistration {
  private val registered = AtomicBoolean(false)

  fun register(coordinatorProvider: () -> BetaSessionCoordinator?) {
    if (!registered.compareAndSet(false, true)) return
    FrameProcessorPluginRegistry.addFrameProcessorPlugin("setuBetaScanner") { _, _ ->
      SetuBetaScannerFrameProcessorPlugin(coordinatorProvider)
    }
  }
}
