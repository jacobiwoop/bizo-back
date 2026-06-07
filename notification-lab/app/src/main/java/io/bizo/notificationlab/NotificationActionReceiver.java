package io.bizo.notificationlab;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class NotificationActionReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();

        if ("io.bizo.notificationlab.SHOW_MESSAGE".equals(action)) {
            BizoLabNotifications.showMessage(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_GROUP".equals(action)) {
            BizoLabNotifications.showGroup(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MESSAGING_STYLE".equals(action)) {
            BizoLabNotifications.showMessagingStyle(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_GROUP_MESSAGING_STYLE".equals(action)) {
            BizoLabNotifications.showGroupMessagingStyle(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_ALL".equals(action)) {
            BizoLabNotifications.showMessage(context);
            BizoLabNotifications.showGroup(context);
            BizoLabNotifications.showMessagingStyle(context);
            BizoLabNotifications.showGroupMessagingStyle(context);
            return;
        }

        if ("io.bizo.notificationlab.CLEAR".equals(action)) {
            BizoLabNotifications.clear(context);
        }
    }
}
