import axiosInstance from "./AxiosInstance";
import { Platform } from "react-native";

export const AIEndpoint = {
  uploadMeal: async (
    userId: string,
    mealImageFile: { uri: string; name: string; type: string },
  ) => {
    const formData = new FormData();
    formData.append("UserId", userId);
    
    if (Platform.OS === "web") {
      try {
        // Fetch the blob from the URI
        const res = await fetch(mealImageFile.uri);
        const blob = await res.blob();
        formData.append("MealImage", blob, mealImageFile.name || 'meal.jpg');
      } catch (e) {
        console.error("Failed to convert URI to Blob on web", e);
        throw e;
      }
    } else {
      formData.append("MealImage", {
        uri: mealImageFile.uri,
        name: mealImageFile.name || 'meal.jpg',
        type: mealImageFile.type || 'image/jpeg',
      } as any);
    }
    
    try {
      const config = {
        headers: { 
          'Content-Type': Platform.OS === 'web' ? 'multipart/form-data' : 'multipart/form-data',
        },
        timeout: 20000, 
      };
      
      if (Platform.OS === 'web') {
        // On web, we need to let the browser set the Content-Type with the boundary
        // by deleting the Content-Type header from the instance defaults for this request
        // However, axios instance defaults are merged. 
        // A common trick is to use transformRequest to modify headers
        
        // But simpler: just use a new axios instance or fetch for this specific call on web?
        // Or try setting it to undefined/false.
        // Actually, if we pass a FormData body, axios usually deletes the Content-Type header if it's not set.
        // But we have a default.
        
        // Let's try setting it to null to remove the default
        // @ts-ignore
        config.headers['Content-Type'] = null; 
      }

      const response = await axiosInstance.post('/api/AI/UploadMeal', formData, config);
      
      console.log('AI Response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('Error uploading meal:');
      
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

  askChat: async (question: string) => {
    try {
      const response = await axiosInstance.post('/api/AI/AskChat', {
        Question: question,
      }, {
        timeout: 60000, 
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

  askChatStream: async (question: string, onChunk: (chunk: string) => void) => {
    try {
      console.log('Starting chat stream request...');
      
      // Get token from secure storage
      const { GetToken } = await import('./AxiosInstance');
      const token = await GetToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const baseURL = axiosInstance.defaults.baseURL;
      const url = `${baseURL}/api/AI/AskChat`;
      
      console.log('Streaming to:', url);

      // Common logic to process chunks
      let buffer = '';
      const processBuffer = (chunk: string, callback: (chunk: string) => void) => {
        buffer += chunk;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          console.log('Processing line:', trimmedLine);

          let jsonStr = trimmedLine;
          if (trimmedLine.startsWith('data: ')) {
            jsonStr = trimmedLine.substring(6);
          }
          
          if (!jsonStr.startsWith('{')) {
            console.log('Skipping non-JSON line:', jsonStr);
            continue;
          }

          try {
            const jsonData = JSON.parse(jsonStr);
            
            if (jsonData.type === 'response.output_text.delta' && jsonData.delta) {
              console.log('>>> DELTA TEXT:', jsonData.delta);
              callback(jsonData.delta);
            }
            
            if (jsonData.type === 'response.completed') {
              console.log('>>> STREAM FINISHED');
            }
          } catch (parseError) {
            console.log('JSON parse error for line:', jsonStr, parseError);
          }
        }
      };

      if (Platform.OS !== 'web') {
        // Native implementation using XMLHttpRequest which handles streaming better on RN
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('ngrok-skip-browser-warning', 'true');
          
          let lastIndex = 0;

          xhr.onprogress = () => {
             // On Android/iOS xhr.responseText grows
             const response = xhr.responseText;
             const newContent = response.substring(lastIndex);
             lastIndex = response.length;
             processBuffer(newContent, onChunk);
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({ answer: 'Stream completed' });
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText}`));
            }
          };

          xhr.onerror = (e) => {
            console.error('XHR Error:', e);
            reject(new Error('Network request failed'));
          };

          xhr.send(JSON.stringify({ Question: question }));
        });
      }

      // Web implementation
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ Question: question }),
      });

      console.log('Stream response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Stream response error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      console.log('Stream response received, processing...');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream completed');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        processBuffer(chunk, onChunk);
      }

      return { answer: 'Stream completed' };

    } catch (error: any) {
      console.error('[askChatStream] Error:', error);
      throw error;
    }
  },
};