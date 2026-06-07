const fs = require("fs");
const path = require("path");
const { createRunOncePlugin, withDangerousMod } = require("@expo/config-plugins");

const PLUGIN_NAME = "with-firebase-notification-color-replace";
const META_DATA_NAME = "com.google.firebase.messaging.default_notification_color";

function withFirebaseNotificationColorReplace(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const manifestPath = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/AndroidManifest.xml"
      );

      if (!fs.existsSync(manifestPath)) {
        return config;
      }

      const contents = fs.readFileSync(manifestPath, "utf8");

      if (!contents.includes(META_DATA_NAME) || contents.includes(`${META_DATA_NAME}" tools:replace=`)) {
        return config;
      }

      const next = contents.replace(
        /(<meta-data android:name="com\.google\.firebase\.messaging\.default_notification_color" android:resource="[^"]+")(\s*\/>)/,
        '$1 tools:replace="android:resource"$2'
      );

      fs.writeFileSync(manifestPath, next);

      return config;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withFirebaseNotificationColorReplace,
  PLUGIN_NAME,
  "1.0.0"
);
