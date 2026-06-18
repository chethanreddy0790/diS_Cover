import { Feather } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useStore } from '../../store/useStore';

const CreateButton = () => {
  return (
    <TouchableOpacity
      style={styles.createButtonContainer}
      onPress={() => router.push('/create-event')}
      activeOpacity={0.8}
    >
      <View style={styles.createButton}>
        <Feather name="plus" size={24} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

function TabLayout() {
  const isLoggedIn = useStore((state) => state.isLoggedIn);

  React.useEffect(() => {
    // Only redirect if user is explicitly not logged in
    if (isLoggedIn === false) {
      const timeout = setTimeout(() => {
        router.replace('/login');
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B5BFF',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarButton: () => <CreateButton />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ color }) => <Feather name="bell" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    height: 80,
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  createButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  createButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B5BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B5BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});

export default TabLayout;
