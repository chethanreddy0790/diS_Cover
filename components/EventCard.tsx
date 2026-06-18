import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppMediaImage from './AppMediaImage';

interface EventCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  image: string;
  imageAspectRatio?: number;
  tags: string[];
  likes: number | any[];
  comments: number | any[];
  onPress: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const { width } = Dimensions.get('window');

export const EventCard: React.FC<EventCardProps> = ({
  title,
  category,
  date,
  location,
  image,
  imageAspectRatio,
  tags,
  likes,
  comments,
  onPress,
  isOwner,
  onEdit,
  onDelete
}) => {
  const safeUri = image?.startsWith('http')
    ? image
    : 'https://via.placeholder.com/150';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <AppMediaImage 
        uri={safeUri} 
        type="event" 
        mode="thumbnail" 
        aspectRatio={imageAspectRatio}
        style={styles.image} 
      />
      
      <View style={styles.tagsContainer}>
        {tags?.map((tag) => (
          <View key={tag} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Owner Controls */}
      {isOwner && (
        <View style={styles.ownerControls}>
          <TouchableOpacity 
            style={styles.controlBtn} 
            onPress={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Feather name="edit-2" size={16} color="#3B5BFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlBtn, styles.deleteBtn]} 
            onPress={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Feather name="trash-2" size={16} color="#FF4D4D" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color="#666" />
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

    <View style={styles.footer}>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Feather name="heart" size={16} color="#666" />
          <Text style={styles.statText}>{Array.isArray(likes) ? likes.length : (likes || 0)}</Text>
        </View>
        <View style={styles.stat}>
          <Feather name="message-circle" size={16} color="#666" />
          <Text style={styles.statText}>{Array.isArray(comments) ? comments.length : (comments || 0)}</Text>
        </View>
      </View>
      <View style={styles.iconButton}>
        <Feather name="arrow-up-right" size={20} color="#111" />
      </View>
    </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    width: width - 48, // Card width
  },
  image: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#E8EAED',
  },
  tagsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
  },
  ownerControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteBtn: {
    // shadowColor: '#FF4D4D',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  category: {
    color: '#3B5BFF',
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    lineHeight: 28,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventCard;
