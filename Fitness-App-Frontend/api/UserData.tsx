import axios, { removeToken, setToken } from '@/api/axiosInstance';
import database from '@/database';
import { OnboardingModel } from '@/models/user_info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface OnboardingApiResponse {
  $values?: Array<{ question?: string; answer?: string }>;
}

export const RegisterUser = async (userData: {
  Name: string;
  Email: string;
  Password: string;
}) => {
  try {
    const response = await axios.post('/api/User/register', userData);
    const data = response.data as { token: string };
    const token = data.token;
    setToken(token);
    return data;
  } catch (error) {
    console.error('Error registering user:', error);
    //TODO: Implement Offline Mode, give user a guest token
    throw error;
  }
};

//Upload Onboarding Data
export const UploadOnboardingData = async (data: {
  userId: string;
  answers: { question: string; answer: string | number }[];
}) => {
  try {
    const response = await axios.post('/api/User/UploadOnboarding', data);
    return response.data;
  } catch (error) {
    console.error('Error uploading onboarding data:', error);
    throw error;
  }
};

// Fetch Onboarding Data and store it in the database
// TODO: Implement Offline Mode, fetch from Async Storage if offline and put in DB
export const FetchOnboardingDataAndStore = async (userId: string) => {
  const { data } = await axios.get<OnboardingApiResponse>(`/api/User/GetOnboardingAnswers/${userId}`);
  const values = data.$values ?? [];

  const cleaned = values.map((item: any, i: number) => ({
    question: item?.question ?? `Q${i}`,
    answer: item?.answer ?? '',
  }));

  await database.write(async () => {
    const collection = database.get<OnboardingModel>('onboarding_answers');
    for (const item of cleaned) {
      await collection.create(entry => {
        entry.question = item.question;
        entry.answer = item.answer;
      });
    }
  });
};


export const Login = async (
  userData: { email: string; password: string }
): Promise<{ token: string }> => {
  try {
    const response = await axios.post<{ token: string }>('/api/User/Login', userData);
    const { token } = response.data;
    return { token };
  } catch (error) {
    console.error('Error logging in user, going offline-mode', error);
    //Implement offline mode, give user a guest token
    throw error;
  }
};

export const LogoutUser = async () => {
  try {
    await database.write(async () => {
      const collections = Object.values(database.collections);
      for (const collection of collections) {
        const allRecords = await collection.query().fetch();
        for (const record of allRecords) {
          await record.destroyPermanently();
        }
      }
    });
    console.log('User logged out successfully.');
  } catch (error) {
    console.error('Error logging out user:', error);
  }
  await removeToken();
  router.push('/');
};
