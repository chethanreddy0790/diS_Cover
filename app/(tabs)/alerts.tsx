import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { useEventStore } from '../../store/useEventStore';

interface DerivedNotification {
  id: string;
  type: 'comment' | 'like';
  actorName: string;
  actorImage?: string;
  eventTitle: string;
  preview?: string;
  timestamp: string;
}

const timeAgo = (timestamp: string) => {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 0) return 'upcoming';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

function AlertsScreen() {
  const { currentUser, registeredUsers } = useStore();
  const { events } = useEventStore();

  const notifications = useMemo<DerivedNotification[]>(() => {
    if (!currentUser) return [];

    const userEvents = events.filter(e => e.createdBy?.id === currentUser.id);
    const items: DerivedNotification[] = [];

    for (const event of userEvents) {
      // Comments from other users
      for (const comment of event.comments) {
        if (comment.userId !== currentUser.id) {
          items.push({
            id: `c-${comment.id}`,
            type: 'comment',
            actorName: comment.userName,
            actorImage: registeredUsers.find(u => u.id === comment.userId)?.image,
            eventTitle: event.title,
            preview: comment.text,
            timestamp: comment.timestamp,
          });
        }
      }

      // Likes from other users
      for (const uid of event.likedBy) {
        if (uid !== currentUser.id) {
          const actor = registeredUsers.find(u => u.id === uid);
          items.push({
            id: `l-${event.id}-${uid}`,
            type: 'like',
            actorName: actor?.username ?? 'Someone',
            actorImage: actor?.image,
            eventTitle: event.title,
            timestamp: event.date,
          });
        }
      }
    }

    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [currentUser, events, registeredUsers]);

  const renderNotification = ({ item }: { item: DerivedNotification }) => (
    <View style={styles.notifRow}>
      {item.actorImage ? (
        <Image source={{ uri: item.actorImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Feather name="user" size={18} color="#A0AEC0" />
        </View>
      )}

      <View style={styles.notifContent}>
        <Text style={styles.notifText} numberOfLines={2}>
          <Text style={styles.bold}>{item.actorName}</Text>
          {item.type === 'comment' ? ' commented on ' : ' liked '}
          <Text style={styles.bold}>{item.eventTitle}</Text>
        </Text>
        {item.preview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {'"'}{item.preview}{'"'}
          </Text>
        ) : null}
        <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
      </View>

      <View style={[
        styles.iconBadge,
        { backgroundColor: item.type === 'comment' ? 'rgba(59,91,255,0.1)' : 'rgba(255,59,91,0.1)' },
      ]}>
        <Feather
          name={item.type === 'comment' ? 'message-circle' : 'heart'}
          size={14}
          color={item.type === 'comment' ? '#3B5BFF' : '#FF3B5B'}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{"Alerts"}</Text>
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.iconContainer}>
            <Feather name="bell-off" size={32} color="#3B5BFF" />
          </View>
          <Text style={styles.emptyTitle}>{"No new alerts"}</Text>
          <Text style={styles.emptyDesc}>
            {"We'll notify you when someone interacts with your events or leaves a comment."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
  },
  badge: {
    marginLeft: 10,
    backgroundColor: '#3B5BFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8EAED',
    marginRight: 12,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifContent: {
    flex: 1,
    marginRight: 8,
  },
  notifText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#111',
  },
  preview: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  time: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 4,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});

export default AlertsScreen;
