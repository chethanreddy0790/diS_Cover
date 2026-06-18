// components/Chip.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 10,
    marginBottom: 12,
  },
  selectedContainer: {
    backgroundColor: 'rgba(59, 91, 255, 0.1)',
    borderColor: '#3B5BFF',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
  },
  selectedText: {
    color: '#3B5BFF',
    fontWeight: '600',
  },
});
