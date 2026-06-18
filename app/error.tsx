import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 12 },
  message: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  button: { backgroundColor: '#3B5BFF', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginBottom: 16 },
  buttonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  link: { padding: 8 },
  linkText: { color: '#3B5BFF', fontSize: 14 },
});

export default function ErrorPage({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{error?.message || 'An unexpected error occurred'}</Text>
        <TouchableOpacity style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => router.replace('/login')}>
          <Text style={styles.linkText}>Go to login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
