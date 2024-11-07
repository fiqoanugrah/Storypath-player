import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationObjectCoords } from 'expo-location';

const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';
const THEME_COLOR = '#FFD700';

// UQ coordinates
const INITIAL_REGION = {
  latitude: -27.4975,
  longitude: 153.0137,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Define the type for location
type LocationType = {
  id: number;
  location_name: string;
  location_position: string;
};

export default function MapScreen() {
  const { projectId } = useLocalSearchParams();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<number[]>([]);
  const [userLocation, setUserLocation] = useState<LocationObjectCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupMap();
  }, []);

  const setupMap = async () => {
    try {
      setIsLoading(true);

      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);

        // Watch location changes
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 5
          },
          (location) => setUserLocation(location.coords)
        );
      }

      // Get profile data
      const profileData = await AsyncStorage.getItem('profile');
      if (!profileData) return;
      const { username } = JSON.parse(profileData);

      // Fetch locations and visited locations
      const [locationsResponse, trackingResponse] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/location?project_id=eq.${projectId}`,
          { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
        ),
        axios.get(
          `${API_BASE_URL}/tracking?project_id=eq.${projectId}&participant_username=eq.${username}`,
          { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
        )
      ]);

      setLocations(locationsResponse.data);
      setVisitedLocations(trackingResponse.data.map((t: { location_id: number }) => t.location_id));

    } catch (error) {
      console.error('Map setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parsePosition = (positionString: string) => {
    try {
      const [lat, lng] = positionString.replace(/[()]/g, '').split(',').map(Number);
      return { latitude: lat, longitude: lng };
    } catch (error) {
      return null;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation
      >
        {locations.map((location: LocationType) => {
          const position = parsePosition(location.location_position);
          if (!position) return null;

          const isVisited = visitedLocations.includes(location.id);
          
          return (
            <React.Fragment key={location.id}>
              <Marker
                coordinate={position}
                pinColor={isVisited ? THEME_COLOR : "#999"}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{location.location_name}</Text>
                    <Text style={styles.calloutText}>
                      {isVisited ? "Visited" : "Not visited yet"}
                    </Text>
                  </View>
                </Callout>
              </Marker>
              <Circle
                center={position}
                radius={20}
                fillColor={isVisited ? "rgba(255,215,0,0.2)" : "rgba(153,153,153,0.2)"}
                strokeColor={isVisited ? THEME_COLOR : "#999"}
                strokeWidth={2}
              />
            </React.Fragment>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    minWidth: 120,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#666',
  }
});