import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { BarcodeType, CardFormData } from "@/types/card";
import { ChevronDown } from "lucide-react-native";

interface AddCardFormProps {
  onSubmit: (data: CardFormData) => Promise<void>;
  onScanPress?: () => void;
  isLoading?: boolean;
}

const BARCODE_TYPES: BarcodeType[] = ["QR", "CODE128", "CODE39", "EAN13"];
const CARD_COLORS = [
  "#8B4513", // Brown
  "#2E7D32", // Green
  "#1565C0", // Blue
  "#C62828", // Red
  "#FF6F00", // Orange
  "#6A1B9A", // Purple
  "#00796B", // Teal
  "#E65100", // Deep Orange
];

export const AddCardForm: React.FC<AddCardFormProps> = ({
  onSubmit,
  onScanPress,
  isLoading = false,
}) => {
  const [form, setForm] = useState<CardFormData>({
    name: "",
    issuer: "",
    barcodeValue: "",
    barcodeType: "CODE128",
    color: CARD_COLORS[0],
  });

  const [showBarcodeMenu, setShowBarcodeMenu] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canSubmit =
    form.name.trim().length > 0 &&
    form.issuer.trim().length > 0 &&
    form.barcodeValue.trim().length >= 6 &&
    !isLoading;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Card name is required";
    }
    if (!form.issuer.trim()) {
      newErrors.issuer = "Issuer is required";
    }
    if (!form.barcodeValue.trim()) {
      newErrors.barcodeValue = "Barcode value is required";
    }
    if (form.barcodeValue.length < 6) {
      newErrors.barcodeValue = "Barcode must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Invalid Form", "Please fix the errors above");
      return;
    }

    try {
      await onSubmit(form);
      // Form will be reset by parent or navigation
    } catch (error) {
      Alert.alert("Error", "Failed to add card. Please try again.");
      console.error(error);
    }
  };

  const Wrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const wrapperProps =
    Platform.OS === "ios" ? { behavior: "padding" as const } : {};

  return (
    <Wrapper style={styles.container} {...wrapperProps}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview */}
        <Animated.View style={styles.previewSection} entering={FadeInUp}>
          <View style={[styles.previewCard, { backgroundColor: form.color }]}>
            <Text style={styles.previewName} numberOfLines={1}>
              {form.name || "Card Name"}
            </Text>
            <Text style={styles.previewIssuer} numberOfLines={1}>
              {form.issuer || "Issuer"}
            </Text>
            <View style={styles.previewBarcode}>
              <Text style={styles.previewBarcodeText}>{form.barcodeType}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View style={styles.formSection} entering={FadeInUp.delay(50)}>
          {onScanPress && (
            <Pressable
              onPress={onScanPress}
              style={({ pressed }) => [
                styles.scanButton,
                pressed && !isLoading && { opacity: 0.85 },
                isLoading && styles.scanButtonDisabled,
              ]}
              disabled={isLoading}
            >
              <Text style={styles.scanButtonTitle}>Scan Barcode or QR Code</Text>
              <Text style={styles.scanButtonText}>
                Use your camera to add a card automatically
              </Text>
            </Pressable>
          )}

          {/* Name Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Card Name</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : undefined]}
              placeholder="e.g., Coffee Rewards"
              placeholderTextColor="#666"
              value={form.name}
              onChangeText={(text) => {
                setForm({ ...form, name: text });
                if (errors.name) {
                  setErrors({ ...errors, name: "" });
                }
              }}
              editable={!isLoading}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Issuer Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Issuer</Text>
            <TextInput
              style={[
                styles.input,
                errors.issuer ? styles.inputError : undefined,
              ]}
              placeholder="e.g., Brew & Co"
              placeholderTextColor="#666"
              value={form.issuer}
              onChangeText={(text) => {
                setForm({ ...form, issuer: text });
                if (errors.issuer) {
                  setErrors({ ...errors, issuer: "" });
                }
              }}
              editable={!isLoading}
            />
            {errors.issuer && (
              <Text style={styles.errorText}>{errors.issuer}</Text>
            )}
          </View>

          {/* Barcode Value Input */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Barcode Value</Text>
            <TextInput
              style={[
                styles.input,
                errors.barcodeValue ? styles.inputError : undefined,
              ]}
              placeholder="e.g., 123456789012345678"
              placeholderTextColor="#666"
              value={form.barcodeValue}
              onChangeText={(text) => {
                setForm({ ...form, barcodeValue: text });
                if (errors.barcodeValue) {
                  setErrors({ ...errors, barcodeValue: "" });
                }
              }}
              editable={!isLoading}
            />
            {errors.barcodeValue && (
              <Text style={styles.errorText}>{errors.barcodeValue}</Text>
            )}
          </View>

          {/* Barcode Type Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Barcode Type</Text>
            <Pressable
              onPress={() => setShowBarcodeMenu(!showBarcodeMenu)}
              style={styles.dropdown}
              disabled={isLoading}
            >
              <Text style={styles.dropdownText}>{form.barcodeType}</Text>
              <ChevronDown
                size={20}
                color="#999"
                style={{
                  transform: [{ rotate: showBarcodeMenu ? "180deg" : "0deg" }],
                }}
              />
            </Pressable>

            {showBarcodeMenu && (
              <View style={styles.dropdownMenu}>
                {BARCODE_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => {
                      setForm({ ...form, barcodeType: type });
                      setShowBarcodeMenu(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      form.barcodeType === type && styles.dropdownItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        form.barcodeType === type &&
                          styles.dropdownItemTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* Color Selector */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Card Color</Text>
            <View style={styles.colorGrid}>
              {CARD_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setForm({ ...form, color })}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: color,
                      borderWidth: form.color === color ? 3 : 0,
                    },
                  ]}
                  disabled={isLoading}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Submit Button */}
        <Animated.View
          style={styles.buttonSection}
          entering={FadeInUp.delay(100)}
        >
          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && canSubmit && { opacity: 0.8 },
              !canSubmit && styles.submitButtonDisabled,
            ]}
            disabled={!canSubmit}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "Adding Card..." : "Add Card"}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  previewIssuer: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.75,
  },
  previewBarcode: {
    marginTop: 12,
    alignItems: "center",
  },
  previewBarcodeText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.6,
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 16,
    gap: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: "#101826",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f4f86",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  scanButtonDisabled: {
    opacity: 0.5,
  },
  scanButtonTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  scanButtonText: {
    color: "#93a7bd",
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  inputError: {
    borderColor: "#c62828",
  },
  errorText: {
    color: "#ff5252",
    fontSize: 12,
    marginTop: 6,
  },
  dropdown: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  dropdownText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  dropdownMenu: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  dropdownItemSelected: {
    backgroundColor: "#262626",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#999",
  },
  dropdownItemTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSection: {
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: "#1565C0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
