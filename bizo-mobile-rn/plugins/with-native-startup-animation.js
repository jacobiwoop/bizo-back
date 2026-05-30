const fs = require("fs");
const path = require("path");
const {
  createRunOncePlugin,
  withAppBuildGradle,
  withDangerousMod,
} = require("@expo/config-plugins");

const PLUGIN_NAME = "with-native-startup-animation";
const LOTTIE_DEPENDENCY = 'implementation("com.airbnb.android:lottie:6.7.1")';
const RAW_ANIMATION_NAME = "bizo_logo_intro_vector.json";

function findFile(dir, fileName) {
  if (!fs.existsSync(dir)) {
    return null;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isFile() && entry.name === fileName) {
      return entryPath;
    }

    if (entry.isDirectory()) {
      const found = findFile(entryPath, fileName);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function injectLottieDependency(contents) {
  if (contents.includes(LOTTIE_DEPENDENCY)) {
    return contents;
  }

  return contents.replace(
    'implementation("com.facebook.react:react-android")',
    `implementation("com.facebook.react:react-android")\n    ${LOTTIE_DEPENDENCY}`
  );
}

function injectMainActivityStartupAnimation(contents) {
  let next = contents;

  const imports = [
    "import android.animation.Animator",
    "import android.view.Gravity",
    "import android.view.View",
    "import android.view.ViewGroup",
    "import android.widget.FrameLayout",
    "import com.airbnb.lottie.LottieAnimationView",
  ];

  for (const importLine of imports) {
    if (!next.includes(importLine)) {
      next = next.replace(/(package .+\n)/, `$1\n${importLine}\n`);
    }
  }

  if (!next.includes("showNativeStartupAnimation()")) {
    next = next.replace("super.onCreate(null)", "super.onCreate(null)\n    showNativeStartupAnimation()");
  }

  if (next.includes("private fun showNativeStartupAnimation()")) {
    return next;
  }

  const methods = `
  private fun showNativeStartupAnimation() {
    val overlay = FrameLayout(this).apply {
      setBackgroundColor(0xFFFFFFFF.toInt())
      isClickable = true
      isFocusable = true
    }

    val animationView = LottieAnimationView(this).apply {
      setAnimation(R.raw.bizo_logo_intro_vector)
      repeatCount = 0
      playAnimation()
    }

    val animationSize = (260 * resources.displayMetrics.density).toInt()
    val animationLayoutParams = FrameLayout.LayoutParams(animationSize, animationSize).apply {
      gravity = Gravity.CENTER
    }

    overlay.addView(animationView, animationLayoutParams)

    addContentView(
      overlay,
      ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )

    animationView.addAnimatorListener(object : Animator.AnimatorListener {
      override fun onAnimationStart(animation: Animator) = Unit
      override fun onAnimationRepeat(animation: Animator) = Unit
      override fun onAnimationCancel(animation: Animator) {
        removeStartupOverlay(overlay)
      }

      override fun onAnimationEnd(animation: Animator) {
        removeStartupOverlay(overlay)
      }
    })
  }

  private fun removeStartupOverlay(overlay: View) {
    overlay.animate()
      .alpha(0f)
      .setDuration(180)
      .withEndAction {
        (overlay.parent as? ViewGroup)?.removeView(overlay)
      }
      .start()
  }

`;

  return next.replace("  /**\n   * Returns the name", `${methods}  /**\n   * Returns the name`);
}

function withNativeStartupAnimation(config) {
  config = withAppBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents = injectLottieDependency(modConfig.modResults.contents);
    return modConfig;
  });

  return withDangerousMod(config, [
    "android",
    (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const androidRoot = modConfig.modRequest.platformProjectRoot;
      const sourceAnimation = path.join(projectRoot, "assets", "animations", "bizo-logo-intro-vector.json");
      const rawDir = path.join(androidRoot, "app", "src", "main", "res", "raw");
      const destinationAnimation = path.join(rawDir, RAW_ANIMATION_NAME);
      const mainActivityPath = findFile(path.join(androidRoot, "app", "src", "main", "java"), "MainActivity.kt");

      if (!mainActivityPath) {
        throw new Error(`${PLUGIN_NAME}: MainActivity.kt introuvable`);
      }

      fs.mkdirSync(rawDir, { recursive: true });
      fs.copyFileSync(sourceAnimation, destinationAnimation);

      const mainActivity = fs.readFileSync(mainActivityPath, "utf8");
      fs.writeFileSync(mainActivityPath, injectMainActivityStartupAnimation(mainActivity));

      return modConfig;
    },
  ]);
}

module.exports = createRunOncePlugin(withNativeStartupAnimation, PLUGIN_NAME, "1.0.0");
