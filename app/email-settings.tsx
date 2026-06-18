import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { useStore } from '../store/useStore';

export default function EmailSettingsScreen() {
  const { currentUser } = useStore();
  const [marketingEnabled, setMarketingEnabled] = useState(true);
  const [transactionalEnabled, setTransactionalEnabled] = useState(true);
  const email = currentUser?.email || 'alex.rivera@university.edu';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.82} onPress={() => router.back()} style={styles.iconButton}>
          <Feather name="arrow-left" size={24} color="#0B4AEF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Settings</Text>
        <TouchableOpacity activeOpacity={0.82} style={styles.iconButton}>
          <Feather name="more-vertical" size={23} color="#8090AA" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>PREFERENCES</Text>
        <Text style={styles.title}>Email Settings</Text>
        <Text style={styles.heroCopy}>
          Manage how diS_Cover communicates with you across your curated academic and campus
          experience.
        </Text>

        <Text style={styles.sectionTitle}>Primary Identity</Text>
        <Text style={styles.sectionCopy}>
          This is the email address where you’ll receive security alerts and event confirmations.
        </Text>

        <View style={styles.identityCard}>
          <Text style={styles.cardLabel}>CURRENT EMAIL ADDRESS</Text>
          <View style={styles.emailBox}>
            <View style={styles.emailIcon}>
              <Feather name="at-sign" size={28} color="#0B4AEF" />
            </View>
            <Text numberOfLines={1} style={styles.emailText}>{email}</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedText}>VERIFIED</Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.88} style={styles.updateButton}>
            <Text style={styles.updateText}>Update Email Address</Text>
            <Feather name="edit-2" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.notificationsTitle}>Email Notifications</Text>
        <Text style={styles.sectionCopy}>Customize the frequency and types of messages we send to your inbox.</Text>

        <NotificationCard
          copy="Get notified about new campus festivals, workshops, and early-bird ticket releases."
          icon="volume-2"
          onValueChange={setMarketingEnabled}
          title="Marketing Emails"
          value={marketingEnabled}
        />

        <NotificationCard
          copy="Essential emails regarding your bookings, payments, and account security changes."
          icon="clipboard"
          note="Required for account safety and ticket delivery."
          onValueChange={setTransactionalEnabled}
          title="Transactional Emails"
          value={transactionalEnabled}
        />

        <View style={styles.encryptedCard}>
          <Feather name="shield" size={34} color="#FFFFFF" />
          <Text style={styles.encryptedTitle}>Encrypted Data</Text>
          <Text style={styles.encryptedCopy}>
            Your privacy is our priority. All settings are synced with end-to-end encryption.
          </Text>
        </View>
      </ScrollView>

      <SettingsBottomNav />
    </SafeAreaView>
  );
}

type NotificationCardProps = {
  copy: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  note?: string;
  onValueChange: (value: boolean) => void;
  title: string;
  value: boolean;
};

function NotificationCard({ copy, icon, note, onValueChange, title, value }: NotificationCardProps) {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationIcon}>
        <Feather name={icon} size={27} color="#0B4AEF" />
      </View>
      <View style={styles.notificationText}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationCopy}>{copy}</Text>
        {note ? (
          <View style={styles.noteRow}>
            <Feather name="info" size={12} color="#E00000" />
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ) : null}
      </View>
      <Switch
        ios_backgroundColor="#D9DEE5"
        onValueChange={onValueChange}
        thumbColor="#FFFFFF"
        trackColor={{ false: '#D9DEE5', true: '#3153E8' }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  topBar: {
    height: 86,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E9F1',
  },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, marginLeft: 18, fontSize: 23, fontWeight: '800', color: '#05070D' },
  content: { paddingHorizontal: 26, paddingTop: 44, paddingBottom: 118 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 4.5, color: '#0B4AEF' },
  title: { marginTop: 14, fontSize: 38, lineHeight: 45, fontWeight: '900', color: '#05070D' },
  heroCopy: { marginTop: 6, fontSize: 16, lineHeight: 24, color: '#343B4D' },
  sectionTitle: { marginTop: 78, fontSize: 21, lineHeight: 27, fontWeight: '800', color: '#05070D' },
  sectionCopy: { marginTop: 16, fontSize: 16, lineHeight: 25, color: '#343B4D' },
  identityCard: {
    marginTop: 62,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 26,
    shadowColor: '#D5DDEA',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.24,
    shadowRadius: 32,
    elevation: 10,
  },
  cardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#687186' },
  emailBox: { marginTop: 18, minHeight: 80, backgroundColor: '#F0F1F3', flexDirection: 'row', alignItems: 'center', paddingLeft: 18 },
  emailIcon: { width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E1E7FF' },
  emailText: { flex: 1, marginLeft: 18, fontSize: 18, color: '#05070D' },
  verifiedPill: { marginRight: -52, borderRadius: 999, backgroundColor: '#DCE5FF', paddingHorizontal: 10, paddingVertical: 7 },
  verifiedText: { fontSize: 11, fontWeight: '800', color: '#0B4AEF' },
  updateButton: {
    marginTop: 36,
    alignSelf: 'center',
    minWidth: 258,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: '#3153E8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: { marginRight: 12, fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  notificationsTitle: { marginTop: 56, fontSize: 21, lineHeight: 27, fontWeight: '800', color: '#05070D' },
  notificationCard: {
    marginTop: 38,
    minHeight: 132,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F3FF' },
  notificationText: { flex: 1, paddingHorizontal: 18 },
  notificationTitle: { fontSize: 18, fontWeight: '800', color: '#05070D' },
  notificationCopy: { marginTop: 3, fontSize: 13, lineHeight: 18, color: '#343B4D' },
  noteRow: { marginTop: 16, flexDirection: 'row', alignItems: 'flex-start' },
  noteText: { flex: 1, marginLeft: 7, fontSize: 11, lineHeight: 15, color: '#E00000' },
  encryptedCard: { marginTop: 56, minHeight: 196, borderRadius: 28, backgroundColor: '#2F4FE3', padding: 28, justifyContent: 'center' },
  encryptedTitle: { marginTop: 36, fontSize: 25, lineHeight: 31, fontWeight: '800', color: '#FFFFFF' },
  encryptedCopy: { marginTop: 4, fontSize: 16, lineHeight: 23, color: '#FFFFFF' },
});
