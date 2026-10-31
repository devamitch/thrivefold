package expo.modules.alarmscheduler

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

data class ScheduledAlarm(
    val id: String,
    val title: String,
    val hour: Int,
    val minute: Int,
    val days: List<Int>, // 1 = Monday .. 7 = Sunday
    val enabled: Boolean
)

object AlarmStore {
    private const val PREFS_NAME = "thrivefold_alarms_prefs"
    private const val KEY_ALARMS = "active_alarms_json"

    fun saveAlarms(context: Context, alarms: List<ScheduledAlarm>) {
        val sp = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val array = JSONArray()
        for (a in alarms) {
            val obj = JSONObject().apply {
                put("id", a.id)
                put("title", a.title)
                put("hour", a.hour)
                put("minute", a.minute)
                put("days", JSONArray(a.days))
                put("enabled", a.enabled)
            }
            array.put(obj)
        }
        sp.edit().putString(KEY_ALARMS, array.toString()).apply()
    }

    fun loadAlarms(context: Context): List<ScheduledAlarm> {
        val sp = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = sp.getString(KEY_ALARMS, null) ?: return emptyList()
        val list = mutableListOf<ScheduledAlarm>()
        try {
            val array = JSONArray(raw)
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                val daysArr = obj.getJSONArray("days")
                val daysList = mutableListOf<Int>()
                for (d in 0 until daysArr.length()) {
                    daysList.add(daysArr.getInt(d))
                }
                list.add(
                    ScheduledAlarm(
                        id = obj.getString("id"),
                        title = obj.getString("title"),
                        hour = obj.getInt("hour"),
                        minute = obj.getInt("minute"),
                        days = daysList,
                        enabled = obj.optBoolean("enabled", true)
                    )
                )
            }
        } catch (_: Exception) {}
        return list
    }

    fun rescheduleAll(context: Context) {
        val alarms = loadAlarms(context)
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

        for (a in alarms) {
            if (!a.enabled) {
                cancelAlarm(context, a.id)
                continue
            }
            scheduleAlarm(context, am, a)
        }
    }

    fun scheduleNextRecurrence(context: Context, routineId: String) {
        val alarms = loadAlarms(context)
        val alarm = alarms.firstOrNull { it.id == routineId && it.enabled } ?: return
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        scheduleAlarm(context, am, alarm)
    }

    fun cancelAlarm(context: Context, routineId: String) {
        val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
        val intent = Intent(context, RoutineAlarmReceiver::class.java).apply {
            action = RoutineAlarmReceiver.ACTION_TRIGGER
        }
        val pi = PendingIntent.getBroadcast(
            context,
            routineId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        am.cancel(pi)
    }

    fun scheduleAlarm(context: Context, am: AlarmManager, alarm: ScheduledAlarm) {
        val triggerTimeMs = calculateNextTrigger(alarm.hour, alarm.minute, alarm.days)

        val intent = Intent(context, RoutineAlarmReceiver::class.java).apply {
            action = RoutineAlarmReceiver.ACTION_TRIGGER
            putExtra(RoutineAlarmReceiver.EXTRA_ROUTINE_ID, alarm.id)
            putExtra(RoutineAlarmReceiver.EXTRA_TITLE, alarm.title)
            putExtra(RoutineAlarmReceiver.EXTRA_TIME, String.format("%02d:%02d", alarm.hour, alarm.minute))
        }

        val pi = PendingIntent.getBroadcast(
            context,
            alarm.id.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Exact Alarm with AlarmClockInfo (shows clock icon in status bar and wakes up device)
        val clockInfo = AlarmManager.AlarmClockInfo(triggerTimeMs, pi)
        try {
            am.setAlarmClock(clockInfo, pi)
        } catch (_: SecurityException) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pi)
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, triggerTimeMs, pi)
            }
        }
    }

    private fun calculateNextTrigger(hour: Int, minute: Int, days: List<Int>): Long {
        val now = Calendar.getInstance()
        val target = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        if (days.isEmpty()) {
            // Daily alarm
            if (target.before(now) || target.timeInMillis <= now.timeInMillis) {
                target.add(Calendar.DAY_OF_YEAR, 1)
            }
            return target.timeInMillis
        }

        // Days: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
        // Calendar day: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
        for (i in 0..7) {
            val candidate = (target.clone() as Calendar).apply { add(Calendar.DAY_OF_YEAR, i) }
            val calDay = candidate.get(Calendar.DAY_OF_WEEK)
            val customDay = if (calDay == Calendar.SUNDAY) 7 else calDay - 1

            if (days.contains(customDay)) {
                if (candidate.after(now)) {
                    return candidate.timeInMillis
                }
            }
        }

        target.add(Calendar.DAY_OF_YEAR, 1)
        return target.timeInMillis
    }
}

