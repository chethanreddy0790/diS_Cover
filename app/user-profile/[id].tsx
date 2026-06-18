import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '../../components/common/LoadingState';
import { useLocalSearchParams, router } from 'expo-router';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useStore } from '../../store/useStore';
import { getUserAvatar, getUsername } from '../../utils/userUtils';
import AppMediaImage from '../../components/AppMediaImage';

const { width } = Dimensions.get('window');

export default function UserProfileScreen() {
  const { id, fallbackName, fallbackAvatar } = useLocalSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [gigs, setGigs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'gigs'>('posts');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;
      try {
        console.log("[ProfileNav] fetching profile data for:", id);
        
        // Fetch User Doc
        const userDoc = await getDoc(doc(db, 'users', id as string));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          // Fallback if user doc missing but we have some info from navigation
          setUser({
            id,
            username: fallbackName || "Explorer",
            image: fallbackAvatar,
            isFallback: true
          });
        }

        // Fetch Events
        const eventsQuery = query(
          collection(db, 'events'),
          where('createdBy.id', '==', id),
          orderBy('createdAt', 'desc')
        );
        const eventsSnap = await getDocs(eventsQuery);
        const eventsData = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setEvents(eventsData);

        // Fetch Gigs
        const gigsQuery = query(
          collection(db, 'gigs'),
          where('createdBy.id', '==', id),
          orderBy('createdAt', 'desc')
        );
        const gigsSnap = await getDocs(gigsQuery);
        const gigsData = gigsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setGigs(gigsData);

      } catch (error) {
        console.error("[UserProfile] Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  if (loading) {
    return <LoadingState label="Fetching profile details..." />;
  }

  const avatarUrl = getUserAvatar(user);
  const displayName = getUsername(user);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
           <Text style={{ fontSize: 18, fontWeight: '600', color: '#111' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <AppMediaImage 
              uri={avatarUrl} 
              type="profile" 
              mode="thumbnail" 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {user.username && <Text style={styles.username}>@{user.username}</Text>}
          
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.designation || "Explorer"}</Text>
            </View>
            <View style={{ width: 8 }} />
            <View style={[styles.badge, { backgroundColor: '#F0F2F5' }]}>
              <Text style={[styles.badgeText, { color: '#666' }]}>{user.collegeName || "Institution"}</Text>
            </View>
          </View>
        </View>

        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{user.bio}</Text>
          </View>
        )}

        <View style={styles.tabsRow}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts ({events.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'gigs' && styles.activeTab]} 
            onPress={() => setActiveTab('gigs')}
          >
            <Text style={[styles.tabText, activeTab === 'gigs' && styles.activeTabText]}>Gigs ({gigs.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {activeTab === 'posts' ? (
            events.length > 0 ? (
              events.map((event) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={styles.card}
                  onPress={() => router.push(`/event-details/${event.id}`)}
                >
                  {event.image ? (
                    <AppMediaImage 
                      uri={event.image} 
                      type="event" 
                      mode="thumbnail" 
                      aspectRatio={event.imageAspectRatio}
                      style={styles.cardImage} 
                    />
                  ) : null}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {event.title || event.name || "Untitled Post"}
                    </Text>
                    <Text style={styles.cardText} numberOfLines={2}>
                      {event.description || "No description available"}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {event.venue || event.location || "No location"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No posts yet.</Text>
            )
          ) : (
            gigs.length > 0 ? (
              gigs.map((gig) => (
                <TouchableOpacity 
                  key={gig.id} 
                  style={styles.card}
                  onPress={() => router.push(`/gig-details/${gig.id}`)}
                >
                  {gig.image ? (
                    <AppMediaImage 
                      uri={gig.image} 
                      type="gig" 
                      mode="thumbnail" 
                      aspectRatio={gig.imageAspectRatio}
                      style={styles.cardImage} 
                    />
                  ) : null}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>
                      {gig.title || "Untitled Gig"}
                    </Text>
                    <Text style={styles.cardText} numberOfLines={2}>
                      {gig.description || "No description available"}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {gig.priceLabel || (gig.price ? `₹${gig.price}` : "Price not mentioned")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>No gigs yet.</Text>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  iconButton: { padding: 8 },
  topTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  content: { padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    borderWidth: 2,
    borderColor: '#3B5BFF',
    marginBottom: 16,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 56 },
  name: { fontSize: 24, fontWeight: '800', color: '#111', marginBottom: 4 },
  username: { fontSize: 16, color: '#666', marginBottom: 16 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { color: '#3B5BFF', fontSize: 12, fontWeight: '700' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  bio: { fontSize: 16, color: '#444', lineHeight: 24 },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B5BFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#3B5BFF',
  },
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAED',
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F7F9FC',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    fontSize: 12,
    color: '#3B5BFF',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 14,
  },
  initialsContainer: {
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
  },
  backBtn: { marginTop: 20, padding: 12, backgroundColor: '#3B5BFF', borderRadius: 8 },
  backBtnText: { color: '#FFF', fontWeight: '600' },
});
