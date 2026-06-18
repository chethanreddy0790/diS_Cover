import React, { useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { Card, Text, useTheme } from "react-native-paper";

import { AppAvatar } from "../../components/common/AppAvatar";
import { EmptyState } from "../../components/common/EmptyState";
import { useFeedStore } from "../../store/useFeedStore";
import { appSpacing } from "../../theme/theme";
import { formatRelativeTime } from "../../utils/format";

export const NotificationsScreen = () => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const notifications = useFeedStore((state) => state.notifications);
  const loadNotifications = useFeedStore((state) => state.loadNotifications);
  const markAllNotificationsRead = useFeedStore((state) => state.markAllNotificationsRead);

  useEffect(() => {
    if (isFocused) {
      void loadNotifications();
      void markAllNotificationsRead();
    }
  }, [isFocused, loadNotifications, markAllNotificationsRead]);

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={notifications}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <EmptyState
          description="Likes and comments on your events will show up here."
          icon="bell-outline"
          title="No notifications yet"
        />
      }
      renderItem={({ item }) => (
        <Card
          mode="contained"
          style={[
            styles.card,
            {
              borderColor: item.read ? "transparent" : theme.colors.primary,
            },
          ]}
        >
          <Card.Content style={styles.cardContent}>
            <View style={styles.row}>
              <AppAvatar name={item.actorName} uri={item.actorAvatarUrl} />
              <View style={styles.flex}>
                <Text variant="bodyMedium">
                  <Text variant="titleSmall">{item.actorName}</Text> {item.message}
                </Text>
                <Text variant="bodySmall">{item.postTitle}</Text>
                <Text variant="labelSmall">{formatRelativeTime(item.createdAt)}</Text>
              </View>
              {!item.read ? <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} /> : null}
            </View>
          </Card.Content>
        </Card>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    padding: appSpacing.md,
    gap: appSpacing.sm,
  },
  card: {
    borderWidth: 1,
  },
  cardContent: {
    paddingVertical: appSpacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: appSpacing.sm,
    alignItems: "center",
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
