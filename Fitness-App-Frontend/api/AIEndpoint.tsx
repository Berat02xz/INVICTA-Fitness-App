import axiosInstance from "./AxiosInstance";

export const AIEndpoint = {
  uploadMeal: async (
    userId: string,
    mealImageFile: { uri: string; name: string; type: string },
    TypeOfUpload: string = ""
  ) => {
    const formData = new FormData();
    formData.append("UserId", userId);
    
    // Fix the image appending - this is the most likely issue
    formData.append("MealImage", {
      uri: mealImageFile.uri,
      name: mealImageFile.name || 'meal.jpg',
      type: mealImageFile.type || 'image/jpeg',
    } as any);
    
    formData.append("TypeOfUpload", TypeOfUpload);

    try {
      const response = await axiosInstance.post('/api/AI/UploadMeal', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        timeout: 20000, 
      });
      
      console.log('AI Response:', response.data);
      return response.data;
      
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error uploading meal:');
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error:', error.message);
      }
      
      throw error;
    }
  },

  askChat: async (question: string) => {
    try {
      const response = await axiosInstance.post('/api/AI/AskChat', {
        Question: question,
      });
      
      console.log('Chat Response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Error asking chat:');
      
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      
      throw error;
    }
  },
};