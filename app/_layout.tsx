// app/_layout.tsx
import 'react-native-gesture-handler';
import { View, Text, StyleSheet, Image } from "react-native";
import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem, DrawerContentComponentProps } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useState, useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_COLOR = '#FFD700';

interface ProfileData {
  username: string;
  imageUri: string;
}

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const pathname = usePathname();
  const [profileData, setProfileData] = useState<ProfileData>({
    username: 'Guest User',
    imageUri: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await AsyncStorage.getItem('profile');
        if (data) {
          setProfileData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    
    loadProfile();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.infoContainer}>
        <View style={styles.profileContainer}>
          {profileData.imageUri ? (
            <Image 
              source={{ uri: profileData.imageUri }} 
              style={styles.profileImage} 
            />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Feather name="user" size={30} color="#666" />
            </View>
          )}
        </View>
        <View style={styles.infoDetailsContainer}>
          <Text style={styles.appTitle}>StoryPath</Text>
          <Text style={styles.username}>
            {profileData.username}
          </Text>
        </View>
      </View>
      
      <DrawerItem
        icon={({ size }) => (
          <Feather
            name="home"
            size={size}
            color={pathname === "/" ? THEME_COLOR : "#000"}
          />
        )}
        label="Welcome"
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/" ? THEME_COLOR : "#000" },
        ]}
        style={{ backgroundColor: pathname === "/" ? "#f8f8f8" : "#fff" }}
        onPress={() => router.push("/")}
      />
      
      <DrawerItem
        icon={({ size }) => (
          <Feather
            name="user"
            size={size}
            color={pathname === "/profile" ? THEME_COLOR : "#000"}
          />
        )}
        label="Profile"
        labelStyle={[
          styles.navItemLabel,
          { color: pathname === "/profile" ? THEME_COLOR : "#000" },
        ]}
        style={{ backgroundColor: pathname === "/profile" ? "#f8f8f8" : "#fff" }}
        onPress={() => router.push("/profile")}
      />
      
      <DrawerItem
        icon={({ size }) => (
          <Feather
            name="map-pin"
            size={size}
            color={pathname.includes("/projects/list") ? THEME_COLOR : "#000"}
          />
        )}
        label="Explore Projects"
        labelStyle={[
          styles.navItemLabel,
          { color: pathname.includes("/projects/list") ? THEME_COLOR : "#000" },
        ]}
        style={{ backgroundColor: pathname.includes("/projects/list") ? "#f8f8f8" : "#fff" }}
        onPress={() => router.push("/projects/list")}
      />
    </DrawerContentScrollView>
  );
};

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: {
            backgroundColor: THEME_COLOR,
          },
          headerTintColor: '#000',
          drawerActiveBackgroundColor: THEME_COLOR,
          drawerActiveTintColor: '#000',
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            title: "StoryPath",
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
        <Drawer.Screen 
          name="projects"
          options={{
            headerShown: false  // Changed this to false since we handle header in projects/_layout.tsx
          }}
        />
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            drawerItemStyle: { height: 0 }
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  navItemLabel: {
    marginLeft: -20,
    fontSize: 16,
  },
  infoContainer: {
    padding: 16,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  profileContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoDetailsContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLOR,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#666',
  }
});