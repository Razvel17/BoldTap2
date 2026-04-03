import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCards } from "@/store/useCards";
import { BarcodeView } from "@/components/BarcodeView";
import { X, Edit2, Trash2 } from "lucide-react-native";
import Animated, {
  FadeIn,
  SlideInUp,
  withSpring,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getCardById = useCards((state) => state.getCardById);
  const removeCard = useCards((state) => state.removeCard);

  const card = id ? getCardById(id) : null;
  const scale = useSharedValue(0.9);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      mass: 1,
      overshootClamping: false,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <X color="#fff" size={28} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Card not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Card",
      `Are you sure you want to delete "${card.name}"?`,
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );
            await removeCard(card.id);
            router.back();
          },
          style: "destructive",
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={card.color} />

      {/* Close Header */}
      <Animated.View style={styles.header} entering={FadeIn}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <X color="#fff" size={28} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Display */}
        <Animated.View
          style={[
            styles.cardContainer,
            { backgroundColor: card.color },
            animatedStyle,
          ]}
          entering={SlideInUp.springify()}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardIssuer}>{card.issuer}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.scanLabel}>Scan from a scanner</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardType}>{card.barcodeType}</Text>
          </View>
        </Animated.View>

        {/* Barcode Section */}
        <Animated.View
          style={styles.barcodeSection}
          entering={FadeIn.delay(100)}
        >
          <Text style={styles.barcodeTitle}>Barcode</Text>
          <BarcodeView
            value={card.barcodeValue}
            type={card.barcodeType}
            width="100%"
            height={120}
          />
        </Animated.View>

        {/* Details Section */}
        <Animated.View
          style={styles.detailsSection}
          entering={FadeIn.delay(150)}
        >
          <Text style={styles.sectionTitle}>Card Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name</Text>
            <Text style={styles.detailValue}>{card.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issuer</Text>
            <Text style={styles.detailValue}>{card.issuer}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Barcode Type</Text>
            <Text style={styles.detailValue}>{card.barcodeType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Barcode Value</Text>
            <Text style={styles.detailValue} selectable>
              {card.barcodeValue}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Added</Text>
            <Text style={styles.detailValue}>
              {new Date(card.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View style={styles.actions} entering={FadeIn.delay(200)}>
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Trash2 color="#ff5252" size={20} />
            <Text style={styles.deleteButtonText}>Delete Card</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    minHeight: 220,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardIssuer: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
  },
  cardBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  scanLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.6,
    fontWeight: "500",
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  cardType: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.5,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  barcodeSection: {
    marginBottom: 28,
  },
  barcodeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  detailsSection: {
    marginBottom: 28,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  detailRow_last: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
    textAlign: "right",
  },
  actions: {
    marginBottom: 16,
    gap: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#ff5252",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff5252",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#999",
  },
});
