# Publication/Search UI Follow-up

- [x] Remove mock listing fallbacks from Home and Search.
- [x] Show skeleton UI while Home and Search results load.
- [x] Add pulse animation to skeleton blocks.
- [x] Route Home category buttons to Search with the matching category filter.
- [x] Run mobile typecheck.

# All Categories Screen

- [x] Replace legacy mock category screen with real listing categories.
- [x] Connect every category to Search with its backend category ID.
- [x] Run mobile typecheck after category screen correction.

# Keyboard Controller Rebuild

- [x] Install `react-native-keyboard-controller`.
- [x] Run mobile typecheck before push.
- [x] Push current mobile state to trigger Android debug and production builds.
- [x] Integrate keyboard-aware containers while CI builds.
- [x] Run mobile typecheck after keyboard integration.

# Messaging V1

- [x] Add mobile API helpers for conversations and messages.
- [x] Connect the inbox screen to real conversations.
- [x] Connect the chat thread to real messages and text sending.
- [x] Remove the Messages tab `useRouter` hook that crashes without a navigation context in the dev client.
- [x] Replace the inbox NativeWind styles with native `StyleSheet` styles to avoid the dev-only css-interop navigation context crash.
- [x] Run mobile typecheck.

# Profile Settings Sheet

- [x] Keep the profile settings modal above the bottom tab navigation.
- [x] Run mobile typecheck after the modal positioning fix.

# Sign-in Keyboard Stability

- [x] Remove the double keyboard movement on the sign-in screen.
- [x] Run mobile typecheck after the sign-in keyboard fix.

# Messaging Inbox Modes

- [x] Expose the listing owner in conversation API responses.
- [x] Expose the current user's conversation role in conversation API responses.
- [x] Add the `Je vends` / `J'achete` switch under the inbox search field.
- [x] Filter inbox conversations by current user role.
- [x] Set `J'achete` as the default inbox mode.
- [x] Run backend and mobile verification.

# Realtime Messaging

- [x] Install realtime client dependencies.
- [x] Install the React Native NetInfo dependency required by `pusher-js/react-native`.
- [x] Add Echo/Reverb client configuration for the mobile app.
- [x] Subscribe the inbox to conversation summary updates.
- [x] Subscribe conversation threads to new messages.
- [x] Stabilize chat states, read marking, and send feedback.
- [x] Run mobile and backend verification.

# Messaging Realtime + Keyboard Correction

- [x] Replace the React Native Echo wrapper with a direct Pusher/Reverb client.
- [x] Add subscription and connection logs for inbox/thread realtime.
- [x] Keep the chat input and message list visible when the keyboard opens.
- [x] Run mobile typecheck.
- [x] Record the result in this file and capture the lesson from the correction.

## Review

- Removed Home/Search mock listing data and fallback remote images.
- Added pulsing skeleton loaders on Home and Search while API data loads.
- Connected Home category buttons to Search with the category filter active.
- Replaced the all-categories page with the real category tree used by publication/search.
- Installed `react-native-keyboard-controller` for the next keyboard visibility pass.
- Added app-wide `KeyboardProvider`, keyboard-aware publication/auth/filter forms, and sticky chat input.
- Connected Messaging V1 to the existing backend conversations and text messages APIs.
- Raised the profile settings sheet above the bottom tab navigation using the device safe-area inset.
- Removed the nested keyboard translation from the sign-in screen so only the keyboard-aware scroll handles focused inputs.
- Added inbox modes so conversations can be filtered between listings the user sells and listings the user contacted.
- Made `J'achete` the default inbox mode and added backend role metadata for reliable filtering.
- Added Reverb/Echo realtime subscriptions for inbox summaries and conversation messages.
- Added optimistic text sending, send failure feedback, and mutation-based read marking in chat threads.
- Replaced the mobile Echo wrapper with direct Pusher/Reverb subscriptions to avoid React Native constructor interop failures.
- Changed the chat thread keyboard handling so the whole conversation screen avoids the keyboard, not only the input bar.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.
- Verification: `php artisan test` passed.

# Realtime Manual Test

- [x] Login as the second test account through the API.
- [x] Find the conversation shared with the active tester account.
- [x] Send one message through the backend API.
- [x] Watch app/realtime logs for delivery.
- [x] Fix the React Native Pusher constructor resolver after logs showed the subscription was skipped.
- [x] Fix the React Native Pusher `cluster` option redbox shown on the phone.
- [x] Reload the dev client and re-test delivery on the corrected bundle.

# Chat Keyboard Visibility

- [x] Replace the thread message ScrollView with a keyboard-aware chat scroll container.
- [x] Preserve auto-scroll behavior when new messages arrive.
- [x] Keep the composer visible while typing.
- [x] Run mobile typecheck.

# Messages Inbox Template Redesign

- [x] Redesign the conversation list from `msgconv.html`, not the direct thread.
- [x] Keep the bottom navbar untouched.
- [x] Add top back button.
- [x] Use filters in order: Tous, J'achete, Je vends.
- [x] Replace type badges with right-side listing title badges.
- [x] Use neutral grey badge color when backend does not provide a real conversation type.
- [x] Run mobile typecheck.

# Messages Navbar Unread Badge

- [x] Read the global conversations query in the custom tabbar.
- [x] Sum `unread_count` across conversations.
- [x] Show a numbered badge on the Messages tab only when unread total is greater than zero.
- [x] Subscribe the tabbar to conversation summary realtime updates.
- [x] Run mobile typecheck.

# Messages Inbox Filter Unread Badges

- [x] Compute unread totals for `Tous`, `J'achete`, and `Je vends`.
- [x] Use the same buyer/seller role resolution for filtering and badge totals.
- [x] Show a badge on a filter only when its unread total is greater than zero.
- [x] Run mobile typecheck.

# Message Push Notification Image

- [x] Add optional image support to FCM notifications.
- [x] Pass the conversation listing photo when dispatching message push notifications.
- [x] Run notification and messaging backend tests.

# Message Avatar Fallbacks

- [x] Use the listing photo first for message notification images.
- [x] Fall back to the sender profile photo when the listing has no photo.
- [x] Show user initials when a chat participant has no profile photo.
- [x] Add a profile image to the Jacobi test account on production.
- [x] Run backend notification tests and mobile typecheck.

# Message Push Image Role Rule

- [x] Document the native limitation: Android keeps the app icon as the small left notification icon; FCM image is shown as rich/large notification media.
- [x] Send the sender profile photo when the listing seller receives a buyer message.
- [x] Send the listing photo when the buyer receives a seller reply, with sender profile fallback.
- [x] Update backend tests around the role-aware image rule.
- [x] Run backend notification and messaging tests.
- [x] Run mobile typecheck for the chat initials fallback changes.

## Review

- Centralized message notification image selection on the `Conversation` model.
- Seller recipients now receive the sender profile image first, then listing fallback.
- Buyer recipients now receive the listing image first, then sender profile fallback.
- Kept Android notification rendering unchanged: the app icon remains the small left icon unless we add a native notification renderer later.
- Verification: `php artisan test tests/Feature/SocialTest.php tests/Feature/NotificationsTest.php` passed.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Native Messaging Notifications

- [x] Install native notification renderer dependencies: Notifee and React Native Firebase Messaging.
- [x] Configure Expo native plugins for Firebase Android builds.
- [x] Register Firebase Messaging foreground/background handlers at app entry.
- [x] Render message pushes locally with Notifee `MESSAGING` style and remote avatar icon.
- [x] Change backend message pushes to data-only for rich local rendering and avoid duplicate system notifications.
- [x] Keep non-message pushes on the existing Expo/FCM path.
- [x] Run backend tests and mobile typecheck.
- [x] Push to trigger debug and production Android builds.
- [x] Fix Firebase Messaging Android manifest color conflict in CI after Expo prebuild.
- [x] Verify debug and production Android workflows complete successfully.

## Review

- Added Notifee and React Native Firebase Messaging dependencies.
- Switched the mobile entrypoint to `index.js` so the background FCM handler is registered before Expo Router.
- Added a native message notification renderer using Notifee `AndroidStyle.MESSAGING` and `person.icon`.
- Switched Android push token registration to Firebase Messaging token retrieval.
- Message push jobs now use FCM data-only payloads so Notifee owns the visible notification and avoids duplicate system notifications.
- Non-message push notifications still use the existing FCM notification payload path.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.
- Verification: `npx expo config --json` resolved the Firebase config plugins.
- Verification: `php artisan test tests/Feature/SocialTest.php tests/Feature/NotificationsTest.php` passed.
- Deployment: pushed commit `6c6cc82` and deployed the backend container on the server.
- CI verification: debug workflow run `27095520568` passed in 25m42s.
- CI verification: production workflow run `27095520561` passed.

# Notification Anatomy Preview

- [x] Locate the Home notification route and existing notification screen structure.
- [x] Add a visual notification anatomy block showing app logo, conversation avatar, text, and optional rich media roles.
- [x] Run mobile typecheck.
- [x] Record the review result.

## Review

- Added a notification anatomy preview at the top of `/notification`.
- The preview separates the app logo, conversation avatar, sender name, message body, and disabled rich image/`largeIcon` slot.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Claude Notification Spec Alignment

- [x] Read `claude-info.md` notification layout spec.
- [x] Align the `/notification` preview with the compact individual message state.
- [x] Keep the preview clean, without inline annotation labels inside the mock notification.
- [x] Run mobile typecheck.
- [x] Record the review result.

## Review

- Updated the `/notification` preview to match Claude's compact individual message spec.
- The mock notification now uses a 52x52 rounded-square avatar, sender/timestamp row, one-line message preview, and a right chevron button.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Real Native Notification Compact Pass

- [x] Map Claude compact spec to real Notifee/Android-supported fields.
- [x] Keep app logo as the small notification icon.
- [x] Keep sender photo only as `AndroidPerson.icon` for the conversation avatar.
- [x] Add native timestamp display and consistent message timestamp.
- [x] Run mobile typecheck.
- [x] Record native limitations and verification.

## Review

- Updated the real Notifee message renderer with `timestamp` and `showTimestamp` so Android can show message recency natively.
- Set `smallIcon` to the existing `notification_icon` resource used by the Android manifest.
- Kept sender photos only on `AndroidPerson.icon`; no `largeIcon`, so the sender/listing image should not replace the primary notification identity.
- Native limitation: Notifee/Android `MESSAGING` style does not expose full custom layout control for radius, exact padding, custom chevron placement, or arbitrary React Native notification UI.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Notification Preview Expand Action

- [x] Make the preview chevron interactive.
- [x] Add compact and expanded preview states.
- [x] Run mobile typecheck.
- [x] Record the review result.

## Review

- The `/notification` preview chevron now toggles between compact and expanded states.
- Expanded state shows a divider and two additional message rows using rounded-square avatars.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Notification Preview Grouped Model

- [x] Change individual expanded preview to reveal the full message text only.
- [x] Add a separate grouped notification preview block.
- [x] Run mobile typecheck.
- [x] Record the review result.

## Review

- The individual preview chevron now expands only the current message text.
- Added a separate grouped compact preview block inspired by the provided screenshot.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Grouped Notification Expanded Preview

- [x] Make grouped notification chevron interactive.
- [x] Add expanded grouped layout with detailed conversation rows.
- [x] Run mobile typecheck.
- [x] Record the review result.

## Review

- The grouped notification preview now expands/collapses from its header chevron.
- Expanded grouped state shows larger conversation rows with avatar, sender, time, message preview, and per-row chevrons.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.

# Android Notification Lab

- [x] Create a standalone Android notification lab app outside Bizo mobile runtime.
- [x] Provide local Bizo logo and sample image/vector assets for notification rendering tests.
- [x] Add ADB-triggerable compact, expanded, and grouped notification examples.
- [x] Add a GitHub Actions workflow to build and upload the lab APK.
- [x] Validate Gradle project configuration.
- [x] Record review result.

## Review

- Added `notification-lab`, a standalone Android app with package `io.bizo.notificationlab`.
- Added local Bizo logo, notification icon, avatar placeholders, and listing thumbnail drawables for offline rendering tests.
- Added native `RemoteViews` layouts for compact message, expanded message, and grouped notification prototypes.
- Added ADB broadcast triggers: `SHOW_MESSAGE`, `SHOW_GROUP`, `SHOW_ALL`, and `CLEAR`.
- Added GitHub Actions workflow `Android Notification Lab` to build and upload the debug APK artifact.
- Verification: all notification lab XML resources passed `xmllint --noout`.
- Verification: `.github/workflows/notification-lab-android.yml` parsed as valid YAML.
- First GitHub compile reached `:app:checkDebugAarMetadata` and exposed the missing AndroidX flag.
- Added `notification-lab/gradle.properties` with `android.useAndroidX=true`.
- Local Gradle compile was attempted, but the Gradle distribution download timed out locally; GitHub Actions performed the full APK build.
- CI verification: `Android Notification Lab` run `27101222843` completed successfully on commit `0c219cc`.
- CI artifact: `bizo-notification-lab-debug-apk`, size `2192587` bytes.

# Android Notification Lab Compact Refinement

- [x] Document the Android system-frame limitation and the target inner-content approach.
- [x] Remove the duplicate in-layout chevron from compact/expanded message custom views.
- [x] Replace the vector avatar with a centered initials text avatar in custom RemoteViews.
- [x] Reduce compact custom-view margins and make the small notification icon visually quieter.
- [x] Add an ADB/app-triggerable `MessagingStyle` comparison notification.
- [x] Use a bitmap-backed `Person.icon` for the `MessagingStyle` avatar and avoid `setLargeIcon()`.
- [x] Validate XML/YAML and run the GitHub Actions build.
- [x] Record review result.

## Review

- Updated compact/expanded custom `RemoteViews` so the avatar is centered initials text instead of a cropped vector image.
- Removed the duplicated internal chevron from the individual custom notification; Android keeps its own expansion affordance.
- Made the notification small icon visually quieter by reducing the actual mark inside its vector canvas.
- Added `SHOW_MESSAGING_STYLE`, a separate Android `MessagingStyle` comparison path.
- The `MessagingStyle` sender avatar now follows the WhatsApp-style path: generated bitmap avatar, `IconCompat.createWithBitmap(bitmap)`, then `Person.Builder().setIcon(...)`; no `setLargeIcon()` is used.
- Verification: notification-lab XML resources passed `xmllint --noout`.
- Verification: GitHub workflow YAML parsed successfully.
- CI verification: `Android Notification Lab` run `27103408705` completed successfully on commit `98fdd09`.

# Android Notification Lab Conversation Shortcut

- [x] Confirm via screenshot and `dumpsys notification` that the current `MessagingStyle` notification is posted as `id=4203` with `android.largeIcon=null`.
- [x] Identify that Xiaomi/Android still shows only the app small icon in compact view without a registered conversation shortcut.
- [x] Register a long-lived dynamic shortcut for `jacobi` using the same bitmap-backed `Person.icon`.
- [x] Attach `setShortcutId("bizo-lab-jacobi")` and `addPerson(jacobi)` to the `MessagingStyle` notification.
- [x] Validate and rebuild the notification lab.
- [x] Re-test with explicit ADB broadcast and screenshot.

## Review

- CI verification: `Android Notification Lab` run `27103913398` completed successfully on commit `1bbca34`.
- Installed `/tmp/bizo-notification-lab-27103913398/app-debug.apk` after uninstalling the old debug-signed lab APK.
- Verified `dumpsys shortcut io.bizo.notificationlab` contains dynamic long-lived shortcut `bizo-lab-jacobi` with a stored bitmap icon.
- Verified `dumpsys notification` shows `id=4203`, `android.template=Notification$MessagingStyle`, `shortcut=bizo-lab-jacobi`, `android.people.list`, and `android.largeIcon=null`.
- Screenshot verification: `/tmp/bizo-notification-messagingstyle-shortcut.png` shows the large `JW` conversation avatar on the left with the small app icon as a badge overlay.
