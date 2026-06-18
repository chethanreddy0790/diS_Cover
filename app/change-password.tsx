import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store/useStore';
import { isStrongEnoughPassword } from '../utils/validation';

type PasswordFieldProps = {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
};

function PasswordField({ label, onChangeText, value }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputPill}>
        <TextInput
          autoCapitalize="none"
          onChangeText={onChangeText}
          placeholder="Enter password"
          placeholderTextColor="#8D96AA"
          secureTextEntry={!isVisible}
          style={styles.input}
          value={value}
        />
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.78}
          onPress={() => setIsVisible((current) => !current)}
          style={styles.eyeButton}>
          <Feather name={isVisible ? 'eye-off' : 'eye'} size={20} color="#7A8499" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const updatePassword = useStore((state) => state.updatePassword);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const isNewPasswordStrong = isStrongEnoughPassword(newPassword);
  const doPasswordsMatch = newPassword === confirmPassword;
  const canSave =
    currentPassword.length > 0 &&
    isNewPasswordStrong &&
    confirmPassword.length > 0 &&
    doPasswordsMatch &&
    !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Check password', 'Use at least 8 characters and make sure both new passwords match.');
      return;
    }

    setIsSaving(true);
    const result = await updatePassword(currentPassword, newPassword);
    setIsSaving(false);

    if (!result.success) {
      Alert.alert('Unable to change password', result.error || 'Please try again.');
      return;
    }

    Alert.alert('Password changed', 'Your password has been updated successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.82} onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={25} color="#3F5EFF" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Change Password</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Feather name="lock" size={28} color="#3F5EFF" />
            </View>
            <Text style={styles.title}>Secure your account</Text>
            <Text style={styles.copy}>
              Choose a password that is at least 8 characters and different from your current one.
            </Text>

            <PasswordField
              label="CURRENT PASSWORD"
              onChangeText={setCurrentPassword}
              value={currentPassword}
            />
            <PasswordField
              label="NEW PASSWORD"
              onChangeText={setNewPassword}
              value={newPassword}
            />
            {newPassword.length > 0 && !isNewPasswordStrong ? (
              <Text style={styles.errorText}>Password must be at least 8 characters.</Text>
            ) : null}
            <PasswordField
              label="CONFIRM NEW PASSWORD"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
            {confirmPassword.length > 0 && !doPasswordsMatch ? (
              <Text style={styles.errorText}>New passwords do not match.</Text>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!canSave}
            onPress={handleSave}
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
            <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save Password'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  topTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 42 },
  card: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 30,
    shadowColor: '#CAD3E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
  },
  title: { marginTop: 18, fontSize: 24, fontWeight: '900', color: '#111827' },
  copy: { marginTop: 8, fontSize: 14, lineHeight: 21, color: '#5F6C84' },
  fieldBlock: { marginTop: 24 },
  fieldLabel: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
    color: '#0E1529',
  },
  inputPill: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 26,
    backgroundColor: '#EEF1F5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 8,
  },
  input: { flex: 1, fontSize: 15, color: '#111827' },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { marginTop: 8, marginLeft: 4, fontSize: 12, color: '#DC2626' },
  saveButton: {
    marginTop: 34,
    alignSelf: 'center',
    minWidth: 210,
    minHeight: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3153E8',
    shadowColor: '#3153E8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
