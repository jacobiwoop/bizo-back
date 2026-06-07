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

        if ("io.bizo.notificationlab.SHOW_MESSAGING_STYLE_ACTIONS".equals(action)) {
            BizoLabNotifications.showMessagingStyleWithActions(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_CHILD_GROUP".equals(action)) {
            BizoLabNotifications.showChildGroup(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MULTI_SUMMARY".equals(action)) {
            BizoLabNotifications.showMultiSummary(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MULTI_SUMMARY_AK_OPEN".equals(action)) {
            BizoLabNotifications.showMultiSummaryAkOpen(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MULTI_SUMMARY_JACOBI_OPEN".equals(action)) {
            BizoLabNotifications.showMultiSummaryJacobiOpen(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MULTI_SUMMARY_RESSI_OPEN".equals(action)) {
            BizoLabNotifications.showMultiSummaryRessiOpen(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MULTI_SUMMARY_CYBER_OPEN".equals(action)) {
            BizoLabNotifications.showMultiSummaryCyberOpen(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_MULTI_SUMMARY_WITHOUT_JACOBI".equals(action)) {
            BizoLabNotifications.showMultiSummaryWithoutJacobi(context);
            return;
        }

        if ("io.bizo.notificationlab.MESSAGE_REPLY".equals(action)
            || "io.bizo.notificationlab.MARK_READ".equals(action)
            || "io.bizo.notificationlab.SILENCE".equals(action)) {
            BizoLabNotifications.showMessagingStyleWithActions(context);
            return;
        }

        if ("io.bizo.notificationlab.SHOW_ALL".equals(action)) {
            BizoLabNotifications.showMessage(context);
            BizoLabNotifications.showGroup(context);
            BizoLabNotifications.showMessagingStyle(context);
            BizoLabNotifications.showGroupMessagingStyle(context);
            BizoLabNotifications.showMessagingStyleWithActions(context);
            BizoLabNotifications.showChildGroup(context);
            BizoLabNotifications.showMultiSummary(context);
            return;
        }

        if ("io.bizo.notificationlab.CLEAR".equals(action)) {
            BizoLabNotifications.clear(context);
        }
    }
}
