// app/projects/_layout.tsx
import { Stack } from 'expo-router';
import { DrawerToggleButton } from '@react-navigation/drawer';

const THEME_COLOR = '#FFD700';

export default function ProjectsLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <DrawerToggleButton tintColor="#000" />,
        headerStyle: {
          backgroundColor: THEME_COLOR,
        },
        headerTintColor: '#000',
      }}
    >
      <Stack.Screen 
        name="list"
        options={{
          title: "Projects",
        }}
      />
      <Stack.Screen 
        name="[id]"
        options={{
          headerShown: false // Hide stack header since we'll use tabs header
        }}
      />
    </Stack>
  );
}