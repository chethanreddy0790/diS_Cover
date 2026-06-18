import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Chip, Divider, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { appRadii, appSpacing } from "../../theme/theme";
import { EventPost } from "../../types";
import { compactNumber, formatEventDate, formatRelativeTime } from "../../utils/format";
import { AppAvatar } from "../common/AppAvatar";
import AppMediaImage from "../AppMediaImage";

interface PostCardProps {
  post: EventPost;
  currentUserId?: string;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onRsvp: () => void;
}

export const PostCard = ({
  post,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onRsvp,
}: PostCardProps) => {
  const theme = useTheme();
  const isLiked = !!currentUserId && post.likes.includes(currentUserId);
  const isAttending = !!currentUserId && post.attendeeIds.includes(currentUserId);

  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <AppAvatar name={post.authorName} uri={post.authorAvatarUrl} />
          <View style={styles.headerText}>
            <Text variant="titleSmall">{post.authorName}</Text>
            <Text numberOfLines={1} variant="bodySmall">
              {post.authorHeadline} · {post.collegeName}
            </Text>
            <Text variant="labelSmall">{formatRelativeTime(post.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text variant="headlineSmall">{post.title}</Text>
          <Text variant="bodyMedium">{post.description}</Text>
        </View>

        {post.imageUrl ? (
          <AppMediaImage 
            uri={post.imageUrl}
            type="post"
            mode="thumbnail"
            allowFullscreen={true}
            style={styles.imageContainer}
          />
        ) : null}

        <View style={styles.metaBlock}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              color={theme.colors.primary}
              name="calendar-clock-outline"
              size={18}
            />
            <Text style={styles.metaText} variant="bodyMedium">
              {formatEventDate(post.eventDate)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              color={theme.colors.secondary}
              name="map-marker-outline"
              size={18}
            />
            <Text style={styles.metaText} variant="bodyMedium">
              {post.location}
            </Text>
          </View>
        </View>

        <View style={styles.tagsWrap}>
          {post.tags.map((tag) => (
            <Chip compact key={tag}>
              #{tag}
            </Chip>
          ))}
        </View>

        <View style={styles.statsRow}>
          <Text variant="bodySmall">
            {compactNumber(post.likes.length)} likes · {compactNumber(post.comments.length)} comments
          </Text>
          <Text variant="bodySmall">
            {compactNumber(post.rsvpCount)} going · {compactNumber(post.shares)} shares
          </Text>
        </View>
      </Card.Content>
      <Divider />
      <Card.Actions style={styles.actions}>
        <Button
          compact
          icon={isLiked ? "thumb-up" : "thumb-up-outline"}
          mode={isLiked ? "contained-tonal" : "text"}
          onPress={onLike}
        >
          Like
        </Button>
        <Button compact icon="comment-outline" onPress={onComment}>
          Comment
        </Button>
        <Button compact icon="share-variant-outline" onPress={onShare}>
          Share
        </Button>
        <Button
          compact
          icon={isAttending ? "calendar-check" : "calendar-plus"}
          mode={isAttending ? "contained-tonal" : "text"}
          onPress={onRsvp}
        >
          RSVP
        </Button>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: appRadii.lg,
    marginBottom: appSpacing.md,
  },
  content: {
    gap: appSpacing.md,
    paddingVertical: appSpacing.md,
  },
  header: {
    flexDirection: "row",
    gap: appSpacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  titleBlock: {
    gap: appSpacing.xs,
  },
  imageContainer: {
    width: "100%",
    borderRadius: appRadii.md,
    overflow: 'hidden',
  },
  metaBlock: {
    gap: appSpacing.xs,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: appSpacing.xs,
  },
  metaText: {
    flex: 1,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appSpacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: appSpacing.sm,
  },
  actions: {
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
});

