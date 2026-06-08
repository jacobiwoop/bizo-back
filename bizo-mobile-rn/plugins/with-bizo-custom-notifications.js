const fs = require("fs");
const path = require("path");
const { createRunOncePlugin, withDangerousMod } = require("@expo/config-plugins");

const PLUGIN_NAME = "with-bizo-custom-notifications";
const MODULE_PACKAGE = "io.bizo.notifications";
const MODULE_PACKAGE_PATH = MODULE_PACKAGE.replace(/\./g, "/");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, contents) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents);
}

function findMainApplication(platformProjectRoot) {
  const javaRoot = path.join(platformProjectRoot, "app/src/main/java");
  const stack = [javaRoot];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.name === "MainApplication.kt") {
        return fullPath;
      }
    }
  }

  return null;
}

function patchMainApplication(mainApplicationPath) {
  let contents = fs.readFileSync(mainApplicationPath, "utf8");

  if (!contents.includes("import io.bizo.notifications.BizoCustomNotificationPackage")) {
    contents = contents.replace(
      "import com.facebook.react.PackageList\n",
      "import com.facebook.react.PackageList\nimport io.bizo.notifications.BizoCustomNotificationPackage\n"
    );
  }

  if (!contents.includes("add(BizoCustomNotificationPackage())")) {
    contents = contents.replace(
      "          // add(MyReactNativePackage())\n",
      "          // add(MyReactNativePackage())\n          add(BizoCustomNotificationPackage())\n"
    );
  }

  fs.writeFileSync(mainApplicationPath, contents);
}

function withBizoCustomNotifications(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformProjectRoot = config.modRequest.platformProjectRoot;
      const appPackage = config.android?.package ?? config.expo?.android?.package ?? "io.bizo.woop";
      const sourceRoot = path.join(projectRoot, "plugins/bizo-custom-notifications/android");
      const javaRoot = path.join(platformProjectRoot, "app/src/main/java", MODULE_PACKAGE_PATH);
      const resRoot = path.join(platformProjectRoot, "app/src/main/res");

      for (const fileName of [
        "BizoCustomNotificationModule.java",
        "BizoCustomNotificationPackage.java",
      ]) {
        const template = fs.readFileSync(path.join(sourceRoot, fileName), "utf8");
        writeFile(
          path.join(javaRoot, fileName),
          template
            .replace(/\{\{APP_PACKAGE\}\}/g, appPackage)
            .replace(/\{\{MODULE_PACKAGE\}\}/g, MODULE_PACKAGE)
        );
      }

      const resourceFiles = [
        ["layout", "bizo_notification_message_compact.xml"],
        ["layout", "bizo_notification_message_expanded.xml"],
        ["drawable", "bizo_avatar_bg_blue.xml"],
        ["drawable", "bizo_avatar_bg_warm.xml"],
        ["drawable", "bizo_notification_small.xml"],
      ];

      for (const [type, fileName] of resourceFiles) {
        writeFile(
          path.join(resRoot, type, fileName),
          fs.readFileSync(path.join(sourceRoot, type, fileName), "utf8")
        );
      }

      const mainApplicationPath = findMainApplication(platformProjectRoot);
      if (!mainApplicationPath) {
        throw new Error("MainApplication.kt was not found after Android prebuild.");
      }
      patchMainApplication(mainApplicationPath);

      return config;
    },
  ]);
}

module.exports = createRunOncePlugin(
  withBizoCustomNotifications,
  PLUGIN_NAME,
  "1.0.0"
);
