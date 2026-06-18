import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFirestoreNetwork, auth } from '../services/firebase';
import { useEventStore } from '../store/useEventStore';
import { useStore } from '../store/useStore';
import { useGigStore } from '../store/useGigStore';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export default function RootLayout() {
  const { initSession, isLoggedIn, currentUser, registerPushToken } = useStore();
  const subscribeToEvents = useEventStore((s) => s.subscribeToEvents);
  const updateUserPresence = useGigStore((s) => s.updateUserPresence);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    initSession();
    enableFirestoreNetwork();
  }, [initSession]);

  // ── Push Notifications ──────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          registerPushToken(token);
          console.log('[Push] token registered to profile');
        }
      }).catch(err => console.warn('[Push] registration error:', err));
    }
  }, [isLoggedIn, currentUser?.id, registerPushToken]);

  // ── Global Presence ──────────────────────────────────────────────
  useEffect(() => {
    const userId = currentUser?.id || auth.currentUser?.uid;
    if (!userId) return;

    // Set online on mount (only if still authenticated)
    if (auth.currentUser) {
      updateUserPresence(userId, true);
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Only update presence if still authenticated — prevents post-logout errors
      if (!auth.currentUser) return;
      const isOnline = nextAppState === 'active';
      updateUserPresence(userId, isOnline);
    });

    return () => {
      subscription.remove();
      // updateUserPresence already guards internally, but skip if no auth
      if (auth.currentUser) {
        updateUserPresence(userId, false);
      }
    };
  }, [currentUser?.id, updateUserPresence]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (unsubscribeRef.current) unsubscribeRef.current();
    unsubscribeRef.current = subscribeToEvents();
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [isLoggedIn, subscribeToEvents]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="interests" options={{ title: 'Interests' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="contact-seller" options={{ presentation: 'card' }} />
        <Stack.Screen name="message-sent-success" options={{ presentation: 'card' }} />
        <Stack.Screen name="inbox" options={{ presentation: 'card' }} />
        <Stack.Screen name="gig-space-conversation" options={{ presentation: 'card' }} />
        <Stack.Screen name="gig-space" options={{ presentation: 'card' }} />
        <Stack.Screen name="gigs-list" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        <Stack.Screen name="change-password" options={{ presentation: 'card' }} />
        <Stack.Screen name="privacy-settings" options={{ presentation: 'card' }} />
        <Stack.Screen name="email-settings" options={{ presentation: 'card' }} />
        <Stack.Screen name="personal-info" options={{ presentation: 'card' }} />
        <Stack.Screen name="profile-drawer" options={{ presentation: 'card' }} />
        <Stack.Screen name="create-event" options={{ presentation: 'modal' }} />
        <Stack.Screen name="create-gig" options={{ presentation: 'modal' }} />
        <Stack.Screen name="create-story" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event-details/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="stories/[id]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="error" />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
