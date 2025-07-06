import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const BACKEND_URL = 'https://2aec-92-53-30-239.ngrok-free.app/';

let token: string | null = null;

// Load token from AsyncStorage on app start (call this once)
export async function loadToken() {
  token = await AsyncStorage.getItem('token');
  if(!token || token === 'null') {
    router.push('/(auth)/login');
  }else{
    router.push('/(app)/Home');
  }
}

// Set token manually after login/register
export function setToken(newToken: string | null) {
  token = newToken;
  if (newToken) {
    AsyncStorage.setItem('token', newToken);
  } else {
    AsyncStorage.removeItem('token');
  }
}

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Synchronous interceptor reading from memory variable 'token'
axiosInstance.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
