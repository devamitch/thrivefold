package expo.modules.poselandmarker

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import com.google.mediapipe.tasks.audio.audioclassifier.AudioClassifier
import com.google.mediapipe.tasks.audio.core.RunningMode
import com.google.mediapipe.tasks.components.containers.AudioData
import com.google.mediapipe.tasks.core.BaseOptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.log10
import kotlin.math.sqrt

/**
 * On-device microphone analysis. Reads 16 kHz mono PCM with AudioRecord and, in memory only:
 *  - every 50 ms: loudness (dBFS) and pitch (YIN, 70-1000 Hz) -> `onPitch`
 *  - every ~0.5 s (when enabled): MediaPipe Audio Classifier (YAMNet, 521 AudioSet classes)
 *    over the last 0.975 s -> `onSound` with the top categories.
 * Nothing is recorded to disk or sent anywhere. Requires RECORD_AUDIO (asked by the app first).
 */
class AudioSenseModule : Module() {
  companion object {
    const val SAMPLE_RATE = 16000
    const val YAMNET_ASSET = "yamnet.tflite"
    private const val PITCH_WINDOW = 2048
    private const val CLASSIFY_WINDOW = 15600 // 0.975 s at 16 kHz, YAMNet's input
  }

  @Volatile private var running = false
  private var thread: Thread? = null

  override fun definition() = ModuleDefinition {
    Name("AudioSense")
    Events("onPitch", "onSound", "onAudioError")

    Function("isAvailable") {
      val ctx = appContext.reactContext ?: return@Function false
      try {
        ctx.assets.open(YAMNET_ASSET).close()
        true
      } catch (_: Exception) {
        false
      }
    }

    Function("start") { classify: Boolean -> start(classify) }
    Function("stop") { stop() }
    OnDestroy { stop() }
  }

  @SuppressLint("MissingPermission")
  private fun start(classify: Boolean): Boolean {
    if (running) return true
    val ctx = appContext.reactContext ?: return false
    val minBuf = AudioRecord.getMinBufferSize(SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT)
    val record = try {
      AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, SAMPLE_RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT, maxOf(minBuf, 4096) * 2)
    } catch (e: Exception) {
      sendEvent("onAudioError", mapOf("message" to (e.message ?: "Microphone unavailable")))
      return false
    }
    if (record.state != AudioRecord.STATE_INITIALIZED) {
      record.release()
      sendEvent("onAudioError", mapOf("message" to "Microphone unavailable (permission or another app is using it)"))
      return false
    }
    val classifier = if (!classify) null else try {
      AudioClassifier.createFromOptions(
        ctx,
        AudioClassifier.AudioClassifierOptions.builder()
          .setBaseOptions(BaseOptions.builder().setModelAssetPath(YAMNET_ASSET).build())
          .setRunningMode(RunningMode.AUDIO_CLIPS)
          .setMaxResults(5)
          .setScoreThreshold(0.2f)
          .build(),
      )
    } catch (e: Exception) {
      sendEvent("onAudioError", mapOf("message" to "Sound model could not load: ${e.message}"))
      null
    }
    running = true
    record.startRecording()
    thread = Thread {
      val chunk = ShortArray(800) // 50 ms
      val ring = FloatArray(CLASSIFY_WINDOW)
      var ringPos = 0
      var filled = 0
      var sinceClassify = 0
      val pitchBuf = FloatArray(PITCH_WINDOW)
      try {
        while (running) {
          val n = record.read(chunk, 0, chunk.size)
          if (n <= 0) continue
          var sum = 0.0
          for (i in 0 until n) {
            val v = chunk[i] / 32768f
            sum += (v * v).toDouble()
            ring[ringPos] = v
            ringPos = (ringPos + 1) % CLASSIFY_WINDOW
          }
          filled = minOf(CLASSIFY_WINDOW, filled + n)
          sinceClassify += n
          val rms = sqrt(sum / n)
          val db = if (rms > 1e-9) 20 * log10(rms) else -120.0
          var pitch = 0.0
          if (filled >= PITCH_WINDOW && db > -50) {
            for (i in 0 until PITCH_WINDOW) pitchBuf[i] = ring[(ringPos - PITCH_WINDOW + i + CLASSIFY_WINDOW) % CLASSIFY_WINDOW]
            pitch = yin(pitchBuf, SAMPLE_RATE)
          }
          sendEvent("onPitch", mapOf("db" to db, "hz" to pitch, "at" to System.currentTimeMillis().toDouble()))

          if (classifier != null && filled >= CLASSIFY_WINDOW && sinceClassify >= SAMPLE_RATE / 2) {
            sinceClassify = 0
            val clip = FloatArray(CLASSIFY_WINDOW) { ring[(ringPos + it) % CLASSIFY_WINDOW] }
            val audio = AudioData.create(AudioData.AudioDataFormat.builder().setNumOfChannels(1).setSampleRate(SAMPLE_RATE.toFloat()).build(), CLASSIFY_WINDOW)
            audio.load(clip)
            val result = classifier.classify(audio)
            val cats = result.classificationResults().firstOrNull()?.classifications()?.firstOrNull()?.categories() ?: emptyList()
            sendEvent(
              "onSound",
              mapOf("categories" to cats.map { mapOf("label" to it.categoryName(), "score" to it.score().toDouble()) }, "at" to System.currentTimeMillis().toDouble()),
            )
          }
        }
      } catch (e: Exception) {
        sendEvent("onAudioError", mapOf("message" to (e.message ?: "Audio stopped")))
      } finally {
        try { record.stop() } catch (_: Exception) {}
        record.release()
        classifier?.close()
      }
    }.also { it.start() }
    return true
  }

  private fun stop() {
    running = false
    thread?.join(500)
    thread = null
  }

  /** YIN fundamental-frequency estimate (de Cheveigne & Kawahara 2002); 0 when unvoiced. */
  private fun yin(x: FloatArray, sr: Int): Double {
    val maxTau = sr / 70
    val minTau = sr / 1000
    val half = x.size / 2
    if (maxTau + 1 >= half) return 0.0
    val d = FloatArray(maxTau + 1)
    for (tau in 1..maxTau) {
      var s = 0f
      for (i in 0 until half) {
        val diff = x[i] - x[i + tau]
        s += diff * diff
      }
      d[tau] = s
    }
    var acc = 0f
    val cmnd = FloatArray(maxTau + 1)
    cmnd[0] = 1f
    for (tau in 1..maxTau) {
      acc += d[tau]
      cmnd[tau] = if (acc == 0f) 1f else d[tau] * tau / acc
    }
    var tau = maxOf(2, minTau)
    while (tau < maxTau) {
      if (cmnd[tau] < 0.15f) {
        while (tau + 1 < maxTau && cmnd[tau + 1] < cmnd[tau]) tau++
        val a = cmnd[tau - 1]
        val b = cmnd[tau]
        val c = cmnd[tau + 1]
        val denom = 2 * (2 * b - a - c)
        val shift = if (denom != 0f) (c - a) / denom else 0f
        return sr / (tau + shift).toDouble()
      }
      tau++
    }
    return 0.0
  }
}
