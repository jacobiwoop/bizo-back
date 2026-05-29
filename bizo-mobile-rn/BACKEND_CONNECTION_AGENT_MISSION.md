# Backend Connection Agent Mission

## Objective

Connect the existing `bizo-mobile-rn` screens to the Laravel backend progressively.

This phase is no longer UI-only. Replace mocked data with real API data step by step while preserving the current screens, navigation, and visual direction as much as possible.

UI changes are allowed when backend integration makes them necessary, but they must be explicit: report what changed, why it was needed, and whether it is a temporary integration adjustment or a real product improvement.

Do not reconnect everything at once.

## Project Context

- Repo root: `/home/aiko/Documents/bizo-back`
- React Native app: `/home/aiko/Documents/bizo-back/bizo-mobile-rn`
- Backend base URL: `https://bizo.aiko.qzz.io/api/v1`
- API client: `bizo-mobile-rn/src/lib/api/client.ts`
- Session store: `bizo-mobile-rn/src/store/session.ts`
- Main backend contract: `MOBILE_INTEGRATION.md`
- Active design reference: `bizo-mobile-rn/design/bizo`
- Legacy reference only: `design-reference/classified-ai` is not the current UI source unless explicitly requested
- Local run instructions: `bizo-mobile-rn/ENVIRONMENT_AND_LAUNCH.md`
- Server/deploy guide: `bizo-mobile-rn/SERVER_OPERATIONS_AGENT_GUIDE.md`
- UI implementation mission: `bizo-mobile-rn/CLASSIFIED_UI_AGENT_MISSION.md`

Required local environment:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
```

Do not use Node 22 for Expo local development.

## Important Rule

The human operator will launch Expo / Metro manually.

Do not run:

```bash
npx expo start --dev-client --clear
```

Your required validation is:

```bash
npm run typecheck
```

## Current App State

The app already has UI screens and mocked data for:

- auth
- onboarding
- discovery / home / search / category / popular items
- listing detail
- publish flow
- favorites
- messages / chat
- seller profile
- profile

Main mock files:

- `src/features/auth/mocks/auth-mocks.ts`
- `src/features/discovery/mocks/discovery-mocks.ts`
- `src/features/detail/mocks/detail-mocks.ts`

The goal is to replace these mocks gradually with typed API services and React Query hooks.

## UI Change Policy

Keep the visual intent from `bizo-mobile-rn/design/bizo`.

Allowed UI changes during backend connection:

- loading, empty, offline, forbidden, and not-found states
- validation messages from backend `422` responses
- disabled/submitting states for forms and action buttons
- replacing mock-only copy with real backend data
- small layout adjustments for real data length, missing images, missing avatars, or optional fields
- auth-required states for protected actions like favorites, publish, profile, and messages

For any larger UI change, warn in the report before treating it as final. Do not silently redesign a screen while connecting an endpoint.

## Backend Contracts To Respect

Use `MOBILE_INTEGRATION.md` as source of truth.

Global rules:

- protected routes require `Authorization: Bearer <token>`
- current Axios client already injects token from `useSessionStore`
- handle `401` by clearing session
- handle `422` validation errors cleanly
- media URLs can be relative `/storage/...` or absolute `https://...`
- resolve relative media URLs against `https://bizo.aiko.qzz.io`
- paginated lists can return Laravel format: `data`, `links`, `meta`
- creation/update responses can return either direct objects or `{ data: ... }` depending on endpoint, so inspect docs and code before assuming

## Recommended Architecture

Add a small API layer under:

```txt
src/lib/api/
```

Suggested files:

- `types.ts`
- `errors.ts`
- `media.ts`
- `auth.ts`
- `listings.ts`
- `favorites.ts`
- `profile.ts`
- `conversations.ts`

Add feature hooks near features or under:

```txt
src/features/<feature>/api/
```

Use React Query for server state:

- `useQuery` for reads
- `useMutation` for writes
- invalidate related queries after mutations

Do not put API calls directly inside presentational UI components.

## Connection Order

### 1. Auth And Session First

Connect:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `POST /auth/password/reset`
- `POST /auth/password/update`
- `GET /profile`
- optional later: `POST /auth/fcm-token`

Files likely involved:

- `src/features/auth/screens/sign-in-screen.tsx`
- `src/features/auth/screens/sign-up-screen.tsx`
- `src/features/auth/screens/forgot-password-screen.tsx`
- `src/features/auth/screens/create-new-password-screen.tsx`
- `src/store/session.ts`
- `src/lib/api/client.ts`

Expected behavior:

- login stores `token`
- login stores current `user`
- app can read `GET /profile`
- logout clears token and user
- password reset shows backend message
- auth errors are shown in UI, not only logged

Session store currently only stores `token`; extend it to also keep `user` if needed.

### 2. Listings Feed, Search, Detail

Connect:

- `GET /listings`
- `GET /search`
- `GET /listings/{id}`
- `GET /listings/{id}/similar` later if useful

Files likely involved:

- `src/features/discovery/screens/discovery-home-screen.tsx`
- `src/features/discovery/screens/discovery-search-screen.tsx`
- `src/features/discovery/screens/discovery-category-screen.tsx`
- `src/features/discovery/screens/discovery-popular-screen.tsx`
- `src/features/detail/screens/detail-product-screen.tsx`
- `src/features/detail/components/detail-ui.tsx`
- `src/features/discovery/components/*`

Canonical listing fields:

- `id`
- `title`
- `description`
- `type`: `VENTE | TROC | TROC_CASH`
- `price`
- `cash_complement`
- `exchange_for`
- `category`
- `condition`
- `delivery_mode`
- `photos`
- `country`
- `city`
- `neighborhood`
- `view_count`
- `favorite_count`
- `status`
- `is_boosted`
- `owner`
- `created_at`
- `updated_at`

Canonical backend categories:

- `electronique`
- `vetements`
- `vehicules`
- `maison`
- `services`

Expected behavior:

- home feed uses real listings
- search uses `GET /search?q=...`
- category screens pass backend category values, not display labels
- detail loads by id from backend
- UI still has a usable fallback/loading/error state

### 3. Favorites

Connect:

- `GET /favorites`
- `POST /favorites/{listingId}`
- `DELETE /favorites/{listingId}`

Files likely involved:

- `app/(tabs)/favorites.tsx`
- discovery/listing cards favorite buttons
- detail favorite button

Expected behavior:

- favorites screen uses backend data
- favorite/unfavorite mutates backend
- listing/detail/favorites queries are invalidated after mutation
- anonymous or unauthenticated favorite actions should route to sign in or show a clear state

### 4. Profile And Seller Public Pages

Connect:

- `GET /profile`
- `PUT /profile`
- `POST /profile/avatar`
- `GET /users/{uid}`
- `GET /users/{uid}/listings`
- `GET /users/{uid}/reviews`
- `GET /my/listings`

Files likely involved:

- `src/features/profile/screens/public-seller-profile-screen.tsx`
- `src/features/profile/screens/public-seller-annonces-screen.tsx`
- `src/features/profile/screens/private-profile-drafts-screen.tsx`
- `app/(tabs)/profile.tsx`
- `app/seller/[id].tsx`
- `app/seller-annonces.tsx`

Expected behavior:

- seller profile detail comes from backend
- seller listings are real
- current profile page uses real current user
- avatar upload remains for a later small subtask if too large for first pass

### 5. Publish Flow

Connect:

- `POST /listings`
- later: `PUT /listings/{id}`
- later: `POST /listings/{id}/photos`
- later: `DELETE /listings/{id}/photos/{idx}`

Files likely involved:

- `src/features/publish/screens/publish-flow-screen.tsx`
- `app/publish.tsx`
- `app/(tabs)/publish-entry.tsx`

Creation must use:

- `multipart/form-data`
- `photos[]` required

Backend rules:

- `type = VENTE` requires `price`
- `type = TROC` requires `exchange_for`
- `type = TROC_CASH` requires `exchange_for`, `cash_complement` optional/allowed
- `photos[]` min 1, max 10
- each photo max 15 MB
- request total should stay below about 80 MB

Expected behavior:

- pick photos from device
- submit real multipart form
- show loading state during submit
- show backend validation errors
- on success route to detail or my listings

### 6. Conversations And Messages

Connect REST first:

- `GET /conversations`
- `GET /conversations/{id}`
- `POST /conversations`
- `GET /conversations/{id}/messages`
- `POST /conversations/{id}/messages`
- `POST /conversations/{id}/read`

Realtime WebSocket comes after REST is stable.

Files likely involved:

- `src/features/chat/screens/messaging-inbox-screen.tsx`
- `src/features/chat/screens/direct-contact-chat-screen.tsx`
- `app/(tabs)/messages.tsx`
- `app/chat/[id].tsx`
- detail contact seller button

Expected behavior:

- inbox shows real conversations
- conversation thread loads real messages
- sending a text message works
- opening a thread marks messages read
- REST works before Reverb is added

Realtime notes:

- backend uses Laravel Reverb
- public host: `bizo.aiko.qzz.io`
- private channels:
  - `conversation.{conversationId}`
  - `users.{userId}.conversations`
- events:
  - `conversation.message.created`
  - `conversation.summary.updated`

Do not start with realtime. Build REST chat first.

## Error Handling Requirements

Create a helper to normalize API errors.

Must handle:

- `401`: clear session
- `403`: forbidden message
- `404`: not found message
- `422`: show validation messages
- `429`: rate limit message
- network timeout/offline

Do not show raw Axios errors directly in UI.

## Media URL Helper

Create a helper like:

```ts
resolveMediaUrl(path?: string | null): string | null
```

Rules:

- `null` or empty returns `null`
- absolute `http://` or `https://` returns unchanged
- relative `/storage/...` becomes `https://bizo.aiko.qzz.io/storage/...`

Use it for:

- listing photos
- avatars
- conversation listing photos
- message images
- seller photos

## Data Mapping Policy

Backend models should be mapped into UI models where the current UI expects different field names.

Do not contort the UI components to match backend snake_case everywhere.

Suggested pattern:

- API type: `ListingResource`
- UI type: `DiscoveryListing`
- mapper: `mapListingToDiscoveryListing`

This allows the UI to remain stable while backend contracts stay accurate.

## What Not To Do

Do not:

- make silent UI changes; if UI must change, report what changed and why
- remove the mocked UI before the API replacement is ready
- add new native dependencies
- run Expo / Metro yourself
- introduce Firebase for chat
- replace Laravel/Reverb backend
- use ad hoc URL concatenation in screens
- ignore TypeScript errors
- connect realtime before REST chat works

## Verification Routine

For every backend connection chunk:

```bash
cd /home/aiko/Documents/bizo-back/bizo-mobile-rn
nvm use v20.19.6
npm run typecheck
```

Optional but useful:

```bash
npx expo install --check
```

Do not run Metro unless explicitly asked by the human operator.

## Suggested Delivery Chunks

Chunk 1:

- API types
- error helper
- media URL helper
- auth login/register/profile/session

Chunk 2:

- listing feed
- search
- detail
- category mapping

Chunk 3:

- favorites
- current profile
- seller profile/listings

Chunk 4:

- publish multipart creation with photos

Chunk 5:

- conversations REST
- messages REST
- mark read

Chunk 6:

- Reverb realtime after REST is stable

## Report Format

When finishing a chunk, report:

1. endpoints connected
2. screens switched from mock to backend
3. mocks still remaining
4. error/loading states added
5. UI changes made or proposed
6. exact validation command result
7. known backend contract assumptions

## Current Priority

Start with Chunk 1.

Do not start with publish or realtime chat.

Auth/session must be reliable before protected routes like favorites, publish, profile, and conversations.
