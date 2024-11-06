// app/projects/[id]/index.tsx
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';

const THEME_COLOR = '#FFD700';
const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';

export default function ProjectDetail() {
  const { projectId } = useLocalSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/project?id=eq.${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`
          }
        }
      );
      setProject(response.data[0]);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Text>Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.text}>{project.instructions}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Initial Clue</Text>
        <Text style={styles.text}>{project.initial_clue}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Points</Text>
          <Text style={styles.statValue}>0/300</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Locations Visited</Text>
          <Text style={styles.statValue}>0/3</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  statBox: {
    flex: 1,
    backgroundColor: THEME_COLOR,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});