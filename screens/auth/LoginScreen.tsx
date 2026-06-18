import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Card,
  HelperText,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import { AuthStackParamList } from "../../navigation/types";
import { appSpacing } from "../../theme/theme";
import { useAuthStore } from "../../store/useAuthStore";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const signIn = useAuthStore((state) => state.signIn);
  const authError = useAuthStore((state) => state.error);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const clearError = useAuthStore((state) => state.clearError);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError("Enter both your college email and password.");
      return;
    }

    try {
      setLocalError(null);
      await signIn({ email, password });
    } catch {
      // Store error is surfaced in the snackbar.
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text variant="displaySmall">CampusCircle</Text>
          <Text variant="bodyLarge">
            Discover college events, share what is happening on campus, and stay close to the
            people and organizations you care about.
          </Text>
        </View>

        <Card mode="contained">
          <Card.Content style={styles.form}>
            <Text variant="headlineSmall">Welcome back</Text>
            <Text variant="bodyMedium">
              Sign in with your verified college email to access your personalized event feed.
            </Text>

            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="College email"
              mode="outlined"
              onChangeText={setEmail}
              value={email}
            />
            <HelperText type="info">Only college addresses ending in .edu are allowed.</HelperText>

            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              label="Password"
              mode="outlined"
              onChangeText={setPassword}
              secureTextEntry
              value={password}
            />

            <Button loading={isSubmitting} mode="contained" onPress={handleLogin}>
              Log in
            </Button>

            <Button mode="text" onPress={() => navigation.navigate("SignUp")}>
              Create a student account
            </Button>

            <Text variant="bodySmall">
              Demo account prefilled: `maya@westfield.edu` / `Password123!`
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        onDismiss={() => {
          setLocalError(null);
          clearError();
        }}
        visible={!!localError || !!authError}
      >
        {localError ?? authError ?? ""}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: appSpacing.lg,
    gap: appSpacing.lg,
  },
  hero: {
    gap: appSpacing.sm,
  },
  form: {
    gap: appSpacing.md,
    paddingVertical: appSpacing.md,
  },
});
