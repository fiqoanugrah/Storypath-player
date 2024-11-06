// app/projects/list.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_COLOR = '#FFD700';
const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';

interface Project {
  id: number;
  title: string;
  description: string;
  is_published: boolean;
  participant_scoring: string;
  participant_count?: number;
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkProfileAndLoadData();
  }, []);

  const checkProfileAndLoadData = async () => {
    try {
      const profileData = await AsyncStorage.getItem('profile');
      if (!profileData) {
        Alert.alert(
          'Profile Required',
          'Please create your profile first',
          [
            {
              text: 'Create Profile',
              onPress: () => router.push('/profile')
            }
          ]
        );
        return;
      }
      fetchProjects();
    } catch (error) {
      console.error('Profile check error:', error);
      setError('Failed to check profile');
      setLoading(false);
    }
  };

  const fetchProjects = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      // Basic axios configuration
      const axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        headers: { 'Authorization': `Bearer ${JWT_TOKEN}` },
        timeout: 10000 // 10 second timeout
      });

      // Fetch published projects
      const projectsResponse = await axiosInstance.get('/project?is_published=eq.true');
      
      if (!projectsResponse.data || !Array.isArray(projectsResponse.data)) {
        throw new Error('Invalid projects data received');
      }

      // Get participant counts
      const projectsWithCounts = await Promise.all(
        projectsResponse.data.map(async (project: Project) => {
          try {
            const countResponse = await axiosInstance.get(
              `/tracking?project_id=eq.${project.id}&select=participant_username`
            );
            const uniqueParticipants = new Set(
              countResponse.data.map((t: any) => t.participant_username)
            );
            return {
              ...project,
              participant_count: uniqueParticipants.size
            };
          } catch (error) {
            console.error(`Error fetching participants for project ${project.id}:`, error);
            return {
              ...project,
              participant_count: 0
            };
          }
        })
      );

      setProjects(projectsWithCounts);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects(false);
  };

  const handleProjectPress = async (project: Project) => {
    try {
      const profileData = await AsyncStorage.getItem('profile');
      if (!profileData) {
        Alert.alert('Error', 'Profile not found');
        router.push('/profile');
        return;
      }

      router.push({
        pathname: `/projects/home`,
        params: { 
          projectId: project.id,
          projectTitle: project.title 
        }
      });
    } catch (err) {
      console.error('Error navigating to project:', err);
      Alert.alert('Error', 'Failed to open project');
    }
  };

  const renderItem = ({ item }: { item: Project }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleProjectPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.participantsTag}>
          <Feather name="users" size={16} color="#666" />
          <Text style={styles.participantsText}>
            {item.participant_count || 0}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.infoContainer}>
          {item.participant_scoring !== "Not Scored" && (
            <View style={styles.infoTag}>
              <Feather name="award" size={14} color="#666" />
              <Text style={styles.infoText}>Scored Activity</Text>
            </View>
          )}
        </View>
        <Feather name="chevron-right" size={24} color="#666" />
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Feather name="inbox" size={50} color="#666" />
      <Text style={styles.emptyText}>No published projects found</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={50} color="#ff4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchProjects()}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME_COLOR}
            colors={[THEME_COLOR]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  participantsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participantsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  infoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: THEME_COLOR,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});