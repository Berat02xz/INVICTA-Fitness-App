import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BACKEND_URL = 'https://f599010a2538.ngrok-free.app';

let token: string | null = null;

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

// Load token from storage at app start
export async function CheckToken() {
  token = await Storage.getItem('token');
  if (!token || token === 'null') {
    console.log("Token is null or undefined, redirecting to Welcome");
    router.push("/(auth)/WelcomeScreen");
  } else {
    router.push('/(tabs)/workout');
  }
}

export async function GetToken(): Promise<string | null> {
  if (!token || token === 'null') {
    console.log("Token is null or undefined, redirecting to Welcome");
    router.push("/(auth)/WelcomeScreen");
    return null;
  }
  return token;
}

// Set token manually after login/register
export async function setToken(newToken: string | null) {
  token = newToken;
  if (newToken) {
    await Storage.setItem('token', newToken);
  }
}

export async function removeToken() {
  token = null;
  await Storage.removeItem('token');
}

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = {
      ...(config.headers ?? {}),
      'ngrok-skip-browser-warning': 'true',
    };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token set in axios interceptor!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
