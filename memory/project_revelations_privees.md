---
name: project-revelations-privees
description: Core context for the Révélations Privées mobile app — purpose, stack, design, and roadmap
metadata:
  type: project
---

## App purpose
Révélations Privées is a React Native / Expo GO app for listening to audiobooks about private revelations, Catholic mystics, and spiritual content. Audio content (~2 GB per book) is streamed from a remote server (not bundled in the app).

## Tech stack
- Expo SDK 56, Expo Router (file-based routing in `src/app/`)
- React Native 0.85.3, React 19
- expo-image, react-native-reanimated 4, react-native-gesture-handler
- Targeting Expo GO initially, will move to Expo Dev Build later

## Design system
- Primary: `#816F5C` (warm brown)
- Secondary: `#AE8041` (golden amber)
- Background: `#F8F3EE` (warm cream)
- Surface: `#EFE8DF`
- Text: `#2C2218`
- All tokens live in `src/constants/theme.ts`

## Current screens
- `src/app/index.tsx` — Welcome screen: logo placeholder, app title, intro text, feature highlights, CTA button
- Navigation: Stack with `headerShown: false`, fade animation

## Roadmap (not yet built)
- Library screen (book catalog)
- Book detail / player screen
- Audio streaming from remote server

**Why:** Audio content is too large to bundle (~2 GB/book), so streaming is required from the start.
**How to apply:** Always design for remote content; never assume local assets for audio.
