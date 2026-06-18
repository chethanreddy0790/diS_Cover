import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput as RNTextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useStore } from '../../store/useStore';
import { useEventStore } from '../../store/useEventStore';
import { Input } from '../../components/Input';
import AppMediaImage from '../../components/AppMediaImage';
import { UserDisplayName } from '../../components/UserDisplayName';

const { width } = Dimensions.get('window');

const isUrl = (text: string): boolean => {
  try {
    const trimmed = text.trim();
    return /^https?:\/\//i.test(trimmed) || /^(www\.)/i.test(trimmed) || trimmed.includes('maps.google') || trimmed.includes('goo.gl');
  } catch {
    return false;
  }
};

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const events = useEventStore((state) => state.events);
  const currentUser = useStore((state) => state.currentUser);
  const toggleLike = useEventStore((state) => state.toggleLike);
  const addComment = useEventStore((state) => state.addComment);
  const toggleSaveEvent = useStore((state) => state.toggleSaveEvent);

  const event = events.find((e) => e.id === id);

  const [commentText, setCommentText] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  
  const userId = currentUser?.id || (currentUser as any)?.uid;
  const isLiked = Array.isArray(event?.likedBy) && userId ? event.likedBy.includes(userId) : false;
  const isSaved = Array.isArray(currentUser?.savedEvents) && event?.id ? currentUser.savedEvents.includes(event.id) : false;
  
  const handleToggleLike = () => {
    if (event) void toggleLike(event.id).catch((e) => console.error('[EventDetails] toggleLike:', e?.message));
  };

  const handleToggleSave = () => {
    if (event) toggleSaveEvent(event.id);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    if (event) {
      void addComment(event.id, commentText).catch((e) => console.error('[EventDetails] addComment:', e?.message));
      setCommentText('');
    }
  };

  const handleNavigateToProfile = (targetUserId: string) => {
    if (!targetUserId) {
      console.warn("[ProfileNav] missing userId");
      return;
    }
    console.log("[ProfileNav] opening user profile:", targetUserId);
    router.push(`/user-profile/${targetUserId}`);
  };

  const handleReport = async () => {
    if (!reportReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }

    setIsReporting(true);
    try {
      const reportId = `event_${event?.id}_${userId}_${Date.now()}`;
      const reportData = {
        reportId,
        targetType: "event",
        targetId: event?.id,
        targetOwnerId: event?.createdBy.id,
        reporterId: userId,
        reporterName: currentUser?.username || "User",
        reason: reportReason,
        details: reportDetails,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'reports', reportId), reportData);
      console.log("[Report] submitted:", "event", event?.id);
      Alert.alert("Report Submitted", "Thank you for helping keep our community safe. We will review this post shortly.");
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

  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const deleteComment = useEventStore((state) => state.deleteComment);
  const editComment = useEventStore((state) => state.editComment);

  const handleDeleteEvent = () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              if (event) {
                await deleteEvent(event.id);
                router.back();
              }
            } catch (error) {
              console.error("[DeleteEvent] error:", error);
              Alert.alert("Error", "Failed to delete post. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const handleCommentOptions = (comment: any) => {
    if (comment.userId !== userId) return;

    Alert.alert(
      "Comment Options",
      "Choose an action",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Edit", 
          onPress: () => {
            Alert.prompt(
              "Edit Comment",
              "Enter new text",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Save", 
                  onPress: (text) => {
                    if (text && text.trim() && event) {
                      editComment(event.id, comment.id, text.trim());
                    }
                  } 
                }
              ],
              "plain-text",
              comment.text
            );
          } 
        },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            if (event) deleteComment(event.id, comment.id);
          } 
        }
      ]
    );
  };

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text>Event not found!</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#3B5BFF' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView bounces={false} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Poster Header */}
          <View style={styles.posterContainer}>
            <AppMediaImage 
              uri={event.image} 
              type="event" 
              mode="detail" 
              aspectRatio={event.imageAspectRatio}
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
                  <TouchableOpacity style={styles.backButton} onPress={handleToggleSave}>
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

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.tagsRow}>
               <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{event.category}</Text>
               </View>
               {event.tags.map(tag => (
                  <Text key={tag} style={styles.tagText}>{"#"}{tag}</Text>
               ))}
            </View>

            <Text style={styles.title}>{event.title}</Text>
            
            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Feather name="calendar" size={20} color="#3B5BFF" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Date & Time</Text>
                  <Text style={styles.infoValue}>{event.date} • {event.time}</Text>
                </View>
              </View>
              <View style={[styles.infoCard, { flex: 1 }]}>
                <Feather name="map-pin" size={20} color="#3B5BFF" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Location</Text>
                  {isUrl(event.venue) ? (
                    <TouchableOpacity onPress={() => {
                      console.log('[EventLocation] opening:', event.venue);
                      Linking.openURL(event.venue.startsWith('http') ? event.venue : `https://${event.venue}`);
                    }}>
                      <Text style={[styles.infoValue, { color: '#3B5BFF', textDecorationLine: 'underline' }]} numberOfLines={3}>
                        {event.venue}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={[styles.infoValue, { flexWrap: 'wrap' }]}>{event.venue}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.deadlineWarning}>
              <Feather name="clock" size={16} color="#E53E3E" />
              <Text style={styles.deadlineText}>{"Deadline to register: "}{event.deadline}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>

            {event.rules && event.rules.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rules & Guidelines</Text>
                {event.rules.map((rule, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{rule}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                 <Text style={styles.sectionTitle}>Organizer</Text>
                 <TouchableOpacity style={styles.likeButton} onPress={handleToggleLike}>
                   <Feather name="heart" size={20} color={isLiked ? "#E53E3E" : "#666"} fill={isLiked ? "#E53E3E" : "transparent"} />
                   <Text style={[styles.likeText, isLiked && styles.likedText]}>{event.likes || 0}</Text>
                 </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={styles.organizerCard} 
                onPress={() => handleNavigateToProfile(event.createdBy.id)}
              >
                <View style={styles.organizerAvatar}>
                  <Text style={styles.organizerInitials}>{event.createdBy.name.charAt(0)}</Text>
                </View>
                <View>
                  <UserDisplayName 
                    userId={event.createdBy.id} 
                    fallbackName={event.createdBy.name} 
                    style={styles.organizerName} 
                  />
                  <Text style={styles.organizerRole}>{event.createdBy.role}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Contact Details (Task 6) */}
            {(event as any).contactDetails ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Details</Text>
                <View style={styles.contactCard}>
                  <Feather name="phone" size={18} color="#3B5BFF" />
                  {isUrl((event as any).contactDetails) ? (
                    <TouchableOpacity onPress={() => {
                      console.log('[EventContact] opening:', (event as any).contactDetails);
                      const url = (event as any).contactDetails;
                      Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
                    }}>
                      <Text style={styles.contactLink}>{(event as any).contactDetails}</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.contactText}>{(event as any).contactDetails}</Text>
                  )}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Comments ({event.comments?.length || 0})</Text>
              {event.comments.map((comment) => (
                <TouchableOpacity 
                  key={comment.id} 
                  style={styles.commentCard}
                  onLongPress={() => handleCommentOptions(comment)}
                  activeOpacity={0.7}
                >
                  <View style={styles.commentHeader}>
                    <TouchableOpacity onPress={() => handleNavigateToProfile(comment.userId)}>
                      <UserDisplayName 
                        userId={comment.userId} 
                        fallbackName={comment.userName} 
                        style={styles.commentUser} 
                      />
                    </TouchableOpacity>
                    <Text style={styles.commentTime}>{new Date(comment.timestamp).toLocaleDateString()}{comment.edited ? ' (edited)' : ''}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </TouchableOpacity>
              ))}
              
              <View style={styles.addCommentContainer}>
                <Input
                  placeholder="Add a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  containerStyle={styles.commentInputContainer}
                  style={styles.commentInput}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]} 
                  onPress={handleAddComment}
                  disabled={!commentText.trim()}
                >
                  <Feather name="send" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={{ height: 100 }}/>
          </View>
        </ScrollView>

        {/* Floating Action Bar */}
        <View style={styles.floatingBar}>
          <View style={styles.actionButtonsRow}>
            {event.createdBy.id === userId && (
              <>
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={handleDeleteEvent}
                  activeOpacity={0.8}
                >
                  <Feather name="trash-2" size={20} color="#E53E3E" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => router.push(`/create-event?id=${event.id}`)}
                  activeOpacity={0.8}
                >
                  <Feather name="edit-2" size={20} color="#3B5BFF" />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity 
              style={[styles.registerButton, !event.registrationLink && styles.disabledButton]} 
              onPress={() => {
                if (event.registrationLink) {
                  import('expo-linking').then(Linking => Linking.openURL(event.registrationLink!));
                } else {
                  Alert.alert('No Link', 'This event does not have a registration link.');
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
              <Text style={styles.modalTitle}>Report Post</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Feather name="x" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Why are you reporting this post?</Text>
              
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
  },
  posterContainer: {
    width: '100%',
    aspectRatio: 1,
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
  content: {
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
  tagText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 20,
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
  deadlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  deadlineText: {
    color: '#E53E3E',
    fontSize: 14,
    fontWeight: '600',
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
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 20,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111',
    marginTop: 10,
    marginRight: 12,
  },
  bulletText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    flex: 1,
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
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  organizerInitials: {
    color: '#FFF',
    fontSize: 18,
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F7FB',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  contactText: {
    fontSize: 15,
    color: '#444',
    flex: 1,
    flexWrap: 'wrap',
  },
  contactLink: {
    fontSize: 15,
    color: '#3B5BFF',
    textDecorationLine: 'underline',
    flex: 1,
    flexWrap: 'wrap',
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
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
  registerButton: {
    flex: 1,
    backgroundColor: '#3B5BFF',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    shadowOpacity: 0.1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  likeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  likedText: {
    color: '#E53E3E',
  },
  commentCard: {
    backgroundColor: '#F7F9FC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  commentInputContainer: {
    flex: 1,
    marginBottom: 0,
  },
  commentInput: {
    marginBottom: 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0AEC0',
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
