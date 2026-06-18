import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { initialsFromName } from '../../utils/format';
import { getUsername } from '../../utils/userUtils';

export type MenuItemKey = 'events' | 'gig-space' | 'settings' | 'profile';

type ProfileDrawerProps = {
  onMenuPress?: (key: MenuItemKey) => void;
  onLogoutPress?: () => void;
  onUpgradePress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const avatarSource = require('../../assets/images/drawer-avatar.png');

const menuItems: {
  key: MenuItemKey;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  { key: 'events', label: 'Events', icon: 'calendar-outline' },
  { key: 'gig-space', label: 'Gig-space', icon: 'briefcase-outline' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

function MenuItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}>
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={29} color="#44485E" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </Pressable>
  );
}

function formatDisplayName(username?: string) {
  if (!username) return '';

  return username
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProfileDrawer({
  onMenuPress,
  onLogoutPress,
  style,
}: ProfileDrawerProps) {
  const { width } = useWindowDimensions();
  const currentUser = useStore((state) => state.currentUser);
  const isCompact = width < 380;
  
  // Use the robust getUsername utility for display name
  const displayName = getUsername(currentUser);
  const subtitle = currentUser?.designation || currentUser?.collegeName || 'Explorer';
  const initials = initialsFromName(displayName) || 'U';
  const hasImage = !!currentUser?.image;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={[styles.panel, isCompact && styles.panelCompact, style]}>
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                {hasImage ? (
                  <Image source={{ uri: currentUser!.image }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.initialsAvatar]}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                )}
              </View>

              <View style={styles.headerText}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                  style={styles.name}>
                  {displayName}
                </Text>
                <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>



            <View style={styles.menuSection}>
              {menuItems.map((item) => (
                <MenuItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  onPress={() => onMenuPress?.(item.key)}
                />
              ))}
            </View>

            <View style={styles.divider} />

            <Pressable
              accessibilityRole="button"
              onPress={onLogoutPress}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}>
              <View style={styles.menuIconWrap}>
                <Ionicons name="log-out-outline" size={30} color="#D60F0F" />
              </View>
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </View>


        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECEFF4',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  panel: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 28,
    shadowColor: '#7C849A',
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.22,
    shadowRadius: 38,
    elevation: 18,
  },
  panelCompact: {
    paddingHorizontal: 22,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 34,
    paddingBottom: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: '#DBE2F1',
  },
  headerText: {
    flex: 1,
    paddingLeft: 18,
  },
  name: {
    fontSize: 33,
    lineHeight: 38,
    fontWeight: '800',
    color: '#171A26',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '500',
    color: '#3E4357',
  },
  avatarContainer: {
    position: 'relative',
  },
  initialsAvatar: {
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  badge: {
    marginTop: 26,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EEF1FF',
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  badgeText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#4C68FF',
  },
  menuSection: {
    marginTop: 42,
  },
  menuItem: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemPressed: {
    opacity: 0.75,
  },
  menuIconWrap: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 23,
    lineHeight: 30,
    fontWeight: '500',
    color: '#3F4457',
  },
  divider: {
    marginTop: 18,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EDF5',
  },
  logoutButton: {
    marginTop: 34,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButtonPressed: {
    opacity: 0.75,
  },
  logoutText: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    color: '#D60F0F',
  },
  premiumCard: {
    marginTop: 56,
    borderRadius: 36,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 22,
    shadowColor: '#2B4BE0',
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },
  premiumBackgroundImage: {
    borderRadius: 36,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    marginRight: 16,
  },
  premiumTitle: {
    flex: 1,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  premiumDescription: {
    marginTop: 20,
    fontSize: 15,
    lineHeight: 26,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upgradeButton: {
    marginTop: 28,
    minHeight: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  upgradeButtonPressed: {
    opacity: 0.9,
  },
  upgradeButtonText: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    color: '#4263FF',
  },
});
