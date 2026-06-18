// app/interests.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { useStore } from '../store/useStore';

const INTERESTS_DATA = [
  'Hackathons',
  'AI',
  'Cultural',
  'Tech',
  'Design',
  'Music',
  'Sports'
];

export default function InterestsScreen() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const completeSignup = useStore((state) => state.completeSignup);

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      alert('Please select at least one interest to continue.');
      return;
    }
    
    // Finalize signup in global state (handles manual AsyncStorage)
    const result = await completeSignup(selectedInterests);

    if (result.success) {
      // Proceed to the main app flow
      router.replace('/(tabs)');
    } else {
      if (result.error === 'No signup data found') {
        alert('Your session expired. Please start over.');
        router.replace('/login');
      } else {
        alert(result.error || 'Failed to complete signup');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{"Select your interests"}</Text>
            <Text style={styles.subtitle}>
              {"Pick what you love, and we'll curate the best stories and events for you."}
            </Text>
          </View>

          <View style={styles.chipContainer}>
            {INTERESTS_DATA.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                selected={selectedInterests.includes(interest)}
                onPress={() => toggleInterest(interest)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={selectedInterests.length === 0}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
});
