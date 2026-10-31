package expo.modules.alarmscheduler

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.PowerManager
import androidx.core.app.NotificationCompat

class RoutineAlarmReceiver : BroadcastReceiver() {
    companion object {
        const val CHANNEL_ID = "thrivefold_routine_alarms_v1"
        const val ACTION_TRIGGER = "expo.modules.alarmscheduler.TRIGGER_ROUTINE_ALARM"
        const val EXTRA_ROUTINE_ID = "routine_id"
        const val EXTRA_TITLE = "routine_title"
        const val EXTRA_TIME = "routine_time"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        if (action == Intent.ACTION_BOOT_COMPLETED) {
            // Restore alarms on reboot from persistence
            AlarmStore.rescheduleAll(context)
            return
        }

        if (action == ACTION_TRIGGER) {
            val routineId = intent.getStringExtra(EXTRA_ROUTINE_ID) ?: return
            val title = intent.getStringExtra(EXTRA_TITLE) ?: "Routine Alarm"
            val time = intent.getStringExtra(EXTRA_TIME) ?: ""

            // Acquire temporary WakeLock to ensure notification & alarm sound fire even if device is asleep
            val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            val wl = pm?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "thrivefold:RoutineAlarmWakeLock")
            wl?.acquire(15000L) // 15 seconds

            showAlarmNotification(context, routineId, title, time)

            // Reschedule next recurrence if this is a recurring alarm
            AlarmStore.scheduleNextRecurrence(context, routineId)
        }
    }

    private fun showAlarmNotification(context: Context, routineId: String, title: String, time: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val audioAttributes = AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build()

            val channel = NotificationChannel(
                CHANNEL_ID,
                "Routine Alarms",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "High priority alarms for Thrivefold mindful routines"
                setSound(alarmUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 800, 400, 800, 400, 800)
                setBypassDnd(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            nm.createNotificationChannel(channel)
        }

        // Tap opens app to the routine screen
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("routine_id", routineId)
        }
        val pIntent = PendingIntent.getActivity(
            context,
            routineId.hashCode(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("⏰ $title")
            .setContentText("It's time for your $title routine ($time). Tap to begin.")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pIntent)
            .setSound(alarmUri)
            .setVibrate(longArrayOf(0, 800, 400, 800, 400, 800))
            .setFullScreenIntent(pIntent, true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()

        nm.notify(routineId.hashCode(), notification)
    }
}

