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
    "import android.animation.ValueAnimator",
    "import android.os.Handler",
    "import android.os.Looper",
    "import android.view.Gravity",
    "import android.view.View",
    "import android.view.ViewGroup",
    "import android.widget.FrameLayout",
    "import android.widget.LinearLayout",
    "import com.airbnb.lottie.LottieAnimationView",
    "import com.facebook.react.ReactInstanceEventListener",
    "import com.facebook.react.bridge.ReactContext",
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
    val mainHandler = Handler(Looper.getMainLooper())
    val overlay = FrameLayout(this).apply {
      setBackgroundColor(0xFFFFFFFF.toInt())
      isClickable = true
      isFocusable = true
    }

    val content = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
    }

    val animationView = LottieAnimationView(this).apply {
      setAnimation(R.raw.bizo_logo_intro_vector)
      repeatCount = 0
      playAnimation()
    }

    val animationSize = (260 * resources.displayMetrics.density).toInt()
    content.addView(
      animationView,
      LinearLayout.LayoutParams(animationSize, animationSize)
    )

    val dotRow = LinearLayout(this).apply {
      orientation = LinearLayout.HORIZONTAL
      gravity = Gravity.CENTER
      alpha = 0f
    }

    val dotSize = (12 * resources.displayMetrics.density).toInt()
    val dotGap = (6 * resources.displayMetrics.density).toInt()
    val dotViews = (0 until 3).map {
      View(this).apply {
        background = android.graphics.drawable.GradientDrawable().apply {
          shape = android.graphics.drawable.GradientDrawable.OVAL
          setColor(0xFFF5C518.toInt())
        }
        alpha = 0.25f
      }
    }

    dotViews.forEachIndexed { index, dot ->
      val params = LinearLayout.LayoutParams(dotSize, dotSize).apply {
        leftMargin = dotGap
        rightMargin = dotGap
        topMargin = (32 * resources.displayMetrics.density).toInt()
      }
      dotRow.addView(dot, params)

      ValueAnimator.ofFloat(0.25f, 1f, 0.25f).apply {
        duration = 1080
        startDelay = (index * 120).toLong()
        repeatCount = ValueAnimator.INFINITE
        addUpdateListener { animator ->
          dot.alpha = animator.animatedValue as Float
          val progress = animator.animatedFraction
          dot.translationY = if (progress < 0.5f) {
            -4 * resources.displayMetrics.density * (progress / 0.5f)
          } else {
            -4 * resources.displayMetrics.density * ((1f - progress) / 0.5f)
          }
        }
        start()
      }
    }

    content.addView(
      dotRow,
      LinearLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      )
    )

    overlay.addView(
      content,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT
      ).apply {
        gravity = Gravity.CENTER
      }
    )

    addContentView(
      overlay,
      ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )

    var animationFinished = false
    var reactReady = reactNativeHost.reactInstanceManager.currentReactContext != null

    fun maybeRemoveOverlay() {
      if (animationFinished && reactReady) {
        mainHandler.postDelayed({ removeStartupOverlay(overlay) }, 350)
      }
    }

    reactNativeHost.reactInstanceManager.addReactInstanceEventListener(object : ReactInstanceEventListener {
      override fun onReactContextInitialized(context: ReactContext) {
        reactReady = true
        reactNativeHost.reactInstanceManager.removeReactInstanceEventListener(this)
        maybeRemoveOverlay()
      }
    })

    mainHandler.postDelayed({ removeStartupOverlay(overlay) }, 180000)

    animationView.addAnimatorListener(object : Animator.AnimatorListener {
      override fun onAnimationStart(animation: Animator) = Unit
      override fun onAnimationRepeat(animation: Animator) = Unit
      override fun onAnimationCancel(animation: Animator) {
        animationFinished = true
        dotRow.animate().alpha(1f).setDuration(180).start()
        maybeRemoveOverlay()
      }

      override fun onAnimationEnd(animation: Animator) {
        animationFinished = true
        dotRow.animate().alpha(1f).setDuration(180).start()
        maybeRemoveOverlay()
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
