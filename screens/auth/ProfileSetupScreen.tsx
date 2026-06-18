import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

import { fetchColleges } from "../../services/profileService";
import { pickImageFromLibrary, uploadImageAsync } from "../../services/mediaService";
import { useAuthStore } from "../../store/useAuthStore";
import { College } from "../../types";
import { appRadii, appSpacing } from "../../theme/theme";
import { validateHeadline, validateProfileBio } from "../../utils/validation";
import { AppAvatar } from "../../components/common/AppAvatar";

export const ProfileSetupScreen = () => {
  const theme = useTheme();
  const profile = useAuthStore((state) => state.profile);
  const completeProfile = useAuthStore((state) => state.completeProfile);
  const authError = useAuthStore((state) => state.error);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const clearError = useAuthStore((state) => state.clearError);

  const [colleges, setColleges] = useState<College[]>([]);
  const [name, setName] = useState(profile?.name ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [graduationYear, setGraduationYear] = useState(
    profile?.graduationYear ? String(profile.graduationYear) : "",
  );
  const [collegeId, setCollegeId] = useState(profile?.collegeId ?? "");
  const [avatarUri, setAvatarUri] = useState(profile?.avatarUrl);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await fetchColleges();
        setColleges(items);
        if (!collegeId && items[0]) {
          setCollegeId(items[0].id);
        }
      } catch (error) {
        setLocalError(
          error instanceof Error ? error.message : "Unable to load colleges for setup.",
        );
      }
    };

    void load();
  }, []);

  const handlePickAvatar = async () => {
    try {
      const result = await pickImageFromLibrary('profile');
      if (result) {
        setAvatarUri(result.uri);
      }
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Unable to choose a profile picture.",
      );
    }
  };

  const handleCompleteProfile = async () => {
    if (!profile) {
      return;
    }

    if (!name.trim() || !collegeId || !validateHeadline(headline) || !validateProfileBio(bio)) {
      setLocalError("Complete your name, college, headline, and a short bio before continuing.");
      return;
    }

    try {
      setLocalError(null);
      const uploadedAvatar = await uploadImageAsync(avatarUri, "avatars");
      await completeProfile({
        name,
        collegeId,
        bio,
        headline,
        avatarUrl: uploadedAvatar,
        graduationYear: graduationYear ? Number(graduationYear) : null,
      });
    } catch {
      // Store error is surfaced below.
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text variant="displaySmall">Finish your profile</Text>
      <Text variant="bodyLarge">
        Add the details that help classmates discover your events and understand what communities
        you are part of.
      </Text>

      <View
        style={[
          styles.avatarCard,
          {
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarPreview} />
        ) : (
          <AppAvatar name={name || "Campus Circle"} size={96} uri={avatarUri} />
        )}
        <Button icon="image-outline" mode="contained-tonal" onPress={handlePickAvatar}>
          Choose photo
        </Button>
      </View>

      <TextInput label="Full name" mode="outlined" onChangeText={setName} value={name} />
      <TextInput
        label="Headline"
        mode="outlined"
        onChangeText={setHeadline}
        placeholder="Ex: Event council lead or CS junior"
        value={headline}
      />
      <TextInput
        label="Short bio"
        mode="outlined"
        multiline
        numberOfLines={4}
        onChangeText={setBio}
        value={bio}
      />
      <TextInput
        keyboardType="number-pad"
        label="Graduation year"
        mode="outlined"
        onChangeText={setGraduationYear}
        value={graduationYear}
      />

      <View style={styles.collegeSection}>
        <Text variant="titleSmall">Choose your college</Text>
        <View style={styles.chipsWrap}>
          {colleges.map((college) => (
            <Chip
              key={college.id}
              selected={collegeId === college.id}
              onPress={() => setCollegeId(college.id)}
            >
              {college.name}
            </Chip>
          ))}
        </View>
      </View>

      <Button loading={isSubmitting} mode="contained" onPress={handleCompleteProfile}>
        Enter CampusCircle
      </Button>

      <Snackbar
        onDismiss={() => {
          setLocalError(null);
          clearError();
        }}
        visible={!!localError || !!authError}
      >
        {localError ?? authError ?? ""}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: appSpacing.lg,
    gap: appSpacing.md,
  },
  avatarCard: {
    borderRadius: appRadii.lg,
    padding: appSpacing.lg,
    alignItems: "center",
    gap: appSpacing.md,
  },
  avatarPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  collegeSection: {
    gap: appSpacing.sm,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appSpacing.sm,
  },
});
