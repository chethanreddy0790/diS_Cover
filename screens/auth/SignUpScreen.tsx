import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  HelperText,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";

import { AuthStackParamList } from "../../navigation/types";
import { appSpacing } from "../../theme/theme";
import { useAuthStore } from "../../store/useAuthStore";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export const SignUpScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const signUp = useAuthStore((state) => state.signUp);
  const authError = useAuthStore((state) => state.error);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const clearError = useAuthStore((state) => state.clearError);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setLocalError("Fill in your email and password to create an account.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      setLocalError(null);
      await signUp({ email, password });
    } catch {
      // Store error is displayed in the snackbar.
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", default: undefined })}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="displaySmall">Create your student profile</Text>
        <Text variant="bodyLarge">
          Join a verified college-only network built around campus events, clubs, and community.
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
        <HelperText type="info">
          Your sign-up email must be a valid college address like `name@college.edu`.
        </HelperText>

        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          label="Password"
          mode="outlined"
          onChangeText={setPassword}
          secureTextEntry
          value={password}
        />

        <TextInput
          autoCapitalize="none"
          autoComplete="new-password"
          label="Confirm password"
          mode="outlined"
          onChangeText={setConfirmPassword}
          secureTextEntry
          value={confirmPassword}
        />

        <Button loading={isSubmitting} mode="contained" onPress={handleSignUp}>
          Sign up
        </Button>

        <Button mode="text" onPress={() => navigation.navigate("Login")}>
          I already have an account
        </Button>
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
    gap: appSpacing.md,
  },
});
