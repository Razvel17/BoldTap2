import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";
import { ChevronDown } from "lucide-react-native";
import { Card } from "@/types/card";

interface CardItemProps {
  card: Card;
  onPress?: () => void;
  onDelete?: () => void;
  index?: number;
  totalCards?: number;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onPress,
  onDelete,
  index = 0,
  totalCards = 1,
}) => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, mass: 1 });
    rotate.value = withSpring(-1, { damping: 10, mass: 1 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, mass: 1 });
    rotate.value = withSpring(0, { damping: 10, mass: 1 });
  };

  // Mask the barcode value
  const maskedValue =
    card.barcodeValue.length > 4
      ? `•••• •••• •••• ${card.barcodeValue.slice(-4)}`
      : card.barcodeValue;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.pressable}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: card.color,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName} numberOfLines={1}>
                {card.name}
              </Text>
              <Text style={styles.cardIssuer} numberOfLines={1}>
                {card.issuer}
              </Text>
            </View>
            <ChevronDown color="#fff" size={20} opacity={0.6} />
          </View>

          {/* Barcode display */}
          <View style={styles.barcodeSection}>
            <View style={styles.barcodePattern}>
              <View
                style={{
                  width: 2,
                  height: 32,
                  backgroundColor: "#fff",
                  opacity: 0.3,
                }}
              />
              <View
                style={{
                  width: 3,
                  height: 32,
                  backgroundColor: "#fff",
                  opacity: 0.6,
                }}
              />
              <View
                style={{
                  width: 2,
                  height: 32,
                  backgroundColor: "#fff",
                  opacity: 0.3,
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 32,
                  backgroundColor: "#fff",
                }}
              />
              <View
                style={{
                  width: 2,
                  height: 32,
                  backgroundColor: "#fff",
                  opacity: 0.4,
                }}
              />
            </View>

            <Text style={styles.maskedValue} numberOfLines={1}>
              {maskedValue}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.type}>{card.barcodeType}</Text>
            <Pressable
              onPress={onDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.deleteText}>×</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    marginHorizontal: 12,
  },
  pressable: {
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardIssuer: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.75,
  },
  barcodeSection: {
    alignItems: "center",
    marginVertical: 12,
    gap: 8,
  },
  barcodePattern: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  },
  maskedValue: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    letterSpacing: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  type: {
    fontSize: 11,
    color: "#fff",
    opacity: 0.6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "300",
  },
});
