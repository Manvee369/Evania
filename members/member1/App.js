import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';

import { AvatarProvider } from './context/AvatarState';
import { executeQuery, initDB } from './database/db';

import OnboardingScreen from './screens/Onboarding/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import SignupScreen from './screens/auth/SignupScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    async function prepareApp() {
      try {
        // Initialize database for mobile
        if (Platform.OS !== 'web') await initDB();

        let initial = 'Login';

        // Check if any users exist
        if (Platform.OS === 'web') {
          const result = await executeQuery('users');
          if (!result.rows || result.rows.length === 0) {
            initial = 'Signup';
          }
        } else {
          const result = await executeQuery('SELECT * FROM users;');
          if (!result.rows._array || result.rows._array.length === 0) {
            initial = 'Signup';
          }
        }

        setInitialRoute(initial);
      } catch (err) {
        console.warn('App initialization error:', err);
        setInitialRoute('Signup');
      } finally {
        setIsAppReady(true);
      }
    }

    prepareApp();
  }, []);

  if (!isAppReady) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" />
        <Text style={styles.splashText}>Starting Evania...</Text>
      </View>
    );
  }

  return (
    <AvatarProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AvatarProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  splashText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
});
