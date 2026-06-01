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
- [ ] Push current mobile state to trigger Android debug and production builds.
- [ ] Integrate keyboard-aware containers while CI builds.

## Review

- Removed Home/Search mock listing data and fallback remote images.
- Added pulsing skeleton loaders on Home and Search while API data loads.
- Connected Home category buttons to Search with the category filter active.
- Replaced the all-categories page with the real category tree used by publication/search.
- Installed `react-native-keyboard-controller` for the next keyboard visibility pass.
- Verification: `npm run typecheck` passed in `bizo-mobile-rn`.
