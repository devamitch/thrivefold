package expo.modules.poselandmarker

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PoseLandmarkerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PoseLandmarker")

    /** True when the bundled model asset is present in this build. */
    Function("isAvailable") {
      val ctx = appContext.reactContext ?: return@Function false
      try {
        ctx.assets.open(PoseCameraView.MODEL_ASSET).close()
        true
      } catch (_: Exception) {
        false
      }
    }

    Function("modelVersion") { PoseCameraView.MODEL_VERSION }

    View(PoseCameraView::class) {
      Events("onPose", "onPoseError")
      Prop("active") { view: PoseCameraView, active: Boolean -> view.setActive(active) }
      Prop("facing") { view: PoseCameraView, facing: String -> view.setFacing(facing) }
      Prop("face") { view: PoseCameraView, on: Boolean -> view.setFace(on) }
      Prop("hands") { view: PoseCameraView, on: Boolean -> view.setHands(on) }
      OnViewDestroys { view: PoseCameraView -> view.release() }
    }
  }
}
