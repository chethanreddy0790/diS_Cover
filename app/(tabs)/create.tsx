import React from 'react';
import { View } from 'react-native';

// This screen exists only to satisfy Expo Router's file-based routing.
// The actual "create" tab button navigates to /create-event via CreateButton.
export default function CreatePlaceholder() {
  return <View />;
}
