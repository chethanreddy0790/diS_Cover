import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

import { appRadii, appSpacing } from "../../theme/theme";
import { EventPost } from "../../types";
import { formatEventDate } from "../../utils/format";

interface UpcomingEventsStripProps {
  posts: EventPost[];
}

export const UpcomingEventsStrip = ({ posts }: UpcomingEventsStripProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="titleSmall">Upcoming soon</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {posts.map((post) => (
          <Pressable key={post.id}>
            <Surface
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                },
              ]}
            >
              <Text numberOfLines={2} variant="titleSmall">
                {post.title}
              </Text>
              <Text numberOfLines={1} variant="bodySmall">
                {formatEventDate(post.eventDate)}
              </Text>
              <Text numberOfLines={1} style={{ color: theme.colors.primary }} variant="bodySmall">
                {post.location}
              </Text>
              <Text numberOfLines={1} variant="labelSmall">
                {post.collegeName}
              </Text>
            </Surface>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: appSpacing.sm,
    marginBottom: appSpacing.lg,
  },
  scrollContent: {
    gap: appSpacing.sm,
    paddingRight: appSpacing.md,
  },
  card: {
    width: 180,
    padding: appSpacing.md,
    borderRadius: appRadii.md,
    gap: appSpacing.xs,
  },
});
