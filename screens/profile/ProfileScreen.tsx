import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Button, Chip, IconButton, Snackbar, Text, useTheme } from "react-native-paper";

import { PostCard } from "../../components/cards/PostCard";
import { EmptyState } from "../../components/common/EmptyState";
import { CommentDialog } from "../../components/feed/CommentDialog";
import { ProfileStats } from "../../components/profile/ProfileStats";
import { MainTabParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/useAuthStore";
import { useFeedStore } from "../../store/useFeedStore";
import { appRadii, appSpacing } from "../../theme/theme";
import { EventPost } from "../../types";
import { AppAvatar } from "../../components/common/AppAvatar";

type Props = BottomTabScreenProps<MainTabParamList, "Profile">;

export const ProfileScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  const userPosts = useFeedStore((state) => state.userPosts);
  const colleges = useFeedStore((state) => state.colleges);
  const error = useFeedStore((state) => state.error);
  const loadProfilePosts = useFeedStore((state) => state.loadProfilePosts);
  const likePost = useFeedStore((state) => state.likePost);
  const commentOnPost = useFeedStore((state) => state.commentOnPost);
  const sharePost = useFeedStore((state) => state.sharePost);
  const toggleRsvp = useFeedStore((state) => state.toggleRsvp);
  const clearError = useFeedStore((state) => state.clearError);
  const resetFeedStore = useFeedStore((state) => state.reset);

  const [selectedPost, setSelectedPost] = useState<EventPost | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="logout"
          onPress={() => {
            void (async () => {
              await signOut();
              resetFeedStore();
            })();
          }}
        />
      ),
      title: "Profile",
    });
  }, [navigation, resetFeedStore, signOut]);

  useEffect(() => {
    if (profile) {
      void loadProfilePosts();
    }
  }, [loadProfilePosts, profile]);

  const handleSubmitComment = async () => {
    if (!selectedPost || !commentDraft.trim()) {
      return;
    }

    await commentOnPost(selectedPost.id, commentDraft);
    setCommentDraft("");
    setSelectedPost(null);
  };

  if (!profile) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={userPosts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            actionLabel="Create your first event"
            description="Share your first campus event to start building momentum."
            icon="calendar-plus"
            onActionPress={() => navigation.navigate("Create")}
            title="No posts yet"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <View style={styles.profileTopRow}>
                <AppAvatar name={profile.name} size={76} uri={profile.avatarUrl} />
                <View style={styles.profileText}>
                  <Text variant="headlineSmall">{profile.name}</Text>
                  <Text variant="bodyMedium">
                    {profile.headline} · {profile.collegeName}
                  </Text>
                  <Text variant="bodySmall">{profile.bio}</Text>
                </View>
              </View>

              <ProfileStats
                followers={profile.followers.length}
                following={profile.followingStudents.length + profile.followingColleges.length}
                posts={userPosts.length}
              />

              <View style={styles.followingSection}>
                <Text variant="titleSmall">Following colleges</Text>
                <View style={styles.chipsWrap}>
                  {profile.followingColleges.map((collegeId) => (
                    <Chip key={collegeId}>
                      {colleges.find((college) => college.id === collegeId)?.name ?? collegeId}
                    </Chip>
                  ))}
                </View>
              </View>

              <Button
                icon="compass-outline"
                mode="contained-tonal"
                onPress={() => navigation.navigate("HomeStack")}
              >
                Discover students and colleges
              </Button>
            </View>

            <Text variant="titleMedium">Your event posts</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard
            currentUserId={profile.id}
            onComment={() => {
              setSelectedPost(item);
              setCommentDraft("");
            }}
            onLike={() => {
              void likePost(item.id);
            }}
            onRsvp={() => {
              void toggleRsvp(item.id);
            }}
            onShare={() => {
              void sharePost(item);
            }}
            post={item}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <CommentDialog
        onChangeText={setCommentDraft}
        onDismiss={() => {
          setSelectedPost(null);
          setCommentDraft("");
        }}
        onSubmit={() => {
          void handleSubmitComment();
        }}
        post={selectedPost}
        value={commentDraft}
        visible={!!selectedPost}
      />

      <Snackbar onDismiss={clearError} visible={!!error}>
        {error ?? ""}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: appSpacing.md,
  },
  headerWrap: {
    gap: appSpacing.md,
    marginBottom: appSpacing.md,
  },
  profileCard: {
    borderRadius: appRadii.lg,
    padding: appSpacing.lg,
    gap: appSpacing.md,
  },
  profileTopRow: {
    flexDirection: "row",
    gap: appSpacing.md,
  },
  profileText: {
    flex: 1,
    gap: appSpacing.xs,
  },
  followingSection: {
    gap: appSpacing.sm,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appSpacing.sm,
  },
});
