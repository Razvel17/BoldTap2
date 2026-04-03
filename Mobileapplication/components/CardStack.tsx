import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CardItem } from "./CardItem";
import { Card } from "@/types/card";

interface CardStackProps {
  cards: Card[];
  onCardPress?: (cardId: string) => void;
  onCardDelete?: (cardId: string) => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  onCardPress,
  onCardDelete,
}) => {
  return (
    <View style={styles.container}>
      {cards.length === 0 ? (
        <View style={styles.emptyState}>
          <Animated.Text style={styles.emptyTitle} entering={FadeInDown}>
            No Cards Yet
          </Animated.Text>
          <Animated.Text
            style={styles.emptyDescription}
            entering={FadeInDown.delay(100)}
          >
            Add your first loyalty card to get started
          </Animated.Text>
        </View>
      ) : (
        <View style={styles.stack}>
          {cards.map((card, index) => (
            <Animated.View
              key={card.id}
              entering={FadeInDown.delay(index * 60).springify()}
            >
              <CardItem
                card={card}
                index={index}
                totalCards={cards.length}
                onPress={() => onCardPress?.(card.id)}
                onDelete={() => onCardDelete?.(card.id)}
              />
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  stack: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
});
