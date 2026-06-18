import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useStoryStore } from '../store/useStoryStore';
import { Button } from '../components/Button';
import { pickImageFromLibrary, uploadImageAsync } from '../services/mediaService';
import AppMediaImage from '../components/AppMediaImage';

export default function CreateStoryScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const addStory = useStoryStore((state) => state.addStory);

  const pickImage = async () => {
    try {
      const result = await pickImageFromLibrary('story');
      if (result) {
        setImage(result.uri);
        setImageAspectRatio(result.aspectRatio);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handlePublish = async () => {
    if (!image) {
      Alert.alert('Selection Required', 'Please pick an image for your story.');
      return;
    }

    setLoading(true);
    
    try {
      const mediaUrl = await uploadImageAsync(image);
      
      if (!mediaUrl) throw new Error("Upload failed");

      await addStory({
        media: mediaUrl,
        caption: caption.trim(),
        imageAspectRatio: imageAspectRatio as any,
      } as any);
      
      setLoading(false);
      router.back();
    } catch (error) {
      console.error('[CreateStory] Failed to publish story:', error);
      Alert.alert('Upload Failed', 'Failed to upload story media. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Feather name="x" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Story</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Selector */}
          <TouchableOpacity 
            style={[styles.imagePreview, !image && styles.imagePlaceholder]} 
            onPress={pickImage}
            activeOpacity={0.9}
          >
            {image ? (
              <AppMediaImage 
                uri={image} 
                type="story" 
                mode="thumbnail" 
                aspectRatio={imageAspectRatio}
                style={styles.selectedImage}
              />
            ) : (
              <View style={styles.placeholderContent}>
                <Feather name="image" size={48} color="#A0AEC0" />
                <Text style={styles.placeholderText}>Tap to select image</Text>
              </View>
            )}
            {image && (
              <View style={styles.editBadge}>
                <Feather name="edit-2" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          {/* Caption Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Caption (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a fun caption..."
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={100}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title="Publish Story" 
            onPress={handlePublish} 
            isLoading={loading}
            disabled={!image}
          />
        </View>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    backgroundColor: '#F7F9FC',
  },
  imagePlaceholder: {
    borderWidth: 2,
    borderColor: '#E8EAED',
    borderStyle: 'dashed',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  editBadge: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B5BFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  inputSection: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  input: {
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
});
