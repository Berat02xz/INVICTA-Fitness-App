import axios, { removeToken, setToken } from '@/api/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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

export const FetchOnboardingDataAndStore = async (userId: string) => {
  try {
    const response = await axios.get<{ $values?: any[] }>(
      `/api/User/GetOnboardingAnswers/${userId}`
    );


    const rawValues = response.data?.$values;

    if (!Array.isArray(rawValues)) {
      console.warn(
        "[FetchOnboardingDataAndStore] ❗ Unexpected format received from API:",
        response.data
      );
      return;
    }

    // Clean the data to avoid issues with circular references or non-serializable fields
    const cleanedValues = rawValues.map((item, i) => {
      if (item && typeof item === "object") {
        return {
          question: item.question ?? `Unknown question ${i}`,
          answer: item.answer ?? "",
        };
      }
      return { question: `Invalid item ${i}`, answer: "" };
    });


    let jsonString;
    try {
      jsonString = JSON.stringify(cleanedValues);
    } catch (stringifyError) {
      console.error("[FetchOnboardingDataAndStore] ❌ Failed to stringify values:", stringifyError);
      return;
    }

    try {
      await AsyncStorage.setItem("Onboarding", jsonString);
      console.log("[FetchOnboardingDataAndStore] 🎉 Successfully saved onboarding data.");
    } catch (storageError) {
      console.error("[FetchOnboardingDataAndStore] ❌ Failed to save to AsyncStorage:", storageError);
    }
  } catch (error) {
    console.error("[FetchOnboardingDataAndStore] ❌ Request failed:", error);
    throw error;
  }
};

export const Login = async (
  userData: { email: string; password: string }
): Promise<{ token: string }> => {
  try {
    const response = await axios.post<{ token: string }>('/api/User/Login', userData);
    const { token } = response.data;
    return { token };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const LogoutUser = async () => {
  try {
    await removeToken();
    router.push('/');
    console.log("User logged out successfully.");
  } catch (error) {
    console.error("Error logging out user:", error);
  }
};
