import React from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

type IconName =
  | React.ComponentProps<typeof Ionicons>['name']
  | React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type SettingsRowProps = {
  label: string;
  iconSet?: 'ionicons' | 'material';
  icon: IconName;
  onPress?: () => void;
  accessory?: 'chevron' | 'external';
  badgeText?: string;
  isLast?: boolean;
  type?: 'action' | 'toggle';
  value?: boolean;
  onValueChange?: (value: boolean) => void;
};

function RowIcon({
  icon,
  iconSet = 'ionicons',
}: {
  icon: IconName;
  iconSet?: 'ionicons' | 'material';
}) {
  if (iconSet === 'material') {
    return (
      <MaterialCommunityIcons
        name={icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
        size={22}
        color="#4B67FF"
      />
    );
  }

  return (
    <Ionicons
      name={icon as React.ComponentProps<typeof Ionicons>['name']}
      size={22}
      color="#4B67FF"
    />
  );
}

export default function SettingsRow({
  label,
  icon,
  iconSet = 'ionicons',
  onPress,
  accessory = 'chevron',
  badgeText,
  isLast = false,
  type = 'action',
  value = false,
  onValueChange,
}: SettingsRowProps) {
  const content = (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={styles.leftContent}>
        <View style={styles.iconWrap}>
          <RowIcon icon={icon} iconSet={iconSet} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.rightContent}>
        {badgeText ? <Text style={styles.badge}>{badgeText}</Text> : null}

        {type === 'toggle' ? (
          <Switch
            trackColor={{ false: '#DBE2F0', true: '#4B67FF' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#DBE2F0"
            onValueChange={onValueChange}
            style={styles.switch}
            value={value}
          />
        ) : accessory === 'external' ? (
          <Feather name="external-link" size={21} color="#B8C0D1" />
        ) : (
          <Feather name="chevron-right" size={21} color="#B8C0D1" />
        )}
      </View>
    </View>
  );

  if (type === 'toggle') {
    return content;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5EAF3',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 14,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#121826',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginRight: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    fontSize: 11,
    fontWeight: '700',
    color: '#4B67FF',
    letterSpacing: 0.6,
  },
  switch: {
    transform: [{ scaleX: 0.96 }, { scaleY: 0.96 }],
  },
  pressed: {
    opacity: 0.75,
  },
});
