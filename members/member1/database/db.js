// db.js
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

let db;
if (Platform.OS !== 'web') {
  db = SQLite.openDatabase('mydb.db');
}

// Unified executeQuery function
export const executeQuery = async (query, params = []) => {
  if (Platform.OS === 'web') {
    try {
      // Web storage: users
      let storedData = await AsyncStorage.getItem('users');
      let usersArray = storedData ? JSON.parse(storedData) : [];

      // If params is object (Signup)
      if (typeof params === 'object' && !Array.isArray(params) && Object.keys(params).length > 0) {
        usersArray.push(params);
        await AsyncStorage.setItem('users', JSON.stringify(usersArray));
        return { rows: [params] };
      }

      // For SELECT
      return { rows: usersArray };
    } catch (err) {
      console.log('AsyncStorage error:', err);
      return { rows: [] };
    }
  } else {
    // Mobile SQLite
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          query,
          Array.isArray(params) ? params : [],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }
};

// Initialize table on mobile
export const initDB = () => {
  if (Platform.OS !== 'web') {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          password TEXT
        );`
      );
    });
  }
};
