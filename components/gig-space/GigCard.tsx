import React from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppMediaImage from '../AppMediaImage';

type GigCardProps = {
  title: string;
  company: string;
  location: string;
  priceLabel: string;
  rating: string;
  companyMark: string;
  image?: string;
  imageAspectRatio?: number;
  isSaved?: boolean;
  onContactPress?: () => void;
  onDetailsPress?: () => void;
  onSavePress?: () => void;
  onSellerPress?: () => void;
};

const { width } = Dimensions.get('window');

export default function GigCard({
  title,
  company,
  location,
  priceLabel,
  rating,
  companyMark,
  image,
  imageAspectRatio,
  isSaved = false,
  onContactPress,
  onDetailsPress,
  onSavePress,
  onSellerPress,
}: GigCardProps) {
  const safeUri = image || 'https://via.placeholder.com/150';

  return (
    <Pressable style={styles.card} onPress={onDetailsPress}>
      <AppMediaImage 
        uri={safeUri} 
        type="gig" 
        mode="thumbnail" 
        aspectRatio={imageAspectRatio}
        style={styles.image} 
      />
      
      <View style={styles.tagsContainer}>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>GIG</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{priceLabel}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSavePress}
        style={({ pressed }) => [
          styles.bookmarkButton,
          pressed && styles.bookmarkButtonPressed,
        ]}>
        <Feather
          name="bookmark"
          size={18}
          color={isSaved ? '#3B5BFF' : '#111'}
          fill={isSaved ? '#3B5BFF' : 'transparent'}
        />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.company} numberOfLines={1}>{company}</Text>
          <View style={styles.ratingRow}>
            <Feather name="star" size={12} color="#F4B400" />
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
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
            <Pressable onPress={onSellerPress} style={styles.avatar}>
               <Text style={styles.avatarText}>{companyMark}</Text>
            </Pressable>
            <View style={styles.stat}>
              <Text style={styles.statText}>Active Listing</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={onContactPress}
          >
            <Feather name="send" size={18} color="#111" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}

// Re-using TouchableOpacity for the icon button inside Pressable card
const TouchableOpacity = Pressable;

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
  priceBadge: {
    backgroundColor: 'rgba(59, 91, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 16,
    right: 16,
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
  bookmarkButtonPressed: {
    opacity: 0.72,
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
  company: {
    color: '#3B5BFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
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
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0D3750',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
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
