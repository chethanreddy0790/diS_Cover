import React, { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { appSpacing } from "../../theme/theme";

interface LoadingStateProps {
  label?: string;
}

export const LoadingState = ({ label = "Loading campus activity..." }: LoadingStateProps) => {
  const theme = useTheme();
  const translateX = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const LOADER_WIDTH = 180;

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateX.value = withRepeat(
      withTiming(LOADER_WIDTH, {
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, contentStyle]}>
      <Text style={styles.logo}>@</Text>
      
      <View style={styles.loaderContainer}>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderBar, animatedStyle]} />
        </View>
      </View>

      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: appSpacing.lg,
    backgroundColor: "#F9F9FB",
  },
  logo: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  loaderContainer: {
    width: 180,
    height: 2,
    marginVertical: 16,
  },
  loaderTrack: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E5E7EB",
    borderRadius: 1,
    overflow: "hidden",
  },
  loaderBar: {
    width: 60,
    height: "100%",
    backgroundColor: "#3B82F6",
    position: "absolute",
    left: 0,
  },
  label: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
});
