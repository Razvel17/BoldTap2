import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BarCodeScanner,
  type BarCodeScannedCallback,
} from "expo-barcode-scanner";
import { Camera, ScanLine, X } from "lucide-react-native";

interface CardScannerProps {
  visible: boolean;
  isSaving?: boolean;
  onClose: () => void;
  onScan: BarCodeScannedCallback;
}

export const CardScanner: React.FC<CardScannerProps> = ({
  visible,
  isSaving = false,
  onClose,
  onScan,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let isMounted = true;

    const requestPermission = async () => {
      const permission = await BarCodeScanner.requestPermissionsAsync();
      if (!isMounted) {
        return;
      }

      setHasPermission(permission.granted);
      setPermissionRequested(true);
    };

    setHasPermission(null);
    setPermissionRequested(false);
    requestPermission();

    return () => {
      isMounted = false;
    };
  }, [visible]);

  const supportedTypes = useMemo(
    () => [
      BarCodeScanner.Constants.BarCodeType.qr,
      BarCodeScanner.Constants.BarCodeType.code128,
      BarCodeScanner.Constants.BarCodeType.code39,
      BarCodeScanner.Constants.BarCodeType.ean13,
    ],
    [],
  );

  return (
    <Modal
      animationType="slide"
      presentationStyle="fullScreen"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Scan Card Code</Text>
            <Text style={styles.subtitle}>
              Scan a barcode or QR code to add a card instantly
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <X color="#fff" size={22} />
          </Pressable>
        </View>

        <View style={styles.scannerCard}>
          {hasPermission === null ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#1565C0" />
              <Text style={styles.stateTitle}>Preparing camera...</Text>
              <Text style={styles.stateText}>
                We are requesting permission to scan your card.
              </Text>
            </View>
          ) : hasPermission === false ? (
            <View style={styles.stateContainer}>
              <Camera color="#fff" size={36} />
              <Text style={styles.stateTitle}>Camera access needed</Text>
              <Text style={styles.stateText}>
                Allow camera access to scan and add cards automatically.
              </Text>
              {permissionRequested && (
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Close Scanner</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.scannerContainer}>
              <BarCodeScanner
                barCodeTypes={supportedTypes}
                onBarCodeScanned={isSaving ? undefined : onScan}
                style={StyleSheet.absoluteFillObject}
              />
              <View pointerEvents="none" style={styles.overlay}>
                <View style={styles.overlayTop} />
                <View style={styles.overlayMiddle}>
                  <View style={styles.overlaySide} />
                  <View style={styles.focusFrame}>
                    <ScanLine color="#8ec5ff" size={34} />
                    <Text style={styles.focusText}>Center the code in frame</Text>
                  </View>
                  <View style={styles.overlaySide} />
                </View>
                <View style={styles.overlayBottom}>
                  <Text style={styles.tipText}>
                    The card will be added to your wallet as soon as the scan completes.
                  </Text>
                </View>
              </View>
              {isSaving && (
                <View style={styles.savingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.savingText}>Adding card to wallet...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050608",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 280,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  scannerCard: {
    flex: 1,
    backgroundColor: "#0b1220",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#172033",
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(1, 6, 15, 0.62)",
  },
  overlayMiddle: {
    flexDirection: "row",
    alignItems: "center",
  },
  overlaySide: {
    flex: 1,
    height: 240,
    backgroundColor: "rgba(1, 6, 15, 0.62)",
  },
  focusFrame: {
    width: 250,
    height: 240,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#8ec5ff",
    backgroundColor: "rgba(17, 24, 39, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  focusText: {
    color: "#e6f4ff",
    fontSize: 15,
    fontWeight: "600",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(1, 6, 15, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  tipText: {
    color: "#dbeafe",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  stateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  stateTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  stateText: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#1565C0",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  savingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
