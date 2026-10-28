package expo.modules.blinkquestvision

import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import java.util.concurrent.atomic.AtomicBoolean

class BlinkQuestVisionFrameProcessorPlugin : FrameProcessorPlugin() {
  override fun callback(frame: Frame, arguments: Map<String, Any>?): Any? {
    BlinkQuestVisionRuntime.processFrame(frame)
    return null
  }
}

object BlinkQuestVisionPluginRegistration {
  private val registered = AtomicBoolean(false)

  fun register() {
    if (!registered.compareAndSet(false, true)) return
    FrameProcessorPluginRegistry.addFrameProcessorPlugin("blinkquestFaceLandmarker") { _, _ ->
      BlinkQuestVisionFrameProcessorPlugin()
    }
  }
}
