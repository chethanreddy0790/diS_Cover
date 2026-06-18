import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserDisplayName } from '../UserDisplayName';

type SellerProfileCardProps = {
  name: string;
  role: string;
  rating: string;
  userId?: string;
};

const sellerAvatarSource = require('../../assets/images/drawer-avatar.png');

export default function SellerProfileCard({
  name,
  role,
  rating,
  userId,
}: SellerProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <Image source={sellerAvatarSource} style={styles.avatar} />
          <View style={styles.statusDot} />
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            {userId ? (
              <UserDisplayName userId={userId} fallbackName={name} style={styles.name} />
            ) : (
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
            )}
            <View style={styles.ratingBadge}>
              <Feather name="star" size={14} color="#F4B400" fill="#F4B400" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>

          <Text style={styles.role} numberOfLines={1}>{role}</Text>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>TOP RATED</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>ALUMNI</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F7FB',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingLeft: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3B5BFF',
    letterSpacing: 0.5,
  },
});
