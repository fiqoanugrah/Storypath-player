import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';
const THEME_COLOR = '#FFD700';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { projectId } = useLocalSearchParams();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    try {
      setScanned(true);

      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(data);
        
        if (!qrData.projectId || !qrData.locationId) {
          throw new Error('Invalid QR code format');
        }
      } catch (err) {
        console.error("QR parse error:", err);
        setScanned(false);
        return;
      }

      // Get profile data
      const profileData = await AsyncStorage.getItem('profile');
      if (!profileData) {
        router.push('/profile');
        return;
      }
      const { username } = JSON.parse(profileData);

      // Get location details and track visit
      const location = await axios.get(
        `${API_BASE_URL}/location?id=eq.${qrData.locationId}`,
        { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
      );

      if (!location.data?.[0]) {
        setScanned(false);
        return;
      }

      // Track the visit
      await axios.post(
        `${API_BASE_URL}/tracking`,
        {
          project_id: parseInt(projectId as string),
          location_id: qrData.locationId,
          points: location.data[0].score_points,
          username: 's4829897',
          participant_username: username
        },
        { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
      );

      // Navigate to show content
      router.push({
        pathname: `/projects/${projectId}/`,
        params: { locationId: qrData.locationId }
      });

    } catch (error) {
      console.error("Scanner error:", error);
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission is required</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.overlayText}>
            Align QR code within frame
          </Text>
        </View>
      </BarCodeScanner>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: THEME_COLOR,
    backgroundColor: 'transparent',
  },
  overlayText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: THEME_COLOR,
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  }
});