import axiosInstance from '@/api/AxiosInstance';
import { removeToken, setToken } from '@/api/AxiosInstance';
import database from '@/database/database';
import { router } from 'expo-router';
import { User } from '@/models/User';
import  UserDTO  from '@/models/DTO/UserDTO';
import { Meal } from '@/models/Meals';
import { MealEndpoint } from './MealEndpoint';

export const RegisterUser = async (userData: {
  Name: string;
  Email: string;
  Password: string;
  Role: string;
}) => {
  try {
    const response = await axiosInstance.post('/api/User/register', userData);
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
    const response = await axiosInstance.post("/api/User/UploadUserInformation", {
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
  try {
    console.log("📡 Making API call to fetch user information...");
    console.log("📡 Request URL:", `/api/User/GetUserInformation/${userId}`);
    
    let response;
    try {
      response = await axiosInstance.get(`/api/User/GetUserInformation/${userId}`);
      console.log("📦 Raw response received:", response);
      console.log("📦 Response data:", JSON.stringify(response?.data, null, 2));
    } catch (apiError: any) {
      console.error("❌ API call failed:", apiError);
      console.error("❌ API error message:", apiError?.message);
      console.error("❌ API error response:", apiError?.response);
      throw apiError;
    }
    
    // Transform C# PascalCase response to JavaScript camelCase
    const backendData: any = response.data;
    
    if (!backendData) {
      console.warn("⚠️ API returned null or undefined data");
      return;
    }
    
    const userData: UserDTO = {
      userId: backendData.UserId || backendData.userId || userId,
      name: backendData.Name || backendData.name || '',
      email: backendData.Email || backendData.email || '',
      age: backendData.Age || backendData.age || 0,
      gender: backendData.Gender || backendData.gender || '',
      height: String(backendData.Height || backendData.height || 0),
      weight: backendData.Weight || backendData.weight || 0,
      equipmentAccess: backendData.EquipmentAccess || backendData.equipmentAccess || '',
      activityLevel: backendData.ActivityLevel || backendData.activityLevel || '',
      fitnessLevel: backendData.FitnessLevel || backendData.fitnessLevel || '',
      goal: backendData.Goal || backendData.goal || '',
      bmi: backendData.Bmi || backendData.bmi || 0,
      bmr: backendData.Bmr || backendData.bmr || 0,
      tdee: backendData.Tdee || backendData.tdee || 0,
      caloricIntake: backendData.CaloricIntake || backendData.caloricIntake || 0,
      caloricDeficit: String(backendData.CaloricDeficit || backendData.caloricDeficit || '0'),
      unit: backendData.Unit || backendData.unit || 'metric',
      appName: backendData.AppName || backendData.appName || 'Invicta',
      role: backendData.Role || backendData.role || 'FREE',
    };
    
    console.log("✅ Transformed userData:", JSON.stringify(userData, null, 2));

    console.log("🔍 Checking for existing user in local database...");
    const existing = await User.getUserDetails(database);

    console.log("💾 Starting database write operation...");
    await database.write(async () => {
      if (!existing) {
        console.log("➕ Creating new user in local database...");
        await User.createUser(database, {
          userId: userId,
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
        console.log("✅ New user created successfully");
      } else {
        console.log("🔄 Updating existing user in local database...");
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
        console.log("✅ Existing user updated successfully");
      }
    });
    console.log("✅ Database write completed successfully");
  } catch (error: any) {
    console.error("❌ Error in FetchUserInformationAndStore:");
    if (error.isAxiosError || error.response) {
      console.error("  - Axios Error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      });
    } else {
      console.error("  - Error details:", error);
      console.error("  - Error type:", typeof error);
      console.error("  - Error message:", error?.message);
      if (error) {
        console.error("  - Error properties:", Object.keys(error));
      }
    }
    throw error; // Re-throw so login.tsx can catch it
  }
};



export const FetchUserMealsAndStore = async (userId: string) => {
  try {
    console.log("🍽️ Fetching all meals for user:", userId);
    
    const response = await MealEndpoint.getMeals(userId);
    console.log("📦 Received meals from API:", response);
    
    if (!response || !Array.isArray(response)) {
      console.warn("⚠️ No meals data received or invalid format");
      return;
    }

    // Clear existing meals for this user before importing
    await Meal.deleteMealsForUser(database, userId);
    console.log("🗑️ Cleared existing meals for user");

    // Store each meal in WatermelonDB
    let successCount = 0;
    for (const backendMeal of response) {
      try {
        await Meal.createMeal(database, {
          userId: userId,
          mealName: backendMeal.MealName || backendMeal.mealName || 'Unknown Meal',
          calories: backendMeal.Calories || backendMeal.calories || 0,
          protein: backendMeal.Protein || backendMeal.protein || 0,
          carbohydrates: backendMeal.Carbohydrates || backendMeal.carbohydrates || 0,
          fats: backendMeal.Fats || backendMeal.fats || 0,
          label: backendMeal.Label || backendMeal.label || '',
          createdAt: backendMeal.CreatedAt || backendMeal.createdAt || Date.now(),
          healthScore: backendMeal.HealthScore || backendMeal.healthScore || 0,
        });
        successCount++;
      } catch (mealError) {
        console.error("❌ Error storing individual meal:", mealError);
      }
    }
    
    console.log(`✅ Successfully stored ${successCount}/${response.length} meals`);
  } catch (error: any) {
    console.error("❌ Error in FetchUserMealsAndStore:", error);
    console.error("  - Error message:", error?.message);
    throw error;
  }
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
    const response = await axiosInstance.post<{ token: string }>('/api/User/Login', userData);
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
    await axiosInstance.delete(`/api/User/DeleteUser/${userId}`);
    console.log('User deleted successfully.');
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};
