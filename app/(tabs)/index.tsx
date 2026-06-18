import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '../../components/EventCard';
import { StoryAvatar } from '../../components/StoryAvatar';
import ProfileDrawer from '../../components/drawer/ProfileDrawer';
import { EVENT_CATEGORIES, type EventCategory } from '../../data/seedEvents';
import { useEventStore } from '../../store/useEventStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useGigStore } from '../../store/useGigStore';
import { useStore } from '../../store/useStore';
import { getUsername } from '../../utils/userUtils';

type DrawerMenuKey = 'events' | 'gig-space' | 'settings' | 'profile';

function HomeScreen() {
  const { currentUser, logout } = useStore();
  const { events, deleteEvent, subscribeToEvents } = useEventStore();
  const { stories, subscribeToStories } = useStoryStore();
  const subscribeToGigs = useGigStore((state) => state.subscribeToGigs);
  const { width } = useWindowDimensions();
  const userId = currentUser?.id || (currentUser as any)?.uid;
  const drawerWidth = Math.min(width * 0.88, 430);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const drawerTranslateX = useRef(new Animated.Value(-460)).current;
  const searchInputRef = useRef<TextInput>(null);
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('All');

  // Filter events based on search and category
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            e.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [events, searchQuery, selectedCategory]);

  const groupedStories = useMemo(() => {
    return stories.reduce((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = [];
      }
      acc[story.userId].push(story);
      return acc;
    }, {} as Record<string, typeof stories>);
  }, [stories]);

  const storyUsers = useMemo(() => Object.keys(groupedStories), [groupedStories]);

  useEffect(() => {
    const unsubEvents = subscribeToEvents();
    const unsubStories = subscribeToStories();
    const unsubGigs = subscribeToGigs();
    return () => {
      unsubEvents();
      unsubStories();
      unsubGigs();
    };
  }, [subscribeToEvents, subscribeToStories, subscribeToGigs]);

  useEffect(() => {
    if (!isDrawerMounted) {
      drawerTranslateX.setValue(-drawerWidth - 24);
    }
  }, [drawerTranslateX, drawerWidth, isDrawerMounted]);

  const handleStoryPress = (userId: string) => {
    router.push(`/stories/${userId}`);
  };

  const handleCreateStory = () => {
    router.push('/create-story');
  };

  const handleEditEvent = (id: string) => {
    router.push(`/create-event?id=${id}`);
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to remove this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEvent(id).catch((err) => {
              Alert.alert('Error', 'Could not delete event. Please try again.');
              console.error('[HomeScreen] deleteEvent failed:', err?.message);
            });
          },
        },
      ]
    );
  };

  const handleEventPress = (id: string) => {
    router.push(`/event-details/${id}`);
  };

  const openDrawer = () => {
    setIsDrawerMounted(true);
    drawerTranslateX.setValue(-drawerWidth - 24);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(drawerTranslateX, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = (onClosed?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(drawerTranslateX, {
        toValue: -drawerWidth - 24,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsDrawerMounted(false);
        onClosed?.();
      }
    });
  };

  const handleDrawerMenuPress = (key: DrawerMenuKey) => {
    closeDrawer(() => {
      if (key === 'events') {
        router.push('/(tabs)');
        return;
      }

      if (key === 'gig-space') {
        router.push('/gig-space');
        return;
      }

      if (key === 'settings') {
        router.push('/settings');
        return;
      }

      if (key === 'profile') {
        router.push('/(tabs)/profile');
        return;
      }

      Alert.alert('Settings', 'This section will be connected next.');
    });
  };

  const handleDrawerLogout = () => {
    closeDrawer(() => {
      void (async () => {
        try {
          await logout();
          router.replace('/');
        } catch (error) {
          console.error('Logout failed:', error);
        }
      })();
    });
  };

  const handleUpgradePress = () => {
    closeDrawer(() => {
      Alert.alert('Go Premium', 'Premium upgrade flow will be connected next.');
    });
  };

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openDrawer}
            style={styles.iconButton}>
            <Feather name="menu" size={22} color="#111" />
          </TouchableOpacity>

          <Text style={styles.greeting}>Hello, {getUsername(currentUser)} 👋</Text>
          <Text style={styles.subtitle}>{"Discover what's happening"}</Text>
        </View>

        <View style={styles.headerIcons}>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search events, venues..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
              <Feather name="x-circle" size={16} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {EVENT_CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              activeOpacity={0.8}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}>
          <View style={styles.addStoryContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const myStories = userId ? groupedStories[userId] : [];
                if (myStories && myStories.length > 0) {
                  handleStoryPress(userId!);
                } else {
                  handleCreateStory();
                }
              }}>
              <View
                style={[
                  styles.addStoryButton,
                  (userId && groupedStories[userId]?.length > 0) &&
                    styles.activeStoryBorder,
                ]}>
                {currentUser?.image ? (
                  <Image source={{ uri: currentUser.image }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Feather name="user" size={24} color="#CBD5E0" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.plusBadge}
              onPress={handleCreateStory}
              activeOpacity={0.9}>
              <Feather name="plus" size={12} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.storyTitle}>{"Your Story"}</Text>
          </View>

          {storyUsers.filter((uid) => uid !== userId).map((userId) => {
            const userStories = groupedStories[userId];
            const latestStory = userStories[0];
            return (
              <StoryAvatar
                key={userId}
                id={userId}
                image={latestStory.media}
                title={latestStory.username} // Keep this as initial, but StoryAvatar should ideally use UserDisplayName
                hasUnseen={true}
                onPress={() => handleStoryPress(userId)}
              />
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{"Up Next"}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item: event }) => (
          <View style={styles.eventCardWrapper}>
            <EventCard
              id={event.id}
              title={event.title}
              category={event.category}
              date={`${event.date} • ${event.time}`}
              location={event.venue}
              image={event.image}
              imageAspectRatio={event.imageAspectRatio}
              tags={event.tags || []}
              likes={event.likes || 0}
              comments={event.comments?.length || 0}
              onPress={() => handleEventPress(event.id)}
              isOwner={event.createdBy?.id === userId}
              onEdit={() => handleEditEvent(event.id)}
              onDelete={() => handleDeleteEvent(event.id)}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={() => (
           <View style={styles.emptyState}>
             <Feather name="search" size={48} color="#CBD5E0" />
             <Text style={styles.emptyTitle}>No events found</Text>
             <Text style={styles.emptySubtitle}>Try adjusting your search or category filters.</Text>
           </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isDrawerMounted ? (
        <View pointerEvents="box-none" style={styles.drawerLayer}>
          <Animated.View style={[styles.drawerBackdrop, { opacity: overlayOpacity }]}>
            <Pressable onPress={() => closeDrawer()} style={StyleSheet.absoluteFill} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawerPanel,
              {
                width: drawerWidth,
                transform: [{ translateX: drawerTranslateX }],
              },
            ]}>
            <ProfileDrawer
              onMenuPress={handleDrawerMenuPress}
              onLogoutPress={handleDrawerLogout}
              onUpgradePress={handleUpgradePress}
            />
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerMain: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111',
  },
  clearSearch: {
    padding: 6,
  },
  categoryScroll: {
    gap: 8,
    paddingRight: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8EAED',
  },
  categoryChipActive: {
    backgroundColor: '#3B5BFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  storiesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  addStoryContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  addStoryButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#3B5BFF',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 2,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  activeStoryBorder: {
    borderStyle: 'solid',
    borderColor: '#3B5BFF',
    borderWidth: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8EAED',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#3B5BFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  storyTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#111',
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  eventCardWrapper: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    elevation: 30,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.24)',
  },
  drawerPanel: {
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default HomeScreen;
