import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGigStore } from '../store/useGigStore';
import { pickImageFromLibrary } from '../services/mediaService';
import AppMediaImage from '../components/AppMediaImage';

export default function CreateGigScreen() {
  const addPublishedGig = useGigStore((state) => state.addPublishedGig);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await pickImageFromLibrary('gig');
      if (result) {
        setImage(result.uri);
        setImageAspectRatio(result.aspectRatio);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const removeUndefined = (obj: any) =>
      Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined)
      );

    setLoading(true);
    try {
      const gigPayload = removeUndefined({
        title,
        description,
        price: Number(price),
        image: image || undefined,
        imageAspectRatio: imageAspectRatio,
      });

      console.log("[CreateGig] Creating gig with payload:", gigPayload);

      const createdGig = await addPublishedGig(gigPayload as any);

      if (!createdGig) {
        Alert.alert('Error', 'Unable to publish gig. Please try again.');
        setLoading(false);
        return;
      }

      console.log("[CreateGig] Gig created successfully");

      Alert.alert('Success', 'Gig created successfully!', [
        { text: 'OK', onPress: () => router.replace('/gig-space') },
      ]);
    } catch (error) {
      console.error('[CreateGig] Error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Gig</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Picker */}
          <TouchableOpacity 
            style={[styles.imageContainer, image && styles.imageContainerActive]} 
            onPress={pickImage}
          >
            {image ? (
              <AppMediaImage 
                uri={image} 
                type="gig" 
                mode="thumbnail" 
                aspectRatio={imageAspectRatio}
                style={styles.imagePreview}
              />
            ) : (
              <View style={styles.placeholderContent}>
                <Feather name="image" size={32} color="#A0AEC0" />
                <Text style={styles.placeholderText}>Upload Gig Banner (Optional)</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.label}>Gig Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Frontend Developer"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the opportunity..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Price / Rate (₹)</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="e.g. 1000"
              keyboardType="numeric"
              value={price}
              onChangeText={(val) => setPrice(val.replace(/[^0-9]/g, ''))}
            />
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Publishing...' : 'Publish Gig'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { padding: 24 },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F5F7FB',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E8EAED',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  imageContainerActive: {
    borderStyle: 'solid',
    borderColor: '#3B5BFF',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  placeholderContent: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
    overflow: 'hidden',
  },
  currencyPrefix: {
    paddingLeft: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#3B5BFF',
  },
  priceInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 8,
    fontSize: 16,
    color: '#111',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#3553EC',
    borderRadius: 999,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#3553EC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
