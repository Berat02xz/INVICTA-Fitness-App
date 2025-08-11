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
// import { MotiView } from "moti"; // Removed to test tslib issue
import SolidBackground from "@/components/ui/SolidBackground";

// Default camera dimensions
const CAMERA_WIDTH = "90%";
const CAMERA_HEIGHT = 700;
const CAMERA_OFFSET_Y = 50;

// Smaller preview size after taking a photo
const PREVIEW_WIDTH = "90%";
const PREVIEW_HEIGHT = 550;
const PREVIEW_OFFSET_Y = 50;

// After confirm sizes
const FINAL_PREVIEW_WIDTH = "90%";
const FINAL_PREVIEW_HEIGHT = 500;
const FINAL_PREVIEW_OFFSET_Y = 50;

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
        {/* Replaced MotiView with View */}
        <View
          style={[
            styles.cameraWrapper,
            {
              width: capturedPhoto ? PREVIEW_WIDTH : CAMERA_WIDTH,
              height: capturedPhoto ? PREVIEW_HEIGHT : CAMERA_HEIGHT,
              marginTop: capturedPhoto ? PREVIEW_OFFSET_Y : CAMERA_OFFSET_Y,
            },
          ]}
        >
          {isFocused && !capturedPhoto && (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              mute={true}
            />
          )}
          {capturedPhoto && (
            <Image source={{ uri: capturedPhoto.uri }} style={styles.camera} />
          )}
        </View>

        {!capturedPhoto && (
          <Pressable
            onPress={takePhoto}
            style={[styles.captureButton, isCapturing && { opacity: 0.6 }]}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="#D72207" />
            ) : (
              <View style={styles.captureContent}>
                <Feather
                  name="camera"
                  size={28}
                  color="#D72207"
                  style={styles.captureIcon}
                />
                <Text style={styles.captureText}>Scan Breakfast</Text>
              </View>
            )}
          </Pressable>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
  },
  cameraWrapper: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    overflow: "hidden",
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
    backgroundColor: "#361716",
    borderRadius: 100,
  },
  captureContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  captureIcon: {
    marginRight: 8,
  },
  captureText: {
    color: "#D72207",
    fontSize: 18,
    fontWeight: "bold",
  },
});
