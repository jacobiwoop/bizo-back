# Bizo Notification Lab

Standalone Android app used to prototype Bizo custom notifications with native `RemoteViews`.

It does not depend on the Bizo React Native app. Use it to iterate on notification layouts quickly before porting the validated design into `bizo-mobile-rn`.

## Build

GitHub Actions workflow:

- `.github/workflows/notification-lab-android.yml`

Local build, if Gradle and Android SDK are available:

```bash
cd notification-lab
gradle :app:assembleDebug
```

APK output:

```text
notification-lab/app/build/outputs/apk/debug/app-debug.apk
```

## Install and Trigger

```bash
adb install -r notification-lab/app/build/outputs/apk/debug/app-debug.apk
```

On Android 13+, open `Bizo Notif Lab` once and accept the notification permission before using the ADB broadcasts.

Individual message:

```bash
adb shell am broadcast -a io.bizo.notificationlab.SHOW_MESSAGE
```

Grouped compact/expanded notification:

```bash
adb shell am broadcast -a io.bizo.notificationlab.SHOW_GROUP
```

Official Android messaging-style comparison:

```bash
adb shell am broadcast -a io.bizo.notificationlab.SHOW_MESSAGING_STYLE
```

This variant follows the WhatsApp-style path: create a bitmap avatar, wrap it with `IconCompat.createWithBitmap(...)`, pass it to `Person.Builder().setIcon(...)`, register a long-lived conversation shortcut with the same person/icon, set that shortcut ID on the notification, and do not call `setLargeIcon(...)`.

Official Android grouped messaging-style comparison:

```bash
adb shell am broadcast -a io.bizo.notificationlab.SHOW_GROUP_MESSAGING_STYLE
```

WhatsApp-like multi-discussion custom summary:

```bash
adb shell am broadcast -a io.bizo.notificationlab.SHOW_MULTI_SUMMARY
```

Both:

```bash
adb shell am broadcast -a io.bizo.notificationlab.SHOW_ALL
```

Clear lab notifications:

```bash
adb shell am broadcast -a io.bizo.notificationlab.CLEAR
```

Capture:

```bash
adb exec-out screencap -p > /tmp/bizo-notification-lab.png
```

## Assets Included

All assets are local XML/vector/drawable resources so the lab can build without network image downloads:

- Bizo logo approximation: `res/drawable/bizo_logo_mark.xml`
- Bizo notification small icon: `res/drawable/bizo_notification_small.xml`
- Sample avatars: `avatar_jacobi.xml`, `avatar_desmarc.xml`, `avatar_akatsuki.xml`, `avatar_lucifer.xml`
- Sample listing/photo thumbnail: `sample_listing_photo.xml`
- Rounded dark notification backgrounds and chevron drawables.

When the design is accepted, replace vector placeholders with real cached bitmaps in the final Bizo native module.
