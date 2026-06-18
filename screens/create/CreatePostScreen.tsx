import React, { useState } from "react";
import { Image, Platform, ScrollView, StyleSheet, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  Button,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { MainTabParamList } from "../../navigation/types";
import { pickImageFromLibrary, uploadImageAsync } from "../../services/mediaService";
import { useFeedStore } from "../../store/useFeedStore";
import { appRadii, appSpacing } from "../../theme/theme";
import { formatEventDate } from "../../utils/format";
import { splitTags, validatePostDescription } from "../../utils/validation";

type Props = BottomTabScreenProps<MainTabParamList, "Create">;

export const CreatePostScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const publishPost = useFeedStore((state) => state.publishPost);
  const isSubmitting = useFeedStore((state) => state.isSubmitting);
  const error = useFeedStore((state) => state.error);
  const clearError = useFeedStore((state) => state.clearError);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [eventDate, setEventDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(18, 0, 0, 0);
    return date;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const handlePickImage = async () => {
    try {
      const selectedImage = await pickImageFromLibrary('post');
      if (selectedImage) {
        setImageUri(selectedImage.uri);
      }
    } catch (error) {
      setLocalMessage(
        error instanceof Error ? error.message : "We could not open your photo library.",
      );
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !location.trim() || !validatePostDescription(description)) {
      setLocalMessage("Add a title, description, and location for your event.");
      return;
    }

    if (eventDate.getTime() <= Date.now()) {
      setLocalMessage("Choose an event date in the future.");
      return;
    }

    try {
      const uploadedImage = await uploadImageAsync(imageUri, "posts");
      await publishPost({
        title,
        description,
        location,
        eventDate: eventDate.toISOString(),
        imageUrl: uploadedImage,
        tags: splitTags(tagInput),
      });

      setTitle("");
      setDescription("");
      setLocation("");
      setTagInput("");
      setImageUri(undefined);
      setLocalMessage("Your event is live on the feed.");
      navigation.navigate("HomeStack");
    } catch {
      // Store error is surfaced in the snackbar.
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text variant="headlineMedium">Create an event post</Text>
      <Text variant="bodyLarge">
        Share something students can plan around: title, poster, date, location, and a clear call
        to show up.
      </Text>

      <Button icon="image-plus-outline" mode="contained-tonal" onPress={handlePickImage}>
        Upload event image
      </Button>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      ) : (
        <View
          style={[
            styles.imagePlaceholder,
            {
              borderColor: theme.colors.outlineVariant,
              backgroundColor: theme.colors.surfaceVariant,
            },
          ]}
        >
          <Text variant="bodyMedium">Poster or event cover preview</Text>
        </View>
      )}

      <TextInput label="Event title" mode="outlined" onChangeText={setTitle} value={title} />
      <TextInput
        label="Description"
        mode="outlined"
        multiline
        numberOfLines={5}
        onChangeText={setDescription}
        value={description}
      />
      <TextInput label="Location" mode="outlined" onChangeText={setLocation} value={location} />
      <TextInput
        label="Tags"
        mode="outlined"
        onChangeText={setTagInput}
        placeholder="startup, social, music"
        value={tagInput}
      />

      <Button icon="calendar-clock-outline" mode="outlined" onPress={() => setShowPicker(true)}>
        {formatEventDate(eventDate.toISOString())}
      </Button>

      {showPicker ? (
        <DateTimePicker
          display={Platform.select({ ios: "inline", android: "default" })}
          mode="datetime"
          onChange={(_, selectedValue) => {
            if (Platform.OS === "android") {
              setShowPicker(false);
            }

            if (selectedValue) {
              setEventDate(selectedValue);
            }
          }}
          value={eventDate}
        />
      ) : null}

      <Button loading={isSubmitting} mode="contained" onPress={handleSubmit}>
        Publish event
      </Button>

      <Snackbar
        onDismiss={() => {
          setLocalMessage(null);
          clearError();
        }}
        visible={!!localMessage || !!error}
      >
        {localMessage ?? error ?? ""}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: appSpacing.lg,
    gap: appSpacing.md,
  },
  imagePreview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: appRadii.lg,
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: appRadii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
});
