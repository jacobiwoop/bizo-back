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
import android.view.View;
import android.widget.RemoteViews;

import androidx.core.app.Person;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.RemoteInput;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;

public final class BizoLabNotifications {
    private static final String CHANNEL_ID = "bizo-lab-alerts";
    private static final int MESSAGE_ID = 4201;
    private static final int GROUP_ID = 4202;
    private static final int MESSAGING_STYLE_ID = 4203;
    private static final int GROUP_MESSAGING_STYLE_ID = 4204;
    private static final int MULTI_SUMMARY_ID = 4205;
    private static final int MESSAGING_STYLE_ACTIONS_ID = 4206;
    private static final int CHILD_GROUP_SUMMARY_ID = 4210;
    private static final int CHILD_GROUP_AK_ID = 4211;
    private static final int CHILD_GROUP_JACOBI_ID = 4212;
    private static final int CHILD_GROUP_RESSI_ID = 4213;
    private static final int CHILD_GROUP_CYBER_ID = 4214;
    private static final String CHILD_GROUP_KEY = "bizo-lab-child-conversations";
    private static final String OPEN_NONE = "none";
    private static final String OPEN_AK = "ak";
    private static final String OPEN_JACOBI = "jacobi";
    private static final String OPEN_RESSI = "ressi";

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
        IconCompat jacobiIcon = IconCompat.createWithBitmap(jacobiAvatar);

        Person jacobi = new Person.Builder()
            .setName("jacobi")
            .setIcon(jacobiIcon)
            .build();

        Person me = new Person.Builder()
            .setName("Bizo")
            .build();

        registerConversationShortcut(context, "bizo-lab-jacobi", "jacobi", jacobi, jacobiIcon);

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
            .setShortcutId("bizo-lab-jacobi")
            .addPerson(jacobi);

        NotificationManagerCompat.from(context).notify(MESSAGING_STYLE_ID, builder.build());
    }

    public static void showGroupMessagingStyle(Context context) {
        ensureChannel(context);

        IconCompat jacobiIcon = IconCompat.createWithBitmap(
            createInitialsAvatarBitmap(context, "JW", 96, 0xFFE8ECFF, 0xFF2F66F3)
        );
        IconCompat ressiIcon = IconCompat.createWithBitmap(
            createInitialsAvatarBitmap(context, "RS", 96, 0xFFF1E8DF, 0xFF7C4A18)
        );
        IconCompat akatsukiIcon = IconCompat.createWithBitmap(
            createInitialsAvatarBitmap(context, "AK", 96, 0xFF2A2F3A, 0xFFFFFFFF)
        );

        Person jacobi = new Person.Builder()
            .setName("jacobi")
            .setIcon(jacobiIcon)
            .build();
        Person ressi = new Person.Builder()
            .setName("Ressi")
            .setIcon(ressiIcon)
            .build();
        Person akatsuki = new Person.Builder()
            .setName("Akatsuki </> Dev")
            .setIcon(akatsukiIcon)
            .build();
        Person me = new Person.Builder()
            .setName("Bizo")
            .build();

        registerConversationShortcut(context, "bizo-lab-group", "Groupe Bizo", jacobi, jacobiIcon);

        long now = System.currentTimeMillis();
        NotificationCompat.MessagingStyle style = new NotificationCompat.MessagingStyle(me)
            .setConversationTitle("Groupe Bizo")
            .setGroupConversation(true)
            .addMessage("Muka'z : Photo", now - 180_000, akatsuki)
            .addMessage("Merci", now - 120_000, ressi)
            .addMessage("Bonjour mon grand comment vas-tu ?", now - 60_000, jacobi);

        NotificationCompat.Builder builder = baseBuilder(context)
            .setContentTitle("Groupe Bizo")
            .setContentText("3 messages de 3 discussions")
            .setStyle(style)
            .setShortcutId("bizo-lab-group")
            .addPerson(jacobi)
            .addPerson(ressi)
            .addPerson(akatsuki);

        NotificationManagerCompat.from(context).notify(GROUP_MESSAGING_STYLE_ID, builder.build());
    }

    public static void showMessagingStyleWithActions(Context context) {
        ensureChannel(context);

        Bitmap jacobiAvatar = createInitialsAvatarBitmap(context, "JW", 96, 0xFFE8ECFF, 0xFF2F66F3);
        IconCompat jacobiIcon = IconCompat.createWithBitmap(jacobiAvatar);
        Person jacobi = new Person.Builder()
            .setName("jacobi")
            .setIcon(jacobiIcon)
            .build();
        Person me = new Person.Builder()
            .setName("Bizo")
            .build();

        registerConversationShortcut(context, "bizo-lab-jacobi-actions", "jacobi", jacobi, jacobiIcon);

        long now = System.currentTimeMillis();
        NotificationCompat.MessagingStyle style = new NotificationCompat.MessagingStyle(me)
            .setConversationTitle("jacobi")
            .addMessage("Bonjour mon grand comment vas-tu ?", now - 180_000, jacobi)
            .addMessage("Oui, l'article est toujours disponible.", now - 120_000, me)
            .addMessage("Je peux passer aujourd'hui ?", now - 60_000, jacobi);

        RemoteInput replyInput = new RemoteInput.Builder("bizo_reply_text")
            .setLabel("Repondre a jacobi")
            .build();

        NotificationCompat.Action reply = new NotificationCompat.Action.Builder(
            R.drawable.bizo_notification_small,
            "Repondre",
            mutableActionIntent(context, "io.bizo.notificationlab.MESSAGE_REPLY", 301)
        )
            .addRemoteInput(replyInput)
            .setAllowGeneratedReplies(true)
            .build();

        NotificationCompat.Builder builder = baseBuilder(context)
            .setContentTitle("jacobi")
            .setContentText("Je peux passer aujourd'hui ?")
            .setStyle(style)
            .setShortcutId("bizo-lab-jacobi-actions")
            .addPerson(jacobi)
            .addAction(reply)
            .addAction(R.drawable.bizo_notification_small, "Marquer comme lu", actionIntent(context, "io.bizo.notificationlab.MARK_READ", 302))
            .addAction(R.drawable.bizo_notification_small, "Silence", actionIntent(context, "io.bizo.notificationlab.SILENCE", 303));

        NotificationManagerCompat.from(context).notify(MESSAGING_STYLE_ACTIONS_ID, builder.build());
    }

    public static void showChildGroup(Context context) {
        ensureChannel(context);

        NotificationManagerCompat manager = NotificationManagerCompat.from(context);
        manager.notify(CHILD_GROUP_AK_ID, childConversationBuilder(context, "Akatsuki </> Dev", "Muka'z : Photo", CHILD_GROUP_AK_ID).build());
        manager.notify(CHILD_GROUP_JACOBI_ID, childConversationBuilder(context, "jacobi", "Bonjour mon grand comment...", CHILD_GROUP_JACOBI_ID).build());
        manager.notify(CHILD_GROUP_RESSI_ID, childConversationBuilder(context, "Ressi", "Merci", CHILD_GROUP_RESSI_ID).build());
        manager.notify(CHILD_GROUP_CYBER_ID, childConversationBuilder(context, "Cyber Torch", "Aliou : Sticker", CHILD_GROUP_CYBER_ID).build());

        NotificationCompat.Builder summary = baseBuilder(context)
            .setContentTitle("Bizo")
            .setContentText("4 conversations")
            .setGroup(CHILD_GROUP_KEY)
            .setGroupSummary(true)
            .setSubText("4 conversations")
            .setStyle(new NotificationCompat.InboxStyle()
                .addLine("Akatsuki </> Dev  Muka'z : Photo")
                .addLine("jacobi  Bonjour mon grand comment...")
                .addLine("Ressi  Merci")
                .addLine("Cyber Torch  Aliou : Sticker")
                .setSummaryText("4 conversations"));

        manager.notify(CHILD_GROUP_SUMMARY_ID, summary.build());
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

    public static void showMultiSummary(Context context) {
        showMultiSummary(context, OPEN_NONE, false);
    }

    public static void showMultiSummaryAkOpen(Context context) {
        showMultiSummary(context, OPEN_AK, false);
    }

    public static void showMultiSummaryJacobiOpen(Context context) {
        showMultiSummary(context, OPEN_JACOBI, false);
    }

    public static void showMultiSummaryRessiOpen(Context context) {
        showMultiSummary(context, OPEN_RESSI, false);
    }

    public static void showMultiSummaryCyberOpen(Context context) {
        showMultiSummary(context, OPEN_NONE, false);
    }

    public static void showMultiSummaryWithoutJacobi(Context context) {
        showMultiSummary(context, OPEN_NONE, true);
    }

    private static void showMultiSummary(Context context, String openConversation, boolean hideJacobi) {
        ensureChannel(context);

        RemoteViews compact = new RemoteViews(context.getPackageName(), R.layout.notification_multi_summary);
        compact.setTextViewText(R.id.summary_header, hideJacobi
            ? "Bizo • 5 messages de 5 discuss... • maintenant"
            : "Bizo • 6 messages de 6 discuss... • maintenant"
        );
        compact.setTextViewText(R.id.summary_avatar_1, "AK");
        compact.setTextViewText(R.id.summary_text_1, "Akatsuki </> Dev  Muka'z : Photo");
        compact.setTextViewText(R.id.summary_avatar_2, "JW");
        compact.setTextViewText(R.id.summary_text_2, hideJacobi ? "Ressi  Merci" : "jacobi  Bonjour mon grand comment...");

        RemoteViews expanded = new RemoteViews(context.getPackageName(), R.layout.notification_multi_summary_expanded);
        bindConversationRow(
            context,
            expanded,
            R.id.summary_row_1,
            R.id.summary_avatar_1,
            R.id.summary_text_1,
            R.id.summary_preview_1,
            R.id.summary_chevron_1,
            R.id.summary_actions_1,
            "AK",
            "Akatsuki </> Dev  Muka'z : Photo",
            "Photo envoyee",
            "Le vendeur a ajoute trois photos de l'article.",
            OPEN_AK,
            openConversation,
            "io.bizo.notificationlab.SHOW_MULTI_SUMMARY_AK_OPEN",
            201,
            true
        );
        bindConversationRow(
            context,
            expanded,
            R.id.summary_row_2,
            R.id.summary_avatar_2,
            R.id.summary_text_2,
            R.id.summary_preview_2,
            R.id.summary_chevron_2,
            R.id.summary_actions_2,
            "JW",
            "jacobi • maintenant",
            "Bonjour mon grand comment...",
            "Bonjour mon grand comment vas-tu ? Je voulais verifier si l'article est toujours disponible.",
            OPEN_JACOBI,
            openConversation,
            "io.bizo.notificationlab.SHOW_MULTI_SUMMARY_JACOBI_OPEN",
            202,
            !hideJacobi
        );
        bindConversationRow(
            context,
            expanded,
            R.id.summary_row_3,
            R.id.summary_avatar_3,
            R.id.summary_text_3,
            R.id.summary_preview_3,
            R.id.summary_chevron_3,
            R.id.summary_actions_3,
            "RS",
            "Ressi • 2 min",
            "Merci",
            "Merci, je te confirme des que je suis pret.",
            OPEN_RESSI,
            openConversation,
            "io.bizo.notificationlab.SHOW_MULTI_SUMMARY_RESSI_OPEN",
            203,
            true
        );
        bindConversationRow(
            context,
            expanded,
            R.id.summary_row_4,
            R.id.summary_avatar_4,
            R.id.summary_text_4,
            R.id.summary_preview_4,
            R.id.summary_chevron_4,
            R.id.summary_actions_4,
            "+3",
            hideJacobi ? "+ 2 autres conversations" : "+ 3 autres conversations",
            "Ouvrir Bizo pour tout voir",
            "Ouvrir Bizo pour tout voir",
            OPEN_NONE,
            openConversation,
            "io.bizo.notificationlab.SHOW_MULTI_SUMMARY",
            204,
            true
        );
        expanded.setViewVisibility(R.id.summary_chevron_4, View.GONE);

        NotificationCompat.Builder builder = baseBuilder(context)
            .setContentTitle("Bizo")
            .setContentText(hideJacobi ? "5 messages de 5 discussions" : "6 messages de 6 discussions")
            .setCustomContentView(compact)
            .setCustomBigContentView(expanded)
            .setStyle(new NotificationCompat.DecoratedCustomViewStyle());

        NotificationManagerCompat.from(context).notify(MULTI_SUMMARY_ID, builder.build());
    }

    public static void clear(Context context) {
        NotificationManagerCompat.from(context).cancel(MESSAGE_ID);
        NotificationManagerCompat.from(context).cancel(GROUP_ID);
        NotificationManagerCompat.from(context).cancel(MESSAGING_STYLE_ID);
        NotificationManagerCompat.from(context).cancel(GROUP_MESSAGING_STYLE_ID);
        NotificationManagerCompat.from(context).cancel(MULTI_SUMMARY_ID);
        NotificationManagerCompat.from(context).cancel(MESSAGING_STYLE_ACTIONS_ID);
        NotificationManagerCompat.from(context).cancel(CHILD_GROUP_SUMMARY_ID);
        NotificationManagerCompat.from(context).cancel(CHILD_GROUP_AK_ID);
        NotificationManagerCompat.from(context).cancel(CHILD_GROUP_JACOBI_ID);
        NotificationManagerCompat.from(context).cancel(CHILD_GROUP_RESSI_ID);
        NotificationManagerCompat.from(context).cancel(CHILD_GROUP_CYBER_ID);
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

    private static PendingIntent actionIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, NotificationActionReceiver.class).setAction(action);
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }

    private static PendingIntent mutableActionIntent(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, NotificationActionReceiver.class).setAction(action);
        return PendingIntent.getBroadcast(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
        );
    }

    private static NotificationCompat.Builder childConversationBuilder(
        Context context,
        String title,
        String message,
        int requestCode
    ) {
        return baseBuilder(context)
            .setContentTitle(title)
            .setContentText(message)
            .setGroup(CHILD_GROUP_KEY)
            .setContentIntent(openIntent(context))
            .setDeleteIntent(actionIntent(context, "io.bizo.notificationlab.MARK_READ", requestCode + 1000));
    }

    private static void bindConversationRow(
        Context context,
        RemoteViews views,
        int rowId,
        int avatarId,
        int titleId,
        int previewId,
        int chevronId,
        int actionsId,
        String initials,
        String title,
        String closedPreview,
        String openPreview,
        String rowKey,
        String openConversation,
        String openAction,
        int requestCode,
        boolean visible
    ) {
        boolean isOpen = rowKey.equals(openConversation);
        views.setViewVisibility(rowId, visible ? View.VISIBLE : View.GONE);
        views.setTextViewText(avatarId, initials);
        views.setTextViewText(titleId, title);
        views.setTextViewText(previewId, isOpen ? openPreview : closedPreview);
        views.setImageViewResource(chevronId, isOpen ? R.drawable.ic_chevron_up : R.drawable.ic_chevron_down);
        views.setViewVisibility(actionsId, isOpen ? View.VISIBLE : View.GONE);
        views.setOnClickPendingIntent(
            chevronId,
            actionIntent(context, isOpen ? "io.bizo.notificationlab.SHOW_MULTI_SUMMARY" : openAction, requestCode)
        );
    }

    private static void registerConversationShortcut(
        Context context,
        String shortcutId,
        String label,
        Person person,
        IconCompat icon
    ) {
        Intent intent = new Intent(context, MainActivity.class)
            .setAction(Intent.ACTION_VIEW)
            .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        ShortcutInfoCompat shortcut = new ShortcutInfoCompat.Builder(context, shortcutId)
            .setShortLabel(label)
            .setLongLabel(label)
            .setIcon(icon)
            .setPerson(person)
            .setLongLived(true)
            .setIntent(intent)
            .build();

        ShortcutManagerCompat.pushDynamicShortcut(context, shortcut);
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
