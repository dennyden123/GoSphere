import React, { useEffect } from 'react';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { BottomTabNavigator } from './BottomTabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ARGuideScreen } from '../screens/ARGuideScreen';
import { CreatePostScreen } from '../screens/CreatePostScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { CreateListingScreen } from '../screens/CreateListingScreen';
import { GrowthHistoryScreen } from '../screens/GrowthHistoryScreen';
import { useSyncManager } from '../hooks/useSyncManager';
import { verifyDatabase } from '../database/verify';

const Stack = createStackNavigator();

export function AppNavigator() {
  const { session, isLoading } = useAuth();

  // Only sync when logged in
  useSyncManager();

  useEffect(() => {
    if (session && Platform.OS !== 'web') {
      verifyDatabase().then(success => {
        if (success) {
          console.log("Database verification successful!");
        } else {
          console.error("Database verification failed!");
        }
      });
    }
  }, [session]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF41" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="ARGuide" component={ARGuideScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Notifications" component={NotificationScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Network" component={NetworkScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="GrowthHistory" component={GrowthHistoryScreen} options={{ presentation: 'card' }} />
        </>
      ) : (

        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#050A10',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
