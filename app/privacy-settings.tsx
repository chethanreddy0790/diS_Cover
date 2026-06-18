import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SettingsBottomNav from '../components/settings/SettingsBottomNav';

import { getUsername, getUserAvatar } from '../utils/userUtils';
import { useStore } from '../store/useStore';

export default function PrivacySettingsScreen() {
  const { currentUser } = useStore();
  const [profileVisible, setProfileVisible] = useState(true);
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(false);

  const avatarUrl = getUserAvatar(currentUser);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.82} onPress={() => router.back()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color="#3B5BFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Privacy</Text>
        <View style={styles.avatarWrapper}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.topAvatar} />
          ) : (
            <View style={[styles.topAvatar, styles.initialsContainer]}>
              <Text style={styles.initialsText}>{getUsername(currentUser).charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>SECURITY & SAFETY</Text>
        <Text style={styles.title}>Privacy Settings</Text>

        <Text style={styles.sectionTitle}>Profile & Activity</Text>
        <Text style={styles.sectionCopy}>Control who can see your activity and personal details.</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingIcon}>
            <Ionicons name="eye-outline" size={22} color="#3B5BFF" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Profile Visibility</Text>
            <Text style={styles.settingCopy}>Allow others to find and view your full profile.</Text>
          </View>
          <Switch
            ios_backgroundColor="#D9DEE5"
            onValueChange={setProfileVisible}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#D9DEE5', true: '#3B5BFF' }}
            value={profileVisible}
          />
        </View>

        <View style={styles.settingCard}>
          <View style={styles.settingIcon}>
            <Ionicons name="radio-outline" size={22} color="#3B5BFF" />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Show Online Status</Text>
            <Text style={styles.settingCopy}>Your connections will see when you are active.</Text>
          </View>
          <Switch
            ios_backgroundColor="#D9DEE5"
            onValueChange={setOnlineStatusVisible}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#D9DEE5', true: '#3B5BFF' }}
            value={onlineStatusVisible}
          />
        </View>

        <Text style={styles.dataTitle}>Your Data, Your Control</Text>
        <Text style={styles.dataCopy}>
          At <Text style={styles.brandText}>DIS-COVER</Text>, we believe privacy is the foundation of a
          safe campus community. All your interactions are encrypted and you maintain complete sovereignty
          over your digital footprint.
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            activeOpacity={0.86} 
            style={styles.downloadButton}
            onPress={() => Alert.alert("Request Sent", "A copy of your data will be sent to your email within 48 hours.")}
          >
            <Text style={styles.downloadText}>Download My Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E9F1',
  },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: '800', color: '#05070D' },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  topAvatar: { width: 32, height: 32 },
  initialsContainer: {
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 116 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: '#0B4AEF' },
  title: { marginTop: 8, fontSize: 28, lineHeight: 34, fontWeight: '900', color: '#05070D' },
  sectionTitle: { marginTop: 34, fontSize: 16, fontWeight: '800', color: '#05070D' },
  sectionCopy: { marginTop: 7, fontSize: 13, lineHeight: 20, color: '#424A5C' },
  settingCard: {
    marginTop: 20,
    minHeight: 94,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F3F7',
  },
  settingText: { flex: 1, paddingHorizontal: 16 },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#05070D' },
  settingCopy: { marginTop: 4, fontSize: 12, lineHeight: 17, color: '#4D5567' },
  interactionsTitle: { marginTop: 42 },
  largeCard: {
    marginTop: 26,
    minHeight: 190,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    padding: 26,
    overflow: 'hidden',
  },
  fadedAt: { position: 'absolute', right: -16, bottom: -30 },
  fadedAtText: { fontSize: 125, lineHeight: 125, fontWeight: '700', color: '#F0F0F0' },
  roundIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3FF',
  },
  largeTitle: { marginTop: 24, fontSize: 16, fontWeight: '500', color: '#05070D' },
  largeCopy: { marginTop: 12, maxWidth: 220, fontSize: 12, lineHeight: 19, color: '#4D5567' },
  segmentRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  segmentActive: { borderRadius: 999, backgroundColor: '#3153E8', paddingHorizontal: 17, paddingVertical: 9 },
  segmentActiveText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  segment: { marginLeft: 12, borderRadius: 999, backgroundColor: '#F0F2F5', paddingHorizontal: 17, paddingVertical: 9 },
  segmentText: { fontSize: 11, fontWeight: '700', color: '#1A2030' },
  linkRow: { marginTop: 26, flexDirection: 'row', alignItems: 'center' },
  linkText: { marginRight: 7, fontSize: 13, fontWeight: '700', color: '#0B4AEF' },
  dataTitle: { marginTop: 68, fontSize: 20, lineHeight: 26, fontWeight: '800', color: '#05070D' },
  dataCopy: { marginTop: 18, fontSize: 14, lineHeight: 24, color: '#343B4D' },
  brandText: { color: '#0B4AEF', fontWeight: '800' },
  actionRow: { marginTop: 18, flexDirection: 'row', alignItems: 'center' },
  downloadButton: { borderRadius: 999, backgroundColor: '#3B5BFF', paddingHorizontal: 21, paddingVertical: 12 },
  downloadText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
  deleteButton: { marginLeft: 26, paddingVertical: 12 },
  deleteText: { fontSize: 13, fontWeight: '700', color: '#E00000' },
  profilePreview: { marginTop: 28, width: '100%', height: 188, borderRadius: 25, opacity: 0.78 },
});
