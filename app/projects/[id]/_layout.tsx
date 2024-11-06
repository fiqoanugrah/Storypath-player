// app/projects/[id]/_layout.tsx
import { Tabs } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const THEME_COLOR = '#FFD700';

export default function ProjectDetailLayout() {
  const { projectTitle } = useLocalSearchParams();

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => <DrawerToggleButton tintColor="#000" />,
        headerStyle: {
          backgroundColor: THEME_COLOR,
        },
        headerTintColor: '#000',
        tabBarActiveTintColor: THEME_COLOR,
        headerTitle: projectTitle as string
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Project',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scanner',
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
