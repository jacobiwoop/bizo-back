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
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.
- Verification: `php artisan test` passed.
