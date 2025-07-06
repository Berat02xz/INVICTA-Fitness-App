import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BACKEND_URL = 'https://a1df-92-53-30-239.ngrok-free.app/'; // TEMPORARY NGROK URL

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let token: string | null = null;

export async function setToken() {
  token = await AsyncStorage.getItem('userToken');
}

axiosInstance.interceptors.request.use(
  (config) => {
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export default axiosInstance;
