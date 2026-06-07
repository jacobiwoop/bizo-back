package io.bizo.notificationlab;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.widget.RemoteViews;

import androidx.core.app.Person;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.graphics.drawable.IconCompat;

public final class BizoLabNotifications {
    private static final String CHANNEL_ID = "bizo-lab-alerts";
    private static final int MESSAGE_ID = 4201;
    private static final int GROUP_ID = 4202;
    private static final int MESSAGING_STYLE_ID = 4203;

    private BizoLabNotifications() {}

    public static void showMessage(Context context) {
        ensureChannel(context);

        RemoteViews compact = new RemoteViews(context.getPackageName(), R.layout.notification_message_compact);
        compact.setTextViewText(R.id.sender, "jacobi");
        compact.setTextViewText(R.id.time, "• 2 min");
        compact.setTextViewText(R.id.message, "Bonjour, je suis interesse par ton article...");
        compact.setTextViewText(R.id.avatar_initials, "JW");

        RemoteViews expanded = new RemoteViews(context.getPackageName(), R.layout.notification_message_expanded);
        expanded.setTextViewText(R.id.sender, "jacobi");
        expanded.setTextViewText(R.id.time, "• 2 min");
        expanded.setTextViewText(
            R.id.message,
            "Bonjour, je suis interesse par ton article. Est-ce que le prix est encore negociable si je passe le recuperer aujourd'hui ?"
        );
        expanded.setTextViewText(R.id.avatar_initials, "JW");

        NotificationCompat.Builder builder = baseBuilder(context)
            .setContentTitle("jacobi")
            .setContentText("Bonjour, je suis interesse par ton article...")
            .setCustomContentView(compact)
            .setCustomBigContentView(expanded)
            .setStyle(new NotificationCompat.DecoratedCustomViewStyle());

        NotificationManagerCompat.from(context).notify(MESSAGE_ID, builder.build());
    }

    public static void showMessagingStyle(Context context) {
        ensureChannel(context);

        Bitmap jacobiAvatar = createInitialsAvatarBitmap(context, "JW", 96, 0xFFE8ECFF, 0xFF2F66F3);

        Person jacobi = new Person.Builder()
            .setName("jacobi")
            .setIcon(IconCompat.createWithBitmap(jacobiAvatar))
            .build();

        Person me = new Person.Builder()
            .setName("Bizo")
            .build();

        NotificationCompat.MessagingStyle style = new NotificationCompat.MessagingStyle(me)
            .setConversationTitle("jacobi")
            .addMessage(
                "Bonjour, je suis interesse par ton article...",
                System.currentTimeMillis() - 120_000,
                jacobi
            );

        NotificationCompat.Builder builder = baseBuilder(context)
            .setContentTitle("jacobi")
            .setContentText("Bonjour, je suis interesse par ton article...")
            .setStyle(style)
            .setShortcutId("bizo-lab-jacobi");

        NotificationManagerCompat.from(context).notify(MESSAGING_STYLE_ID, builder.build());
    }

    public static void showGroup(Context context) {
        ensureChannel(context);

        RemoteViews group = new RemoteViews(context.getPackageName(), R.layout.notification_group);
        group.setTextViewText(R.id.group_header, "Bizo • 224 messages de 7 discussions • 2 min");
        group.setTextViewText(R.id.text_1, "Akatsuki </> Dev  Muka'z : Photo");
        group.setTextViewText(R.id.text_2, "Ressi  Merci");
        group.setTextViewText(R.id.text_3, "+229 95 05 98 25  Bonjour mon grand...");

        NotificationCompat.Builder builder = baseBuilder(context)
            .setContentTitle("Bizo")
            .setContentText("224 messages de 7 discussions")
            .setCustomContentView(group)
            .setCustomBigContentView(group)
            .setStyle(new NotificationCompat.DecoratedCustomViewStyle());

        NotificationManagerCompat.from(context).notify(GROUP_ID, builder.build());
    }

    public static void clear(Context context) {
        NotificationManagerCompat.from(context).cancel(MESSAGE_ID);
        NotificationManagerCompat.from(context).cancel(GROUP_ID);
        NotificationManagerCompat.from(context).cancel(MESSAGING_STYLE_ID);
    }

    private static NotificationCompat.Builder baseBuilder(Context context) {
        return new NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.bizo_notification_small)
            .setColor(0xFF111111)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setContentIntent(openIntent(context));
    }

    private static PendingIntent openIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(
            context,
            100,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static Bitmap createInitialsAvatarBitmap(
        Context context,
        String initials,
        int sizeDp,
        int backgroundColor,
        int textColor
    ) {
        int size = dp(context, sizeDp);
        Bitmap bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        Paint backgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        backgroundPaint.setColor(backgroundColor);
        float radius = dp(context, 18);
        canvas.drawRoundRect(new RectF(0, 0, size, size), radius, radius, backgroundPaint);

        Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(textColor);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        textPaint.setTextSize(dp(context, 34));

        Rect bounds = new Rect();
        textPaint.getTextBounds(initials, 0, initials.length(), bounds);
        float y = (size / 2f) - bounds.exactCenterY();
        canvas.drawText(initials, size / 2f, y, textPaint);

        return bitmap;
    }

    private static int dp(Context context, int value) {
        return Math.round(value * context.getResources().getDisplayMetrics().density);
    }

    private static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationManager manager = context.getSystemService(NotificationManager.class);
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Bizo Lab",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Bizo notification layout lab");
        manager.createNotificationChannel(channel);
    }
}
