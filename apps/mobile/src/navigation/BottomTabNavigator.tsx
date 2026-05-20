import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { 
  LayoutDashboard, 
  Camera, 
  Sprout, 
  UserCircle2,
  Users
} from 'lucide-react-native';

import { DashboardScreen } from '../screens/DashboardScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { GardenScreen } from '../screens/GardenScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(5, 10, 16, 0.95)',
          height: 85,
          paddingBottom: Platform.OS === 'ios' ? 30 : 20,
          paddingTop: 10,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
          ) : null
        ),
        tabBarActiveTintColor: '#00FF41',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Control',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={ScanScreen} 
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Garden" 
        component={GardenScreen} 
        options={{
          tabBarLabel: 'Garden',
          tabBarIcon: ({ color, size }) => <Sprout color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen} 
        options={{
          tabBarLabel: 'Social',
          tabBarIcon: ({ color, size }) => <Users color={color} size={22} />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'User',
          tabBarIcon: ({ color, size }) => <UserCircle2 color={color} size={22} />
        }}
      />
    </Tab.Navigator>
  );
}
