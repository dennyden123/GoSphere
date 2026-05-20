import React, { useEffect } from 'react';
import './src/i18n';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// WatermelonDB Provider
import { GroSphereDatabaseProvider } from './src/database/provider';
import { verifyDatabase } from './src/database/verify';

// Error Boundary
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';
import { DashboardScreen } from './src/screens/DashboardScreen';

// Auth Context
import { AuthProvider } from './src/context/AuthContext';

// Cart Context
import { CartProvider } from './src/context/CartContext';

// Stripe Integration
import { StripeProvider } from '@stripe/stripe-react-native';

// Sync Manager
import { useSyncManager } from './src/hooks/useSyncManager';

export default function App() {
  console.log("App component initializing...");

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
          merchantIdentifier="merchant.com.grosphere"
        >
          <CartProvider>
            {Platform.OS === 'web' ? (
              <DashboardScreen />
            ) : (
              <GroSphereDatabaseProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </GroSphereDatabaseProvider>
            )}
          </CartProvider>
        </StripeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
