import axios, { removeToken, setToken } from '@/api/AxiosInstance';
import database from '@/database/database';
import { router } from 'expo-router';
import { User } from '@/models/User';
import  UserDTO  from '@/models/DTO/UserDTO';

export const RegisterUser = async (userData: {
  Name: string;
  Email: string;
  Password: string;
  Role: string;
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


export const UploadUserInformation = async ({
  userId,
  answers,
}: {
  userId: string;
  answers: { [question: string]: string | number };
}) => {
  try {
    const response = await axios.post("/api/User/UploadUserInformation", {
      userId,
      answers,
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading user information:", error);
    throw error;
  }
};

export const FetchUserInformationAndStore = async (userId: string) => {
  const { data: userData } = await axios.get<UserDTO>(`/api/User/GetUserInformation/${userId}`);
  if (!userData) return;

  const existing = await User.getUserDetails(database);

  await database.write(async () => {
    if (!existing) {
      await User.createUser(database, {
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        age: userData.age,
        gender: userData.gender,
        height: userData.height,
        weight: userData.weight,
        equipmentAccess: userData.equipmentAccess,
        activityLevel: userData.activityLevel,
        fitnessLevel: userData.fitnessLevel,
        goal: userData.goal,
        bmi: userData.bmi,
        bmr: userData.bmr,
        tdee: userData.tdee,
        caloricIntake: userData.caloricIntake,
        caloricDeficit: userData.caloricDeficit,
        unit: userData.unit,
        appName: userData.appName,
        role: userData.role,
      });
    } else {
      await existing.update((u) => Object.assign(u, {
        name: userData.name,
        email: userData.email,
        age: userData.age,
        gender: userData.gender,
        height: String(userData.height),
        weight: userData.weight,
        equipmentAccess: userData.equipmentAccess,
        activityLevel: userData.activityLevel,
        fitnessLevel: userData.fitnessLevel,
        goal: userData.goal,
        bmi: userData.bmi,
        bmr: userData.bmr,
        tdee: userData.tdee,
        caloricIntake: userData.caloricIntake,
        caloricDeficit: String(userData.caloricDeficit),
        unit: userData.unit,
        appName: userData.appName,
        role: userData.role,
      }));
    }
  });
};



export const GetUserDetails = async (): Promise<UserDTO | null> => {
  try {
    const user = await User.getUserDetails(database);
    if (!user) return null;
    return {
      userId: user.userId,
      name: user.name,
      email: user.email,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      equipmentAccess: user.equipmentAccess,
      activityLevel: user.activityLevel,
      fitnessLevel: user.fitnessLevel,
      goal: user.goal,
      bmi: user.bmi,
      bmr: user.bmr,
      tdee: user.tdee,
      caloricIntake: user.caloricIntake,
      caloricDeficit: user.caloricDeficit,
      unit: user.unit,
      appName: user.appName,
      role: user.role,
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

export const GetUserValue = async <K extends keyof UserDTO>(key: K): Promise<UserDTO[K] | null> => {
  try {
    const result = await User.getValue(database, key);
    return result as UserDTO[K] ?? null;
  } catch (error) {
    console.error("Error fetching user value:", error);
    return null;
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
    console.error('Error logging in user, going offline-mode', error);
    //Implement offline mode, give user a guest token
    throw error;
  }
};

export const LogoutUser = async () => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
  await removeToken();
  router.push('/');
};

export const DeleteUser = async (userId: string) => {
  try {
    await axios.delete(`/api/User/DeleteUser/${userId}`);
    console.log('User deleted successfully.');
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};
