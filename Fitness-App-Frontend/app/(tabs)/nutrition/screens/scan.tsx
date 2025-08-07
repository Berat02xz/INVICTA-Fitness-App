import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  CameraCapturedPicture,
} from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import SolidBackground from "@/components/ui/SolidBackground";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const isFocused = useIsFocused();
  const [capturedPhoto, setCapturedPhoto] =
    useState<CameraCapturedPicture | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true,
      });
      setCapturedPhoto(photo);
    } catch (e) {
      console.warn("Failed to take photo", e);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <>
        <SolidBackground style={StyleSheet.absoluteFill} />
        <View style={styles.container}>
          <Text style={styles.permissionText}>
            We need your permission to use the camera
          </Text>
          <Pressable
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <SolidBackground style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        {isFocused && !capturedPhoto && (
          <View style={styles.cameraWrapper}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          </View>
        )}
        {capturedPhoto && (
          <Image source={{ uri: capturedPhoto.uri }} style={styles.camera} />
        )}
        <Pressable
          onPress={takePhoto}
          style={[styles.captureButton, isCapturing && { opacity: 0.6 }]}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Feather name="camera" size={28} color="#fff" />
          )}
        </Pressable>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraWrapper: {
    height: 700, // ← Change this to your desired height
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40, // ← Pushes it vertically from top
    borderRadius: 20,
    overflow: "hidden", // To make borderRadius work
  },

  camera: {
    width: "100%",
    height: "100%",
  },

  permissionText: {
    color: "white",
    textAlign: "center",
    marginBottom: 12,
    fontSize: 16,
  },
  permissionButton: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1e90ff",
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  captureButton: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    padding: 20,
    backgroundColor: "#555",
    borderRadius: 100,
  },
});
