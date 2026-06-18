import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

type NavKey = 'home' | 'inbox' | 'create' | 'alerts' | 'profile';

type GigBottomNavProps = {
  activeKey: NavKey;
  onHomePress?: () => void;
  onInboxPress?: () => void;
  onCreatePress?: () => void;
  onAlertsPress?: () => void;
  onProfilePress?: () => void;
};

const sideItems: {
  key: NavKey;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}[] = [
  { key: 'home', label: 'HOME', icon: 'home' },
  { key: 'inbox', label: 'INBOX', icon: 'message-circle' },
  { key: 'alerts', label: 'ALERTS', icon: 'bell' },
  { key: 'profile', label: 'PROFILE', icon: 'user' },
];

export default function GigBottomNav({
  activeKey,
  onHomePress,
  onInboxPress,
  onCreatePress,
  onAlertsPress,
  onProfilePress,
}: GigBottomNavProps) {
  const handlers: Record<NavKey, (() => void) | undefined> = {
    home: onHomePress,
    inbox: onInboxPress,
    create: onCreatePress,
    alerts: onAlertsPress,
    profile: onProfilePress,
  };

  return (
    <View style={styles.container}>
      <View style={styles.sideGroup}>
        {sideItems.slice(0, 2).map((item) => {
          const isActive = item.key === activeKey;

          return (
            <Pressable
              key={item.key}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              onPress={handlers[item.key]}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}>
              <Feather
                name={item.icon}
                size={24}
                color={isActive ? '#3B5BFF' : '#A0AEC0'}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityLabel="CREATE"
        accessibilityRole="button"
        onPress={handlers.create}
        style={({ pressed }) => [
          styles.createButtonContainer,
          pressed && styles.itemPressed,
        ]}>
        <View style={styles.createButton}>
          <Feather name="plus" size={30} color="#FFFFFF" />
        </View>
      </Pressable>

      <View style={styles.sideGroup}>
        {sideItems.slice(2).map((item) => {
          const isActive = item.key === activeKey;

          return (
            <Pressable
              key={item.key}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              onPress={handlers[item.key]}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}>
              <Feather
                name={item.icon}
                size={24}
                color={isActive ? '#3B5BFF' : '#A0AEC0'}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    height: 80,
    paddingHorizontal: 42,
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  sideGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  itemPressed: {
    opacity: 0.86,
  },
  createButtonContainer: {
    top: -20,
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
