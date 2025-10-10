import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { executeQuery } from '../../database/db';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      let user = null;

      if (Platform.OS === 'web') {
        const storedUsers = await executeQuery('users');
        const usersArray = Array.isArray(storedUsers.rows) ? storedUsers.rows : [];
        user = usersArray.find(u => u.email === email && u.password === password);
      } else {
        const result = await executeQuery(
          'SELECT * FROM users WHERE email = ? AND password = ?;',
          [email, password]
        );
        if (result.rows._array && result.rows._array.length > 0) {
          user = result.rows._array[0];
        }
      }

      if (user) {
        Alert.alert('Success', 'Login successful!');
        // Navigate to Onboarding first
        navigation.navigate('Onboarding', { user });
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (err) {
      console.log('Login error:', err);
      Alert.alert('Error', 'Failed to log in');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.bottomText}>
        <Text>Don't have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
          Sign Up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f2f2f2',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 36,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#4e9bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#4e9bff',
    fontWeight: 'bold',
  },
});
