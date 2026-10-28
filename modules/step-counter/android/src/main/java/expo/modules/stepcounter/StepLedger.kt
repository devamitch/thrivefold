package expo.modules.stepcounter

import android.content.Context
import android.content.SharedPreferences
import android.provider.Settings
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/**
 * Turns readings of the hardware step counter (steps since boot) into per-day totals.
 *
 * Each sample adds the steps since the previous sample. Steps taken between two samples that
 * fall on different local days are split across those days in proportion to time; the share
 * that comes from a gap longer than [ESTIMATE_GAP_MS] is also counted as `estimated`, so the UI
 * can say so. Reboots reset the hardware counter; then the new counter value is the delta.
 * The very first sample only sets the baseline: nothing before it is ever claimed.
 */
class StepLedger(context: Context) {
  private val appContext = context.applicationContext
  private val prefs: SharedPreferences =
    appContext.getSharedPreferences("thrivefold_step_ledger", Context.MODE_PRIVATE)

  /** `hours` has 24 entries: steps attributed to each local hour of the day. */
  data class Day(val steps: Long, val estimated: Long, val since: Long?, val hours: LongArray = LongArray(24))

  @Synchronized
  fun record(counter: Float, now: Long = System.currentTimeMillis()): Day {
    val boot = bootCount()
    val days = readDays()
    val hasBaseline = prefs.contains(KEY_COUNTER)
    val lastCounter = prefs.getFloat(KEY_COUNTER, counter)
    val lastTime = prefs.getLong(KEY_TIME, now)
    val lastBoot = prefs.getInt(KEY_BOOT, boot)

    if (!hasBaseline) {
      // Tracking starts now: today's total begins at zero, from this moment.
      val today = dateOf(now)
      if (!days.has(today)) days.put(today, dayJson(0, 0, now))
    } else {
      val rebooted = boot != lastBoot || counter < lastCounter
      val delta = (if (rebooted) counter else counter - lastCounter).toLong()
      if (delta in 1..MAX_DELTA && now > lastTime) {
        distribute(days, delta, lastTime, now)
      }
      if (!days.has(dateOf(now))) days.put(dateOf(now), dayJson(0, 0, null))
    }

    prune(days, now)
    prefs.edit()
      .putFloat(KEY_COUNTER, counter)
      .putLong(KEY_TIME, now)
      .putInt(KEY_BOOT, boot)
      .putString(KEY_DAYS, days.toString())
      .apply()
    return dayFrom(days.optJSONObject(dateOf(now)))
  }

  @Synchronized
  fun days(): Map<String, Day> {
    val json = readDays()
    return json.keys().asSequence().toList().associateWith { dayFrom(json.optJSONObject(it)) }
  }

  fun lastSampleAt(): Long? = if (prefs.contains(KEY_TIME)) prefs.getLong(KEY_TIME, 0) else null

  @Synchronized
  fun clear() {
    prefs.edit().clear().apply()
  }

  private fun distribute(days: JSONObject, delta: Long, from: Long, to: Long) {
    val span = (to - from).toDouble()
    val estimated = to - from > ESTIMATE_GAP_MS
    var cursor = from
    var assigned = 0L
    while (cursor < to) {
      val boundary = minOf(nextHour(cursor), to)
      val share =
        if (boundary >= to) delta - assigned else Math.round(delta * (boundary - cursor) / span)
      assigned += share
      val key = dateOf(cursor)
      val day = days.optJSONObject(key)
      val steps = (day?.optLong("steps") ?: 0L) + share
      val est = (day?.optLong("estimated") ?: 0L) + if (estimated) share else 0L
      val since = day?.let { if (it.has("since")) it.optLong("since") else null }
      val hours = hoursOf(day)
      hours[hourOf(cursor)] += share
      days.put(key, dayJson(steps, est, since, hours))
      cursor = boundary
    }
  }

  private fun nextHour(t: Long): Long =
    Calendar.getInstance().apply {
      timeInMillis = t
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 0)
      set(Calendar.MILLISECOND, 0)
      add(Calendar.HOUR_OF_DAY, 1)
    }.timeInMillis

  private fun hourOf(t: Long): Int = Calendar.getInstance().apply { timeInMillis = t }.get(Calendar.HOUR_OF_DAY)

  private fun hoursOf(day: JSONObject?): LongArray {
    val out = LongArray(24)
    val arr = day?.optJSONArray("hours") ?: return out
    for (i in 0 until minOf(24, arr.length())) out[i] = arr.optLong(i)
    return out
  }

  private fun prune(days: JSONObject, now: Long) {
    val cutoff = dateOf(now - KEEP_DAYS * 86_400_000L)
    days.keys().asSequence().toList().filter { it < cutoff }.forEach { days.remove(it) }
  }

  private fun readDays(): JSONObject =
    try {
      JSONObject(prefs.getString(KEY_DAYS, "{}") ?: "{}")
    } catch (_: Exception) {
      JSONObject()
    }

  private fun dayJson(steps: Long, estimated: Long, since: Long?, hours: LongArray? = null) =
    JSONObject().put("steps", steps).put("estimated", estimated).apply {
      if (since != null) put("since", since)
      if (hours != null) put("hours", org.json.JSONArray(hours.toList()))
    }

  private fun dayFrom(json: JSONObject?): Day =
    if (json == null) Day(0, 0, null)
    else Day(
      json.optLong("steps"),
      json.optLong("estimated"),
      if (json.has("since")) json.optLong("since") else null,
      hoursOf(json),
    )

  private fun bootCount(): Int =
    try {
      Settings.Global.getInt(appContext.contentResolver, Settings.Global.BOOT_COUNT, -1)
    } catch (_: Exception) {
      -1
    }

  companion object {
    private const val KEY_COUNTER = "lastCounter"
    private const val KEY_TIME = "lastTime"
    private const val KEY_BOOT = "bootCount"
    private const val KEY_DAYS = "days"
    private const val KEEP_DAYS = 400
    /** One sample can't plausibly carry more steps than this; larger jumps are sensor faults. */
    private const val MAX_DELTA = 100_000L
    private const val ESTIMATE_GAP_MS = 2 * 60 * 60 * 1000L

    fun dateOf(t: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(t)
  }
}
