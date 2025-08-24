import axiosInstance from "./AxiosInstance";

export const AIEndpoint = {
  uploadMeal: async (
    userId: string,
    mealImageFile: { uri: string; name: string; type: string },
    TypeOfUpload: string = ""
  ) => {
    const formData = new FormData();
    formData.append("UserId", userId);
    formData.append("MealImage", {
      uri: mealImageFile.uri,
      name: mealImageFile.name,
      type: mealImageFile.type,
    } as any);
    formData.append("TypeOfUpload", TypeOfUpload);

    try {
      const response = await axiosInstance.post('/api/AI/UploadMeal', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading meal:', error);
      throw error;
    }
  },
};
