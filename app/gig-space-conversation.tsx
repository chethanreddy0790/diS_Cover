import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Alert,
  Image,
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
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import ConversationMessageBubble from '../components/gig-space/ConversationMessageBubble';
import { useGigStore } from '../store/useGigStore';
import { useStore } from '../store/useStore';
import { auth } from '../services/firebase';
import { uploadImage } from '../services/storageUtils';

const sellerAvatarSource = require('../assets/images/drawer-avatar.png');

const formatMessageTime = (value: any) => {
  if (!value) return '';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const formatLastSeen = (value: any) => {
  if (!value) return 'OFFLINE';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'OFFLINE';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ONLINE';
  if (mins < 60) return `${mins}M AGO`;
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function GigSpaceConversationScreen() {
  const { 
    activeMessages, 
    subscribeToMessages, 
    sendGigConversationMessage, 
    markMessagesAsRead,
    setTypingState,
    subscribeToPresence,
    userPresences,
    gigConversations
  } = useGigStore();
  const { currentUser, hasHydrated } = useStore();
  
  const params = useLocalSearchParams<{
    conversationId?: string;
    sellerName?: string;
    receiverId?: string;
    gigTitle?: string;
  }>();

  const [draftMessage, setDraftMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationId = params.conversationId;
  const sellerName = params.sellerName || 'Partner';
  const receiverId = params.receiverId;
  const currentUserId = currentUser?.id || auth.currentUser?.uid;

  const conversation = useMemo(() => gigConversations.find(c => c.id === conversationId), [gigConversations, conversationId]);
  const otherParticipantTyping = useMemo(() => {
    if (!conversation?.typing || !receiverId) return false;
    return conversation.typing[receiverId] === true;
  }, [conversation?.typing, receiverId]);

  const otherPresence = receiverId ? userPresences[receiverId] : null;

  const displayMessages = useMemo(() => {
    if (!currentUserId || !conversation?.deletedAtBy?.[currentUserId]) return activeMessages;
    const deletedAt = conversation.deletedAtBy[currentUserId];
    const deletedTime = deletedAt?.toDate ? deletedAt.toDate().getTime() : (typeof deletedAt === 'string' ? new Date(deletedAt).getTime() : 0);
    return activeMessages.filter(msg => {
      const msgTime = msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now();
      return msgTime > deletedTime;
    });
  }, [activeMessages, conversation?.deletedAtBy, currentUserId]);

  useEffect(() => {
    if (conversationId && hasHydrated && currentUserId) {
      const unsubscribe = subscribeToMessages(conversationId);
      return () => unsubscribe();
    }
  }, [conversationId, hasHydrated, currentUserId]);

  useEffect(() => {
    if (conversationId && currentUserId && activeMessages.length > 0) {
      markMessagesAsRead(conversationId, currentUserId);
    }
  }, [conversationId, currentUserId, activeMessages.length]);

  useEffect(() => {
    if (receiverId) {
      const unsubscribe = subscribeToPresence([receiverId]);
      return () => unsubscribe();
    }
  }, [receiverId]);

  useEffect(() => {
    return () => {
      if (conversationId && currentUserId) setTypingState(conversationId, currentUserId, false);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 150);
  }, [displayMessages.length, otherParticipantTyping]);

  const handleTyping = (text: string) => {
    setDraftMessage(text);
    if (conversationId && currentUserId) {
      setTypingState(conversationId, currentUserId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => { setTypingState(conversationId, currentUserId, false); }, 1500);
    }
  };

  const handleSend = async () => {
    if (!draftMessage.trim() || !conversationId || !receiverId || !currentUserId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTypingState(conversationId, currentUserId, false);
    try {
      await sendGigConversationMessage({ conversationId, text: draftMessage.trim(), receiverId });
      setDraftMessage('');
    } catch (e) { Alert.alert('Error', 'Could not send message.'); }
  };

  const handlePickImage = async () => {
    if (!conversationId || !receiverId || !currentUserId) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        const imageUrl = await uploadImage(result.assets[0].uri);
        await sendGigConversationMessage({ conversationId, text: '', receiverId, imageUrl, type: 'image' });
      }
    } catch (e) { Alert.alert('Error', 'Failed to upload image.'); }
    finally { setIsUploading(false); }
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
          
          <View style={styles.headerTitleContainer}>
             <View style={styles.avatarWrap}>
                <Image source={sellerAvatarSource} style={styles.avatar} />
                {otherPresence?.isOnline && <View style={styles.onlineDot} />}
             </View>
             <View style={styles.headerText}>
                <Text style={styles.headerName} numberOfLines={1}>{sellerName}</Text>
                <Text style={[styles.headerStatus, otherPresence?.isOnline && styles.headerStatusOnline]}>
                   {otherParticipantTyping ? 'Typing...' : (otherPresence?.isOnline ? 'Online' : formatLastSeen(otherPresence?.lastSeen))}
                </Text>
             </View>
          </View>

          <TouchableOpacity style={styles.headerIconButton} onPress={() => Alert.alert('Chat Info')}>
            <Feather name="more-vertical" size={20} color="#111" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef} 
          contentContainerStyle={styles.content} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {displayMessages.map((message, index) => {
            const isOutgoing = message.senderId === currentUserId;
            const isRead = message.readBy?.includes(receiverId || '');
            return (
              <View key={message.id || index} style={[styles.messageRow, isOutgoing ? styles.rowOutgoing : styles.rowIncoming]}>
                {message.type === 'image' && message.imageUrl ? (
                   <View style={[styles.imageMsg, isOutgoing ? styles.imgOutgoing : styles.imgIncoming]}>
                      <Image source={{ uri: message.imageUrl }} style={styles.chatImg} />
                   </View>
                ) : (
                   <ConversationMessageBubble text={message.text} variant={isOutgoing ? 'outgoing' : 'incoming'} />
                )}
                <View style={[styles.metaRow, isOutgoing ? styles.metaOutgoing : styles.metaIncoming]}>
                  <Text style={styles.timeText}>{formatMessageTime(message.createdAt)}</Text>
                  {isOutgoing && <MaterialIcons name="done-all" size={14} color={isRead ? "#3B5BFF" : "#94A3B8"} />}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.composer}>
          <TouchableOpacity style={styles.composerBtn} onPress={handlePickImage} disabled={isUploading}>
            {isUploading ? <ActivityIndicator size="small" color="#3B5BFF" /> : <Feather name="image" size={22} color="#666" />}
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Write a message..."
              placeholderTextColor="#999"
              style={styles.input}
              value={draftMessage}
              onChangeText={handleTyping}
              multiline
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendBtn, !draftMessage.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!draftMessage.trim()}
          >
            <Feather name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F7FB', justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F7FB' },
  onlineDot: { position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: '#FFFFFF' },
  headerText: { marginLeft: 12 },
  headerName: { fontSize: 16, fontWeight: '700', color: '#111' },
  headerStatus: { fontSize: 12, color: '#666', marginTop: 2 },
  headerStatusOnline: { color: '#22C55E', fontWeight: '600' },
  headerIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F7FB', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: 40 },
  messageRow: { marginBottom: 16, width: '100%' },
  rowIncoming: { alignItems: 'flex-start' },
  rowOutgoing: { alignItems: 'flex-end' },
  imageMsg: { maxWidth: '75%', borderRadius: 16, overflow: 'hidden' },
  imgIncoming: { borderBottomLeftRadius: 4 },
  imgOutgoing: { borderBottomRightRadius: 4, backgroundColor: '#3B5BFF' },
  chatImg: { width: 220, height: 160, resizeMode: 'cover' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaIncoming: { marginLeft: 4 },
  metaOutgoing: { marginRight: 4 },
  timeText: { fontSize: 11, color: '#94A3B8' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  composerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F7FB', justifyContent: 'center', alignItems: 'center' },
  inputContainer: { flex: 1, backgroundColor: '#F5F7FB', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100 },
  input: { fontSize: 15, color: '#111' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3B5BFF', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#A0AEC0' },
});
