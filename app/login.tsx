import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../services/firebase';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { SocialButton } from '../components/SocialButton';
import { useStore } from '../store/useStore';
import { isCollegeEmail, isStrongEnoughPassword } from '../utils/validation';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const signupStepOne = useStore((state) => state.signupStepOne);
  const localLogin = useStore((state) => state.localLogin);
  const syncGoogleUser = useStore((state) => state.syncGoogleUser);
  const hasHydrated = useStore((state) => state.hasHydrated);

  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [designation, setDesignation] = useState('Student');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_CONFIGURED = Platform.select({
    ios: !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    android: !!(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    default: !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const handleFirebaseGoogleAuth = async (idToken: string) => {
    setIsLoading(true);
    console.log("[GoogleAuth] Starting Firebase sign-in");
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;
      console.log("[GoogleAuth] Firebase user:", firebaseUser.uid);

      const result = await syncGoogleUser(firebaseUser);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert("Sync Failed", result.error || "Failed to synchronize user profile.");
      }
    } catch (error: any) {
      console.error("[GoogleAuth] Firebase Auth error:", error);
      Alert.alert("Login Error", error.message || "Failed to sign in with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Internal component to handle Google Auth hook safely.
   * This is only rendered if Google is configured for the current platform.
   */
  const GoogleLoginSection = () => {
    const [request, response, promptAsync] = Google.useAuthRequest({
      expoClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
    });

    useEffect(() => {
      if (!response) return;
      if (response.type === 'success') {
        const { id_token, authentication } = response.params;
        const token = id_token || authentication?.idToken;
        if (token) {
          handleFirebaseGoogleAuth(token);
        }
      } else if (response.type === 'error') {
        console.error("[GoogleAuth] Auth response error:", response.error, response.params);
        Alert.alert("Google Login Failed", "An error occurred during Google authentication.");
      }
    }, [response]);

    const handleGoogleSignIn = async () => {
      console.log("[GoogleAuth] Starting Google sign-in prompt");
      try {
        await promptAsync({ useProxy: true });
      } catch (error) {
        console.error("[GoogleAuth] promptAsync error:", error);
        Alert.alert("Error", "Could not initiate Google login.");
      }
    };

    return (
      <SocialButton
        icon="google"
        title="Continue with Google"
        onPress={handleGoogleSignIn}
        disabled={!request || isLoading}
      />
    );
  };

  if (!hasHydrated) return null;

  const validateEmail = (text: string) => {
    setEmail(text);
    if (text.length > 0 && text.includes('@') && !isCollegeEmail(text)) {
      setEmailError('Please use a verified college email address');
    } else {
      setEmailError('');
    }
  };

  const handleAppleSignIn = () => {
    alert('Apple Sign-In coming soon');
  };

  const handleAuth = async () => {
    if (!email.trim() || !isCollegeEmail(email)) {
      alert('Please provide a valid college email address');
      return;
    }
    if (!isStrongEnoughPassword(password)) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);

      if (isSignup) {
        if (!username.trim() || !collegeName.trim()) {
          alert('Please fill in all fields');
          return;
        }
        const result = signupStepOne({ username, email, password, collegeName, designation });
        if (result.success) {
          router.push('/interests');
        } else {
          alert(result.error || 'Signup failed');
        }
      } else {
        const result = await localLogin({ email, password });
        if (result.success) {
          // Redirection should happen via the Root Router in app/index.tsx
          // but explicit replace is also fine for immediate feedback
          router.replace('/(tabs)');
        } else {
          alert(result.error || 'Login failed');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.brandContainer}>
              <Text style={styles.appName}>di<Text style={styles.highlightText}>S_C</Text>over</Text>
              <Text style={styles.subtitle}>THE DIGITAL CURATOR</Text>
            </View>
            <Text style={styles.heading}>
              {isSignup ? "Join the " : "Welcome "}
              <Text style={styles.highlightText}>{isSignup ? "community" : "back"}</Text>
              {"."}
            </Text>
          </View>

          {/* Card Section */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>{isSignup ? "Create your account" : "Login to your account"}</Text>

            <View style={styles.socialContainer}>
              {GOOGLE_CONFIGURED ? (
                <GoogleLoginSection />
              ) : (
                Platform.OS === 'ios' && (
                  <Text style={styles.googleWarning}>
                    Google Sign-In is not configured for iOS yet.
                  </Text>
                )
              )}
              <SocialButton
                icon="apple"
                title="Continue with Apple"
                onPress={handleAppleSignIn}
              />
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {isSignup && (
              <>
                <Input
                  label="Username"
                  placeholder="e.g. johndoe_22"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />

                <Input
                  label="College Name"
                  placeholder="e.g. CAIAS"
                  value={collegeName}
                  onChangeText={setCollegeName}
                />

                <View style={styles.designationContainer}>
                  <Text style={styles.label}>Designation</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      style={[styles.toggleButton, designation === 'Student' && styles.toggleButtonActive]}
                      onPress={() => setDesignation('Student')}
                    >
                      <Text style={[styles.toggleButtonText, designation === 'Student' && styles.toggleButtonTextActive]}>Student</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleButton, designation === 'Organizer' && styles.toggleButtonActive]}
                      onPress={() => setDesignation('Organizer')}
                    >
                      <Text style={[styles.toggleButtonText, designation === 'Organizer' && styles.toggleButtonTextActive]}>Organizer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <Input
              label="College Email"
              placeholder="e.g. yourname@college.edu"
              value={email}
              onChangeText={validateEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Button
              title={isLoading ? "Please wait..." : (isSignup ? "Continue" : "Login")}
              onPress={handleAuth}
              style={styles.submitButton}
              disabled={isLoading}
            />

            <Text style={styles.footerText}>
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <Text style={styles.loginText} onPress={() => setIsSignup(!isSignup)}>
                {isSignup ? "Log in here" : "Create account"}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Light background
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 40,
    marginTop: 20,
  },
  brandContainer: {
    marginBottom: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 2,
    marginTop: 4,
  },
  heading: {
    fontSize: 40,
    fontWeight: '700',
    color: '#111',
    lineHeight: 48,
    letterSpacing: -1,
  },
  highlightText: {
    color: '#3B5BFF',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 24,
    textAlign: 'center',
  },
  socialContainer: {
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EAED',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  loginText: {
    color: '#3B5BFF',
    fontWeight: '600',
  },
  designationContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F7F8F9',
    borderWidth: 1,
    borderColor: '#E8EAED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    borderColor: '#3B5BFF',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: '#3B5BFF',
  },
  googleWarning: {
    fontSize: 12,
    color: '#FF8C00',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(255, 140, 0, 0.05)',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.2)',
  },
});
