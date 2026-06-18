import { Redirect } from 'expo-router';
import React from 'react';
import { useStore } from '../store/useStore';
import { LoadingScreen } from '../components/common/LoadingScreen';

/**
 * Root Router / Dispatcher
 * This is the entry point (/) that decides where to send the user
 * based on their authentication state.
 *
 * Uses <Redirect> instead of router.replace() to avoid the
 * "Attempted to navigate before mounting the Root Layout" error.
 * <Redirect> is navigator-aware and waits for the Stack to mount.
 */
function RootIndex() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const hasHydrated = useStore((state) => state.hasHydrated);
  const [isMinimumTimeElapsed, setIsMinimumTimeElapsed] = React.useState(false);

  React.useEffect(() => {
    // Show splash for at least 3 seconds to let animations play
    const timer = setTimeout(() => {
      setIsMinimumTimeElapsed(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Wait for store rehydration AND minimum animation time
  if (!hasHydrated || !isMinimumTimeElapsed) {
    return <LoadingScreen />;
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

export default RootIndex;
