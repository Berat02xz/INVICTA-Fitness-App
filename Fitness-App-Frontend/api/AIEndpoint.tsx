import axiosInstance from "./AxiosInstance";

export const AIEndpoint = {
  uploadMeal: async (
    userId: string,
    mealImageFile: File,
    extraMessage: string = ""
  ) => {
  const formData = new FormData();
  formData.append("UserId", userId);
  formData.append("MealImage", mealImageFile);
  formData.append("ExtraMessage", extraMessage);

  try {
    const response = await axiosInstance.post('/api/AI/uploadMeal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading meal:', error);
    throw error;
  }
},
}
