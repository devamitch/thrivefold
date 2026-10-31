package expo.modules.alarmscheduler

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
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

        // Thrivefold terracotta, used to tint the status-bar glyph
        private const val BRAND_COLOR = 0xFFD27D5C.toInt()
        private const val STAT_ICON = "ic_stat_thrivefold"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        if (action == Intent.ACTION_BOOT_COMPLETED) {
            AlarmStore.rescheduleAll(context)
            return
        }

        if (action == ACTION_TRIGGER) {
            val routineId = intent.getStringExtra(EXTRA_ROUTINE_ID) ?: return
            val title = intent.getStringExtra(EXTRA_TITLE) ?: "Routine alarm"
            val time = intent.getStringExtra(EXTRA_TIME) ?: ""

            val pm = context.getSystemService(Context.POWER_SERVICE) as? PowerManager
            val wl = pm?.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "thrivefold:RoutineAlarmWakeLock")
            wl?.acquire(15000L)

            showAlarmNotification(context, routineId, title, time)
            AlarmStore.scheduleNextRecurrence(context, routineId)
        }
    }

    /** "18:30" -> "6:30 PM" */
    private fun to12Hour(time: String): String {
        val parts = time.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: return time
        val m = parts.getOrNull(1)?.toIntOrNull() ?: return time
        val h12 = if (h % 12 == 0) 12 else h % 12
        return String.format("%d:%02d %s", h12, m, if (h >= 12) "PM" else "AM")
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
                "Routine alarms",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alarms for your Thrivefold routines"
                setSound(alarmUri, audioAttributes)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 800, 400, 800, 400, 800)
                setBypassDnd(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            nm.createNotificationChannel(channel)
        }

        val deepLinkUri = Uri.parse("thrivefold://routines?routineId=${Uri.encode(routineId)}&title=${Uri.encode(title)}&time=${Uri.encode(time)}&trigger=alarm")
        val launchIntent = (Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
            setPackage(context.packageName)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("routine_id", routineId)
            putExtra("routine_title", title)
            putExtra("routine_time", time)
            putExtra("trigger", "alarm")
        }).takeIf { it.resolveActivity(context.packageManager) != null }
            ?: context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                data = deepLinkUri
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                putExtra("routine_id", routineId)
                putExtra("routine_title", title)
                putExtra("routine_time", time)
                putExtra("trigger", "alarm")
            }
        val pIntent = launchIntent?.let {
            PendingIntent.getActivity(
                context,
                routineId.hashCode(),
                it,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }

        // Brand glyph from the drawable shipped with this module; system alarm icon only as a fallback.
        val iconRes = context.resources
            .getIdentifier(STAT_ICON, "drawable", context.packageName)
            .takeIf { it != 0 } ?: android.R.drawable.ic_lock_idle_alarm

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(iconRes)
            .setColor(BRAND_COLOR)
            .setContentTitle(title) // no emoji: the glyph is the icon
            .setContentText(if (time.isNotEmpty()) "${to12Hour(time)} · Tap to begin" else "Tap to begin")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setSound(alarmUri)
            .setVibrate(longArrayOf(0, 800, 400, 800, 400, 800))
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)

        if (pIntent != null) {
            builder.setContentIntent(pIntent).setFullScreenIntent(pIntent, true)
        }

        nm.notify(routineId.hashCode(), builder.build())
    }
}
