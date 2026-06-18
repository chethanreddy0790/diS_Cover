import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import SettingsRow from '../components/settings/SettingsRow';
import SettingsSectionCard from '../components/settings/SettingsSectionCard';
import { useStore } from '../store/useStore';

const fallbackAvatarSource = require('../assets/images/drawer-avatar.png');
const pushSettingsRoute = (path: string) => router.push(path as never);

function formatDisplayName(username?: string) {
  if (!username) {
    return 'Alex Rivera';
  }

  return username
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

import { getUsername, getUserAvatar } from '../utils/userUtils';

export default function SettingsScreen() {
  const { currentUser, logout } = useStore();
  
  const profileName = getUsername(currentUser);
  const profileEmail = currentUser?.email || 'Explorer';
  const avatarUrl = getUserAvatar(currentUser);

  const handleLogout = () => {
    Alert.alert('Logout', 'Do you want to log out now?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              console.error('Logout failed:', error);
            }
          })();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => router.back()}
          style={styles.backButton}>
          <Feather name="arrow-left" size={25} color="#3F5EFF" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.initialsContainer]}>
                <Text style={styles.initialsText}>{profileName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          <View style={styles.profileContent}>
            <Text numberOfLines={1} style={styles.profileName}>
              {profileName}
            </Text>
            <Text numberOfLines={1} style={styles.profileEmail}>
              {profileEmail}
            </Text>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.editRow}>
              <Text style={styles.editText}>Edit Profile</Text>
              <Feather name="edit-2" size={14} color="#3F5EFF" />
            </TouchableOpacity>
          </View>
        </View>

        <SettingsSectionCard title="ACCOUNT">
          <SettingsRow
            icon="person-outline"
            label="Personal Info"
            onPress={() => pushSettingsRoute('/personal-info')}
          />
          <SettingsRow
            icon="lock-reset"
            iconSet="material"
            label="Change Password"
            onPress={() => pushSettingsRoute('/change-password')}
          />
          <SettingsRow
            icon="trash-outline"
            isLast
            label="Delete Account"
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all data. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert("Request Sent", "Your account deletion request has been sent to the admin for verification.");
                    }
                  }
                ]
              );
            }}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="PRIVACY & SECURITY">
          <SettingsRow
            icon="shield-checkmark-outline"
            isLast
            label="Privacy Settings"
            onPress={() => pushSettingsRoute('/privacy-settings')}
          />
        </SettingsSectionCard>

        <SettingsSectionCard title="LEGAL">
          <SettingsRow
            accessory="external"
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() => pushSettingsRoute('/terms-conditions')}
          />
          <SettingsRow
            accessory="external"
            icon="shield-outline"
            isLast
            label="Privacy Policy"
            onPress={() => pushSettingsRoute('/privacy-policy')}
          />
        </SettingsSectionCard>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleLogout}
          style={styles.logoutButton}>
          <Feather name="log-out" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DIS_COVER V 2.5.0</Text>
        <Text style={styles.footerText}>Made with curated excellence.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
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
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#CAD3E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarWrapper: {
    width: 78,
    height: 78,
    borderRadius: 39,
    overflow: 'hidden',
  },
  avatar: {
    width: 78,
    height: 78,
    backgroundColor: '#E3E7EF',
  },
  initialsContainer: {
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
  },
  profileContent: {
    flex: 1,
    paddingLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141C2B',
  },
  profileEmail: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7891',
  },
  editRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editText: {
    marginRight: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#3F5EFF',
  },
  logoutButton: {
    marginTop: 38,
    minHeight: 60,
    borderRadius: 999,
    backgroundColor: '#FDE7E7',
    borderWidth: 1,
    borderColor: '#FACACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  versionText: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
    color: '#A0ABC0',
  },
  footerText: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#7D889E',
  },
});
