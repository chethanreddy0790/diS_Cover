import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#3B5BFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>
        
        <Text style={styles.sectionTitle}>1. Data We Collect</Text>
        <Text style={styles.text}>
          We collect information that you provide to us directly, such as your name, email address, profile photo, and college affiliation. We also collect the content you generate, including posts, gigs, stories, comments, and chat messages.
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
        <Text style={styles.text}>
          We use your data to provide and improve our services, facilitate communication between users, and ensure the safety and security of our community. This includes personalized event recommendations and marketplace services.
        </Text>

        <Text style={styles.sectionTitle}>3. Firebase & Cloudinary Usage</Text>
        <Text style={styles.text}>
          We use Firebase Auth for secure authentication and Firestore for our real-time database. All images uploaded to the platform are stored and optimized via Cloudinary.
        </Text>

        <Text style={styles.sectionTitle}>4. Visibility of Content</Text>
        <Text style={styles.text}>
          Posts, gigs, and public stories are visible to all registered users within the DIS-COVER community. Your profile information, such as your name and college, is also visible to other users.
        </Text>

        <Text style={styles.sectionTitle}>5. Chat & Message Privacy</Text>
        <Text style={styles.text}>
          Gig chat messages are private between the participants. However, messages may be reviewed by moderators if reported for violating our community guidelines.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Security</Text>
        <Text style={styles.text}>
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.sectionTitle}>7. Data Deletion</Text>
        <Text style={styles.text}>
          You have the right to request the deletion of your account and all associated data. You can initiate this request through the Settings screen.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact Us</Text>
        <Text style={styles.text}>
          If you have any questions about this Privacy Policy, please contact us at privacy@dis-cover.app
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
