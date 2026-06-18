import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#3B5BFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>
        
        <Text style={styles.sectionTitle}>1. User Accounts</Text>
        <Text style={styles.text}>
          To access certain features of DIS-COVER, you must register for an account using a verified college email address. You are responsible for maintaining the confidentiality of your account credentials.
        </Text>

        <Text style={styles.sectionTitle}>2. Events Posting</Text>
        <Text style={styles.text}>
          Users can post events happening within their college communities. You agree that any event information provided is accurate and does not violate any college policies.
        </Text>

        <Text style={styles.sectionTitle}>3. Stories</Text>
        <Text style={styles.text}>
          Users can share ephemeral stories. Content must adhere to our community guidelines. DIS-COVER reserves the right to remove any content that is deemed inappropriate.
        </Text>

        <Text style={styles.sectionTitle}>4. Gig Marketplace & Chat</Text>
        <Text style={styles.text}>
          The marketplace allows students to offer and request services (Gigs). All negotiations happen through the Gig Chat. DIS-COVER provides the platform but is not responsible for the actual delivery of services or payments.
        </Text>

        <Text style={styles.sectionTitle}>5. User-Generated Content</Text>
        <Text style={styles.text}>
          You retain ownership of the content you post but grant DIS-COVER a license to host and display it. You are solely responsible for your content.
        </Text>

        <Text style={styles.sectionTitle}>6. Prohibited Content</Text>
        <Text style={styles.text}>
          Harassment, hate speech, illegal activities, and adult content are strictly prohibited. Violators will face account suspension or deletion.
        </Text>

        <Text style={styles.sectionTitle}>7. No Payment Guarantees</Text>
        <Text style={styles.text}>
          DIS-COVER does not handle financial transactions between users. We do not guarantee payment for gigs. Users are advised to handle payments through trusted external methods.
        </Text>

        <Text style={styles.sectionTitle}>8. Moderation & Reporting</Text>
        <Text style={styles.text}>
          Users can report inappropriate content or behavior. Our team reviews all reports and takes necessary actions to maintain a safe community.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.text}>
          For any legal inquiries, please contact our admin team at admin@dis-cover.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  backButton: { padding: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  content: { padding: 20 },
  lastUpdated: { fontSize: 12, color: '#999', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 24, marginBottom: 8 },
  text: { fontSize: 14, color: '#444', lineHeight: 22 },
});
