# Lessons

- When category behavior changes, check both the Home category rail and the `/category` all-categories screen. They must use `listingCategories` IDs, not legacy mock labels.
- Bottom sheets inside tab screens must reserve space for the bottom tab bar plus safe-area inset. A high z-index alone does not prevent the native/tab navigation from visually covering the sheet.
- In Expo Router tab screens, prefer the `router` singleton for simple push callbacks passed to children. A route-level `useRouter()` hook can surface "Couldn't find a navigation context" in the dev client when the tab screen is rendered during navigation.
- If NativeWind/css-interop throws a navigation context error while printing an upgrade warning, remove `className` from that small screen/component and use `StyleSheet`. The warning serializer can touch Expo Router internals through React element props in development.
- Do not nest `KeyboardAvoidingView` around `KeyboardAwareScrollView` on auth forms. Use one keyboard movement strategy per screen, otherwise the form jumps up and then repositions when the keyboard opens or closes.
- On chat screens, a keyboard-sticky input is not enough by itself. The message list and input must share a keyboard-avoiding parent so the conversation remains visible while typing.
- In React Native, `pusher-js/react-native` may expose its constructor as `Pusher` on the imported module instead of as the module/default value. Resolve named exports before declaring realtime unavailable.
- `pusher-js/react-native` still requires a `cluster` option even when Reverb uses explicit `wsHost`/`wssPort`. Without it, the inbox crashes with "Options object must provide a cluster".
- For the Messages inbox redesign, keep three filters in this order: `Tous`, `J'achete`, `Je vends`. Keep the top back button, and use listing-title badges on the right while preserving the template badge color language.
- In the Messages inbox, use the other user's profile photo first, then the listing photo, then the initial fallback.
- The Messages tab badge must read the shared `["conversations"]` query and subscribe to the user conversations channel in the custom tabbar, otherwise unread counts update only inside the inbox screen.
- The Messages inbox filters each need their own unread badge: `Tous` sums all conversations, `J'achete` sums buyer conversations, and `Je vends` sums seller conversations using the same role-resolution logic as filtering.
- Do not run Laravel queue workers in the app container with `--max-time` as a one-shot background process. Wrap it in a restart loop or use a real supervisor, otherwise push jobs stop after one hour and notifications stay queued.
- For message push images, choose the image from the recipient's point of view: sellers receiving buyer messages should see the sender profile image, while buyers receiving seller replies should see the listing image with sender profile fallback.
- FCM `notification.image` is rich notification media/large image on Android; it does not replace the small left app icon. A true conversation-style left avatar requires a native notification renderer.
- For WhatsApp-style message notifications on Android, use data-only FCM plus Notifee `AndroidStyle.MESSAGING`; sending an FCM `notification` block at the same time risks duplicate notifications and prevents full control of the row avatar.
- If an Expo config plugin cannot reliably add AndroidManifest `tools:replace` after native library manifests are merged, patch the generated manifest in the CI workflow immediately after `expo prebuild` and before Gradle.
- Do not set Notifee `largeIcon` or `AndroidPerson.icon` for Bizo message notifications unless the product explicitly wants the sender photo to replace the compact notification icon. Keep the app logo as the primary notification identity.
