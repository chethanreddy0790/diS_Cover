import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type NavItemProps = {
  active?: boolean;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  onPress: () => void;
};

function NavItem({ active, icon, label, onPress }: NavItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        active && styles.itemActive,
        pressed && styles.itemPressed,
      ]}>
      <Feather name={icon} size={21} color={active ? '#0B4AEF' : '#7E8CA3'} />
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsBottomNav() {
  return (
    <View style={styles.container}>
      <NavItem icon="home" label="HOME" onPress={() => router.push('/(tabs)')} />
      <NavItem icon="search" label="SEARCH" onPress={() => router.push('/(tabs)/explore')} />
      <NavItem icon="plus-circle" label="LIST" onPress={() => router.push('/create-event')} />
      <NavItem icon="mail" label="INBOX" onPress={() => router.push('/inbox')} />
      <NavItem active icon="user" label="PROFILE" onPress={() => router.push('/(tabs)/profile')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 86,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#D4DDEA',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  item: {
    width: 58,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: '#EEF6FF',
  },
  itemPressed: {
    opacity: 0.78,
  },
  label: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    color: '#7E8CA3',
  },
  labelActive: {
    color: '#0B4AEF',
  },
});
