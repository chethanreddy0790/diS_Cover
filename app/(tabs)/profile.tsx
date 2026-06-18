import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventCard } from '../../components/EventCard';
import GigCard from '../../components/gig-space/GigCard';
import { useStore } from '../../store/useStore';
import { useEventStore } from '../../store/useEventStore';
import { useGigStore } from '../../store/useGigStore';
import { getUserAvatar, getUsername } from '../../utils/userUtils';

const { width } = Dimensions.get('window');

import AppMediaImage from '../../components/AppMediaImage';

function ProfileScreen() {
  const { currentUser, updateBio, updateProfileImage, toggleSaveGig } = useStore();
  const { events, isLoading: eventsLoading } = useEventStore();
  const { publishedGigs, isLoading: gigsLoading } = useGigStore();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'gigs' | 'saved'>('posts');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(currentUser?.bio || '');

  const userId = currentUser?.id;

  // Memoized user data sections
  const myPosts = useMemo(() => events.filter(e => e.createdBy?.id === userId), [events, userId]);
  const myGigs = useMemo(() => publishedGigs.filter(g => g.createdBy?.id === userId), [publishedGigs, userId]);
  
  const savedEventsData = useMemo(() => 
    events.filter(e => Array.isArray(currentUser?.savedEvents) && currentUser.savedEvents.includes(e.id)),
    [events, currentUser?.savedEvents]
  );
  
  const savedGigsData = useMemo(() => 
    publishedGigs.filter(g => Array.isArray(currentUser?.savedGigs) && currentUser.savedGigs.includes(g.id)),
    [publishedGigs, currentUser?.savedGigs]
  );

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateProfileImage(result.assets[0].uri);
    }
  };

  const handleSaveBio = () => {
    updateBio(bioText);
    setIsEditingBio(false);
  };

  const renderAvatar = () => {
    const avatar = getUserAvatar(currentUser);

    return (
      <View style={styles.avatarWrapper}>
        <AppMediaImage 
          uri={avatar} 
          type="profile" 
          mode="thumbnail" 
          style={styles.avatar} 
        />
        <TouchableOpacity style={styles.cameraBadge} onPress={handlePickImage}>
          <Feather name="camera" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Header Background */}
        <View style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn}>
              <Feather name="settings" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          {renderAvatar()}
          
          <Text style={styles.userName}>{getUsername(currentUser)}</Text>
          <Text style={styles.userHandle}>@{currentUser?.username || 'explorer'}</Text>
          <Text style={styles.userRole}>{currentUser?.designation || 'Student'} • {currentUser?.collegeName || 'Community Member'}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myGigs.length}</Text>
              <Text style={styles.statLabel}>Gigs</Text>
            </View>
          </View>
        </View>

        {/* Bio Section */}
        <View style={styles.bioSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <TouchableOpacity onPress={() => isEditingBio ? handleSaveBio() : setIsEditingBio(true)}>
              <Feather name={isEditingBio ? "check" : "edit-2"} size={16} color="#3B5BFF" />
            </TouchableOpacity>
          </View>
          {isEditingBio ? (
            <TextInput
              style={styles.bioInput}
              value={bioText}
              onChangeText={setBioText}
              multiline
              autoFocus
              placeholder="Write something about yourself..."
            />
          ) : (
            <Text style={styles.bioText}>{currentUser?.bio || "Hey! I'm using Dis-cover to explore events and opportunities around campus."}</Text>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>My Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'gigs' && styles.activeTab]} 
            onPress={() => setActiveTab('gigs')}
          >
            <Text style={[styles.tabText, activeTab === 'gigs' && styles.activeTabText]}>My Gigs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]} 
            onPress={() => setActiveTab('saved')}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        <View style={styles.contentList}>
          {activeTab === 'posts' && (
            <>
              {myPosts.length > 0 ? (
                myPosts.map(post => (
                  <EventCard
                    key={post.id}
                    {...post}
                    date={`${post.date} • ${post.time}`}
                    location={post.venue}
                    imageAspectRatio={post.imageAspectRatio}
                    onPress={() => router.push(`/event-details/${post.id}`)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="plus-circle" size={48} color="#CBD5E0" />
                  <Text style={styles.emptyTitle}>No Posts Yet</Text>
                  <Text style={styles.emptySubtitle}>Events you create will appear here.</Text>
                  <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-event')}>
                    <Text style={styles.createBtnText}>Create Post</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {activeTab === 'gigs' && (
            <>
              {myGigs.length > 0 ? (
                myGigs.map(gig => (
                  <GigCard
                    key={gig.id}
                    {...gig}
                    imageAspectRatio={gig.imageAspectRatio}
                    isSaved={currentUser?.savedGigs?.includes(gig.id)}
                    onSavePress={() => toggleSaveGig(gig.id)}
                    onDetailsPress={() => router.push(`/gig-details/${gig.id}`)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="briefcase" size={48} color="#CBD5E0" />
                  <Text style={styles.emptyTitle}>No Gigs Yet</Text>
                  <Text style={styles.emptySubtitle}>Gigs you list will appear here.</Text>
                  <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/create-gig')}>
                    <Text style={styles.createBtnText}>List a Gig</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {[...savedEventsData, ...savedGigsData].length > 0 ? (
                <>
                  {savedEventsData.map(post => (
                    <EventCard
                      key={post.id}
                      {...post}
                      date={`${post.date} • ${post.time}`}
                      location={post.venue}
                      imageAspectRatio={post.imageAspectRatio}
                      onPress={() => router.push(`/event-details/${post.id}`)}
                    />
                  ))}
                  {savedGigsData.map(gig => (
                    <GigCard
                      key={gig.id}
                      {...gig}
                      imageAspectRatio={gig.imageAspectRatio}
                      isSaved={true}
                      onSavePress={() => toggleSaveGig(gig.id)}
                      onDetailsPress={() => router.push(`/gig-details/${gig.id}`)}
                    />
                  ))}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="bookmark" size={48} color="#CBD5E0" />
                  <Text style={styles.emptyTitle}>Nothing Saved</Text>
                  <Text style={styles.emptySubtitle}>Items you bookmark will appear here.</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#F0F4FF',
  },
  initialsContainer: {
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#3B5BFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#05070D',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 14,
    color: '#3B5BFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#05070D',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 30,
  },
  bioSection: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#05070D',
  },
  bioText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  bioInput: {
    fontSize: 15,
    color: '#05070D',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: 24,
  },
  tab: {
    marginRight: 30,
    paddingVertical: 15,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B5BFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#05070D',
    fontWeight: '700',
  },
  contentList: {
    padding: 24,
    gap: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#05070D',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createBtn: {
    backgroundColor: '#3B5BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProfileScreen;
