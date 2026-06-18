import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import SellerProfileCard from '../components/gig-space/SellerProfileCard';
import { useGigStore } from '../store/useGigStore';
import { useStore } from '../store/useStore';
import { auth } from '../services/firebase';

const { width } = Dimensions.get('window');
const timelineOptions = ['1 Week', '2 Weeks', '1 Month'];

export default function ContactSellerScreen() {
  const { sendGigInquiry } = useGigStore();
  const { currentUser, hasHydrated } = useStore();
  
  const params = useLocalSearchParams<{
    gigId?: string;
    gigTitle?: string;
    sellerName?: string;
    sellerRole?: string;
    sellerRating?: string;
    sellerId?: string;
  }>();

  const gigId = params.gigId;
  const gigTitle = params.gigTitle || '';
  const sellerName = params.sellerName || '';
  const sellerRole = params.sellerRole || '';
  const sellerRating = params.sellerRating || '';
  const sellerId = params.sellerId;

  const [message, setMessage] = useState('');
  const [budget, setBudget] = useState('');
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const cycleTimeline = () => {
    setTimelineIndex((current) => (current + 1) % timelineOptions.length);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter your project message first.');
      return;
    }

    if (!gigId || !sellerId) {
      Alert.alert('Error', 'Gig or Seller information is missing.');
      return;
    }

    const isHydrated = hasHydrated;
    let userId = currentUser?.id;

    if (!userId && auth.currentUser?.uid) {
      userId = auth.currentUser.uid;
    }

    if (!isHydrated || !userId) {
      Alert.alert("Session Loading", "Your profile is still synchronizing. Please wait.");
      return;
    }

    setIsSending(true);
    try {
      const conversationId = await sendGigInquiry({
        gigId,
        gigTitle,
        sellerName,
        sellerRole,
        sellerRating,
        sellerId,
        text: message.trim(),
      });

      if (conversationId) {
        router.push({
          pathname: '/message-sent-success',
          params: { gigTitle, sellerName, conversationId, receiverId: sellerId },
        });
      }
    } catch (error) {
      console.error('[ContactSeller] sendGigInquiry error:', error);
      Alert.alert('Error', 'Failed to send inquiry.');
    } finally {
      setIsSending(false);
    }
  };

  const isReady = hasHydrated && (!!currentUser?.id || !!auth.currentUser?.uid);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Seller</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <Text style={styles.kicker}>GIG SPACE</Text>
            <Text style={styles.heroTitle}>Discuss your project</Text>
          </View>

          <View style={styles.profileSection}>
            <SellerProfileCard userId={sellerId} name={sellerName} rating={sellerRating} role={sellerRole} />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Brief your requirements</Text>
              <TextInput
                multiline
                numberOfLines={6}
                placeholder="What do you need help with?"
                placeholderTextColor="#999"
                style={styles.messageInput}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Budget ($)</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  style={styles.singleLineInput}
                  value={budget}
                  onChangeText={setBudget}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Timeline</Text>
                <TouchableOpacity style={styles.timelineInput} onPress={cycleTimeline}>
                  <Text style={styles.timelineText}>{timelineOptions[timelineIndex]}</Text>
                  <Feather name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.attachmentBox} onPress={() => Alert.alert('Coming Soon')}>
              <Feather name="paperclip" size={20} color="#3B5BFF" />
              <Text style={styles.attachmentTitle}>Attach project brief or assets</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.floatingBar}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSend}
            disabled={isSending || !isReady}
            style={[styles.sendButton, (!isReady || isSending) && styles.sendButtonDisabled]}>
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.sendButtonText}>
                  {isReady ? 'Send Message' : 'Connecting...'}
                </Text>
                <Feather name="send" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  content: {
    paddingBottom: 120,
  },
  heroSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#3B5BFF',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
    letterSpacing: -0.5,
  },
  profileSection: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  fieldGroup: {
    marginTop: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  messageInput: {
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
    fontSize: 16,
    color: '#111',
  },
  rowFields: {
    flexDirection: 'row',
    gap: 16,
  },
  singleLineInput: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  timelineInput: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  attachmentBox: {
    marginTop: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3B5BFF',
    borderRadius: 16,
    backgroundColor: 'rgba(59, 91, 255, 0.05)',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
  },
  attachmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B5BFF',
  },
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
  sendButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B5BFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#3B5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
