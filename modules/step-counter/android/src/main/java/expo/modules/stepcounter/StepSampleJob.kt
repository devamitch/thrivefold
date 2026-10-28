package expo.modules.stepcounter

import android.app.job.JobInfo
import android.app.job.JobParameters
import android.app.job.JobScheduler
import android.app.job.JobService
import android.content.ComponentName
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper

/**
 * Samples the step counter about every 15 minutes (the OS minimum; Doze may stretch it), so
 * day boundaries are attributed accurately even when the app is closed. Battery cost is one
 * short sensor registration per run; the counter itself is maintained by the sensor hub.
 */
class StepSampleJob : JobService() {
  private var listener: SensorEventListener? = null
  private val handler = Handler(Looper.getMainLooper())

  override fun onStartJob(params: JobParameters): Boolean {
    val sm = getSystemService(Context.SENSOR_SERVICE) as SensorManager
    val sensor = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) ?: return false
    val ledger = StepLedger(this)
    val l = object : SensorEventListener {
      override fun onSensorChanged(event: SensorEvent) {
        ledger.record(event.values[0])
        finish(sm, params)
      }
      override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
    }
    listener = l
    val ok = try {
      sm.registerListener(l, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    } catch (_: SecurityException) {
      false
    }
    if (!ok) return false
    // Some sensor hubs only report on the next step; give up quietly after a short wait.
    handler.postDelayed({ finish(sm, params) }, 10_000)
    return true
  }

  override fun onStopJob(params: JobParameters): Boolean {
    listener?.let { (getSystemService(Context.SENSOR_SERVICE) as SensorManager).unregisterListener(it) }
    listener = null
    return true
  }

  private fun finish(sm: SensorManager, params: JobParameters) {
    val l = listener ?: return
    listener = null
    handler.removeCallbacksAndMessages(null)
    sm.unregisterListener(l)
    jobFinished(params, false)
  }

  companion object {
    private const val JOB_ID = 0x5717

    fun schedule(context: Context): Boolean {
      val js = context.getSystemService(Context.JOB_SCHEDULER_SERVICE) as JobScheduler
      if (js.getPendingJob(JOB_ID) != null) return true
      val info = JobInfo.Builder(JOB_ID, ComponentName(context, StepSampleJob::class.java))
        .setPeriodic(15 * 60 * 1000L)
        .setPersisted(true)
        .build()
      return js.schedule(info) == JobScheduler.RESULT_SUCCESS
    }

    fun cancel(context: Context) {
      (context.getSystemService(Context.JOB_SCHEDULER_SERVICE) as JobScheduler).cancel(JOB_ID)
    }
  }
}
