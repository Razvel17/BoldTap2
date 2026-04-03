import React, { useEffect } from "react";
import { useCards } from "@/store/useCards";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const initializeStore = useCards((state) => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "default",
            gestureEnabled: true,
            animationTypeForReplace: "pop",
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="card/[id]"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
              gestureEnabled: true,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
