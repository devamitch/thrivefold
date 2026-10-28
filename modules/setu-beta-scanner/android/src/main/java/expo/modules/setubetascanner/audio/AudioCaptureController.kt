package expo.modules.setubetascanner.audio

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import expo.modules.setubetascanner.algorithms.audio.VoiceAnalyzer
import expo.modules.setubetascanner.algorithms.audio.VoiceMetrics
import kotlinx.coroutines.*
import java.util.concurrent.atomic.AtomicBoolean

/**
 * High-performance, offline audio capture controller
 * Streams 16 kHz 16-bit mono PCM into VoiceAnalyzer for real-time DSP
 */
class AudioCaptureController(
    private val context: Context,
    private val onVoiceMetrics: (VoiceMetrics) -> Unit
) {
    companion object {
        const val SAMPLE_RATE = 16000
        const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        const val FRAME_SIZE = 1024
    }

    private var audioRecord: AudioRecord? = null
    private var recordingJob: Job? = null
    private val isRunning = AtomicBoolean(false)
    private val voiceAnalyzer = VoiceAnalyzer()
    private val audioScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    @SuppressLint("MissingPermission")
    fun startCapture(): Boolean {
        if (isRunning.get()) return true

        val hasPermission = context.checkSelfPermission(android.Manifest.permission.RECORD_AUDIO) ==
            PackageManager.PERMISSION_GRANTED
        if (!hasPermission) {
            android.util.Log.w("AudioCaptureController", "RECORD_AUDIO permission not granted")
            return false
        }

        val minBufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
        val bufferSize = maxOf(minBufferSize, FRAME_SIZE * 2)

        return try {
            val record = AudioRecord(
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
            )

            if (record.state != AudioRecord.STATE_INITIALIZED) {
                android.util.Log.e("AudioCaptureController", "AudioRecord initialization failed")
                record.release()
                return false
            }

            audioRecord = record
            record.startRecording()
            isRunning.set(true)

            recordingJob = audioScope.launch(Dispatchers.IO) {
                val audioBuffer = ShortArray(FRAME_SIZE)
                while (isRunning.get() && isActive) {
                    val readSamples = record.read(audioBuffer, 0, FRAME_SIZE)
                    if (readSamples > 0) {
                        try {
                            val metrics = voiceAnalyzer.analyze(audioBuffer)
                            withContext(Dispatchers.Default) {
                                onVoiceMetrics(metrics)
                            }
                        } catch (e: Exception) {
                            android.util.Log.w("AudioCaptureController", "Audio frame processing exception: ${e.message}")
                        }
                    }
                    delay(30) // ~30 fps analysis rate to prevent thread starvation
                }
            }

            true
        } catch (e: Exception) {
            android.util.Log.e("AudioCaptureController", "Failed to start audio recording", e)
            false
        }
    }

    fun stopCapture() {
        isRunning.set(false)
        recordingJob?.cancel()
        recordingJob = null

        try {
            audioRecord?.apply {
                if (recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                    stop()
                }
                release()
            }
        } catch (e: Exception) {
            android.util.Log.w("AudioCaptureController", "Error releasing AudioRecord: ${e.message}")
        } finally {
            audioRecord = null
        }
    }

    fun isCapturing(): Boolean = isRunning.get()
}
