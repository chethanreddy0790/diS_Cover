import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Button,
  Card,
  Searchbar,
  Snackbar,
  Text,
} from "react-native-paper";

import { AppAvatar } from "../../components/common/AppAvatar";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { HomeStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/useAuthStore";
import { useFeedStore } from "../../store/useFeedStore";
import { appSpacing } from "../../theme/theme";

type Props = NativeStackScreenProps<HomeStackParamList, "Search">;

export const SearchScreen = ({}: Props) => {
  const profile = useAuthStore((state) => state.profile);
  const searchResults = useFeedStore((state) => state.searchResults);
  const isSearching = useFeedStore((state) => state.isSearching);
  const error = useFeedStore((state) => state.error);
  const runSearch = useFeedStore((state) => state.runSearch);
  const followStudent = useFeedStore((state) => state.followStudent);
  const followCollege = useFeedStore((state) => state.followCollege);
  const clearError = useFeedStore((state) => state.clearError);

  const [query, setQuery] = useState("");

  useEffect(() => {
    void runSearch("");
  }, [runSearch]);

  return (
    <View style={styles.screen}>
      <Searchbar
        onChangeText={(value) => {
          setQuery(value);
          void runSearch(value);
        }}
        placeholder="Search students, clubs, or colleges"
        style={styles.searchbar}
        value={query}
      />

      {isSearching && searchResults.students.length === 0 && searchResults.colleges.length === 0 ? (
        <LoadingState label="Searching campus communities..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text variant="titleMedium">Students</Text>
          {searchResults.students.length === 0 ? (
            <EmptyState
              description="Try another name, role, or college."
              icon="account-search-outline"
              title="No students found"
            />
          ) : (
            searchResults.students.map((student) => {
              const isFollowing = !!profile?.followingStudents.includes(student.id);

              return (
                <Card key={student.id} mode="contained" style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.row}>
                      <AppAvatar name={student.name} uri={student.avatarUrl} />
                      <View style={styles.flex}>
                        <Text variant="titleSmall">{student.name}</Text>
                        <Text variant="bodySmall">
                          {student.headline} · {student.collegeName}
                        </Text>
                      </View>
                    </View>
                    <Text variant="bodyMedium">{student.bio}</Text>
                    <Button
                      mode={isFollowing ? "contained-tonal" : "contained"}
                      onPress={() => {
                        void followStudent(student.id);
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </Card.Content>
                </Card>
              );
            })
          )}

          <Text style={styles.sectionTitle} variant="titleMedium">
            Colleges
          </Text>
          {searchResults.colleges.length === 0 ? (
            <EmptyState
              description="Try searching by city or college name."
              icon="school-outline"
              title="No colleges found"
            />
          ) : (
            searchResults.colleges.map((college) => {
              const isFollowing = !!profile?.followingColleges.includes(college.id);

              return (
                <Card key={college.id} mode="contained" style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    <View style={styles.row}>
                      <View
                        style={[
                          styles.collegeBadge,
                          {
                            backgroundColor: college.color,
                          },
                        ]}
                      />
                      <View style={styles.flex}>
                        <Text variant="titleSmall">{college.name}</Text>
                        <Text variant="bodySmall">
                          {college.city} · {college.followers} followers
                        </Text>
                      </View>
                    </View>
                    <Text variant="bodyMedium">{college.description}</Text>
                    <Button
                      mode={isFollowing ? "contained-tonal" : "contained"}
                      onPress={() => {
                        void followCollege(college.id);
                      }}
                    >
                      {isFollowing ? "Following" : "Follow college"}
                    </Button>
                  </Card.Content>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}

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
  searchbar: {
    marginHorizontal: appSpacing.md,
    marginTop: appSpacing.md,
  },
  content: {
    padding: appSpacing.md,
    gap: appSpacing.md,
  },
  card: {
    marginTop: appSpacing.sm,
  },
  cardContent: {
    gap: appSpacing.sm,
    paddingVertical: appSpacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: appSpacing.sm,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    marginTop: appSpacing.md,
  },
  collegeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
