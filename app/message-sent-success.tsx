import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const inquiryAvatarSource = require('../assets/images/drawer-avatar.png');

export default function MessageSentSuccessScreen() {
  const params = useLocalSearchParams<{
    gigTitle?: string;
    sellerName?: string;
    conversationId?: string;
    receiverId?: string;
  }>();

  const gigTitle = params.gigTitle || '';
  const sellerName = params.sellerName || '';
  const conversationId = params.conversationId;
  const receiverId = params.receiverId;

  const goToGigSpace = () => {
    router.replace('/gig-space');
  };

  const openConversation = () => {
    if (!conversationId) {
      router.push('/inbox');
      return;
    }

    router.push({
      pathname: '/gig-space-conversation',
      params: {
        conversationId,
        sellerName,
        receiverId,
        gigTitle,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={goToGigSpace}
          style={styles.closeButton}>
          <Feather name="x" size={34} color="#697489" />
        </TouchableOpacity>

        <Text style={styles.brandText}>diS_Cover</Text>

        <View style={styles.topBarSpacer} />
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.successWrap}>
          <View style={styles.successOuterRing}>
            <View style={styles.successInnerRing}>
              <View style={styles.successCore}>
                <Feather name="check" size={42} color="#FFFFFF" />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Message Sent!</Text>
        <Text style={styles.description}>
          Your inquiry has been successfully delivered to{' '}
          <Text style={styles.descriptionStrong}>{sellerName}</Text>. You will
          receive a notification when they respond.
        </Text>

        <View style={styles.inquiryCard}>
          <Image source={inquiryAvatarSource} style={styles.inquiryAvatar} />

          <View style={styles.inquiryContent}>
            <Text style={styles.inquiryLabel}>INQUIRY DETAILS</Text>
            <Text style={styles.inquiryTitle}>{gigTitle}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            onPress={openConversation}
            style={styles.inquiryAction}>
            <Feather name="mail" size={22} color="#2951F5" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={goToGigSpace}
          style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Back to Gig Space</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openConversation}
          style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View Conversations</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2951F5',
    letterSpacing: -0.6,
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 48,
  },
  successWrap: {
    alignItems: 'center',
    marginTop: 52,
  },
  successOuterRing: {
    width: 232,
    height: 232,
    borderRadius: 116,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D6DEFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 34,
    elevation: 14,
  },
  successInnerRing: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: '#E3E8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCore: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#3553EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 54,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '900',
    color: '#111111',
    textAlign: 'center',
    letterSpacing: -1.1,
  },
  description: {
    marginTop: 24,
    paddingHorizontal: 10,
    fontSize: 17,
    lineHeight: 42,
    color: '#383F51',
    textAlign: 'center',
  },
  descriptionStrong: {
    fontWeight: '800',
    color: '#111111',
  },
  inquiryCard: {
    marginTop: 60,
    borderRadius: 34,
    backgroundColor: '#F1F4F8',
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inquiryAvatar: {
    width: 84,
    height: 84,
    borderRadius: 22,
    marginRight: 18,
  },
  inquiryContent: {
    flex: 1,
    paddingRight: 12,
  },
  inquiryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2951F5',
    letterSpacing: 1.8,
  },
  inquiryTitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '800',
    color: '#111111',
  },
  inquiryAction: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    marginTop: 86,
    minHeight: 82,
    borderRadius: 999,
    backgroundColor: '#3553EC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3553EC',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2951F5',
  },
});
