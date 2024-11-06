// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_COLOR = '#FFD700';

export default function Welcome() {
  const handleNavigation = async (route: 'profile' | 'projects/list') => {
    try {
      if (route === 'projects/list') {
        const profileData = await AsyncStorage.getItem('profile');
        if (!profileData) {
          Alert.alert(
            'Profile Required',
            'Please create your profile first before exploring projects',
            [
              {
                text: 'Create Profile',
                onPress: () => router.push('/profile')
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
          return;
        }
      }
      router.push(`/${route}`);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/storypath-mobile.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to StoryPath</Text>
        <Text style={styles.subtitle}>
          Explore Unlimited Location-based Experiences
        </Text>
        <Text style={styles.description}>
          With StoryPath, you can discover and create amazing location-based adventures. 
          From city tours to treasure hunts, the possibilities are endless!
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => handleNavigation('profile')}
        >
          <Text style={styles.buttonText}>CREATE PROFILE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => handleNavigation('projects/list')}
        >
          <Text style={styles.buttonText}>EXPLORE PROJECTS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 200,
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME_COLOR,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: THEME_COLOR,
  },
  buttonText: {
    color: '#000', // Changed to black for better contrast on yellow
    fontSize: 16,
    fontWeight: '600',
  },
});