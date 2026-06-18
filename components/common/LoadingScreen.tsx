import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * SplashLoadingScreen component integrated from provided design.
 * Handles the initial application loading state with premium animations.
 */
export const LoadingScreen = () => {
  const iconDrop = useRef(new Animated.Value(-400)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;

  const logoShift = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(10)).current;

  const progress = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const footerTranslate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(iconDrop, {
          toValue: 0,
          duration: 1400,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoShift, {
          toValue: -60,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    ).start();

    Animated.timing(footerOpacity, {
      toValue: 1,
      duration: 1200,
      delay: 3000,
      useNativeDriver: true,
    }).start();

    Animated.timing(footerTranslate, {
      toValue: 0,
      duration: 1200,
      delay: 3000,
      useNativeDriver: true,
    }).start();
  }, [iconDrop, iconOpacity, iconScale, logoShift, textOpacity, textTranslate, progress, footerOpacity, footerTranslate]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.blurCircleTop} />
        <View style={styles.blurCircleBottom} />

        <Animated.View
          style={[
            styles.logoCluster,
            {
              transform: [{ translateX: logoShift }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.iconWrap,
              {
                opacity: iconOpacity,
                transform: [{ translateY: iconDrop }, { scale: iconScale }],
              },
            ]}
          >
            <MaterialIcons name="alternate-email" size={42} color="#191c1e" />
          </Animated.View>

          <Animated.View
            style={[
              styles.brandWrap,
              {
                opacity: textOpacity,
                transform: [{ translateX: textTranslate }],
              },
            ]}
          >
            <Text style={styles.brandText}>
              di<Text style={styles.brandBlue}>S_C</Text>over
            </Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.loaderTrack}>
          <Animated.View
            style={[
              styles.loaderFill,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: footerOpacity,
              transform: [{ translateY: footerTranslate }],
            },
          ]}
        >
          <Text style={styles.slogan}>INTER-COLLEGE EVENT DISCOVERY</Text>
          <View style={styles.footerLine} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomBrand,
            {
              opacity: footerOpacity,
              transform: [{ translateY: footerTranslate }],
            },
          ]}
        >
          <View style={styles.dot} />
          <Text style={styles.bottomText}>DESIGNED BY THE DIGITAL CURATOR</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f9fb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7f9fb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blurCircleTop: {
    position: "absolute",
    top: -160,
    right: -160,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(79, 109, 255, 0.05)",
  },
  blurCircleBottom: {
    position: "absolute",
    bottom: -160,
    left: -160,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: "rgba(173, 198, 255, 0.08)",
  },
  logoCluster: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  brandWrap: {
    position: "absolute",
    left: 48,
    marginLeft: -4,
    minWidth: 220,
  },
  brandText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#191c1e",
    letterSpacing: -1,
  },
  brandBlue: {
    color: "#3B5BFF",
  },
  loaderTrack: {
    marginTop: 48,
    width: 192,
    height: 2,
    borderRadius: 999,
    backgroundColor: "#e0e3e5",
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    backgroundColor: "#3B5BFF",
    borderRadius: 999,
  },
  footer: {
    position: "absolute",
    bottom: 96,
    alignItems: "center",
    gap: 16,
  },
  slogan: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#747687",
  },
  footerLine: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(79, 109, 255, 0.4)",
  },
  bottomBrand: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(79, 109, 255, 0.6)",
  },
  bottomText: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 2,
    color: "rgba(85, 92, 106, 0.7)",
  },
});
