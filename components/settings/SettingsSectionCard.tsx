import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type SettingsSectionCardProps = {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SettingsSectionCard({
  title,
  children,
  style,
}: SettingsSectionCardProps) {
  return (
    <View style={[styles.section, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 26,
  },
  title: {
    marginBottom: 12,
    paddingHorizontal: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#5F6C84',
    letterSpacing: 1.8,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    shadowColor: '#CAD3E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
});
