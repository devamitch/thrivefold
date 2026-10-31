package expo.modules.alarmscheduler

import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AlarmSchedulerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("AlarmScheduler")

        AsyncFunction("canScheduleExactAlarms") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                return@AsyncFunction am.canScheduleExactAlarms()
            }
            return@AsyncFunction true
        }

        AsyncFunction("requestExactAlarmPermission") {
            val context = appContext.reactContext ?: return@AsyncFunction false
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
                if (!am.canScheduleExactAlarms()) {
                    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                        data = Uri.parse("package:${context.packageName}")
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                    return@AsyncFunction true
                }
            }
            return@AsyncFunction true
        }

        AsyncFunction("syncAlarms") { alarmsList: List<Map<String, Any?>> ->
            val context = appContext.reactContext ?: return@AsyncFunction false

            val converted = alarmsList.mapNotNull { map ->
                val id = map["id"] as? String ?: return@mapNotNull null
                val title = map["title"] as? String ?: "Routine Alarm"
                val timeStr = map["time"] as? String ?: return@mapNotNull null
                val parts = timeStr.split(":")
                if (parts.size < 2) return@mapNotNull null
                val hour = parts[0].toIntOrNull() ?: return@mapNotNull null
                val minute = parts[1].toIntOrNull() ?: return@mapNotNull null

                val daysRaw = map["days"] as? List<*> ?: emptyList<Any>()
                val days = daysRaw.mapNotNull { (it as? Number)?.toInt() }
                val enabled = map["enabled"] as? Boolean ?: true

                ScheduledAlarm(
                    id = id,
                    title = title,
                    hour = hour,
                    minute = minute,
                    days = days,
                    enabled = enabled
                )
            }

            AlarmStore.saveAlarms(context, converted)
            AlarmStore.rescheduleAll(context)
            return@AsyncFunction true
        }

        AsyncFunction("cancelAlarm") { routineId: String ->
            val context = appContext.reactContext ?: return@AsyncFunction false
            AlarmStore.cancelAlarm(context, routineId)
            return@AsyncFunction true
        }
    }
}

