import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';

const BACKEND_URL = 'https://bc9ec6567ed5.ngrok-free.app/';

let token: string | null = null;

// Load token from AsyncStorage on app start (call this once)
export async function loadToken() {
  token = await AsyncStorage.getItem('token');
  if(!token || token === 'null') {
    router.push('/');
    console.log("Token is null or undefined, redirecting to Login");
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
