import axiosInstance from "./AxiosInstance";

export const MealEndpoint = {
  createMeal: async (mealData: { UserId: string; MealName: string; Calories: number; Carbohydrates: number; Fats: number; Label: string }) => {
    const response = await axiosInstance.post("/Meal/AddMeal", mealData);
    return response.data;
  },

  getMeals: async (userId: string) => {
    const response = await axiosInstance.get(`/Meal/GetMealsByUserId/${userId}`);
    return response.data;
  },

  deleteMeal: async (mealId: string) => {
    const response = await axiosInstance.delete(`/Meal/DeleteMeal/${mealId}`);
    return response.data;
  },
};
