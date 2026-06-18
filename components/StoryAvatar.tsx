import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { UserDisplayName } from './UserDisplayName';

interface StoryAvatarProps {
  id: string;
  image: string;
  title: string;
  hasUnseen?: boolean;
  onPress?: () => void;
}

export const StoryAvatar: React.FC<StoryAvatarProps> = ({ id, image, title, hasUnseen = true, onPress }) => {
  const safeUri = image?.startsWith('http')
    ? image
    : 'https://via.placeholder.com/150';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.ringContainer, hasUnseen && styles.activeRing]}>
        <Image source={{ uri: safeUri }} style={styles.image} />
      </View>
      <UserDisplayName 
        userId={id} 
        fallbackName={title} 
        style={styles.title} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    width: 72,
  },
  ringContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeRing: {
    borderColor: '#3B5BFF',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8EAED',
  },
  title: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#111',
    textAlign: 'center',
  },
});
