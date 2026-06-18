import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type RecentListingCardProps = {
  title: string;
  subtitle: string;
  price: string;
  level: string;
  mark: string;
  onPress?: () => void;
};

export default function RecentListingCard({
  title,
  subtitle,
  price,
  level,
  mark,
  onPress,
}: RecentListingCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.leftAccent} />

      <View style={styles.markBubble}>
        <Text style={styles.markText}>{mark}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.level}>{level}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 20,
    overflow: 'hidden',
    shadowColor: '#C5CEE8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  cardPressed: {
    opacity: 0.92,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#CAD8FF',
  },
  markBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FE',
  },
  markText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E54F1',
  },
  content: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 14,
  },
  title: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: '#111111',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: '#4A4F61',
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B4BFF',
  },
  level: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: '#3F4454',
  },
});
