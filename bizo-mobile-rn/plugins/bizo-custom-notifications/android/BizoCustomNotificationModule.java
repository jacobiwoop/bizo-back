package {{MODULE_PACKAGE}};

import {{APP_PACKAGE}}.R;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public final class BizoCustomNotificationModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "bizo-alerts";
    private static final int DEFAULT_NOTIFICATION_ID = 6200;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    BizoCustomNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "BizoCustomNotifications";
    }

    @ReactMethod
    public void showMessageNotification(ReadableMap payload, Promise promise) {
        executor.execute(() -> {
            try {
                Context context = getReactApplicationContext();
                ensureChannel(context);

                String conversationId = readString(payload, "conversationId", "");
                String senderName = readString(payload, "senderName", "Nouveau message");
                String body = readString(payload, "body", "Nouveau message");
                String avatarUrl = readString(payload, "avatarUrl", "");
                String listingTitle = readString(payload, "listingTitle", "");
                String notificationId = readString(payload, "notificationId", conversationId);
                long timestamp = System.currentTimeMillis();

                String initials = initialsFrom(senderName);
                Bitmap avatar = loadBitmap(avatarUrl);
                if (avatar == null) {
                    avatar = createInitialsAvatarBitmap(context, initials, 52, 0xFFE8ECFF, 0xFF2F66F3);
                }

                RemoteViews compact = new RemoteViews(context.getPackageName(), R.layout.bizo_notification_message_compact);
                compact.setTextViewText(R.id.bizo_sender, senderName);
                compact.setTextViewText(R.id.bizo_time, "• maintenant");
                compact.setTextViewText(R.id.bizo_message, body);
                compact.setImageViewBitmap(R.id.bizo_avatar, avatar);

                RemoteViews expanded = new RemoteViews(context.getPackageName(), R.layout.bizo_notification_message_expanded);
                expanded.setTextViewText(R.id.bizo_sender, senderName);
                expanded.setTextViewText(R.id.bizo_time, "• maintenant");
                expanded.setTextViewText(R.id.bizo_message, body);
                expanded.setTextViewText(R.id.bizo_context, listingTitle.isEmpty() ? "Message Bizo" : listingTitle);
                expanded.setImageViewBitmap(R.id.bizo_avatar, avatar);

                NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.bizo_notification_small)
                    .setColor(Color.rgb(17, 17, 17))
                    .setContentTitle(senderName)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                    .setAutoCancel(true)
                    .setShowWhen(true)
                    .setWhen(timestamp)
                    .setContentIntent(openIntent(context, conversationId))
                    .setCustomContentView(compact)
                    .setCustomBigContentView(expanded)
                    .setStyle(new NotificationCompat.DecoratedCustomViewStyle());

                NotificationManagerCompat.from(context).notify(notificationIdFrom(notificationId), builder.build());
                promise.resolve(true);
            } catch (Exception exception) {
                promise.reject("BIZO_CUSTOM_NOTIFICATION_FAILED", exception);
            }
        });
    }

    private static String readString(ReadableMap payload, String key, String fallback) {
        if (!payload.hasKey(key) || payload.isNull(key)) {
            return fallback;
        }

        String value = payload.getString(key);
        if (value == null || value.trim().isEmpty()) {
            return fallback;
        }

        return value.trim();
    }

    private static int notificationIdFrom(String value) {
        if (value == null || value.trim().isEmpty()) {
            return DEFAULT_NOTIFICATION_ID;
        }

        return DEFAULT_NOTIFICATION_ID + Math.abs(value.hashCode() % 100000);
    }

    private static PendingIntent openIntent(Context context, String conversationId) {
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (intent == null) {
            intent = new Intent();
        }

        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        if (conversationId != null && !conversationId.isEmpty()) {
            intent.putExtra("conv_id", conversationId);
            intent.putExtra("type", "new_message");
        }

        return PendingIntent.getActivity(
            context,
            210,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static Bitmap loadBitmap(String sourceUrl) {
        if (sourceUrl == null || sourceUrl.trim().isEmpty()) {
            return null;
        }

        HttpURLConnection connection = null;
        try {
            URL url = new URL(sourceUrl);
            connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(2500);
            connection.setReadTimeout(2500);
            connection.setDoInput(true);
            connection.connect();

            try (InputStream stream = connection.getInputStream()) {
                return BitmapFactory.decodeStream(stream);
            }
        } catch (Exception ignored) {
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String initialsFrom(String name) {
        String normalized = name == null ? "" : name.trim();
        if (normalized.isEmpty()) {
            return "BZ";
        }

        String[] parts = normalized.split("\\s+");
        StringBuilder initials = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                initials.append(part.substring(0, 1).toUpperCase(Locale.ROOT));
            }
            if (initials.length() == 2) {
                break;
            }
        }

        return initials.length() == 0 ? "BZ" : initials.toString();
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
        float radius = dp(context, 10);
        canvas.drawRoundRect(new RectF(0, 0, size, size), radius, radius, backgroundPaint);

        Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint.setColor(textColor);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        textPaint.setTextSize(dp(context, 17));

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
            "Bizo",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Messages et alertes Bizo");
        manager.createNotificationChannel(channel);
    }
}
