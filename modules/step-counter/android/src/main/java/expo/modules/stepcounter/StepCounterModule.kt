package expo.modules.stepcounter

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class StepCounterModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No React context")

  private val sensorManager: SensorManager
    get() = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  private var live: SensorEventListener? = null

  private fun hasPermission(): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
      ContextCompat.checkSelfPermission(context, Manifest.permission.ACTIVITY_RECOGNITION) ==
      PackageManager.PERMISSION_GRANTED

  private fun dayMap(date: String, d: StepLedger.Day) = mapOf(
    "date" to date,
    "steps" to d.steps.toDouble(),
    "estimated" to d.estimated.toDouble(),
    "since" to d.since?.toDouble(),
    "hours" to d.hours.map { it.toDouble() },
  )

  override fun definition() = ModuleDefinition {
    Name("StepCounter")
    Events("onSteps")

    Function("isAvailable") {
      sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) != null
    }

    Function("hasPermission") { hasPermission() }

    Function("getDays") {
      StepLedger(context).days().map { (date, d) -> dayMap(date, d) }
    }

    Function("lastSampleAt") { StepLedger(context).lastSampleAt()?.toDouble() }

    /** Reads the counter once, records it, resolves with today's total. */
    AsyncFunction("sampleNow") { promise: Promise ->
      val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
      if (sensor == null || !hasPermission()) {
        promise.resolve(null)
        return@AsyncFunction
      }
      val sm = sensorManager
      val ledger = StepLedger(context)
      val handler = android.os.Handler(android.os.Looper.getMainLooper())
      var done = false
      val l = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
          if (done) return
          done = true
          sm.unregisterListener(this)
          handler.removeCallbacksAndMessages(null)
          val d = ledger.record(event.values[0])
          promise.resolve(dayMap(StepLedger.dateOf(System.currentTimeMillis()), d))
        }
        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
      }
      sm.registerListener(l, sensor, SensorManager.SENSOR_DELAY_UI)
      handler.postDelayed({
        if (!done) {
          done = true
          sm.unregisterListener(l)
          promise.resolve(null)
        }
      }, 5_000)
    }

    /** Live updates while the app is open; each event is recorded and emitted as today's total. */
    Function("startLive") {
      if (live != null || !hasPermission()) return@Function false
      val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER) ?: return@Function false
      val ledger = StepLedger(context)
      val l = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
          val d = ledger.record(event.values[0])
          sendEvent("onSteps", dayMap(StepLedger.dateOf(System.currentTimeMillis()), d))
        }
        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
      }
      live = l
      sensorManager.registerListener(l, sensor, SensorManager.SENSOR_DELAY_UI)
    }

    Function("stopLive") {
      live?.let { sensorManager.unregisterListener(it) }
      live = null
    }

    Function("scheduleBackground") {
      if (!hasPermission()) false else StepSampleJob.schedule(context)
    }

    /** Stops collection and deletes everything this module stored. */
    Function("disableAndErase") {
      live?.let { sensorManager.unregisterListener(it) }
      live = null
      StepSampleJob.cancel(context)
      StepLedger(context).clear()
    }

    OnDestroy {
      live?.let { sensorManager.unregisterListener(it) }
      live = null
    }
  }
}
