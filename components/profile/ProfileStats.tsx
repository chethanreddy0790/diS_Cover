import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text } from "react-native-paper";

import { appRadii, appSpacing } from "../../theme/theme";

interface ProfileStatsProps {
  posts: number;
  followers: number;
  following: number;
}

export const ProfileStats = ({ posts, followers, following }: ProfileStatsProps) => (
  <View style={styles.row}>
    <Surface style={styles.card}>
      <Text variant="headlineSmall">{posts}</Text>
      <Text variant="bodySmall">Posts</Text>
    </Surface>
    <Surface style={styles.card}>
      <Text variant="headlineSmall">{followers}</Text>
      <Text variant="bodySmall">Followers</Text>
    </Surface>
    <Surface style={styles.card}>
      <Text variant="headlineSmall">{following}</Text>
      <Text variant="bodySmall">Following</Text>
    </Surface>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: appSpacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: appRadii.md,
    padding: appSpacing.md,
    alignItems: "center",
    gap: appSpacing.xs,
  },
});
