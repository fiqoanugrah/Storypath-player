// app/profile.tsx
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const THEME_COLOR = '#FFD700';

interface ProfileData {
  username: string;
  imageUri: string;
}

export default function Profile() {
  const [username, setUsername] = useState('');
  const [imageUri, setImageUri] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('profile');
      if (profileData) {
        const { username, imageUri }: ProfileData = JSON.parse(profileData);
        setUsername(username);
        setImageUri(imageUri);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const pickImage = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const saveProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Required Field', 'Please enter your username');
      return;
    }

    try {
      const profileData: ProfileData = {
        username: username.trim(),
        imageUri: imageUri,
      };
      
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      
      Alert.alert(
        'Success',
        'Profile saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/projects/list')
          }
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image Section */}
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.profileImage} 
          />
        ) : (
          <View style={[styles.profileImage, styles.placeholderImage]}>
            <Feather name="camera" size={40} color="#666" />
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Username Input Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={saveProfile}
      >
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: THEME_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});