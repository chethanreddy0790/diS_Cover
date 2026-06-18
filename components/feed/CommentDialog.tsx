import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";

import { appSpacing } from "../../theme/theme";
import { EventPost } from "../../types";
import { AppAvatar } from "../common/AppAvatar";
import { formatRelativeTime } from "../../utils/format";

interface CommentDialogProps {
  post: EventPost | null;
  value: string;
  visible: boolean;
  onChangeText: (value: string) => void;
  onDismiss: () => void;
  onSubmit: () => void;
}

export const CommentDialog = ({
  post,
  value,
  visible,
  onChangeText,
  onDismiss,
  onSubmit,
}: CommentDialogProps) => (
  <Portal>
    <Dialog dismissable onDismiss={onDismiss} visible={visible}>
      <Dialog.Title>Join the conversation</Dialog.Title>
      <Dialog.Content style={styles.content}>
        {post ? (
          <ScrollView contentContainerStyle={styles.commentList} style={styles.commentScroll}>
            {post.comments.slice(-3).map((comment) => (
              <View key={comment.id} style={styles.commentRow}>
                <AppAvatar name={comment.authorName} size={34} uri={comment.authorAvatarUrl} />
                <View style={styles.commentBody}>
                  <Text variant="labelMedium">
                    {comment.authorName} · {formatRelativeTime(comment.createdAt)}
                  </Text>
                  <Text variant="bodyMedium">{comment.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : null}
        <TextInput
          label="Comment"
          mode="outlined"
          multiline
          numberOfLines={3}
          onChangeText={onChangeText}
          value={value}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button disabled={!value.trim()} mode="contained" onPress={onSubmit}>
          Comment
        </Button>
      </Dialog.Actions>
    </Dialog>
  </Portal>
);

const styles = StyleSheet.create({
  content: {
    gap: appSpacing.md,
  },
  commentScroll: {
    maxHeight: 180,
  },
  commentList: {
    gap: appSpacing.sm,
  },
  commentRow: {
    flexDirection: "row",
    gap: appSpacing.sm,
  },
  commentBody: {
    flex: 1,
    gap: 2,
  },
});
