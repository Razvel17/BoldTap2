import React, { useMemo } from "react";
import { View, Text, StyleSheet, type DimensionValue } from "react-native";
import { BarcodeType } from "@/types/card";

interface BarcodeViewProps {
  value: string;
  type: BarcodeType;
  width?: DimensionValue;
  height?: number;
}

// Fallback barcode renderer using SVG pattern
const renderBarcodePattern = (value: string, type: BarcodeType) => {
  // Generate a visual barcode pattern
  const bars = value
    .split("")
    .map((char, i) => (Math.random() > 0.5 ? 1 : 0))
    .slice(0, 50)
    .map((bit, i) => (
      <View
        key={i}
        style={{
          width: bit ? 3 : 2,
          height: 40,
          backgroundColor: bit ? "#000" : "#fff",
          marginHorizontal: 1,
        }}
      />
    ));

  return bars;
};

export const BarcodeView: React.FC<BarcodeViewProps> = ({
  value,
  type,
  width = 300,
  height = 120,
}) => {
  const displayValue = useMemo(() => {
    // Show last 4 digits for privacy
    if (value.length > 4) {
      return `•••• •••• •••• ${value.slice(-4)}`;
    }
    return value;
  }, [value]);

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.barcodeContainer}>
        <View style={styles.barcode}>{renderBarcodePattern(value, type)}</View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{type}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  barcodeContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  barcode: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: "#999",
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: "#333",
    letterSpacing: 1,
  },
});
