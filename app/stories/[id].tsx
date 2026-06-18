import React, { useCallback, useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar,
  Animated,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useStore } from '../../store/useStore';
import { useStoryStore } from '../../store/useStoryStore';
import { Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { db } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserDisplayName } from '../../components/UserDisplayName';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds

import AppMediaImage from '../../components/AppMediaImage';

export default function StoryViewerScreen() {
  const { id: userId } = useLocalSearchParams();
  const { currentUser, registeredUsers } = useStore();
  const { stories, recordStoryView, deleteStory } = useStoryStore();
  
  // Get all stories for this user
  const userStories = stories.filter(s => s.userId === userId).sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [storyViewers, setStoryViewers] = useState<any[]>([]);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const currentStory = userStories[currentIndex];

  const isOwner = currentUser?.id === currentStory?.userId;
  const { subscribeToStoryViewers } = useStoryStore();

  useEffect(() => {
    if (showViewers && currentStory?.id && isOwner) {
      const unsubscribe = subscribeToStoryViewers(currentStory.id, (viewers) => {
        setStoryViewers(viewers);
      });
      return () => unsubscribe();
    }
  }, [showViewers, currentStory?.id, isOwner]);

  const handleNext = useCallback(() => {
    setCaptionExpanded(false);
    if (currentIndex < userStories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  }, [currentIndex, userStories.length]);

  useEffect(() => {
    if (currentStory && currentUser) {
      recordStoryView(currentStory.id);
    }
  }, [currentStory, currentUser, recordStoryView]);

  useEffect(() => {
    if (!currentStory) return;

    // Start progress animation
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });

    return () => progress.stopAnimation();
  }, [currentIndex, currentStory, handleNext, progress]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Could potentially go to previous user's story here if we wanted to be fancy
      setCurrentIndex(0);
    }
  };

  const handleDeleteStory = () => {
    if (!currentStory) return;
    
    Alert.alert(
      "Delete Story",
      "Are you sure you want to delete this story?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteStory(currentStory.id);
            // If there are more stories, go to next, else return
            if (userStories.length > 1) {
              handleNext();
            } else {
              router.back();
            }
          } 
        }
      ]
    );
  };

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleReport = async () => {
    if (!reportReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }

    setIsReporting(true);
    try {
      const reportId = `story_${currentStory?.id}_${currentUser?.id}_${Date.now()}`;
      const reportData = {
        reportId,
        targetType: "story",
        targetId: currentStory?.id,
        targetOwnerId: currentStory?.userId,
        reporterId: currentUser?.id,
        reporterName: currentUser?.username || "User",
        reason: reportReason,
        details: reportDetails,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'reports', reportId), reportData);
      console.log("[Report] submitted story:", currentStory?.id);
      Alert.alert("Report Submitted", "Thank you for helping keep our community safe. We will review this story shortly.");
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

  const handleTap = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (!currentStory) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Blurred Background */}
      <View style={StyleSheet.absoluteFill}>
        <Image 
          source={{ uri: currentStory.media }} 
          style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} 
          blurRadius={50}
        />
      </View>
      
      {/* Media Content */}
      <AppMediaImage 
        uri={currentStory.media} 
        type="story" 
        mode="detail" 
        aspectRatio={currentStory.imageAspectRatio}
        style={styles.media} 
      />

      {/* Overlay controls */}
      <TouchableOpacity 
        style={styles.touchOverlay} 
        activeOpacity={1} 
        onPress={handleTap}
      >
        <SafeAreaView style={styles.safeArea}>
          
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {userStories.map((_, index) => (
              <View key={index} style={styles.progressTrack}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: index === currentIndex 
                        ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                        : index < currentIndex ? '100%' : '0%'
                    }
                  ]} 
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarOutline}>
                <Image 
                  source={{ uri: currentStory.media }} // Fallback or real user avatar if available
                  style={styles.miniAvatar} 
                />
              </View>
              <View>
                <UserDisplayName 
                  userId={currentStory.userId} 
                  fallbackName={currentStory.username} 
                  style={styles.username} 
                />
                <Text style={styles.timestamp}>
                  {formatDistanceToNow(new Date(currentStory.createdAt))} ago
                </Text>
              </View>
              {currentStory.userRole && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{currentStory.userRole}</Text>
                </View>
              )}
            </View>
             <View style={styles.headerActions}>
               <TouchableOpacity onPress={() => setShowReportModal(true)} style={styles.actionBtn}>
                 <Feather name="flag" size={20} color="#FFF" />
               </TouchableOpacity>
               {isOwner && (
                 <TouchableOpacity onPress={handleDeleteStory} style={styles.actionBtn}>
                   <Feather name="trash-2" size={20} color="#FFF" />
                 </TouchableOpacity>
               )}
               <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                 <Feather name="x" size={24} color="#FFF" />
               </TouchableOpacity>
             </View>
          </View>

          {currentStory.caption ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setCaptionExpanded(!captionExpanded)}
              style={styles.captionContainer}
            >
              <Text
                style={styles.captionText}
                numberOfLines={captionExpanded ? undefined : 2}
              >
                {currentStory.caption}
              </Text>
              {currentStory.caption.length > 80 && (
                <Text style={styles.captionToggle}>
                  {captionExpanded ? 'less' : 'more'}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          {/* Viewer Info (Only for Owner) */}
          {isOwner && (
            <TouchableOpacity 
              style={styles.viewerFooter} 
              onPress={() => setShowViewers(true)}
            >
              <Feather name="eye" size={18} color="#FFF" />
              <Text style={styles.viewerCount}>
                {currentStory.viewerIds?.length || 0} {(currentStory.viewerIds?.length === 1) ? 'viewer' : 'viewers'}
              </Text>
            </TouchableOpacity>
          )}

        </SafeAreaView>
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>Report Story</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Feather name="x" size={24} color="#111" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Why are you reporting this story?</Text>
              
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

      {/* Viewers Modal */}
      <Modal
        visible={showViewers}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowViewers(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Views</Text>
              <TouchableOpacity onPress={() => setShowViewers(false)}>
                <Feather name="x" size={24} color="#111" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={storyViewers}
              keyExtractor={(viewer) => viewer.userId}
              renderItem={({ item: viewer }) => {
                return (
                  <View style={styles.viewerItem}>
                    <Image 
                      source={{ uri: viewer.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(viewer.name || 'User') + '&background=random' }} 
                      style={styles.viewerAvatar} 
                    />
                    <View>
                      <Text style={styles.viewerName}>{viewer.name || 'Unknown User'}</Text>
                      <Text style={styles.viewerRole}>
                        Viewed {viewer.viewedAt?.toDate ? formatDistanceToNow(viewer.viewedAt.toDate()) + ' ago' : 'Recently'}
                      </Text>
                    </View>
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptyViewers}>
                   <Text style={styles.emptyTextBlack}>No views yet</Text>
                </View>
              )}
              contentContainerStyle={{ padding: 24 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  media: {
    width: width,
    height: height,
    position: 'absolute',
  },
  touchOverlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarOutline: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFF',
    padding: 2,
  },
  miniAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  username: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
  roleBadge: {
    backgroundColor: 'rgba(59, 91, 255, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  roleText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  closeBtn: {
    padding: 8,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderRadius: 16,
  },
  captionText: {
    color: '#FFF',
    fontSize: 15,
    textAlign: 'left',
    fontWeight: '500',
    lineHeight: 22,
  },
  captionToggle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'left',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    marginBottom: 20,
  },
  backLink: {
    color: '#3B5BFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewerFooter: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  viewerCount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '60%',
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
  viewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  viewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  viewerRole: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 16,
  },
  emptyViewers: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTextBlack: {
    color: '#666',
    fontSize: 14,
  },
});
