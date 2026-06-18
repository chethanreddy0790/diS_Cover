import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileDrawer, { MenuItemKey } from '../components/drawer/ProfileDrawer';
import GigBottomNav from '../components/gig-space/GigBottomNav';
import GigCard from '../components/gig-space/GigCard';
import { useGigStore } from '../store/useGigStore';
import { useStore } from '../store/useStore';

const avatarSource = require('../assets/images/drawer-avatar.png');

const filters = ['All Gigs', 'UI/UX Design', 'Development'];

const normalizeText = (value: any): string =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const FILTER_KEYWORDS: Record<string, string[]> = {
  'UI/UX Design': ['ui', 'ux', 'ui/ux', 'design', 'figma', 'graphic'],
  'Development': ['development', 'developer', 'web development', 'app development', 'frontend', 'backend', 'coding', 'programming', 'software'],
};

export default function GigSpaceScreen() {
  const { currentUser, logout, toggleSaveGig } = useStore();
  const publishedGigs = useGigStore((state) => state.publishedGigs);
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.88, 430);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const drawerTranslateX = useRef(new Animated.Value(-460)).current;
  const [isDrawerMounted, setIsDrawerMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const subscribeToGigs = useGigStore((state) => state.subscribeToGigs);
  const subscribeToConversations = useGigStore((state) => state.subscribeToConversations);

  const { hasHydrated } = useStore();
  
  useEffect(() => {
    if (!hasHydrated) return;
    const unsubscribeGigs = subscribeToGigs();
    let unsubscribeConversations = () => {};
    if (currentUser?.id) {
      unsubscribeConversations = subscribeToConversations(currentUser.id);
    }
    return () => {
      unsubscribeGigs();
      unsubscribeConversations();
    };
  }, [hasHydrated, currentUser?.id, subscribeToGigs, subscribeToConversations]);

  const filteredGigs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const keywords = q.split(/\s+/).filter(k => k.length > 0);
    
    return publishedGigs.filter((gig) => {
      // Search Logic: Match ALL keywords across multiple fields
      const searchTarget = `
        ${gig.title} 
        ${gig.description} 
        ${gig.company} 
        ${gig.sellerRole} 
        ${gig.sellerName}
      `.toLowerCase();

      const matchesSearch = keywords.length === 0 || keywords.every(kw => searchTarget.includes(kw));

      // Category filter logic using keyword map
      let matchesFilter = true;
      if (selectedFilter !== 'All Gigs') {
        const filterKeywords = FILTER_KEYWORDS[selectedFilter] || [];
        const gigText = normalizeText(
          `${gig.title} ${gig.description} ${gig.sellerRole} ${gig.sellerName} ${gig.company}`
        );
        matchesFilter = filterKeywords.some(kw => gigText.includes(kw));
      }

      return matchesSearch && matchesFilter;
    });
  }, [publishedGigs, searchQuery, selectedFilter]);

  useEffect(() => {
    if (!isDrawerMounted) {
      drawerTranslateX.setValue(-drawerWidth - 24);
    }
  }, [drawerTranslateX, drawerWidth, isDrawerMounted]);

  const openDrawer = () => {
    setIsDrawerMounted(true);
    drawerTranslateX.setValue(-drawerWidth - 24);
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(drawerTranslateX, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeDrawer = (onClosed?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(drawerTranslateX, { toValue: -drawerWidth - 24, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsDrawerMounted(false);
        onClosed?.();
      }
    });
  };

  const handleDrawerMenuPress = (key: MenuItemKey) => {
    closeDrawer(() => {
      if (key === 'gig-space') return;
      if (key === 'events') { router.push('/(tabs)'); return; }
      if (key === 'settings') { router.push('/settings'); return; }
      if (key === 'profile') {
        router.push({ pathname: '/(tabs)/profile', params: { context: 'gig-space' } });
        return;
      }
    });
  };

  const handleLogout = () => {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={openDrawer}
            style={styles.brandRow}>
            <View style={styles.menuIconWrap}>
               <Feather name="menu" size={22} color="#111" />
            </View>
            <Text style={styles.brandText}>GigSpace</Text>
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.kicker}>OPPORTUNITIES</Text>
          <Text style={styles.heroTitle}>
            Find your next{'\n'}
            <Text style={styles.heroAccent}>creative gig.</Text>
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search roles or companies"
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                 <Feather name="x-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.filterRow}
          showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => {
            const isActive = filter === selectedFilter;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.85}
                onPress={() => setSelectedFilter(filter)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Top Gigs</Text>
            <Text style={styles.sectionSubtitle}>Tailored for your expertise</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/gigs-list')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsColumn}>
          {filteredGigs.map((gig) => (
            <GigCard
              key={gig.id}
              company={gig.company}
              companyMark={gig.companyMark}
              location={gig.location}
              priceLabel={gig.priceLabel}
              rating={gig.rating}
              title={gig.title}
              image={gig.image}
              imageAspectRatio={gig.imageAspectRatio}
              isSaved={currentUser?.savedGigs?.includes(gig.id)}
              onSavePress={() => toggleSaveGig(gig.id)}
              onSellerPress={() => {
                const sellerId = gig.createdBy?.id || (gig as any).userId || (gig as any).sellerId;
                if (sellerId) {
                  router.push(`/user-profile/${sellerId}`);
                } else {
                  console.warn("[GigSpace] No sellerId found for gig:", gig.id);
                }
              }}
              onContactPress={() =>
                router.push({
                  pathname: '/contact-seller',
                  params: {
                    gigId: gig.id,
                    gigTitle: gig.title,
                    sellerName: gig.sellerName,
                    sellerRole: gig.sellerRole,
                    sellerRating: gig.sellerRating,
                    sellerId: gig.createdBy?.id || (gig as any).userId || (gig as any).sellerId,
                  },
                })
              }
              onDetailsPress={() => router.push(`/gig-details/${gig.id}`)}
            />
          ))}
          {filteredGigs.length === 0 && (
            <View style={styles.emptyState}>
               <Feather name="search" size={48} color="#E2E8F0" />
               <Text style={styles.emptyText}>No matching gigs found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <GigBottomNav
        activeKey="home"
        onHomePress={() => undefined}
        onInboxPress={() => router.push('/inbox')}
        onCreatePress={() => router.push('/create-gig')}
        onAlertsPress={() => router.push('/(tabs)/alerts')}
        onProfilePress={() =>
          router.push({ pathname: '/(tabs)/profile', params: { context: 'gig-space' } })
        }
      />

      {isDrawerMounted && (
        <View pointerEvents="box-none" style={styles.drawerLayer}>
          <Animated.View style={[styles.drawerBackdrop, { opacity: overlayOpacity }]}>
            <Pressable onPress={() => closeDrawer()} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View
            style={[styles.drawerPanel, { width: drawerWidth, transform: [{ translateX: drawerTranslateX }] }]}>
            <ProfileDrawer
              onMenuPress={handleDrawerMenuPress}
              onLogoutPress={handleLogout}
              onUpgradePress={() => closeDrawer()}
            />
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 140,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F2F5',
  },
  heroSection: {
    paddingHorizontal: 24,
    marginTop: 32,
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
    lineHeight: 42,
    fontWeight: '800',
    color: '#111',
  },
  heroAccent: {
    color: '#3B5BFF',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
  filterRow: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  filterChip: {
    borderRadius: 12,
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B5BFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B5BFF',
  },
  cardsColumn: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerPanel: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
