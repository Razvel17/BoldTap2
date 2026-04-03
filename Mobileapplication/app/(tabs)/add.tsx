import React, { useState } from "react";
import { Alert, SafeAreaView, StatusBar, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useCards } from "@/store/useCards";
import { AddCardForm } from "@/components/AddCardForm";
import { CardScanner } from "@/components/CardScanner";
import { CardFormData } from "@/types/card";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { type BarCodeScannerResult } from "expo-barcode-scanner";

export default function AddCardScreen() {
  const router = useRouter();
  const addCard = useCards((state) => state.addCard);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const handleSubmit = async (formData: CardFormData) => {
    try {
      setIsLoading(true);
      await addCard(formData);
      setFormKey((current) => current + 1);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error("Failed to add card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mapScannedType = (type: string): CardFormData["barcodeType"] => {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes("qr")) {
      return "QR";
    }
    if (normalizedType.includes("39")) {
      return "CODE39";
    }
    if (normalizedType.includes("ean13") || normalizedType.includes("ean_13")) {
      return "EAN13";
    }

    return "CODE128";
  };

  const handleScannedCard = async ({ data, type }: BarCodeScannerResult) => {
    if (hasScanned || isLoading) {
      return;
    }

    const trimmedData = data.trim();
    if (!trimmedData) {
      Alert.alert("Invalid Scan", "We could not read a usable code from that scan.");
      return;
    }

    setHasScanned(true);
    const barcodeType = mapScannedType(type);
    const autoCard: CardFormData = {
      name: barcodeType === "QR" ? "Scanned QR Card" : "Scanned Loyalty Card",
      issuer: "Quick Scan",
      barcodeValue: trimmedData,
      barcodeType,
      color: "#1565C0",
    };

    try {
      setIsLoading(true);
      await addCard(autoCard);
      setScannerVisible(false);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Card Added",
        `${autoCard.name} was added to your wallet automatically.`,
      );
      router.replace("/");
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Scan Failed",
        "We scanned the code, but could not add the card. Please try again.",
      );
      console.error("Failed to add scanned card:", error);
    } finally {
      setIsLoading(false);
      setHasScanned(false);
    }
  };

  const openScanner = () => {
    setHasScanned(false);
    setScannerVisible(true);
  };

  const closeScanner = () => {
    if (isLoading) {
      return;
    }

    setScannerVisible(false);
    setHasScanned(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

      {/* Header */}
      <Animated.View style={styles.header} entering={FadeInDown.springify()}>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <Text style={styles.headerSubtitle}>
          Create a new loyalty card to your wallet
        </Text>
      </Animated.View>

      {/* Form */}
      <AddCardForm
        key={formKey}
        onSubmit={handleSubmit}
        onScanPress={openScanner}
        isLoading={isLoading}
      />

      <CardScanner
        visible={scannerVisible}
        isSaving={isLoading}
        onClose={closeScanner}
        onScan={handleScannedCard}
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
