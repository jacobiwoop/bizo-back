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

        Button all = new Button(this);
        all.setText("Show both");
        all.setOnClickListener(v -> {
            BizoLabNotifications.showMessage(this);
            BizoLabNotifications.showGroup(this);
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
