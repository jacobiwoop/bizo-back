const { createRunOncePlugin, withAndroidManifest } = require("@expo/config-plugins");

const PLUGIN_NAME = "with-firebase-notification-color-replace";
const META_DATA_NAME = "com.google.firebase.messaging.default_notification_color";

function withFirebaseNotificationColorReplace(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];

    if (!application) {
      return config;
    }

    const metaData = application["meta-data"]?.find(
      (entry) => entry.$?.["android:name"] === META_DATA_NAME
    );

    if (metaData?.$) {
      metaData.$["tools:replace"] = "android:resource";
    }

    return config;
  });
}

module.exports = createRunOncePlugin(
  withFirebaseNotificationColorReplace,
  PLUGIN_NAME,
  "1.0.0"
);
