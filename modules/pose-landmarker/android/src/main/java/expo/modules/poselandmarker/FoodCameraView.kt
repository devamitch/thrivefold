package expo.modules.poselandmarker

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
import android.util.Size
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.AspectRatioStrategy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.Promise
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Back-camera preview that names what it sees (on-device classifier, ~2.5 times a second) and
 * takes a photo on request. Frames are classified in memory and dropped; only labels and scores
 * reach JavaScript. A photo is written only when the person taps the shutter.
 */
class FoodCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  override val shouldUseAndroidLayout = true

  private val onLabels by EventDispatcher()
  private val onFoodReady by EventDispatcher()
  private val onFoodError by EventDispatcher()

  private val previewView = PreviewView(context).also {
    it.scaleType = PreviewView.ScaleType.FILL_CENTER
    it.implementationMode = PreviewView.ImplementationMode.COMPATIBLE
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  private var executor: ExecutorService? = null
  @Volatile private var classifier: FoodClassifier? = null
  private var provider: ProcessCameraProvider? = null
  private var imageCapture: ImageCapture? = null
  private var active = false
  private var frontFacing = false
  /** Plain photo mode: no food labelling, just preview and capture (selfies, documents, objects). */
  private var labels = true
  @Volatile private var lastRun = 0L

  fun setFacing(value: String) {
    val front = value == "front"
    if (front == frontFacing) return
    frontFacing = front
    if (active) {
      stop()
      start()
    }
  }

  fun setLabels(value: Boolean) {
    labels = value
  }

  fun setActive(value: Boolean) {
    if (value == active) return
    active = value
    if (value) start() else stop()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    previewView.layout(0, 0, r - l, b - t)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    super.onMeasure(widthMeasureSpec, heightMeasureSpec)
    previewView.measure(widthMeasureSpec, heightMeasureSpec)
  }

  private fun start() {
    val owner = appContext.currentActivity as? LifecycleOwner
    if (owner == null) {
      onFoodError(mapOf("code" to "no_activity", "message" to "Camera needs a visible screen"))
      return
    }
    val exec = Executors.newSingleThreadExecutor().also { executor = it }
    exec.execute {
      classifier = try {
        FoodClassifier.create(context)
      } catch (e: Throwable) {
        post { onFoodError(mapOf("code" to "model_unavailable", "message" to (e.message ?: "Model could not load"))) }
        null
      }
    }
    val future = ProcessCameraProvider.getInstance(context)
    future.addListener({
      if (!active) return@addListener
      try {
        val p = future.get().also { provider = it }
        val ratio = ResolutionSelector.Builder()
          .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
          .build()
        val preview = Preview.Builder().setResolutionSelector(ratio).build()
          .also { it.setSurfaceProvider(previewView.surfaceProvider) }
        val analysis = ImageAnalysis.Builder()
          .setResolutionSelector(
            ResolutionSelector.Builder()
              .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
              .setResolutionStrategy(ResolutionStrategy(Size(640, 480), ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER))
              .build(),
          )
          .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
          .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
          .build()
        analysis.setAnalyzer(exec) { image -> analyse(image) }
        // ~1600 px is plenty for a meal photo and keeps saving and any AI upload quick.
        val capture = ImageCapture.Builder()
          .setResolutionSelector(
            ResolutionSelector.Builder()
              .setAspectRatioStrategy(AspectRatioStrategy.RATIO_4_3_FALLBACK_AUTO_STRATEGY)
              .setResolutionStrategy(ResolutionStrategy(Size(1600, 1200), ResolutionStrategy.FALLBACK_RULE_CLOSEST_LOWER_THEN_HIGHER))
              .build(),
          )
          .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
          .build()
        imageCapture = capture
        p.unbindAll()
        p.bindToLifecycle(owner, if (frontFacing) CameraSelector.DEFAULT_FRONT_CAMERA else CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis, capture)
        onFoodReady(mapOf<String, Any>())
      } catch (e: Exception) {
        onFoodError(mapOf("code" to "camera_unavailable", "message" to (e.message ?: "Camera could not start")))
      }
    }, ContextCompat.getMainExecutor(context))
  }

  private fun analyse(image: ImageProxy) {
    try {
      val now = SystemClock.uptimeMillis()
      val c = classifier
      if (!labels || c == null || now - lastRun < 400) return
      lastRun = now
      val bmp = image.toBitmap()
      val rot = image.imageInfo.rotationDegrees
      val upright = if (rot == 0) bmp else Bitmap.createBitmap(
        bmp, 0, 0, bmp.width, bmp.height, Matrix().apply { postRotate(rot.toFloat()) }, true,
      )
      val labels = c.classify(upright)
      if (upright !== bmp) upright.recycle()
      bmp.recycle()
      post { if (active) onLabels(mapOf("labels" to labels)) }
    } catch (_: Exception) {
      // A dropped frame is fine; the next one comes 400 ms later.
    } finally {
      image.close()
    }
  }

  @Volatile private var capturing = false

  fun capture(promise: Promise) {
    val capture = imageCapture
    if (capture == null) {
      promise.reject("not_ready", "Camera is not ready yet", null)
      return
    }
    // One photo at a time: a second tap while saving would race the first.
    if (capturing) {
      promise.reject("busy", "Already taking a photo", null)
      return
    }
    capturing = true
    val file = File(context.cacheDir, "meal_${System.currentTimeMillis()}.jpg")
    capture.takePicture(
      ImageCapture.OutputFileOptions.Builder(file).build(),
      ContextCompat.getMainExecutor(context),
      object : ImageCapture.OnImageSavedCallback {
        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
          capturing = false
          promise.resolve("file://${file.absolutePath}")
        }

        override fun onError(exception: ImageCaptureException) {
          capturing = false
          promise.reject("capture_failed", exception.message ?: "Could not take the photo", exception)
        }
      },
    )
  }

  private fun stop() {
    try {
      provider?.unbindAll()
    } catch (_: Exception) {
    }
    provider = null
    imageCapture = null
    val c = classifier
    classifier = null
    val exec = executor
    executor = null
    if (exec != null) {
      exec.execute { c?.close() }
      exec.shutdown()
    } else {
      c?.close()
    }
  }

  fun release() {
    active = false
    stop()
  }
}
