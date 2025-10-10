// OnboardingScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery } from '../../database/db'; // if using SQLite

const steps = [
  { key: 'sleep', question: 'How many hours do you sleep on average?', options: ['<5', '5-7', '7-9', '>9'] },
  { key: 'stress', question: 'Your stress level?', options: ['Low', 'Medium', 'High'] },
  { key: 'focus', question: 'Your focus level?', options: ['Poor', 'Average', 'Good'] },
  { key: 'mood', question: 'Your current mood?', options: ['😊', '😐', '😞'] },
  { key: 'theme', question: 'Choose a theme color?', options: ['Blue', 'Green', 'Red', 'Dark'] },
  { key: 'goal', question: 'Your daily goal?', options: ['Sleep', 'Meditation', 'Exercise', 'Study'] },
  { key: 'target', question: 'Daily target in minutes?', options: ['15', '30', '45', '60'] },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleAnswer = (option) => {
    const key = steps[currentStep].key;
    setAnswers({ ...answers, [key]: option });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      submitAnswers({ ...answers, [key]: option });
    }
  };

  const submitAnswers = async (finalAnswers) => {
    try {
      // Save to AsyncStorage for web/mobile
      await AsyncStorage.setItem('userPreferences', JSON.stringify(finalAnswers));

      // If using SQLite
      if (Platform.OS !== 'web') {
        await executeQuery(
          `UPDATE users SET sleep=?, stress=?, focus=?, mood=?, theme=?, goal=?, target=? WHERE id=1;`,
          [
            finalAnswers.sleep,
            finalAnswers.stress,
            finalAnswers.focus,
            finalAnswers.mood,
            finalAnswers.theme,
            finalAnswers.goal,
            finalAnswers.target,
          ]
        );
      }

      Alert.alert('Success', 'Onboarding completed!');
      navigation.replace('Home'); // Go to home screen
    } catch (err) {
      console.log('Onboarding save error:', err);
      Alert.alert('Error', 'Failed to save onboarding data');
    }
  };

  const step = steps[currentStep];

  return (
    <View style={styles.container}>
      <Text style={styles.stepText}>
        Step {currentStep + 1} of {steps.length}
      </Text>
      <Text style={styles.question}>{step.question}</Text>
      <View style={styles.optionsContainer}>
        {step.options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.optionButton}
            onPress={() => handleAnswer(option)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f2f2f2',
  },
  stepText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#888',
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#4e9bff',
    paddingVertical: 14,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
