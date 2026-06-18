# Dis-cover

[![Expo](https://img.shields.io/badge/Expo-54.0.35-4d85d4?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?logo=react)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.1-orange?logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?logo=typescript)](https://www.typescriptlang.org)

## Project Overview

**Dis-cover** is a comprehensive campus networking and collaboration platform built with Expo and React Native. Designed as a final-year project, it enables college students to connect with their campus community through events, stories, gig listings, profiles, and notifications in a unified mobile experience.

The project uses **Expo Router** for file-based navigation, **Zustand** for state management, and **Firebase** for authentication and backend data persistence. It targets Android, iOS, and web platforms via Expo.

## Features

- College email-based authentication and profile onboarding
- Event discovery feed with search and category filtering
- Story feed with student story viewing
- Gig marketplace for posting and browsing student gigs
- Student profile and settings management
- Firebase Auth and Firestore integration
- Mobile-first UI with Expo components and React Native Paper
- Responsive navigation with bottom tabs and drawer menu

## Technology Stack

| Category | Technology |
| --- | --- |
| Framework | Expo / React Native |
| Navigation | Expo Router, React Navigation Bottom Tabs |
| State Management | Zustand |
| Backend | Firebase Auth, Firestore |
| UI / Styling | React Native Paper, Expo Vector Icons |
| Data / Utilities | Date-fns, Expo Image Picker, Expo Notifications |
| Tooling | TypeScript, Babel, ESLint |

## Folder Structure

```text
Dis-cover
├── app
│   ├── (tabs)
│   │   ├── _layout.tsx
│   │   ├── alerts.tsx
│   │   ├── calendar.tsx
│   │   ├── create.tsx
│   │   ├── explore.tsx
│   │   ├── index.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── create-event.tsx
│   ├── create-gig.tsx
│   ├── create-story.tsx
│   ├── event-details
│   ├── gig-details
│   ├── stories
│   ├── user-profile
│   ├── settings.tsx
│   └── privacy-settings.tsx
├── assets
│   └── images
├── components
│   ├── cards
│   ├── common
│   ├── drawer
│   ├── feed
│   ├── gig-space
│   ├── profile
│   ├── settings
│   └── ui
├── constants
├── data
├── hooks
├── images
├── navigation
├── screens
│   ├── auth
│   ├── create
│   ├── feed
│   ├── notifications
│   ├── profile
│   └── search
├── services
├── store
├── theme
├── types
└── utils
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/chethanreddy0790/diS_Cover.git
cd diS_Cover
```

2. Install dependencies

```bash
npm install
```

3. Start the Expo development server

```bash
npx expo start
```

4. Run the app

- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

## Environment Variables

Create a `.env` file from `.env.example` and add your Firebase credentials.

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=dwl7rtcct
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=discover_unsigned
```

> Do not commit `.env` or expose secret keys in source control.

## Screenshots

Screenshots of the application will be added soon.

Current application modules include:

- Authentication
- Home Feed
- Stories
- Events
- Gig Space
- User Profile
- Notifications

## Future Enhancements

- Add real-time messaging and chat features
- Support push notifications and event reminders
- Enable social login providers
- Add calendar sync for events
- Enhance story creation with media upload workflows
- Add analytics and performance monitoring

## Developers

- **Chethan Reddy A**
- **Suhasi Bindu D**

Bachelor of Computer Applications (BCA)

Academic Year: 2025–2026

Institution: Christ Academy Institute For Advanced Studies

Project Type: Final Year Major Project

## License

No license is currently defined for this repository. Add a `LICENSE` file to specify reuse and distribution terms.
