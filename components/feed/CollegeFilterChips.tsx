import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Text } from "react-native-paper";

import { College, CollegeFilter } from "../../types";
import { appSpacing } from "../../theme/theme";

interface CollegeFilterChipsProps {
  colleges: College[];
  selectedFilter: CollegeFilter;
  onSelect: (filter: CollegeFilter) => void;
}

export const CollegeFilterChips = ({
  colleges,
  selectedFilter,
  onSelect,
}: CollegeFilterChipsProps) => (
  <View style={styles.container}>
    <Text variant="titleSmall">Filter by college</Text>
    <ScrollView
      contentContainerStyle={styles.chipRow}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <Chip selected={selectedFilter === "all"} onPress={() => onSelect("all")}>
        All
      </Chip>
      <Chip
        selected={selectedFilter === "following"}
        onPress={() => onSelect("following")}
      >
        Following
      </Chip>
      {colleges.map((college) => (
        <Chip
          key={college.id}
          selected={selectedFilter === college.id}
          onPress={() => onSelect(college.id)}
        >
          {college.name}
        </Chip>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: appSpacing.sm,
    marginBottom: appSpacing.lg,
  },
  chipRow: {
    gap: appSpacing.sm,
    paddingRight: appSpacing.md,
  },
});
