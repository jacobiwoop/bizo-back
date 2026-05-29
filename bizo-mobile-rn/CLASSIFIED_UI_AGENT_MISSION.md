# Bizo UI Agent Mission

## Objective

Implement the new Bizo mobile UI in `bizo-mobile-rn` by reproducing the active `design/bizo` references progressively.

For now:

- focus on screens, layout, components, navigation flow, and visual fidelity
- use mocked data freely where needed
- do **not** block on backend integration
- do **not** reintroduce Kotlin work

The backend will be connected later.

## Project context

- Repo root: `/home/aiko/Documents/bizo-back`
- React Native app: `/home/aiko/Documents/bizo-back/bizo-mobile-rn`
- Main design reference: `/home/aiko/Documents/bizo-back/bizo-mobile-rn/design/bizo`
- Legacy reference only: `/home/aiko/Documents/bizo-back/design-reference/classified-ai` is not the current UI source unless explicitly requested
- Stack is already bootstrapped with Expo / React Native / TypeScript

Important local environment:

- use `nvm`
- required Node version: `v20.19.6`
- launch instructions are documented in:
  - `bizo-mobile-rn/ENVIRONMENT_AND_LAUNCH.md`

## Current status

The Expo dev baseline is working again.

Already fixed:

- Metro bundling works
- Babel / NativeWind config is fixed
- Expo dependency mismatch on `@shopify/flash-list` is fixed
- TypeScript baseline is clean

Known non-blocking issue:

- Expo Router warning about `(auth)` route nesting still needs cleanup

## Immediate mission

Your mission is to implement the UI progressively from `design/bizo` with mocked content.

Priority order:

1. onboarding and auth: `bizo_onboarding_*`, `bizo_login_screen`, `bizo_registration_*`
2. discovery: `marketplace_home_redesign`, `bizo_home_screen_marketplace_redesign`, `search_results_iphone_13`, `filter_bottom_sheet_modal`
3. listing detail: `detail-product`, `product_detail_page`, `detailed_product_listing`, `fullscreen_photo_viewer`
4. posting flow: `post_ad_step_*`
5. chat: `messaging_inbox`, `product_chat_*`, `direct_contact_chat_no_listing`
6. profile and seller: `private_user_profile`, `private_profile_*`, `public_seller_profile*`

## Screen source of truth

Use only the offline design bundle already extracted locally.

Primary source:

- `bizo-mobile-rn/design/bizo`

Useful structure:

- each screen folder usually contains `screen.png`
- many screen folders also contain `code.html`
- use the folder names listed in the priority order above to locate the matching screen

Do not invent random layouts if the matching screen already exists in `design/bizo`.

## Working rules

1. Keep the work inside `bizo-mobile-rn`
2. Do not modify the old Kotlin app as part of this mission
3. Do not block on API integration
4. Use mocked data where necessary
5. Preserve the current stack already installed
6. Do not add new native dependencies unless truly necessary
7. Prefer reusable components over one-off screen markup
8. Preserve the design direction from `design/bizo`
9. Keep code readable and strongly typed
10. Avoid changing infrastructure unless the UI task really requires it

## Mocking policy

For now, mocked data is acceptable and expected.

Examples:

- listing cards
- categories
- favorites
- chat previews
- conversation messages
- seller profile details
- onboarding slides
- posting success state

Mocking is allowed if:

- it helps unblock UI implementation
- it keeps the intended UX visible
- it does not distort the future backend contract too much

Try to centralize mocks in a clear place instead of scattering them randomly.

## Expected implementation style

Use a component-first approach.

Recommended pattern:

- screen-specific file under `src/features/...`
- shared UI primitives under `src/components/ui/...`
- mocked feature data near the feature or in a small shared mock layer

Examples of reusable pieces to build:

- top headers
- search bars
- chips
- category icon tiles
- listing cards
- seller badges
- bottom action bars
- section titles
- empty states
- auth form shells
- posting step blocks
- chat bubbles

## What to avoid

Do not:

- connect every screen to live backend now
- over-engineer state management for mock-only screens
- add unnecessary libraries
- rewrite working infrastructure just for style preferences
- use random colors or layouts that drift away from `design/bizo`
- leave screens half-finished without a clear visual state

## Navigation expectations

Even with mocked data, screens should be navigable enough to review UX.

At minimum:

- onboarding -> sign in
- sign in -> forgot password
- sign in -> create new password if needed in flow
- home -> listing detail
- home -> publish
- home -> favorites / profile / messages through tabs
- messages -> conversation
- posting screens should be reachable and reviewable

It is acceptable to use temporary buttons and placeholder transitions if the final route logic is not finished yet.

## Verification routine

For each meaningful change:

1. make the UI change
2. run typecheck
3. run the Expo dev server
4. inspect the screen in the dev client
5. fix layout/runtime warnings if they are directly related

Minimum commands:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
npm run typecheck
```

If device connection is needed:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
```

## Quality bar

Each delivered screen should be:

- visually close to the reference
- internally consistent
- not obviously broken on mobile sizing
- navigable enough for review
- free of avoidable TypeScript errors

Prefer:

- spacing discipline
- hierarchy clarity
- reusable styling
- bold but controlled UI

## Deliverable rhythm

Work progressively in reviewable chunks.

Good chunk examples:

- onboarding + sign in
- forgot password + create new password
- home header + category block + card grid
- favorites screen
- listing detail hero + info blocks
- posting flow step 1 and step 2
- chat list + conversation shell

## Reporting format

When finishing a chunk, report:

1. what screens/components were implemented
2. what is mocked
3. what remains incomplete
4. whether `npm run typecheck` passes
5. whether the screen is ready for manual Expo dev client review

## Manual run responsibility

The agent should not start Expo / Metro by itself for this mission.

That means:

- do not run `npx expo start --dev-client --clear`
- do not take ownership of device-side runtime checks
- leave final runtime review to the human operator

The agent is responsible for:

- implementing the UI
- keeping TypeScript clean
- leaving the app in a state ready for manual review

## Final reminder

This phase is **UI-first**.

It is acceptable if:

- buttons are temporary
- content is mocked
- some routes are placeholders

It is **not** acceptable if:

- the screen drifts far from `design/bizo`
- the app stops bundling
- the code ignores the Node/Expo environment rules
