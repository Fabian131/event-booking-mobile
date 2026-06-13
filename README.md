# Event Booking Mobile

A cross-platform mobile application for event reservations built with **Expo** and **React Native**. Users can browse available events, check availability calendars, make reservations, and manage their booking history through a modern and intuitive interface.

## Tech Stack

| Technology | Description |
|---|---|
| [React Native](https://reactnative.dev/) | Cross-platform mobile framework |
| [Expo](https://expo.dev/) | Platform and SDK for React Native development |
| [Expo Router](https://docs.expo.dev/router/introduction/) | File-based routing |
| [TypeScript](https://www.typescriptlang.org/) | Static typing for JavaScript |
| [React Navigation](https://reactnavigation.org/) | Navigation and bottom tabs |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | High-performance animations |

## Project Structure

```
event-booking-mobile/
├── README.md
└── /event-booking/
    ├── /.github/workflows/       # CI/CD: Automated test scripts for PRs
    ├── /api-contracts/           # API contracts and mock data for events/reservations
    ├── /architecture/            # Diagrams and technical decisions
    ├── /docs/                    # Research document (APA 7)
    ├── /research/                # Platform research notes
    ├── /screenshots/             # Screenshots for README
    ├── /tests/                   # Unit and integration tests (Jest/React Native Testing Library)
    ├── app.json                  # Native Expo config (icons, splash screen, plugins)
    ├── package.json
    ├── README.md
    │
    ├── /app/                     # EXPO ROUTER ROUTING (Views)
    │   ├── _layout.tsx           # Global providers (AuthContext, Theme, QueryClient)
    │   ├── index.tsx             # Initial screen (Redirect to Login or Dashboard)
    │   ├── (auth)/               # ROUTE GROUP: Authentication
    │   │   ├── _layout.tsx
    │   │   ├── login.tsx
    │   │   └── register.tsx
    │   ├── (admin)/              # ROUTE GROUP: Business admin (Stack)
    │   │   ├── _layout.tsx       # Auth guard + logout button + screen registration
    │   │   ├── index.tsx         # Calendar dashboard
    │   │   └── create-event.tsx  # Event creation form
    │   └── (customer)/           # ROUTE GROUP: Customer (Tabs)
    │       ├── _layout.tsx       # Auth guard + tab bar
    │       ├── reservations.tsx  # Reservation history
    │       └── events/           # Events tab (nested stack)
    │           ├── _layout.tsx
    │           ├── index.tsx     # Events feed
    │           └── [id].tsx      # Event detail
    │
    └── /src/                     # BUSINESS LOGIC AND COMPONENTS
        ├── /components/          # Reusable UI
        │   ├── /ui/              # Atoms (Button, Input, Loader, EmptyState)
        │   └── /domain/          # Organisms (EventCard, ReservationItem)
        ├── /context/             # Global state management (Auth, Theme)
        ├── /hooks/               # Logic extracted from screens
        │   ├── useEvents.ts
        │   ├── useEventDetail.ts
        │   └── useReservations.ts
        ├── /services/            # External integrations
        │   ├── api.ts
        │   ├── auth.ts
        │   ├── events.ts
        │   └── storage.ts
        ├── /types/               # TypeScript types
        │   ├── auth.ts
        │   └── events.ts
        └── /utils/               # Pure helpers
            └── validators.ts
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- For Android: [Android Studio](https://docs.expo.dev/workflow/android-studio-emulator/) or the [Expo Go](https://expo.dev/go) app on your physical device
- For iOS: [Xcode](https://docs.expo.dev/workflow/ios-simulator/) (macOS only) or the [Expo Go](https://expo.dev/go) app on your physical device

## Installation

```bash
cd event-booking
npm install
```

## Running Locally

All commands below should be executed from the `event-booking/` directory:

### Android

```bash
npm run android
```

Launches the app on an Android emulator or a connected physical device.

### iOS

```bash
npm run ios
```

Launches the app on the iOS simulator (requires macOS). If you need iOS development without a Mac, use the Expo Go app instead.

### Web

```bash
npm run web
```

Launches the app in your web browser.

### Development Server

```bash
npm start
```

Starts the Expo development server.

## Testing on a Physical Device

To run the app on your mobile device without an emulator:

1. Install **Expo Go** from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [Apple App Store](https://apps.apple.com/app/expo-go/id982107779).
2. Run `npm start` inside the `event-booking/` directory.
3. Scan the **QR code** displayed in the terminal with your device's camera (Android) or the Expo Go app (iOS).
4. The app will load automatically in Expo Go.

> **Note:** Your mobile device and computer must be connected to the **same Wi-Fi network**.

Contracts in API DOG: https://rm6l6vvc8k.apidog.io/
VIDEO TY: https://youtu.be/4kpe3MSs1oU