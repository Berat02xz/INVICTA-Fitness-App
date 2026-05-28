import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

 const BACKEND_URL = 'https://invicta-backend-dbhycqc7dndwfyf9.westeurope-01.azurewebsites.net';
// const BACKEND_URL = 'https://localhost:44326';

let token: string | null = null;

const normalizeToken = (value: string | null | undefined) => {
  if (!value || value === 'null' || value === 'undefined') {
    return null;
  }
  return value;
};

const Storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      return await AsyncStorage.setItem(key, value);
    }
    return await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      return await AsyncStorage.removeItem(key);
    }
    return await SecureStore.deleteItemAsync(key);
  }
};

export async function loadStoredToken(): Promise<string | null> {
  token = normalizeToken(await Storage.getItem('token'));
  return token;
}

// Load token from storage at app start
export async function CheckToken() {
  const storedToken = await loadStoredToken();
  if (!storedToken) {
    console.log("Token is null or undefined, redirecting to Welcome");
    router.replace("/WelcomeScreen");
  } else {
    // Check if we are already in tabs to avoid loop/pushing context on top
    // However, replace is generally safe to reset the current stack item
    router.replace('/workout');
  }
}

export async function GetToken(): Promise<string | null> {
  const currentToken = normalizeToken(token) ?? await loadStoredToken();
  if (!currentToken) {
    console.log("Token is null or undefined, redirecting to Welcome");
    router.replace("/WelcomeScreen");
    return null;
  }
  return currentToken;
}

// Set token manually after login/register
export async function setToken(newToken: string | null) {
  token = normalizeToken(newToken);
  if (token) {
    await Storage.setItem('token', token);
  }
}

export async function removeToken() {
  token = null;
  await Storage.removeItem('token');
}

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.headers) {
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.warn("⚠️ No token set in axios interceptor!");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
