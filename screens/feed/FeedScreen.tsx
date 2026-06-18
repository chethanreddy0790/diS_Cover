import React, { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ActivityIndicator, IconButton, Snackbar, Text, useTheme } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";

import { PostCard } from "../../components/cards/PostCard";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { CommentDialog } from "../../components/feed/CommentDialog";
import { CollegeFilterChips } from "../../components/feed/CollegeFilterChips";
import { UpcomingEventsStrip } from "../../components/feed/UpcomingEventsStrip";
import { HomeStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/useAuthStore";
import { useFeedStore } from "../../store/useFeedStore";
import { appRadii, appSpacing } from "../../theme/theme";
import { EventPost } from "../../types";

type Props = NativeStackScreenProps<HomeStackParamList, "Feed">;

export const FeedScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const profile = useAuthStore((state) => state.profile);

  const posts = useFeedStore((state) => state.posts);
  const colleges = useFeedStore((state) => state.colleges);
  const collegeFilter = useFeedStore((state) => state.collegeFilter);
  const isLoadingInitial = useFeedStore((state) => state.isLoadingInitial);
  const isLoadingMore = useFeedStore((state) => state.isLoadingMore);
  const isRefreshing = useFeedStore((state) => state.isRefreshing);
  const error = useFeedStore((state) => state.error);
  const hydrate = useFeedStore((state) => state.hydrate);
  const loadMoreFeed = useFeedStore((state) => state.loadMoreFeed);
  const refreshFeed = useFeedStore((state) => state.refreshFeed);
  const likePost = useFeedStore((state) => state.likePost);
  const commentOnPost = useFeedStore((state) => state.commentOnPost);
  const sharePost = useFeedStore((state) => state.sharePost);
  const toggleRsvp = useFeedStore((state) => state.toggleRsvp);
  const setCollegeFilter = useFeedStore((state) => state.setCollegeFilter);
  const clearError = useFeedStore((state) => state.clearError);

  const [selectedPost, setSelectedPost] = useState<EventPost | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Campus feed",
      headerRight: () => (
        <IconButton icon="magnify" onPress={() => navigation.navigate("Search")} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (profile && posts.length === 0 && !isLoadingInitial) {
      void hydrate();
    }
  }, [hydrate, isLoadingInitial, posts.length, profile]);

  const upcomingPosts = [...posts]
    .filter((post) => new Date(post.eventDate).getTime() > Date.now())
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate))
    .slice(0, 5);

  const heroPost = upcomingPosts[0];

  const handleSubmitComment = async () => {
    if (!selectedPost || !commentDraft.trim()) {
      return;
    }

    await commentOnPost(selectedPost.id, commentDraft);
    setCommentDraft("");
    setSelectedPost(null);
  };

  if (isLoadingInitial && posts.length === 0) {
    return <LoadingState label="Loading your personalized event feed..." />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={posts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            description="Follow a few students or colleges to start shaping your feed."
            icon="calendar-search"
            title="No events match this filter yet"
          />
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator />
            </View>
          ) : (
            <View style={styles.footerSpace} />
          )
        }
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.heroCard}
            >
              <Text style={styles.heroEyebrow} variant="labelLarge">
                Upcoming on campus
              </Text>
              <Text style={styles.heroTitle} variant="headlineMedium">
                {heroPost?.title ?? "Stay ahead of what students are planning this week"}
              </Text>
              <Text style={styles.heroBody} variant="bodyLarge">
                {heroPost
                  ? `${heroPost.collegeName} · ${heroPost.location}`
                  : "Your feed prioritizes upcoming events from followed students and colleges."}
              </Text>
            </LinearGradient>

            {upcomingPosts.length > 0 ? <UpcomingEventsStrip posts={upcomingPosts} /> : null}

            <CollegeFilterChips
              colleges={colleges}
              onSelect={(filter) => {
                void setCollegeFilter(filter);
              }}
              selectedFilter={collegeFilter}
            />
          </View>
        }
        onEndReached={() => {
          void loadMoreFeed();
        }}
        onEndReachedThreshold={0.25}
        onRefresh={() => {
          void refreshFeed();
        }}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          <PostCard
            currentUserId={profile?.id}
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
  heroCard: {
    borderRadius: appRadii.lg,
    marginBottom: appSpacing.lg,
    padding: appSpacing.lg,
    gap: appSpacing.sm,
  },
  heroEyebrow: {
    color: "#DBEAFE",
  },
  heroTitle: {
    color: "#FFFFFF",
  },
  heroBody: {
    color: "#E0F2FE",
  },
  footerLoader: {
    paddingVertical: appSpacing.md,
  },
  footerSpace: {
    height: appSpacing.xl,
  },
});
