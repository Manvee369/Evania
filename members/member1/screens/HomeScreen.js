import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery } from '../database/db';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState({ name: 'User', base_mood: '😊' });

  useEffect(() => {
    const initDB = async () => {
      try {
        if (Platform.OS !== 'web') {
          await executeQuery(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, name TEXT, base_mood TEXT);'
          );
        } else {
          await executeQuery('users', [{ id: 1, name: 'Prakhar', base_mood: '😊' }]);
        }

        // Fetch user token
        let token;
        if (Platform.OS === 'web') {
          token = await AsyncStorage.getItem('userToken');
        } else {
          token = await SecureStore.getItemAsync('userToken');
        }

        if (token) setUser(JSON.parse(token));
      } catch (err) {
        console.log('DB error:', err);
      }
    };

    initDB();
  }, []);

  const handleLogout = async () => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem('userToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }

      Alert.alert('Logged out', 'You have been logged out successfully!');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.log('Logout error:', err);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}!</Text>
      <Text style={styles.mood}>Your current mood: {user.base_mood}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Onboarding')}
      >
        <Text style={styles.buttonText}>Go to Onboarding</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.platformText}>
        {Platform.OS === 'web' ? 'Running on Web' : 'Running on Mobile'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  mood: {
    fontSize: 18,
    color: '#555',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#4e9bff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    width: '70%',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  logoutButton: {
    backgroundColor: '#ff4e4e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  platformText: {
    marginTop: 30,
    fontSize: 14,
    color: '#888',
  },
});

export default HomeScreen;
