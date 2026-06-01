# Lessons

- When category behavior changes, check both the Home category rail and the `/category` all-categories screen. They must use `listingCategories` IDs, not legacy mock labels.
- Bottom sheets inside tab screens must reserve space for the bottom tab bar plus safe-area inset. A high z-index alone does not prevent the native/tab navigation from visually covering the sheet.
- In Expo Router tab screens, prefer the `router` singleton for simple push callbacks passed to children. A route-level `useRouter()` hook can surface "Couldn't find a navigation context" in the dev client when the tab screen is rendered during navigation.
- If NativeWind/css-interop throws a navigation context error while printing an upgrade warning, remove `className` from that small screen/component and use `StyleSheet`. The warning serializer can touch Expo Router internals through React element props in development.
- Do not nest `KeyboardAvoidingView` around `KeyboardAwareScrollView` on auth forms. Use one keyboard movement strategy per screen, otherwise the form jumps up and then repositions when the keyboard opens or closes.
