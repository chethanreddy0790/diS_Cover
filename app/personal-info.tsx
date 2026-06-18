import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
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
import SettingsBottomNav from '../components/settings/SettingsBottomNav';
import { useStore } from '../store/useStore';
import { uploadImage } from '../services/storageUtils';

const avatarSource = require('../assets/images/icon.png');

function displayName(username?: string) {
  if (!username) {
    return 'Alex Sterling';
  }

  return username
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function PersonalInfoScreen() {
  const { currentUser, updatePersonalInfo } = useStore();
  const initialName = currentUser?.fullName || displayName(currentUser?.username);
  const [fullName, setFullName] = React.useState(initialName);
  const [username, setUsername] = React.useState(currentUser?.username || 'alex__discover');
  const [university, setUniversity] = React.useState(currentUser?.collegeName || 'Central State University');
  const [phoneNumber, setPhoneNumber] = React.useState(currentUser?.phoneNumber || '');
  const [profileImage, setProfileImage] = React.useState(currentUser?.image);
  const isPhoneValid = /^\d{10}$/.test(phoneNumber);
  const showPhoneError = phoneNumber.length > 0 && !isPhoneValid;
  const canSave = fullName.trim().length > 0 && username.trim().length > 0 && university.trim().length > 0 && !showPhoneError;

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value.replace(/\D/g, '').slice(0, 10));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Check details', 'Please complete the required fields before saving.');
      return;
    }

    try {
      let finalImageUrl = profileImage;
      
      // Upload image if it's a local file
      if (profileImage && !profileImage.startsWith('http')) {
        finalImageUrl = await uploadImage(profileImage);
      }

      updatePersonalInfo({
        fullName: fullName.trim(),
        username: username.trim(),
        collegeName: university.trim(),
        phoneNumber,
        image: finalImageUrl,
      });
      Alert.alert('Saved', 'Your personal information has been updated.');
    } catch (error) {
      console.error('[PersonalInfo] Failed to update profile:', error);
      Alert.alert('Update Failed', 'An error occurred while saving your profile. Please try again.');
    }
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
          <TouchableOpacity activeOpacity={0.82} onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={23} color="#0B4AEF" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Personal Info</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.avatarWrap}>
              <Image source={profileImage ? { uri: profileImage } : avatarSource} style={styles.avatar} />
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={handlePickImage}
                style={styles.editBadge}>
                <Feather name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity activeOpacity={0.82} onPress={handlePickImage}>
              <Text style={styles.uploadText}>Upload Photo</Text>
            </TouchableOpacity>
            <Text style={styles.eyebrow}>ACCOUNT OWNER</Text>
            <Text style={styles.name}>{fullName || username}</Text>
            <Text style={styles.heroCopy}>
              Update your account identity and institutional verification to keep your diS_Cover profile
              current for events.
            </Text>
          </View>

          <InfoCard title="Identity Details">
            <EditableField
              icon="badge-account-outline"
              label="FULL NAME"
              onChangeText={setFullName}
              placeholder="Enter full name"
              value={fullName}
            />
            <EditableField
              autoCapitalize="none"
              icon="at"
              label="USERNAME"
              onChangeText={setUsername}
              placeholder="Enter username"
              value={username}
            />
          </InfoCard>

          <InfoCard title="Contact & Connectivity">
            <PhoneField
              hasError={showPhoneError}
              onChangeText={handlePhoneChange}
              value={phoneNumber}
            />
          </InfoCard>

          <InfoCard title="Institution">
            <EditableField
              icon="school-outline"
              label="UNIVERSITY"
              onChangeText={setUniversity}
              placeholder="Enter university"
              value={university}
            />
            <View style={styles.verifyNote}>
              <MaterialCommunityIcons name="seal-variant" size={22} color="#0B4AEF" />
              <Text style={styles.verifyText}>
                Your university status is used to verify access to campus-specific event clusters and
                academic workshops.
              </Text>
            </View>
          </InfoCard>

          <TouchableOpacity
            activeOpacity={0.88}
            disabled={!canSave}
            onPress={handleSave}
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <SettingsBottomNav />
    </SafeAreaView>
  );
}

type InfoCardProps = {
  children: React.ReactNode;
  title: string;
};

function InfoCard({ children, title }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      {children}
    </View>
  );
}

type EditableFieldProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

function EditableField({
  autoCapitalize = 'words',
  icon,
  label,
  onChangeText,
  placeholder,
  value,
}: EditableFieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldPill}>
        <TextInput
          autoCapitalize={autoCapitalize}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7E879B"
          style={styles.fieldInput}
          value={value}
        />
        <MaterialCommunityIcons name={icon} size={22} color="#B8BED4" />
      </View>
    </View>
  );
}

type PhoneFieldProps = {
  hasError: boolean;
  onChangeText: (value: string) => void;
  value: string;
};

function PhoneField({ hasError, onChangeText, value }: PhoneFieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
      <View style={[styles.fieldPill, hasError && styles.fieldPillError]}>
        <TextInput
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={onChangeText}
          placeholder="Enter 10 digit mobile number"
          placeholderTextColor="#7E879B"
          style={styles.phoneInput}
          value={value}
        />
        <MaterialCommunityIcons name="phone-outline" size={22} color="#B8BED4" />
      </View>
      {hasError ? (
        <Text style={styles.fieldError}>Enter a valid 10 digit Indian mobile number.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  topBar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E9F1',
  },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: '800', color: '#05070D' },
  headerSpacer: { width: 34, height: 34 },
  content: { paddingHorizontal: 21, paddingTop: 24, paddingBottom: 124 },
  hero: { alignItems: 'center', paddingHorizontal: 10 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 132, height: 132, borderRadius: 66, backgroundColor: '#FFFFFF' },
  editBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3153E8',
  },
  uploadText: { marginTop: 12, fontSize: 13, fontWeight: '800', color: '#3153E8' },
  eyebrow: { marginTop: 18, fontSize: 11, fontWeight: '700', letterSpacing: 4.4, color: '#0B4AEF' },
  name: { marginTop: 8, fontSize: 27, lineHeight: 33, fontWeight: '900', color: '#05070D' },
  heroCopy: { marginTop: 8, fontSize: 15, lineHeight: 22, textAlign: 'center', color: '#343B4D' },
  infoCard: { marginTop: 46, borderRadius: 5, backgroundColor: '#FFFFFF', paddingHorizontal: 28, paddingTop: 31, paddingBottom: 28 },
  infoTitle: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: '#05070D' },
  fieldBlock: { marginTop: 25 },
  fieldLabel: { marginLeft: 4, fontSize: 11, fontWeight: '800', letterSpacing: 2.4, color: '#0E1529' },
  fieldPill: { marginTop: 10, minHeight: 47, borderRadius: 24, backgroundColor: '#DFE3E6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  fieldPillError: { borderWidth: 1, borderColor: '#DC2626' },
  fieldInput: { flex: 1, paddingRight: 10, fontSize: 14, color: '#05070D' },
  phoneInput: { flex: 1, paddingRight: 10, fontSize: 14, color: '#05070D' },
  fieldError: { marginTop: 8, marginLeft: 4, fontSize: 12, color: '#DC2626' },
  verifyNote: { marginTop: 28, minHeight: 82, borderRadius: 41, backgroundColor: '#F0F2F4', paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  verifyText: { flex: 1, marginLeft: 12, fontSize: 11, lineHeight: 17, color: '#5B6376' },
  saveButton: { marginTop: 42, alignSelf: 'center', minWidth: 190, minHeight: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3153E8' },
  saveButtonDisabled: { opacity: 0.5 },
  saveText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
