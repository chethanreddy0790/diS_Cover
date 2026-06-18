import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { useEventStore } from '../store/useEventStore';
import { Input } from '../components/Input';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { pickImageFromLibrary, uploadImageAsync } from '../services/mediaService';
import AppMediaImage from '../components/AppMediaImage';

const CATEGORIES = ['Hackathons', 'AI', 'Cultural', 'Tech', 'Design', 'Music', 'Sports'];

export default function CreateEventScreen() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useStore();
  const { addEvent, updateEvent, events } = useEventStore();
  
  console.log("[CreateEvent] currentUser:", currentUser);
  console.log("[CreateEvent] selected image:", image);
  console.log("[CreateEvent] aspect ratio:", imageAspectRatio);
  
  const isEditing = !!id;
  const existingEvent = isEditing ? events.find(e => e.id === id) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [registrationLink, setRegistrationLink] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Pre-fill data if editing + PERMISSION CHECK
  useEffect(() => {
    if (isEditing && existingEvent) {
      // SECURITY CHECK
      if (existingEvent.createdBy?.id !== currentUser?.id) {
        Alert.alert('Access Denied', 'You do not have permission to edit this event.');
        router.back();
        return;
      }

      setTitle(existingEvent.title);
      setDescription(existingEvent.description);
      setSelectedCategory(existingEvent.category);
      setDate(existingEvent.date);
      setTime(existingEvent.time);
      setVenue(existingEvent.venue);
      setRegistrationLink(existingEvent.registrationLink || '');
      setContactDetails((existingEvent as any).contactDetails || '');
      setImage(existingEvent.image);
      setImageAspectRatio(existingEvent.imageAspectRatio);
    }
  }, [isEditing, existingEvent, currentUser]);

  const pickImage = async () => {
    try {
      const result = await pickImageFromLibrary('event');
      if (result) {
        setImage(result.uri);
        setImageAspectRatio(result.aspectRatio);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      setDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(tempDate);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setTempDate(updatedDate);
      setTime(format(selectedTime, 'hh:mm a'));
    }
  };

    const handlePublish = async () => {
    if (!title || !description || !selectedCategory || !date || !time || !venue) {
      Alert.alert('Missing fields', 'Please fill out all the fields to continue.');
      return;
    }

    if (registrationLink && !registrationLink.startsWith('http://') && !registrationLink.startsWith('https://')) {
      Alert.alert('Invalid Link', 'Registration link must start with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = image || 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?w=800&q=80';
      
      // Upload image if it's a local file
      if (image && !image.startsWith('http')) {
        finalImageUrl = await uploadImageAsync(image) || finalImageUrl;
      }

      const removeUndefined = (obj: any) =>
        Object.fromEntries(
          Object.entries(obj).filter(([_, value]) => value !== undefined)
        );

      const eventData = removeUndefined({
        title,
        description,
        category: selectedCategory,
        date,
        time,
        venue,
        registrationLink,
        contactDetails: contactDetails.trim() || null,
        deadline: date,
        createdBy: existingEvent?.createdBy || {
          id: currentUser?.id || 'anonymous',
          name: currentUser?.username || 'Organizer',
          role: currentUser?.designation || 'Student',
        },
        image: finalImageUrl,
        imageAspectRatio,
        tags: [selectedCategory, 'New'],
        rules: existingEvent?.rules || ['Standard event rules apply'],
      });

      if (isEditing && existingEvent) {
        await updateEvent({
          ...existingEvent,
          ...eventData,
        });
      } else {
        await addEvent(eventData);
      }

      setLoading(false);
      router.back();
    } catch (error) {
      console.error('[CreateEvent] Failed to publish event:', error);
      Alert.alert('Publish Failed', 'An error occurred while saving the event. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Event' : 'Create Event'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.contentContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Upload Area */}
          <TouchableOpacity 
            style={[styles.uploadContainer, image && styles.uploadContainerActive]} 
            onPress={pickImage}
            activeOpacity={0.9}
          >
            {image ? (
              <AppMediaImage 
                uri={image} 
                type="event" 
                mode="thumbnail" 
                aspectRatio={imageAspectRatio}
                style={styles.imagePreview}
              />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Feather name="image" size={32} color="#A0AEC0" />
                <Text style={styles.uploadText}>{"Upload Event Poster"}</Text>
              </View>
            )}
            {image && (
              <View style={styles.editBadge}>
                 <Feather name="edit-2" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>

          <Input 
            label="Event Title" 
            placeholder="Give it a catchy name" 
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.sectionDivider} />
          <Text style={styles.label}>{"Category"}</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map(cat => (
              <Chip 
                key={cat} 
                label={cat} 
                selected={selectedCategory === cat} 
                onPress={() => setSelectedCategory(cat)} 
              />
            ))}
          </View>

          <Input 
            label="Description" 
            placeholder="What's this event about?" 
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                style={styles.pickerTrigger} 
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={18} color="#3B5BFF" />
                <Text style={[styles.pickerValue, !date && styles.pickerPlaceholder]}>
                  {date || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Time</Text>
              <TouchableOpacity 
                style={styles.pickerTrigger} 
                onPress={() => setShowTimePicker(true)}
              >
                <Feather name="clock" size={18} color="#3B5BFF" />
                <Text style={[styles.pickerValue, !time && styles.pickerPlaceholder]}>
                  {time || 'Select Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={tempDate}
              mode="time"
              display="default"
              onChange={onTimeChange}
              is24Hour={false}
            />
          )}

          <Input 
            label="Location" 
            placeholder="Venue or Meeting Link" 
            value={venue}
            onChangeText={setVenue}
          />

          <Input 
            label="Registration Link (Optional)" 
            placeholder="https://..." 
            value={registrationLink}
            onChangeText={setRegistrationLink}
            autoCapitalize="none"
            keyboardType="url"
          />

          <Input 
            label="Contact Details (Optional)" 
            placeholder="Phone / email / Instagram / WhatsApp group link" 
            value={contactDetails}
            onChangeText={setContactDetails}
            autoCapitalize="none"
          />

          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            title={isEditing ? 'Save Changes' : 'Publish Event'} 
            onPress={handlePublish} 
            isLoading={loading}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  contentContainer: {
    padding: 24,
  },
  uploadContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F7FB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8EAED',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  uploadContainerActive: {
    borderStyle: 'solid',
    borderColor: '#3B5BFF',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#3B5BFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionDivider: {
    height: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F7FB',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8EAED',
    marginBottom: 24,
  },
  pickerValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  pickerPlaceholder: {
    color: '#A0AEC0',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
  },
});
