import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  TextInput as RNTextInput,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGigStore } from '../../store/useGigStore';
import { useStore } from '../../store/useStore';
import { resolveUserAvatar } from '../../services/serviceUtils';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { UserDisplayName } from '../../components/UserDisplayName';

const { width } = Dimensions.get('window');

import AppMediaImage from '../../components/AppMediaImage';

export default function GigDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const publishedGigs = useGigStore((state) => state.publishedGigs);
  const currentUser = useStore((state) => state.currentUser);
  const toggleSaveGig = useStore((state) => state.toggleSaveGig);

  const gig = useMemo(() => publishedGigs.find((g) => g.id === id), [publishedGigs, id]);
  const isSaved = currentUser?.savedGigs?.includes(id || '');

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const userId = currentUser?.id || (currentUser as any)?.uid;

  if (!gig) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Gig not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleContact = () => {
    router.push({
      pathname: '/contact-seller',
      params: {
        gigId: gig.id,
        gigTitle: gig.title,
        sellerName: gig.sellerName,
        sellerRole: gig.sellerRole,
        sellerRating: gig.sellerRating,
        sellerId: gig.createdBy?.id,
      },
    });
  };

  const handleNavigateToProfile = () => {
    const sellerId = gig.createdBy?.id;
    if (!sellerId) {
      console.warn("[ProfileNav] missing sellerId");
      return;
    }
    console.log("[ProfileNav] opening seller profile:", sellerId);
    router.push(`/user-profile/${sellerId}`);
  };

  const handleReport = async () => {
    if (!reportReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }

    setIsReporting(true);
    try {
      const reportId = `gig_${gig?.id}_${userId}_${Date.now()}`;
      const reportData = {
        reportId,
        targetType: "gig",
        targetId: gig?.id,
        targetOwnerId: gig?.createdBy?.id,
        reporterId: userId,
        reporterName: currentUser?.username || "User",
        reason: reportReason,
        details: reportDetails,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'reports', reportId), reportData);
      console.log("[Report] submitted:", "gig", gig?.id);
      Alert.alert("Report Submitted", "Thank you for helping keep our community safe. We will review this gig shortly.");
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch (error) {
      console.error("[Report] Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const deleteGig = useGigStore((state) => state.deleteGig);

  const handleDeleteGig = () => {
    Alert.alert(
      "Delete Gig",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (gig) {
                await deleteGig(gig.id);
                router.back();
              }
            } catch (error) {
              console.error("[DeleteGig] error:", error);
              Alert.alert("Error", "Failed to delete gig. Please try again.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Poster Header Style - Matching Events */}
        <View style={styles.posterContainer}>
          <AppMediaImage 
            uri={gig.image || 'https://via.placeholder.com/800'} 
            type="gig" 
            mode="detail" 
            aspectRatio={gig.imageAspectRatio}
            style={styles.poster} 
          />
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.headerNav}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Feather name="arrow-left" size={24} color="#111" />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={styles.backButton} onPress={() => setShowReportModal(true)}>
                  <Feather name="flag" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => toggleSaveGig(gig.id)}
                >
                  <Feather 
                    name="bookmark" 
                    size={20} 
                    color={isSaved ? "#3B5BFF" : "#111"} 
                    fill={isSaved ? "#3B5BFF" : "transparent"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.tagsRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>GIG OPPORTUNITY</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{gig.priceLabel}</Text>
            </View>
          </View>

          <Text style={styles.title}>{gig.title}</Text>
          
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Feather name="map-pin" size={20} color="#3B5BFF" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{gig.location}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Feather name="briefcase" size={20} color="#3B5BFF" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Company</Text>
                <Text style={styles.infoValue}>{gig.company}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this Role</Text>
            <Text style={styles.description}>{gig.description}</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
               <Text style={styles.sectionTitle}>Posted by</Text>
               <View style={styles.ratingBadge}>
                  <Feather name="star" size={16} color="#F4B400" fill="#F4B400" />
                  <Text style={styles.ratingText}>{gig.rating}</Text>
               </View>
            </View>
            <TouchableOpacity 
              style={styles.organizerCard}
              onPress={handleNavigateToProfile}
            >
              <View style={styles.organizerAvatar}>
                <Text style={styles.organizerInitials}>{gig.companyMark}</Text>
              </View>
              <View>
                <UserDisplayName 
                  userId={gig.createdBy?.id} 
                  fallbackName={gig.sellerName} 
                  style={styles.organizerName} 
                />
                <Text style={styles.organizerRole}>{gig.sellerRole}</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 120 }}/>
        </View>
      </ScrollView>

      {/* Floating Action Bar - Matching Events */}
      <View style={styles.floatingBar}>
        <View style={styles.actionButtonsRow}>
          {gig.createdBy?.id === userId && (
            <>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDeleteGig}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={20} color="#E53E3E" />
              </TouchableOpacity>
              {/* Note: Edit for gigs is not implemented in store yet, but we add the button for UI consistency */}
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => router.push(`/create-gig?id=${gig.id}`)}
                activeOpacity={0.8}
              >
                <Feather name="edit-2" size={20} color="#3B5BFF" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Text style={styles.contactButtonText}>Apply / Contact Seller</Text>
            <Feather name="arrow-up-right" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Gig</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Feather name="x" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Why are you reporting this gig?</Text>
              
              {["Spam", "Harassment", "Scam/Fraud", "Inappropriate content", "False information", "Other"].map((reason) => (
                <TouchableOpacity 
                  key={reason} 
                  style={[styles.reasonOption, reportReason === reason && styles.reasonOptionActive]}
                  onPress={() => setReportReason(reason)}
                >
                  <View style={[styles.radioCircle, reportReason === reason && styles.radioCircleActive]}>
                    {reportReason === reason && <View style={styles.radioInner} />}
                  </View>
                  <Text style={[styles.reasonText, reportReason === reason && styles.reasonTextActive]}>{reason}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>Additional details (optional)</Text>
              <RNTextInput
                style={styles.detailsInput}
                placeholder="Tell us more..."
                multiline
                numberOfLines={4}
                value={reportDetails}
                onChangeText={setReportDetails}
              />

              <TouchableOpacity 
                style={[styles.reportSubmitBtn, (!reportReason || isReporting) && styles.reportSubmitBtnDisabled]}
                onPress={handleReport}
                disabled={!reportReason || isReporting}
              >
                {isReporting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.reportSubmitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: { fontSize: 18, color: '#64748B' },
  backLink: { marginTop: 16, color: '#3B5BFF', fontWeight: '600' },
  
  posterContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#000',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentOverlay: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#3B5BFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priceBadge: {
    backgroundColor: '#3B5BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111',
    lineHeight: 40,
    marginBottom: 24,
  },
  infoCards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    padding: 16,
    borderRadius: 16,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0D3750',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  organizerInitials: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  organizerRole: {
    fontSize: 14,
    color: '#666',
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#3B5BFF',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    gap: 12,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  modalBody: {
    padding: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F7F9FC',
  },
  reasonOptionActive: {
    backgroundColor: 'rgba(59, 91, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 91, 255, 0.2)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#B8BED4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioCircleActive: {
    borderColor: '#3B5BFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B5BFF',
  },
  reasonText: {
    fontSize: 15,
    color: '#444',
  },
  reasonTextActive: {
    color: '#111',
    fontWeight: '600',
  },
  detailsInput: {
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#111',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  reportSubmitBtn: {
    backgroundColor: '#E53E3E',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportSubmitBtnDisabled: {
    backgroundColor: '#F0F2F5',
  },
  reportSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
