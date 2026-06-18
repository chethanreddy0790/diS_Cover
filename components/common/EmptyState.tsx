import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { appSpacing } from "../../theme/theme";

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
      >
        <MaterialCommunityIcons color={theme.colors.primary} name={icon} size={26} />
      </View>
      <Text style={styles.centerText} variant="titleMedium">
        {title}
      </Text>
      <Text style={styles.centerText} variant="bodyMedium">
        {description}
      </Text>
      {actionLabel && onActionPress ? (
        <Button mode="contained" onPress={onActionPress}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: appSpacing.xl,
    gap: appSpacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    textAlign: "center",
  },
});
