import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGigStore } from '../store/useGigStore';
import { useStore } from '../store/useStore';
import { auth } from '../services/firebase';
import type { GigConversation } from '../store/useStore';

const avatarSource = require('../assets/images/drawer-avatar.png');

type MessagePreview = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  image: any;
  unreadCount?: number;
  gigTitle?: string;
  sellerName?: string;
  receiverId?: string;
  isOnline?: boolean;
};

const formatConversationTime = (value: any) => {
  if (!value) return '';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const toPreview = (conversation: GigConversation, index: number, userPresences: any): MessagePreview => {
  const currentUser = useStore.getState().currentUser;
  const currentUserId = currentUser?.id || auth.currentUser?.uid;
  const receiverId = conversation.participants.find(id => id !== currentUserId) || conversation.sellerId;
  const isSelf = currentUserId === conversation.sellerId;
  const otherName = isSelf ? (conversation.buyerName || 'Buyer') : conversation.sellerName;
  const presence = receiverId ? userPresences[receiverId] : null;

  return {
    id: conversation.id,
    title: otherName,
    subtitle: conversation.lastMessage || 'Open chat to start',
    time: formatConversationTime(conversation.updatedAt),
    image: avatarSource,
    gigTitle: conversation.gigTitle,
    sellerName: conversation.sellerName,
    receiverId: receiverId,
    isOnline: presence?.isOnline || false,
  };
};

export default function InboxScreen() {
  const { gigConversations, subscribeToConversations, subscribeToPresence, userPresences, deleteConversation } = useGigStore();
  const { currentUser, hasHydrated } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const userId = currentUser?.id || auth.currentUser?.uid;
    if (!hasHydrated || !userId) return;
    const unsubscribe = subscribeToConversations(userId);
    return () => unsubscribe();
  }, [hasHydrated, currentUser?.id, subscribeToConversations]);

  useEffect(() => {
    const currentUserId = currentUser?.id || auth.currentUser?.uid;
    if (!currentUserId || gigConversations.length === 0) return;
    const partnerIds = Array.from(new Set(
      gigConversations.map(c => c.participants.find(id => id !== currentUserId)).filter(Boolean) as string[]
    ));
    if (partnerIds.length > 0) {
      const unsubscribe = subscribeToPresence(partnerIds);
      return () => unsubscribe();
    }
  }, [gigConversations, currentUser?.id, subscribeToPresence]);

  const messages = useMemo(() => {
    const liveMessages = gigConversations.map((c, i) => toPreview(c, i, userPresences));
    const query = searchQuery.trim().toLowerCase();
    if (!query) return liveMessages;
    return liveMessages.filter(m => m.title.toLowerCase().includes(query) || m.subtitle.toLowerCase().includes(query));
  }, [gigConversations, searchQuery, userPresences]);

  const openMessage = (message: any) => {
    if (isDeleteMode) { confirmDelete(message.id); return; }
    router.push({
      pathname: '/gig-space-conversation',
      params: { conversationId: message.id, sellerName: message.title, receiverId: message.receiverId, gigTitle: message.gigTitle },
    });
  };

  const confirmDelete = (conversationId: string) => {
    Alert.alert("Delete conversation?", "This chat will be removed from your messages.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(conversationId) }
    ]);
  };

  const handleDelete = async (conversationId: string) => {
    const userId = currentUser?.id || auth.currentUser?.uid;
    if (!userId || !conversationId) return;
    setIsDeletingId(conversationId);
    try { await deleteConversation(conversationId, userId); } catch (e) { Alert.alert("Error", "Could not delete conversation."); }
    finally { setIsDeletingId(null); }
  };

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
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Messages</Text>
            {isDeleteMode && <Text style={styles.deleteModeLabel}>Edit Mode</Text>}
          </View>
          <TouchableOpacity onPress={() => setIsDeleteMode(!isDeleteMode)} style={styles.headerIconButton}>
            <Feather name={isDeleteMode ? "x" : "edit-3"} size={22} color={isDeleteMode ? "#EF4444" : "#111"} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search messages..."
              placeholderTextColor="#999"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.messageList}>
            {messages.map((message) => (
              <TouchableOpacity
                key={message.id}
                activeOpacity={0.86}
                onPress={() => openMessage(message)}
                style={[styles.messageCard, isDeleteMode && styles.messageCardDeleteMode]}>
                <View style={styles.thumbnailWrap}>
                  <Image source={message.image} style={styles.thumbnail} />
                  {message.isOnline && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.messageBody}>
                  <View style={styles.messageTopLine}>
                    <Text numberOfLines={1} style={styles.messageTitle}>{message.title}</Text>
                    {!isDeleteMode && <Text style={styles.messageTime}>{message.time}</Text>}
                  </View>
                  <Text numberOfLines={1} style={styles.previewText}>{message.subtitle}</Text>
                </View>

                {isDeleteMode && (
                  <View style={styles.deleteIconWrap}>
                    {isDeletingId === message.id ? <ActivityIndicator size="small" color="#EF4444" /> : <Feather name="trash-2" size={20} color="#EF4444" />}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="message-square" size={48} color="#E2E8F0" />
              <Text style={styles.emptyText}>No conversations found.</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: { flex: 1, marginLeft: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  deleteModeLabel: { fontSize: 12, fontWeight: '700', color: '#EF4444', marginTop: 2 },
  headerIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F7FB', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { paddingHorizontal: 24, marginTop: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111' },
  content: { paddingHorizontal: 24, paddingBottom: 100 },
  messageList: { marginTop: 20 },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  messageCardDeleteMode: { borderColor: '#FEE2E2' },
  thumbnailWrap: { position: 'relative' },
  thumbnail: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F5F7FB' },
  onlineDot: { position: 'absolute', right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF' },
  messageBody: { flex: 1, marginLeft: 16 },
  messageTopLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  messageTitle: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1 },
  messageTime: { fontSize: 12, color: '#999' },
  previewText: { fontSize: 14, color: '#666' },
  deleteIconWrap: { width: 40, alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 16 },
  emptyText: { fontSize: 16, color: '#94A3B8' },
});
