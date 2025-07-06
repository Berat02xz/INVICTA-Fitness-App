import axios, { setToken } from '@/api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Register a User
export const registerUser = async (userData: {
  Name: string;
  Email: string;
  Password: string;
}) => {
  try {
    const response = await axios.post('/User/register', userData);
    const data = response.data as { token: string };
    const token = data.token;
    await AsyncStorage.setItem('userToken', token);
    setToken();
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

//Upload Onboarding Data
export const uploadOnboardingData = async (data: {
  userId: string;
  answers: { question: string; answer: string | number }[];
}) => {
  try {
    const response = await axios.post('/User/UploadOnboarding', data);
    return response.data;
  } catch (error) {
    console.error('Error uploading onboarding data:', error);
    throw error;
  }
};

//Fetch Onboarding Data
export const fetchOnboardingDataAndStore = async (userId: string) => {
  try {
    const response = await axios.get(`/User/GetOnboardingAnswers/${userId}`);
    // put the list of { question: string, answer: string} into AsyncStorage
    await AsyncStorage.setItem('Onboarding', JSON.stringify(response.data));

  } catch (error) {
    console.error('Error fetching onboarding data:', error);
    throw error;
  }
};