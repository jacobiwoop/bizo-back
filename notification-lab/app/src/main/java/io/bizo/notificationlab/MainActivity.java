package io.bizo.notificationlab;

import android.Manifest;
import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1001);
        }

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        int pad = dp(20);
        root.setPadding(pad, pad, pad, pad);

        TextView title = new TextView(this);
        title.setText("Bizo Notification Lab");
        title.setTextSize(22);
        title.setTextColor(0xFF111111);
        root.addView(title);

        Button message = new Button(this);
        message.setText("Show individual notification");
        message.setOnClickListener(v -> BizoLabNotifications.showMessage(this));
        root.addView(message);

        Button group = new Button(this);
        group.setText("Show grouped notification");
        group.setOnClickListener(v -> BizoLabNotifications.showGroup(this));
        root.addView(group);

        Button messagingStyle = new Button(this);
        messagingStyle.setText("Show MessagingStyle notification");
        messagingStyle.setOnClickListener(v -> BizoLabNotifications.showMessagingStyle(this));
        root.addView(messagingStyle);

        Button groupMessagingStyle = new Button(this);
        groupMessagingStyle.setText("Show group MessagingStyle notification");
        groupMessagingStyle.setOnClickListener(v -> BizoLabNotifications.showGroupMessagingStyle(this));
        root.addView(groupMessagingStyle);

        Button messagingStyleActions = new Button(this);
        messagingStyleActions.setText("Show MessagingStyle with actions");
        messagingStyleActions.setOnClickListener(v -> BizoLabNotifications.showMessagingStyleWithActions(this));
        root.addView(messagingStyleActions);

        Button childGroup = new Button(this);
        childGroup.setText("Show grouped child notifications");
        childGroup.setOnClickListener(v -> BizoLabNotifications.showChildGroup(this));
        root.addView(childGroup);

        Button multiSummary = new Button(this);
        multiSummary.setText("Show multi-discussion summary");
        multiSummary.setOnClickListener(v -> BizoLabNotifications.showMultiSummary(this));
        root.addView(multiSummary);

        Button all = new Button(this);
        all.setText("Show all");
        all.setOnClickListener(v -> {
            BizoLabNotifications.showMessage(this);
            BizoLabNotifications.showGroup(this);
            BizoLabNotifications.showMessagingStyle(this);
            BizoLabNotifications.showGroupMessagingStyle(this);
            BizoLabNotifications.showMessagingStyleWithActions(this);
            BizoLabNotifications.showChildGroup(this);
            BizoLabNotifications.showMultiSummary(this);
        });
        root.addView(all);

        Button clear = new Button(this);
        clear.setText("Clear");
        clear.setOnClickListener(v -> BizoLabNotifications.clear(this));
        root.addView(clear);

        setContentView(root);
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density);
    }
}
