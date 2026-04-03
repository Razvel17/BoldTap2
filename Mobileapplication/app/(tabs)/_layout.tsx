import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Home, Plus } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function TabsLayout() {
  return (
    <Tabs
      sceneContainerStyle={styles.sceneContainer}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#1565C0",
        tabBarInactiveTintColor: "#666",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Cards",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <Home color={color} size={24} />
            </Animated.View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Card",
          tabBarIcon: ({ color, focused }) => (
            <Animated.View entering={FadeIn}>
              <Plus color={color} size={24} />
            </Animated.View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#1a1a1a",
    borderTopColor: "#262626",
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  sceneContainer: {
    backgroundColor: "#0a0a0a",
  },
});
