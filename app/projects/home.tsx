// app/projects/home.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';

// API Configuration
const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';

// Types
interface Project {
  id: number;
  title: string;
  instructions: string;
  initial_clue: string;
  participant_scoring: string;
  homescreen_display: string;
}

interface Location {
  id: number;
  location_name: string;
  location_content: string;
  score_points: number;
}

interface TrackingStats {
  totalPoints: number;
  maxPoints: number;
  visitedLocations: number;
  totalLocations: number;
}

const THEME_COLOR = '#FFD700';

export default function ProjectHome() {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<TrackingStats>({
    totalPoints: 0,
    maxPoints: 0,
    visitedLocations: 0,
    totalLocations: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Get profile data
      const profileData = await AsyncStorage.getItem('profile');
      const profile = profileData ? JSON.parse(profileData) : null;
      const username = profile?.username;

      if (!username) {
        throw new Error('Profile not found');
      }

      // Fetch project details
      const projectResponse = await axios.get(
        `${API_BASE_URL}/project?id=eq.${projectId}`,
        { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
      );
      const projectData = projectResponse.data[0];
      setProject(projectData);

      // Fetch locations
      const locationsResponse = await axios.get(
        `${API_BASE_URL}/location?project_id=eq.${projectId}`,
        { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
      );
      const locationsData = locationsResponse.data;
      setLocations(locationsData);

      // Calculate max possible points
      const maxPoints = locationsData.reduce((sum: number, loc: Location) => sum + loc.score_points, 0);

      // Fetch tracking data
      const trackingResponse = await axios.get(
        `${API_BASE_URL}/tracking?project_id=eq.${projectId}&participant_username=eq.${username}`,
        { headers: { 'Authorization': `Bearer ${JWT_TOKEN}` }}
      );
      const trackingData = trackingResponse.data;

      // Calculate stats
      const totalPoints = trackingData.reduce((sum: number, record: any) => sum + record.points, 0);
      const visitedLocations = new Set(trackingData.map((record: any) => record.location_id)).size;

      setStats({
        totalPoints,
        maxPoints,
        visitedLocations,
        totalLocations: locationsData.length
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProjectData(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text>Project not found</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[THEME_COLOR]}
          tintColor={THEME_COLOR}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>{project.title}</Text>
        
        {/* Instructions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.text}>{project.instructions}</Text>
        </View>

        {/* Initial Clue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Initial Clue</Text>
          <Text style={styles.text}>{project.initial_clue}</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Points</Text>
            <Text style={styles.statValue}>
              {stats.totalPoints} / {stats.maxPoints}
            </Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statTitle}>Locations Visited</Text>
            <Text style={styles.statValue}>
              {stats.visitedLocations} / {stats.totalLocations}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});