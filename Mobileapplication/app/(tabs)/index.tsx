import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Pressable,
  SafeAreaView,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useCards } from "@/store/useCards";
import { CardStack } from "@/components/CardStack";
import { Wallet } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function HomeScreen() {
  const router = useRouter();
  const { cards, initialized } = useCards((state) => ({
    cards: state.cards,
    initialized: state.initialized,
  }));
  const removeCard = useCards((state) => state.removeCard);

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => b.createdAt - a.createdAt),
    [cards],
  );

  const handleCardPress = (cardId: string) => {
    router.push(`/card/${cardId}`);
  };

  const handleCardDelete = (cardId: string) => {
    removeCard(cardId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <Animated.View style={styles.header} entering={FadeInDown.springify()}>
        <View style={styles.headerContent}>
          <View style={styles.walletTrigger}>
            <View style={styles.walletIconWrap}>
              <Wallet color="#1565C0" size={28} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Loyalty Cards</Text>
              <Text style={styles.headerSubtitle}>
                {sortedCards.length} card{sortedCards.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Card Stack */}
      <View style={styles.content}>
        {initialized ? (
          <CardStack
            cards={sortedCards}
            onCardPress={handleCardPress}
            onCardDelete={handleCardDelete}
          />
        ) : (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#1565C0" />
            <Text style={styles.loadingText}>Loading your cards...</Text>
          </View>
        )}
      </View>

      {/* Quick Add FAB */}
      {sortedCards.length > 0 && (
        <Animated.View
          style={styles.fab}
          entering={FadeInDown.delay(200).springify()}
        >
          <Pressable
            onPress={() => router.push("/add")}
            style={({ pressed }) => [
              styles.fabButton,
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
          >
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  walletIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f1724",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 12,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#999",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 100,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1565C0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
  },
});
